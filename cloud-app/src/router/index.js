import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user.js'

import AuthCallback from '@/views/AuthCallback.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/files',
        name: 'Files',
        component: () => import('@/views/FileList.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/edit/new',
        name: 'NewFile',
        component: () => import('@/views/Editor.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/edit/:id',
        name: 'EditFile',
        component: () => import('@/views/Editor.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/share/:id',
        name: 'Share',
        component: () => import('@/views/Share.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/auth/callback',
        name: 'AuthCallback',
        component: AuthCallback,
        meta: { requiresAuth: false }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
let isInitialized = false

router.beforeEach(async (to, from, next) => {
    console.log(`Router beforeEach: from ${from.path} to ${to.path}`)
    const userStore = useUserStore()

    // 首次加载时，如果有 token 但没有用户信息，先获取用户信息
    if (!isInitialized && userStore.token && !userStore.user) {
        isInitialized = true
        console.log('Initializing user info...')
        await userStore.fetchUser()
        console.log('User info initialized:', userStore.user ? 'success' : 'failed')
    }

    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        console.log('Requires auth, redirecting to Home')
        next({ name: 'Home' })
    } else {
        console.log('Proceeding')
        next()
    }
})

export default router
