import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {defineEventHandler} from 'h3'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const {fileName} = body

        if (!fileName) throw new Error('文件名不能为空')

        // 确保文件名以 .md 结尾
        const mdFileName = fileName.endsWith('.md') ? fileName : `${fileName}.md`
        const filePath = join(process.cwd(), 'data', 'markdown', mdFileName)
        const content = await readFile(filePath, 'utf8')

        return {
            success: true, content
        }
    } catch (error: any) {
        console.error('读取文件失败:', error)

        if (error.code === 'ENOENT') return {
            success: false, message: '文件不存在'
        }

        return {
            success: false, message: error.message, error: error instanceof Error ? error.message : String(error)
        }
    }
})
