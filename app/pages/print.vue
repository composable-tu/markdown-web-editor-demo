<script lang="ts" setup>
import {ref, onMounted, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {renderMarkdownWithMermaid} from '~/lib/markdown-util';
import {readMarkdownFile} from '~/lib/utils';
import {useUserStore} from '@/store/login-store';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 检查用户是否已登录，如果没有则重定向到登录页面
onMounted(() => {
  if (!userStore.isLoggedIn) router.push('/login');
});

const fileName = ref<string | null>(route.query.file ? String(route.query.file) : null);
const markdownContent = ref<string>('');
const renderedHtml = ref<string>('');
const isLoading = ref(true);

// 加载文件内容并渲染
const loadAndRenderFile = async () => {
  if (!fileName.value) {
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    const result = await readMarkdownFile(fileName.value);
    if (result.success) {
      markdownContent.value = result.content;
      renderedHtml.value = await renderMarkdownWithMermaid(result.content as string);

      // 延迟一小段时间确保渲染完成后再唤起打印功能
      setTimeout(() => {
        window.print();
      }, 500);
    }
  } catch (error) {
    console.error('加载文件失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 页面加载时加载文件
onMounted(() => {
  loadAndRenderFile();
});

// 监听文件名变化
watch(() => route.query.file, (newFile) => {
  fileName.value = newFile ? String(newFile) : null;
  loadAndRenderFile();
});
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 text-black dark:text-white print:bg-white print:text-black">
    <div v-if="isLoading" class="flex items-center justify-center h-screen">
      <div class="text-lg">正在加载文件...</div>
    </div>

    <div v-else-if="!renderedHtml" class="flex items-center justify-center h-screen">
      <div class="text-lg text-red-600">无法加载文件内容</div>
    </div>

    <div v-else class="max-w-4xl mx-auto px-4 py-8">
      <div class="markdown prose prose-lg max-w-none" v-html="renderedHtml"></div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  body {
    margin: 0;
    padding: 0;
  }

  .max-w-4xl {
    max-width: 100%;
  }

  .px-4 {
    padding-left: 1cm;
    padding-right: 1cm;
  }

  .py-8 {
    padding-top: 1cm;
    padding-bottom: 1cm;
  }
}

/* 确保在打印预览中正确显示深色模式内容 */
@media print and (prefers-color-scheme: dark) {
  body {
    background-color: white !important;
    color: black !important;
  }
}
</style>