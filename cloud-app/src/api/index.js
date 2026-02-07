import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_HOST ? `${import.meta.env.VITE_API_HOST}/api` : '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器：添加 Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截器：处理错误
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

// 系统配置 API
export const configApi = {
    // 获取配置
    get: () => api.get('/config')
}

// 认证 API
export const authApi = {
    // 获取当前用户信息
    getMe: () => api.get('/auth/me'),

    // 退出登录
    logout: () => api.post('/auth/logout')
}

// 文件 API
export const fileApi = {
    // 获取文件列表
    getList: (params) => api.get('/files', { params }),

    // 创建文件
    create: (data) => api.post('/files', data),

    // 获取文件详情
    getDetail: (id) => api.get(`/files/${id}`),

    // 更新文件信息
    update: (id, data) => api.put(`/files/${id}`, data),

    // 删除文件
    delete: (id) => api.delete(`/files/${id}`),

    // 获取文件内容
    getContent: (id) => api.get(`/files/${id}/content`),

    // 保存文件内容
    saveContent: (id, data) => api.put(`/files/${id}/content`, data),

    // 切换分享状态
    toggleShare: (id, isShared) => api.put(`/files/${id}/share`, { is_shared: isShared })
}

// 分享 API
export const shareApi = {
    // 获取分享内容（公开）
    getContent: (id) => api.get(`/share/${id}/content`)
}

export default api
