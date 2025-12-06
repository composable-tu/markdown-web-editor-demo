import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  try {
    const dirPath = join(process.cwd(), 'data', 'markdown')
    const files = await readdir(dirPath)
    const markdownFiles = files.filter(file => file.endsWith('.md'))

    return {
      success: true,
      files: markdownFiles
    }
  } catch (error: any) {
    // 如果目录不存在，返回空文件列表
    if (error.code === 'ENOENT') {
      return {
        success: true,
        files: []
      }
    }

    console.error('读取文件列表失败:', error)
    return {
      success: false,
      message: '读取文件列表失败',
      error: error instanceof Error ? error.message : String(error)
    }
  }
})
