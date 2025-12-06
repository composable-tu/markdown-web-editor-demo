import {stat, writeFile} from 'node:fs/promises'
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

        try {
            // 检查文件是否已存在
            await stat(filePath);
            throw new Error('文件已存在');
        } catch (err: any) {
            if (err.code !== 'ENOENT') throw err
        }

        await writeFile(filePath, "", 'utf8')
        return {success: true}
    } catch (error: any) {
        console.error('创建文件失败:', error)
        return {
            success: false, message: error.message, error: error instanceof Error ? error.message : String(error)
        }
    }
})