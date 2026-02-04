import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'

export const useUserStore = defineStore('user', () => {
    const user = ref(null)
    const token = ref(localStorage.getItem('token') || '')

    const isLoggedIn = computed(() => !!token.value && !!user.value)

    // 设置 Token
    function setToken(newToken) {
        token.value = newToken
        if (newToken) {
            localStorage.setItem('token', newToken)
        } else {
            localStorage.removeItem('token')
        }
    }

    // 获取用户信息
    async function fetchUser() {
        if (!token.value) return null
        try {
            const data = await authApi.getMe()
            user.value = data
            return data
        } catch (error) {
            setToken('')
            user.value = null
            return null
        }
    }

    // 退出登录
    async function logout() {
        try {
            await authApi.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setToken('')
            user.value = null
        }
    }

    return {
        user,
        token,
        isLoggedIn,
        setToken,
        fetchUser,
        logout
    }
})
