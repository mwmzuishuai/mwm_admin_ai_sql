<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { ElButton, ElCard, ElIcon, ElInput, ElText } from 'element-plus';

const intext = ref('');

interface TestItem {
  type: string;
  name: string;
  id: number;
  content?: string | undefined;
}
const testList = ref<TestItem[]>([]);
const redioList = ref([]);
const redIndex = ref(0);
// 从 localStorage 读取历史对话记录
onMounted(() => {
  const storedChats = localStorage.getItem('chatHistory');
  if (storedChats) {
    redioList.value = JSON.parse(storedChats);
    testList.value = redioList.value[0];
  }
});

// 新对话
const xin = () => {
  redioList.value.unshift(testList.value);
  testList.value = [];
  redIndex.value = 0;
  intext.value = '';
};
// 选择对话
const selectChat = (index: number) => {
  redIndex.value = index;
  testList.value = redioList.value[index];
};
// 删除对话
const deleteChat = (index: number) => {
  redioList.value.splice(index, 1);
  testList.value = [];
  redIndex.value = 0;
};
const handleUpload = async () => {
  const id = testList.value.length + 1;
  testList.value.push({
    type: 'user',
    name: '用户',
    id,
    content: intext.value,
  });

  // 原代码中 strs 未使用，可删除
  // const strs = intext.value;
  intext.value = '';
  const url = 'https://api.suanli.cn/v1/chat/completions';
  const headers = {
    Authorization: 'Bearer sk-ObpoO9YUsQKsOnL783PspO7bkP2HGu0C5p8152kxZ035Swme',
    'Content-Type': 'application/json',
  };
  // 构建历史对话记录
  const messages = testList.value.map((item) => {
    return {
      role: item.type === 'user' ? 'user' : 'assistant',
      content: item.content || '',
    };
  });
  const data = {
    model: 'deepseek-r1',
    messages,
    stream: true,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf8');
    let done = false;
    const length = testList.value.length;
    testList.value.push({
      type: 'ai',
      name: 'AI',
      id: length + 1,
      content: '',
    });
    while (!done) {
      let value;
      let readerDone = true;
      if (reader) {
        const result = await reader.read();
        value = result.value;
        readerDone = result.done;
      }
      done = readerDone;
      const decodedString = decoder.decode(value, { stream: true });
      const jsonString = decodedString
        .replaceAll('data: ', '') // 移除前缀
        .replaceAll('[DONE]', '') // 移除结束标志
        .trim();
      const texts: string[] = jsonString.split(/[\r\n]/);
      texts.forEach((element) => {
        if (element) {
          try {
            const jsonData = JSON.parse(element);
            testList.value[length].content =
              testList.value[length].content +
              jsonData.choices[0].delta.content;
          } catch (parseError) {
            console.error('JSON 解析错误:', parseError);
          }
        }
      });
    }
    // 保存历史对话记录到 localStorage
    redioList.value[redIndex.value] = testList.value;
    localStorage.setItem('chatHistory', JSON.stringify(redioList.value));
  } catch (error) {
    console.error('请求出错:', error);
  }
};
</script>

<template>
  <!-- 模板部分保持不变 -->
  <Page class="h-full">
    <ElCard class="mb-5 h-full w-full">
      <div class="flex h-full overflow-auto">
        <div class="h-full w-1/4">
          <div class="reads bg-cyan-400" @click="xin">新对话</div>
          <div
            v-for="(item, index) in redioList"
            :key="index"
            class="m-2"
            @click="selectChat(index)"
          >
            <ElText truncated> {{ item[0].content }} </ElText>
            <ElIcon
              class="ml-2 cursor-pointer"
              name="Delete"
              @click.stop="deleteChat(index)"
            />
          </div>
        </div>
        <div class="flex h-full w-3/4 flex-col justify-between">
          <div class="redio overflow-auto">
            <template v-for="item in testList" :key="item.name">
              <div v-if="item.type === 'user'" class="flex flex-col items-end">
                <div class="box-text bg-orange-50 p-1 text-xs">
                  {{ item.name }}
                </div>
                <div class="flex w-2/3">
                  <div class="box-text ml-auto mt-1 w-auto bg-green-600 p-2">
                    {{ item.content }}
                  </div>
                </div>
              </div>
              <div v-else class="flex flex-col items-start">
                <div class="box-text bg-orange-50 p-1 text-xs">
                  {{ item.name }}
                </div>
                <div class="flex w-2/3">
                  <Typewriter :content="item.content" :is-markdown="true" />
                  <!-- <pre class="box-text mt-1 w-auto bg-gray-50 p-2">{{
                    item.content
                  }}</pre> -->
                </div>
              </div>
            </template>
          </div>
          <div class="bg-input rounded-sm p-5">
            <ElInput
              v-model="intext"
              autosize
              class="bg-transparent"
              placeholder="请输入内容"
              resize="none"
              type="textarea"
              @keyup.enter="handleUpload"
            />
            <div class="flex justify-end">
              <!-- 回车键发送 -->

              <ElButton @click="handleUpload"> 上传 </ElButton>
            </div>
          </div>
        </div>
      </div>
    </ElCard>
  </Page>
</template>

<style scoped lang="scss">
:deep(.el-card__body) {
  height: 100%;
  border-radius: 0;
}

:deep(.el-textarea__inner) {
  background-color: transparent;

  &:focus {
    background-color: transparent;
    box-shadow: none;
  }

  &:hover {
    background-color: transparent;
    box-shadow: none;
  }
}

.box-text {
  display: block;
  text-wrap: auto;
  border-radius: var(--el-border-radius-base);
}

.redio {
  height: 56vh;
  overflow: auto;
}

.reads {
  width: 40%;
  padding: 20px;
  color: cornflowerblue;
  border-radius: 10px;

  &:hover {
    background-color: #f0f0f0;
  }
}
</style>
