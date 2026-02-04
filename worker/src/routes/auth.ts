import { Hono } from 'hono'
import * as jose from 'jose'
import { Env, User } from '../types'

const auth = new Hono<{ Bindings: Env }>()

// 发起 GitHub OAuth
auth.get('/github', (c) => {
    const clientId = c.env.GITHUB_CLIENT_ID
    const redirectUri = `${new URL(c.req.url).origin}/api/auth/callback`

    const url = new URL('https://github.com/login/oauth/authorize')
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('scope', 'read:user user:email')

    return c.redirect(url.toString())
})

// GitHub OAuth 回调
auth.get('/callback', async (c) => {
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

// 获取当前用户信息
auth.get('/me', async (c) => {
    const user = c.get('user')
    return c.json({
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        email: user.email
    })
})

// 退出登录
auth.post('/logout', (c) => {
    // 客户端清除 token 即可
    return c.json({ success: true })
})

export default auth
