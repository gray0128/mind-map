import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Env } from './types'
import { authMiddleware } from './middleware/auth'
import filesRoutes from './routes/files'
import shareRoutes from './routes/share'
import thumbnailRoutes from './routes/thumbnail'
import * as jose from 'jose'
import { User } from './types'

const app = new Hono<{ Bindings: Env }>()

// 启用 CORS
app.use('*', cors({
    origin: (origin) => origin || '*',
    credentials: true
}))

// ========== 公开路由 ==========

// 健康检查
app.get('/api/health', (c) => c.json({ status: 'ok' }))

// GitHub OAuth 发起
app.get('/api/auth/github', (c) => {
    const clientId = c.env.GITHUB_CLIENT_ID
    const redirectUri = `${new URL(c.req.url).origin}/api/auth/callback`

    const url = new URL('https://github.com/login/oauth/authorize')
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('scope', 'read:user user:email')

    return c.redirect(url.toString())
})

// GitHub OAuth 回调
app.get('/api/auth/callback', async (c) => {
    const code = c.req.query('code')

    if (!code) {
        return c.json({ error: 'Missing code' }, 400)
    }

    try {
        // 交换 access_token
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: c.env.GITHUB_CLIENT_ID,
                client_secret: c.env.GITHUB_CLIENT_SECRET,
                code
            })
        })

        const tokenData = await tokenRes.json() as { access_token: string, error?: string }

        if (tokenData.error || !tokenData.access_token) {
            return c.json({ error: 'OAuth failed' }, 400)
        }

        // 获取用户信息
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'User-Agent': 'MindMap-App'
            }
        })

        const githubUser = await userRes.json() as {
            id: number
            login: string
            avatar_url: string
            email: string | null
        }

        // 查找或创建用户
        let user = await c.env.DB.prepare(
            'SELECT * FROM users WHERE github_id = ?'
        ).bind(String(githubUser.id)).first<User>()

        if (!user) {
            const userId = crypto.randomUUID()
            await c.env.DB.prepare(
                `INSERT INTO users (id, github_id, username, avatar_url, email)
         VALUES (?, ?, ?, ?, ?)`
            ).bind(
                userId,
                String(githubUser.id),
                githubUser.login,
                githubUser.avatar_url,
                githubUser.email
            ).run()

            user = {
                id: userId,
                github_id: String(githubUser.id),
                username: githubUser.login,
                avatar_url: githubUser.avatar_url,
                email: githubUser.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        } else {
            // 更新用户信息
            await c.env.DB.prepare(
                `UPDATE users SET username = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
            ).bind(githubUser.login, githubUser.avatar_url, user.id).run()
        }

        // 生成 JWT
        const secret = new TextEncoder().encode(c.env.JWT_SECRET)
        const token = await new jose.SignJWT({ sub: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(secret)

        // 重定向到前端，携带 token
        return c.redirect(`${c.env.FRONTEND_URL}/auth/callback?token=${token}`)
    } catch (error) {
        console.error('OAuth error:', error)
        return c.json({ error: 'OAuth failed' }, 500)
    }
})

// 分享公开接口
app.route('/api/share', shareRoutes)

// ========== 受保护路由（需要认证） ==========
app.use('/api/auth/me', authMiddleware)
app.use('/api/auth/logout', authMiddleware)
app.use('/api/files/*', authMiddleware)

// 获取当前用户信息
app.get('/api/auth/me', async (c) => {
    const user = c.get('user')
    return c.json({
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        email: user.email
    })
})

// 退出登录
app.post('/api/auth/logout', (c) => {
    return c.json({ success: true })
})

// 文件管理路由
app.route('/api/files', filesRoutes)
app.route('/api/files', thumbnailRoutes)

// 404 处理
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// 错误处理
app.onError((err, c) => {
    console.error('Server error:', err)
    return c.json({ error: 'Internal server error' }, 500)
})

export default app
