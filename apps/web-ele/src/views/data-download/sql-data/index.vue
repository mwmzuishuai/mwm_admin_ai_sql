<script setup lang="ts">
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import axios from 'axios';
import { ElButton, ElCard, ElInput } from 'element-plus';

const requst = axios.create({
  baseURL: 'http://47.100.77.155:5001',
  timeout: 10_000,
});
const postselect = (query: string) => {
  return requst.post('/query', { query });
};
const snList = ref<string>('');
const sqlstring = ref<string>('');
const loading = ref<boolean>(false);
const sqlup = async () => {
  const arr = snList.value.split('\n');
  loading.value = true;
  let i = 0;
  // 假设每次请求返回的数据是一个数组，且数组中的每个元素是一个对象

  for (const item of arr) {
    i++;
    if (i === arr.length) {
      loading.value = false;
    }
    let csvContent = 'data:text/csv;charset=utf-8,';
    let allData: any[] = [];
    const str = sqlstring.value.replace('loop', item);
    const res = await postselect(str);
    allData = [...allData, ...res.data]; // 假设返回的数据在res.data中
    if (allData.length > 0) {
      const headers = Object.keys(allData[0]).join(',');
      const rows = allData.map((obj) => Object.values(obj).join(','));
      csvContent += `${headers}\n${rows.join('\n')}`;

      // 创建CSV文件并触发下载
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${item}.csv`);
      document.body.append(link);
      link.click();
      link.remove();
    }
    // 将数据转换为CSV格式
  }
};
</script>
<template>
  <Page>
    <ElCard class="mb-5 w-full">
      <template #header>
        <div class="flex items-center justify-between">
          <span>Sn列表</span>
        </div>
      </template>
      <ElInput v-model="snList" :rows="3" resize="none" type="textarea" />
    </ElCard>
    <ElCard class="mb-5 h-max w-full">
      <template #header>
        <div class="flex items-center justify-between">
          <span>Sql代码</span>
          <ElButton :loading="loading" type="primary" @click="sqlup">
            下载
          </ElButton>
        </div>
      </template>
      <ElInput
        v-model="sqlstring"
        :rows="11"
        placeholder="请将循环的使用loop字段替换"
        resize="none"
        type="textarea"
      />
    </ElCard>
  </Page>
</template>
<style scoped lang="scss"></style>
