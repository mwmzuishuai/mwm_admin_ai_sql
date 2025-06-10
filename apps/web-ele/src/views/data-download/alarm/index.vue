<script setup lang="ts">
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  ElButton,
  ElCard,
  ElDatePicker,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getAlarm, getSnList } from '#/api';

const total = ref<number>(0);
const dateRange = ref<string[]>([]);
const loading = ref<boolean>(false); // 修改：明确类型
interface RowType {
  // id: number;
  name: string;
}
const Insd = ref<any>(null);
const getTableData = async (params: any) => {
  const res = await getSnList(params);
  total.value = res.totalElements;
  return {
    items: res.content,
    total: res.totalElements,
  };
};
const gridOptions: VxeGridProps<RowType> = {
  columns: [
    { title: '序号', type: 'seq', width: 50 },
    { field: 'installVpp.factory.name', title: '用户' },

    { field: 'installVpp.name', title: 'Name' },
    { field: 'sn', title: 'Sn' },
  ],
  sortConfig: {
    multiple: true,
  },
  stripe: true,
  height: 250,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }) => {
        return await getTableData({
          pageNo: page.currentPage,
          pageSize: page.pageSize,
          InstallStatus: Insd.value,
        });
      },
    },
  },
};

const [Grid, extendedApi] = useVbenVxeGrid({
  gridOptions,
});

// 修改 DropUp 函数
const DropUp = (e: any) => {
  if (typeof getTableData === 'function') {
    if (extendedApi) {
      Insd.value = e;
      extendedApi.reload();
    } else {
      console.error('extendedApi 为 undefined，可能未正确返回 api 属性');
    }
  }
};

// 文件下载
const Sndownload = async () => {
  const params = {
    pageNo: 1,
    pageSize: total.value,
    InstallStatus: Insd.value,
  };
  const { items } = await getTableData(params);
  const csvContent = [
    ['设备ID', '状态', 'EMS编号', '电站名称', '客户名称', '安装时间'].join(','), // CSV表头
    ...items.map((item: any) =>
      [
        item.sn, // 处理可能包含逗号的内容
        item.installStatus,
        item.emsSn,
        item.installVpp ? item.installVpp.name : '',
        item.installVpp ? item.installVpp.factory.name : '',
        item.createTime,
      ].join(','),
    ),
  ].join('\n');
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: 'text/csv;charset=utf-8',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `设备列表_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const upalarm = async () => {
  const { items } = await getTableData({
    pageNo: 1,
    pageSize: total.value,
    installStatus: 'INSTALLED',
  });
  let i = 0;
  loading.value = true;
  for (const s of items) {
    i++;
    if (i === total.value - 1) {
      loading.value = false;
    }
    let success = false;
    let retryCount = 0;
    while (!success && retryCount < 3) {
      try {
        const res = await getAlarm({
          sn: s.sn,
          current: 1,
          pageSize: 1_000_000,
          startDate: dateRange.value[0],
          endDate: dateRange.value[1],
        });

        const seen = new Set();
        const lists = res.filter((item: any) => {
          const isMatch = item.description?.slice(0, 2) === '重度';
          const key = `${item.dateTime?.slice(0, 10)}_${item.description}`;
          return isMatch && !seen.has(key) && seen.add(key);
        });

        if (lists.length > 0) {
          const csvContent = [
            ['sn', '告警描述', '告警时间'].join(','),
            ...lists.map((item: any) =>
              [item.essSn, item.description, item.dateTime.slice(0, 10)].join(
                ',',
              ),
            ),
          ].join('\n');

          // 创建下载链接并等待下载完成
          await new Promise((resolve) => {
            const blob = new Blob([`\uFEFF${csvContent}`], {
              type: 'text/csv;charset=utf-8',
            });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${s.sn}_故障.csv`;
            link.addEventListener('click', () => setTimeout(resolve, 500)); // 等待2秒保证下载
            link.click();
            URL.revokeObjectURL(link.href);
          });
        }
        success = true; // 请求成功，退出 while 循环
      } catch (error) {
        retryCount++;
        console.error(`Error processing SN ${s.sn}:`, error);
        if (retryCount >= 3) {
          console.error(`SN ${s.sn} failed after 3 retries.`);
          break; // 超过重试次数，跳过该请求
        }
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒后重试
      }
    }
  }
  loading.value = false;
};
</script>
<template>
  <Page>
    <div class="flex flex-wrap gap-5">
      <ElCard class="mb-5 w-full">
        <template #header>
          <div class="flex items-center justify-between">
            <span>列表</span>
            <ElDropdown
              split-button
              type="primary"
              @click="Sndownload()"
              @command="DropUp"
            >
              下载
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="">全部</ElDropdownItem>
                  <ElDropdownItem command="INSTALLED">运营中</ElDropdownItem>
                  <ElDropdownItem command="SCRAPPED">报废</ElDropdownItem>
                  <ElDropdownItem command="TO_INSTALL">待安装</ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </div>
        </template>
        <!-- 直接使用 Grid 组件 -->
        <Grid />
      </ElCard>
    </div>
    <ElCard class="mb-5 w-full">
      <template #header>
        <div class="flex items-center justify-between">
          <span>警告数据</span>
          <ElButton :loading="loading" type="primary" @click="upalarm">
            下载
          </ElButton>
        </div>
      </template>
      <div class="flex items-center">
        <title>时间选择</title>
        <ElDatePicker
          v-model="dateRange"
          end-placeholder="结束日期"
          range-separator="至"
          start-placeholder="开始日期"
          type="daterange"
          value-format="YYYY-MM-DD"
        />
      </div>
    </ElCard>
  </Page>
</template>
<style scoped lang="scss"></style>
