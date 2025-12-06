import type {ClassValue} from "clsx"
import {clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {toast} from "vue-sonner";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * 删除 Markdown 文件
 * @param fileName 要删除的文件名
 * @param refreshKey 用于刷新文件列表的响应式变量
 * @param currentFileName 当前选中的文件名
 * @param editorContent 编辑器内容
 * @param previewHtml 预览内容
 */
export async function deleteMarkdownFile(fileName: string, refreshKey: Ref<number>, currentFileName: Ref<string | null>, editorContent: Ref<string>, previewHtml: Ref<string>) {
    try {
        const response: any = await $fetch('/api/files/delete', {
            method: 'DELETE', body: {fileName}
        })

        if (response.success) {
            toast.success(`文件 ${fileName} 已成功删除`)
            refreshKey.value++

            // 如果当前打开的是被删除的文件，则清空编辑器
            if (currentFileName.value === fileName) {
                currentFileName.value = null
                editorContent.value = ''
                previewHtml.value = ''
            }
        } else toast.error(response.message || '删除文件失败')

        return response
    } catch (error) {
        toast.error('删除文件时发生错误')
        console.error('删除文件失败:', error)
        return {success: false, error}
    }
}
