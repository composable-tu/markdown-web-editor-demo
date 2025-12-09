<script lang="ts" setup>
import LoginForm from "@/components/LoginForm.vue"
import {ref} from 'vue'

definePageMeta({
  layout: 'other',
})

const logoSrc = ref('/LogoColorBlack.png')

</script>

<template>
  <div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
      <div class="flex items-center gap-2 self-center font-medium">
        <div class="flex h-16 w-48 items-center justify-center bg-contain bg-no-repeat bg-center">
        </div>
      </div>
      <LoginForm/>
    </div>
  </div>
</template>

