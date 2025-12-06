<script lang="ts" setup>
import {FileText, MoreHorizontal, Plus, Trash} from 'lucide-vue-next'
import {
  Sidebar,
  SidebarContent,
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
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu'
import {deleteMarkdownFile} from "~/lib/utils";

interface MarkdownFile {
  name: string
}

const route = useRoute()
const router = useRouter()

// 一个响应式的时间戳，用于触发重新获取数据
const refreshKey = ref(0)

// 使用 useAsyncData 获取文件列表，依赖 refreshKey 来实现刷新
const {data: filesData, refresh} = await useAsyncData(
    'files', () => $fetch('/api/files/list'), {
      watch: [refreshKey] // 当 refreshKey 变化时重新获取数据
    }
)

const files = computed(() => {
  if (filesData.value && filesData.value.success) {
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

// 监听 currentFileName 变化，同步到 URL
watch(currentFileName, (newFileName) => {
  navigateTo({
    query: {...route.query, file: newFileName || undefined}
  }, {replace: true})
})

// 监听路由变化，同步到 currentFileName
watch(() => route.query.file, (newFile) => {
  if (newFile !== currentFileName.value) {
    currentFileName.value = newFile ? String(newFile) : null
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

const handleFileClick = (fileName: string) => {
  // TODO: 文件切换
  currentFileName.value = fileName
}

const handleContentChange = () => {
  // TODO: 内容变化处理（保存和预览）
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
      </Sidebar>

      <!-- 主编辑区域 -->
      <SidebarInset>
        <div class="flex h-screen w-full overflow-hidden">
          <div class="w-1/2 border-r border-border flex flex-col">
            <div class="border-b border-border px-4 py-2 flex-shrink-0">
              <h3 class="text-sm font-medium">编辑</h3>
            </div>
            <div class="flex-1 overflow-hidden p-0">
              <Textarea v-model="editorContent" :disabled="currentFileName === null"
                        :placeholder="currentFileName === null?'请先选中 Markdown 文件':'在这里输入 Markdown 文本'"
                        class="h-full min-h-full w-full resize-none rounded-none border-0 focus-visible:ring-0"
                        @input="handleContentChange"/>
            </div>
          </div>

          <div class="w-1/2 flex flex-col">
            <div class="border-b border-border px-4 py-2 flex-shrink-0">
              <h3 class="text-sm font-medium">预览</h3>
            </div>
            <div class="flex-1 overflow-auto p-4 prose prose-sm max-w-none dark:prose-invert">
              <div v-if="!previewHtml" class="text-muted-foreground">
                <p>预览将在这里显示</p>
              </div>
              <div v-else v-html="previewHtml"/>
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

:deep(.prose ul),
:deep(.prose ol) {
  margin-top: 1em;
  margin-bottom: 1em;
  padding-left: 2em;
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

