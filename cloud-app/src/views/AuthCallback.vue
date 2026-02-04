<template>
  <div class="callback-page">
    <div class="loading" v-if="!error">
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
      <p>正在登录...</p>
    </div>
    <div class="error" v-else>
      <div class="error-content">
        <h2>登录失败</h2>
        <p>登录失败: {{ error }}</p>
        <button class="btn-primary" @click="goHome">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const error = ref('')

onMounted(async () => {
  const token = route.query.token
  console.log('[AuthCallback] Token from URL:', token ? 'YES' : 'NO')
  
  if (!token) {
    error.value = '未获取到登录凭证'
    return
  }
  
  try {
    console.log('[AuthCallback] Setting token...')
    userStore.setToken(token)
    
    // 设置 10 秒超时
    const fetchUserWithTimeout = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('获取用户信息超时'))
      }, 10000)
      
      userStore.fetchUser()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId))
    })
    
    console.log('[AuthCallback] Fetching user...')
    const user = await fetchUserWithTimeout
    console.log('[AuthCallback] Fetch user result:', user)
    
    if (user) {
      console.log('[AuthCallback] Login success, redirecting to /files')
      router.replace('/files')
    } else {
      console.error('[AuthCallback] Fetch user failed (returned null)')
      error.value = '获取用户信息失败，请重新登录'
    }
  } catch (e) {
    console.error('[AuthCallback] Login error:', e)
    error.value = e.message || '登录失败，请稍后重试'
  }
})

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 自定义 spinner 动画 */
.spinner-container {
  width: 40px;
  height: 40px;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  margin-top: 20px;
  color: #606266;
  font-size: 16px;
}

.error {
  width: 100%;
  max-width: 600px;
}

.error-content {
  text-align: center;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.error-content h2 {
  color: #f56c6c;
  margin-bottom: 10px;
}

.error-content p {
  color: #606266;
  margin-bottom: 20px;
}

.btn-primary {
  padding: 8px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #66b1ff;
}
</style>
