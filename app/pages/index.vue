<script lang="ts" setup>
import {ChevronsUpDown, FileText, LogOut, Printer, Moon, MoreHorizontal, Plus, Sun, Trash} from 'lucide-vue-next'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider
} from '@/components/ui/sidebar'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {deleteMarkdownFile, readMarkdownFile, saveMarkdownFile} from "~/lib/utils";
import {useDebounceFn} from "@vueuse/core";
import {useColorMode} from "#imports";
import {renderMarkdownWithMermaid} from "~/lib/markdown-util";
import {useUserStore} from '@/store/login-store'
import {useRouter} from 'vue-router'

const colorMode = useColorMode()
const userStore = useUserStore()
const router = useRouter()

// 检查用户是否已登录，如果没有则重定向到登录页面
onMounted(() => {
  if (!userStore.isLoggedIn) router.push('/login')
})

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const route = useRoute()

// 一个响应式的时间戳，用于触发重新获取数据
const refreshKey = ref(0)

// 使用 useAsyncData 获取文件列表，依赖 refreshKey 来实现刷新
const {data: filesData, refresh} = await useAsyncData(
    'files', () => $fetch('/api/files/list'), {
      watch: [refreshKey] // 当 refreshKey 变化时重新获取数据
    }
)

const files = computed(() => {
  if (filesData.value && filesData.value.success && 'files' in filesData.value) {
    return filesData.value.files.map((name: string) => ({name}))
  }
  return []
})

// 定期刷新文件列表
onMounted(() => {
  const interval = setInterval(() => refreshKey.value++, 1000)
  onUnmounted(() => clearInterval(interval))
})

// 初始化 currentFileName 为路由参数
const currentFileName = ref<string | null>(route.query.file ? String(route.query.file) : null)

// 页面加载时，如果有文件名则加载文件内容
onMounted(async () => {
  if (currentFileName.value) await loadFileContent(currentFileName.value)
})

// 监听 currentFileName 变化，同步到 URL
watch(currentFileName, (newFileName) => {
  navigateTo({
    query: {...route.query, file: newFileName || undefined}
  }, {replace: true})
})

// 监听路由变化，同步到 currentFileName
watch(() => route.query.file, async (newFile) => {
  if (newFile !== currentFileName.value) {
    currentFileName.value = newFile ? String(newFile) : null
    // 当路由中的文件名改变时，加载对应文件内容
    if (currentFileName.value) await loadFileContent(currentFileName.value); else {
      editorContent.value = ''
      previewHtml.value = ''
    }
  }
})

const editorContent = ref<string>('')
const previewHtml = ref<string>('')

const isCreateFileDialogOpen = ref(false)

const handleNewFile = () => {
  isCreateFileDialogOpen.value = true
}

// 删除文件
const deleteFile = async (fileName: string) => await deleteMarkdownFile(fileName, refreshKey, currentFileName, editorContent, previewHtml);

// 打印文件
const printFile = (fileName: string) => {
  const printUrl = `/print?file=${encodeURIComponent(fileName)}`;
  window.open(printUrl, '_blank');
};

// 加载文件内容的函数
const loadFileContent = async (fileName: string) => {
  const result = await readMarkdownFile(fileName)
  if (result.success) {
    editorContent.value = result.content
    previewHtml.value = await renderMarkdownWithMermaid(result.content as string)
  }
}

// 切换文件时加载内容
const handleFileClick = async (fileName: string) => {
  currentFileName.value = fileName
  await loadFileContent(fileName)
}

// 实时保存和预览
const debouncedSave = useDebounceFn(async (content: string) => {
  if (currentFileName.value) {
    await saveMarkdownFile(currentFileName.value, content)
    previewHtml.value = await renderMarkdownWithMermaid(content);
  }
})

const handleContentChange = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  editorContent.value = target.value
  debouncedSave(target.value)
}
</script>

<template>
  <SidebarProvider>
    <div class="flex min-h-screen w-full">
      <!-- 侧边栏 -->
      <Sidebar>
        <SidebarHeader>
          <div class="flex items-center justify-between px-2 py-2">
            <h2 class="text-lg font-semibold">Markdown 编辑器</h2>
          </div>
          <div>
            <Button class="w-full" @click="handleNewFile">
              <Plus class="h-4 w-4"/>
              新建 Markdown
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem v-for="file in files" :key="file.name">
                  <div class="flex items-center justify-between">
                    <SidebarMenuButton :is-active="currentFileName === file.name" class="flex-1"
                                       @click="handleFileClick(file.name)">
                      <FileText class="h-4 w-4"/>
                      <span>{{ file.name }}</span>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button class="h-8 w-8 p-0" size="sm" variant="ghost">
                          <MoreHorizontal class="h-4 w-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="printFile(file.name)">
                          <Printer class="h-4 w-4 mr-2"/>
                          打印
                        </DropdownMenuItem>
                        <DropdownMenuItem class="text-red-600" @click="deleteFile(file.name)">
                          <Trash class="h-4 w-4 mr-2"/>
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <SidebarMenuButton>
                    <Sun
                        class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"/>
                    <Moon
                        class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"/>
                    主题
                    <ChevronsUpDown class="ml-auto"/>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-[--radix-popper-anchor-width]" side="right">
                  <DropdownMenuLabel>切换主题</DropdownMenuLabel>
                  <DropdownMenuSeparator/>
                  <DropdownMenuCheckboxItem :model-value="colorMode.preference === 'light'"
                                            @click="colorMode.preference ='light'">
                    {{ "浅色主题" }}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem :model-value="colorMode.preference === 'dark'"
                                            @click="colorMode.preference='dark'">
                    {{ "深色主题" }}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem :model-value="colorMode.preference === 'system'"
                                            @click="colorMode.preference='system'">
                    {{ "系统主题" }}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton @click="handleLogout">
                <LogOut class="h-4 w-4"/>
                退出登录
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <!-- 主编辑区域 -->
      <SidebarInset>
        <div class="flex h-screen w-full overflow-hidden">
          <div class="w-1/2 border-r border-border flex flex-col">
            <div class="border-b border-border px-4 py-2 shrink-0">
              <h3 class="text-sm font-medium">编辑</h3>
            </div>
            <div class="flex-1 overflow-hidden p-0">
              <Textarea :disabled="currentFileName === null"
                        :placeholder="currentFileName === null?'请先选中 Markdown 文件':'在这里输入 Markdown 文本'"
                        :value="editorContent"
                        class="h-full min-h-full w-full resize-none rounded-none border-0 focus-visible:ring-0"
                        @input="handleContentChange"/>
            </div>
          </div>

          <div class="w-1/2 flex flex-col">
            <div class="border-b border-border px-4 py-2 shrink-0">
              <h3 class="text-sm font-medium">预览</h3>
            </div>
            <div class="flex-1 overflow-auto p-4 prose prose-sm max-w-none dark:prose-invert">
              <div v-if="!previewHtml" class="text-muted-foreground">
                <p>预览将在这里显示</p>
              </div>
              <div v-else class="markdown" v-html="previewHtml"/>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  </SidebarProvider>

  <CreateFileDialog v-model:open="isCreateFileDialogOpen"/>
</template>

<style scoped>
/* Markdown 预览样式 */
/* Tailwind CSS 自带了个 Preflight，会覆盖掉浏览器对原生 HTML 样式的渲染 */
:deep(.prose) {
  color: inherit;
}

:deep(.prose h1) {
  font-size: 2em;
  font-weight: bold;
  margin-top: 0.67em;
  margin-bottom: 0.67em;
}

:deep(.prose h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 0.83em;
  margin-bottom: 0.83em;
}

:deep(.prose h3) {
  font-size: 1.17em;
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 1em;
}

:deep(.prose p) {
  margin-top: 1em;
  margin-bottom: 1em;
}

:deep(.prose ul) {
  list-style-type: disc;
  margin-top: 1em;
  margin-bottom: 1em;
  padding-left: 2em;
}

:deep(.prose ol) {
  list-style-type: decimal;
  margin-top: 1em;
  margin-bottom: 1em;
  padding-left: 2em;
}

:deep(.prose li) {
  display: list-item;
}

:deep(.prose ul ul) {
  list-style-type: circle;
}

:deep(.prose ul ul ul) {
  list-style-type: square;
}

:deep(.prose ol ul) {
  list-style-type: circle;
}

:deep(.prose ol ul ul) {
  list-style-type: square;
}

:deep(.prose code) {
  background-color: hsl(var(--muted));
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.9em;
}

:deep(.prose pre) {
  background-color: hsl(var(--muted));
  padding: 1em;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-top: 1em;
  margin-bottom: 1em;
}

:deep(.prose pre code) {
  background-color: transparent;
  padding: 0;
}

:deep(.prose blockquote) {
  border-left: 4px solid hsl(var(--border));
  padding-left: 1em;
  margin: 1em 0;
  color: hsl(var(--muted-foreground));
  font-style: italic;
}

:deep(.prose a) {
  color: hsl(var(--primary));
  text-decoration: underline;
}

:deep(.prose img) {
  max-width: 100%;
  height: auto;
  margin: 1em 0;
}
</style>

