<script lang="ts" setup>
import {computed, ref} from 'vue'
import {toast} from 'vue-sonner'
import {useRouter} from 'vue-router'
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import 'remixicon/fonts/remixicon.css'
import Altcha from "./Altcha.vue"
import {useUserStore} from '@/store/login-store'

const props = defineProps({
  class: {
    type: String,
    default: ''
  }
})

const userStore = useUserStore()
const route = useRouter()

const userId = ref('')
const password = ref('')
const altchaPayload = ref('')

const isFormValid = computed(() => {
  return userId.value.trim() && password.value.trim() && altchaPayload.value
})

const isFormEmpty = computed(() => {
  return userId.value && password.value
})

function handleFormSubmit(e: Event) {
  e.preventDefault()

  if (!userId.value.trim()) {
    toast.error("用户名不能为空")
    return
  }

  if (!password.value.trim()) {
    toast.error("密码不能为空")
    return
  }

  if (!altchaPayload.value) {
    toast.error("请完成验证码")
    return
  }

  const success = userStore.login(userId.value, password.value)

  if (success) {
    toast.success("登录成功")
    route.push('/')
  } else toast.error("用户名或密码错误")
}

function handleWechatLogin() {
  console.log("微信登录")
  // 添加微信登录逻辑
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-xl">欢迎使用</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit="handleFormSubmit">
          <div class="grid gap-6">
            <div class="grid gap-4">
              <Label for="userId">用户名</Label>
              <Input id="userId" v-model="userId" :placeholder="'用户名'" required type="text"/>
            </div>
            <div class="grid gap-4">
              <div class="flex items-center">
                <Label for="password">密码</Label>
                <a class="ml-auto text-sm underline-offset-4 hover:underline" href="#">
                  {{ '忘记密码' }}
                </a>
              </div>
              <Input id="password" v-model="password" :placeholder="'密码'" required type="password"/>
            </div>
            <ClientOnly class="grid gap-4">
              <Altcha v-model:payload="altchaPayload" />
            </ClientOnly>
            <div class="grid gap-4">
              <Button :disabled="!isFormEmpty" :variant="isFormValid ? 'default' : 'secondary'" type="submit">
                {{ '登录' }}
              </Button>
              <div class="relative my-2">
                <div class="absolute inset-0 flex items-center">
                  <span class="w-full border-t"/>
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                  <span class="bg-background px-2 text-muted-foreground">
                    {{ '第三方登录' }}
                  </span>
                </div>
              </div>
              <Button class="mb-2" type="button" variant="outline" @click="handleWechatLogin">
                <i class="ri-wechat-line ri-lg"></i>
                {{ '微信登录' }}
              </Button>
              <p class="text-center text-sm text-muted-foreground">
                {{ '没有账号' }}
                <a class="underline underline-offset-4 hover:underline" href="#">
                  {{ '注册' }}
                </a>
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
    <p class="px-6 text-center text-sm text-muted-foreground">
      {{ '登录即表示您同意我们的 ' }}
      <a class="underline underline-offset-4 hover:underline" href="#">
        {{ '服务条款' }}
      </a>
      {{ '和' }}
      <a class="underline underline-offset-4 hover:underline" href="#">
        {{ '隐私政策' }}
      </a>
    </p>
  </div>
</template>

