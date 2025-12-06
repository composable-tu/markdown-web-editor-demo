<script lang="ts" setup>
import {Button} from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'

const isOpen = defineModel<boolean>('open', {required: true})
const fileName = ref('')

async function handleSubmit(e: Event) {
  e.preventDefault()
  if (fileName.value.trim()) {
    try {
      const response: any = await $fetch('/api/files/create', {
        method: 'POST',
        body: { fileName: fileName.value.trim() }
      })

      if (response.success) {
        fileName.value = ''
        isOpen.value = false
      } else alert(response.message || '创建文件失败')
    } catch (error) {
      console.error('创建文件时发生错误:', error)
      alert('创建文件时发生错误')
    }
  } else alert("文件名不可为空")
}

</script>

<template>
  <Dialog v-model:open="isOpen">
    <form @submit="handleSubmit">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建 Markdown 文件</DialogTitle>
          <DialogDescription>Markdown 文件将存储在服务器中。</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4">
          <div class="grid gap-3">
            <Label for="name-1">文件名</Label>
            <Input id="name-1" v-model="fileName" name="name" placeholder="文件将自动以 .md 结尾" required/>
          </div>
        </div>
        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button :disabled="!fileName.trim()" type="submit" @click="handleSubmit">新建</Button>
        </DialogFooter>
      </DialogContent>
    </form>
  </Dialog>
</template>
