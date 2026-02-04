import { Hono } from 'hono'
import { Env, File } from '../types'

const share = new Hono<{ Bindings: Env }>()

// 获取分享内容（公开接口，无需认证）
share.get('/:id/content', async (c) => {
    const fileId = c.req.param('id')

    // 查找已分享的文件
    const file = await c.env.DB.prepare(
        'SELECT * FROM files WHERE id = ? AND is_shared = 1'
    ).bind(fileId).first<File>()

    if (!file) {
        return c.json({ error: 'File not found or not shared' }, 404)
    }

    // 从 R2 获取内容
    const object = await c.env.BUCKET.get(file.r2_key)
    if (!object) {
        return c.json({ error: 'Content not found' }, 404)
    }

    const content = await object.json()

    return c.json({
        file: {
            id: file.id,
            name: file.name,
            created_at: file.created_at,
            updated_at: file.updated_at
        },
        content
    })
})

export default share
