<script setup>
import { Page } from '@vben/common-ui';

import { ElCard, ElInput } from 'element-plus';
</script>
<template>
  <Page class="h-full">
    <ElCard class="mb-5 h-full w-full">
      <div class="flex h-full">
        <div class="h-full w-1/4"></div>
        <div class="h-full w-3/4">
          <div>1111</div>
          <ElInput v-model="input" class="w-1/2" placeholder="请输入内容" />
        </div>
      </div>
    </ElCard>
  </Page>
</template>
<style scoped lang="scss">
:deep(.el-card__body) {
  height: 100%;
}
</style>
