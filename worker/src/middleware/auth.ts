import * as jose from 'jose'
import { Context, Next } from 'hono'
import { Env, User } from '../types'

// 扩展 Context 类型以包含 user
declare module 'hono' {
    interface ContextVariableMap {
        user: User
    }
}

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
    const authHeader = c.req.header('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.slice(7)

    try {
        const secret = new TextEncoder().encode(c.env.JWT_SECRET)
        const { payload } = await jose.jwtVerify(token, secret)

        const userId = payload.sub as string

        // 从数据库获取用户信息
        const user = await c.env.DB.prepare(
            'SELECT * FROM users WHERE id = ?'
        ).bind(userId).first<User>()

        if (!user) {
            return c.json({ error: 'User not found' }, 401)
        }

        c.set('user', user)
        await next()
    } catch (error) {
        return c.json({ error: 'Invalid token' }, 401)
    }
}
