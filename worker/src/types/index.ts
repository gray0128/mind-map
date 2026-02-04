export interface Env {
    // D1 数据库
    DB: D1Database

    // R2 存储桶
    BUCKET: R2Bucket

    // 环境变量
    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string
    JWT_SECRET: string
    FRONTEND_URL: string
}

export interface User {
    id: string
    github_id: string
    username: string
    avatar_url: string | null
    email: string | null
    created_at: string
    updated_at: string
}

export interface File {
    id: string
    user_id: string
    name: string
    size: number
    r2_key: string
    thumbnail_key: string | null
    is_shared: number
    created_at: string
    updated_at: string
}
