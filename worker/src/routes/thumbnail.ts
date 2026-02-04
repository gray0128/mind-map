import { Hono } from 'hono'
import { Env, File, User } from '../types'

const thumbnail = new Hono<{ Bindings: Env; Variables: { user: User } }>()

// 上传缩略图
thumbnail.put('/:id/thumbnail', async (c) => {
    const user = c.get('user')
    const fileId = c.req.param('id')

    // 验证文件所有权
    const file = await c.env.DB.prepare(
        'SELECT * FROM files WHERE id = ? AND user_id = ?'
    ).bind(fileId, user.id).first<File>()

    if (!file) {
        return c.json({ error: 'File not found' }, 404)
    }

    try {
        const formData = await c.req.formData()
        const thumbnailFile = formData.get('thumbnail') as globalThis.File | null

        if (!thumbnailFile) {
            return c.json({ error: 'No thumbnail provided' }, 400)
        }

        // 验证文件类型
        if (!thumbnailFile.type.startsWith('image/')) {
            return c.json({ error: 'Invalid file type' }, 400)
        }

        // 限制大小（最大 500KB）
        if (thumbnailFile.size > 500 * 1024) {
            return c.json({ error: 'Thumbnail too large (max 500KB)' }, 400)
        }

        const thumbnailKey = `thumbnails/${user.id}/${fileId}.png`

        // 如果已有旧缩略图，先删除
        if (file.thumbnail_key) {
            await c.env.BUCKET.delete(file.thumbnail_key)
        }

        // 上传新缩略图到 R2
        const arrayBuffer = await thumbnailFile.arrayBuffer()
        await c.env.BUCKET.put(thumbnailKey, arrayBuffer, {
            httpMetadata: { contentType: 'image/png' }
        })

        // 更新数据库
        await c.env.DB.prepare(
            'UPDATE files SET thumbnail_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(thumbnailKey, fileId).run()

        return c.json({ success: true })
    } catch (error) {
        console.error('Upload thumbnail error:', error)
        return c.json({ error: 'Upload failed' }, 500)
    }
})

export default thumbnail
