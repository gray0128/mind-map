<template>
  <div id="app-debug" style="position:fixed;top:0;left:0;z-index:9999;background:yellow;font-size:12px;opacity:0.8;">
    App Mounted
  </div>
  <router-view />
</template>

<script setup>
import { onMounted, onErrorCaptured } from 'vue'
import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()

// 应用初始化时获取用户信息
onMounted(async () => {
  console.log('App.vue onMounted')
  if (localStorage.getItem('token')) {
    try {
      await userStore.fetchUser()
      console.log('User fetched successfully')
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }
})

onErrorCaptured((err, instance, info) => {
  console.error('Global Error Captured:', err, info)
  alert('Global Error: ' + err.message)
  return false
})

console.log('App.vue setup executed')
</script>
