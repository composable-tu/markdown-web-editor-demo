<script setup lang="ts">
import 'vue-sonner/style.css'
import {Toaster} from '@/components/ui/sonner'
import {onMounted} from 'vue'
import {useUserStore} from '@/store/login-store'

const userStore = useUserStore()

onMounted(() => userStore.init())
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <Toaster />
  </div>
</template>
