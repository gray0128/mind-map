import { Hono } from 'hono'
import { Env, File, User } from '../types'

const files = new Hono<{ Bindings: Env; Variables: { user: User } }>()

// 获取文件列表
files.get('/', async (c) => {
    const user = c.get('user')

    const result = await c.env.DB.prepare(
        `SELECT id, name, size, is_shared, thumbnail_key, created_at, updated_at
     FROM files WHERE user_id = ? ORDER BY updated_at DESC`
    ).bind(user.id).all<File>()

    const filesWithThumbnails = result.results?.map(f => ({
        ...f,
        thumbnail_url: f.thumbnail_key ? `/api/files/${f.id}/thumbnail` : null
    })) || []

    return c.json({ files: filesWithThumbnails })
})

// 创建文件
files.post('/', async (c) => {
    const user = c.get('user')
    const body = await c.req.json<{ name: string; content: any }>()

    if (!body.name) {
        return c.json({ error: 'Name is required' }, 400)
    }

    const fileId = crypto.randomUUID()
    const r2Key = `files/${user.id}/${fileId}.json`
    const content = JSON.stringify(body.content || { root: { data: { text: '中心主题' }, children: [] } })
    const size = new Blob([content]).size

    // 检查配额（单文件 10MB，总空间 200MB）
    if (size > 10 * 1024 * 1024) {
        return c.json({ error: 'File too large (max 10MB)' }, 400)
    }

    const totalSize = await c.env.DB.prepare(
        'SELECT SUM(size) as total FROM files WHERE user_id = ?'
    ).bind(user.id).first<{ total: number }>()

    if ((totalSize?.total || 0) + size > 200 * 1024 * 1024) {
        return c.json({ error: 'Storage quota exceeded (max 200MB)' }, 400)
    }

    // 存储到 R2
    await c.env.BUCKET.put(r2Key, content, {
        httpMetadata: { contentType: 'application/json' }
    })

    // 写入数据库
    await c.env.DB.prepare(
        `INSERT INTO files (id, user_id, name, size, r2_key)
     VALUES (?, ?, ?, ?, ?)`
    ).bind(fileId, user.id, body.name, size, r2Key).run()

    return c.json({
        id: fileId,
        name: body.name,
        size,
        is_shared: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, 201)
})

// 获取文件详情
files.get('/:id', async (c) => {
    const user = c.get('user')
    const fileId = c.req.param('id')

    const file = await c.env.DB.prepare(
        'SELECT * FROM files WHERE id = ? AND user_id = ?'
    ).bind(fileId, user.id).first<File>()

    if (!file) {
        return c.json({ error: 'File not found' }, 404)
    }

    return c.json(file)
})

// 更新文件信息
files.put('/:id', async (c) => {
    const user = c.get('user')
    const fileId = c.req.param('id')
    const body = await c.req.json<{ name?: string }>()

    const file = await c.env.DB.prepare(
        'SELECT * FROM files WHERE id = ? AND user_id = ?'
    ).bind(fileId, user.id).first<File>()

    if (!file) {
        return c.json({ error: 'File not found' }, 404)
    }

    if (body.name) {
        await c.env.DB.prepare(
            'UPDATE files SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(body.name, fileId).run()
    }

    return c.json({ success: true })
})

// 删除文件
files.delete('/:id', async (c) => {
    const user = c.get('user')
    const fileId = c.req.param('id')

    const file = await c.env.DB.prepare(
        'SELECT * FROM files WHERE id = ? AND user_id = ?'
    ).bind(fileId, user.id).first<File>()

    if (!file) {
        return c.json({ error: 'File not found' }, 404)
    }

    // 删除 R2 文件
    await c.env.BUCKET.delete(file.r2_key)
    if (file.thumbnail_key) {
        await c.env.BUCKET.delete(file.thumbnail_key)
    }

    // 删除数据库记录
    await c.env.DB.prepare('DELETE FROM files WHERE id = ?').bind(fileId).run()

    return c.json({ success: true })
})

// 获取文件内容
files.get('/:id/content', async (c) => {
    const user = c.get('user')
    const fileId = c.req.param('id')

    const file = await c.env.DB.prepare(
        'SELECT * FROM files WHERE id = ? AND user_id = ?'
    ).bind(fileId, user.id).first<File>()

    if (!file) {
        return c.json({ error: 'File not found' }, 404)
    }

    const object = await c.env.BUCKET.get(file.r2_key)
    if (!object) {
        return c.json({ error: 'Content not found' }, 404)
    }

    const content = await object.json()
    return c.json(content)
})

// 保存文件内容
files.put('/:id/content', async (c) => {
    const user = c.get('user')
    const fileId = c.req.param('id')
    const body = await c.req.json<{ thumbnail?: string } & any>()

    const file = await c.env.DB.prepare(
        'SELECT * FROM files WHERE id = ? AND user_id = ?'
    ).bind(fileId, user.id).first<File>()

    if (!file) {
        return c.json({ error: 'File not found' }, 404)
    }

    // 处理缩略图
    let thumbnailKey = file.thumbnail_key
    if (body.thumbnail) {
        // body.thumbnail 是 data:image/png;base64,xxxx
        const base64Data = body.thumbnail.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

        thumbnailKey = `files/${user.id}/${fileId}.png`
        await c.env.BUCKET.put(thumbnailKey, buffer, {
            httpMetadata: { contentType: 'image/png' }
        })

        // 从内容中移除缩略图
        delete body.thumbnail
    }

    const content = JSON.stringify(body)
    const size = new Blob([content]).size

    // 检查配额
    if (size > 10 * 1024 * 1024) {
        return c.json({ error: 'File too large (max 10MB)' }, 400)
    }

    // 更新 R2 内容
    await c.env.BUCKET.put(file.r2_key, content, {
        httpMetadata: { contentType: 'application/json' }
    })

    // 更新数据库
    await c.env.DB.prepare(
        'UPDATE files SET size = ?, thumbnail_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(size, thumbnailKey, fileId).run()

    return c.json({ success: true })
})

// 切换分享状态
files.put('/:id/share', async (c) => {
    const user = c.get('user')
    const fileId = c.req.param('id')
    const body = await c.req.json<{ is_shared: boolean }>()

    const file = await c.env.DB.prepare(
        'SELECT * FROM files WHERE id = ? AND user_id = ?'
    ).bind(fileId, user.id).first<File>()

    if (!file) {
        return c.json({ error: 'File not found' }, 404)
    }

    await c.env.DB.prepare(
        'UPDATE files SET is_shared = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(body.is_shared ? 1 : 0, fileId).run()

    return c.json({ success: true, is_shared: body.is_shared })
})

// 获取缩略图
files.get('/:id/thumbnail', async (c) => {
    const user = c.get('user')
    const fileId = c.req.param('id')

    const file = await c.env.DB.prepare(
        'SELECT thumbnail_key FROM files WHERE id = ? AND user_id = ?'
    ).bind(fileId, user.id).first<{ thumbnail_key: string | null }>()

    if (!file?.thumbnail_key) {
        return c.json({ error: 'Thumbnail not found' }, 404)
    }

    const object = await c.env.BUCKET.get(file.thumbnail_key)
    if (!object) {
        return c.json({ error: 'Thumbnail not found' }, 404)
    }

    return new Response(object.body, {
        headers: { 'Content-Type': 'image/png' }
    })
})

export default files
