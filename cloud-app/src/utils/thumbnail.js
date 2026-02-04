/**
 * 缩略图生成工具
 * 使用 simple-mind-map 的 Export 插件生成 PNG 缩略图
 */

const THUMBNAIL_WIDTH = 300
const THUMBNAIL_HEIGHT = 200

/**
 * 从 MindMap 实例生成缩略图
 * @param {MindMap} mindMap - MindMap 实例
 * @returns {Promise<Blob>} 缩略图 Blob
 */
export async function generateThumbnail(mindMap) {
    if (!mindMap) {
        throw new Error('MindMap instance is required')
    }

    try {
        // 使用 Export 插件导出 PNG
        const dataUrl = await mindMap.export('png', true, {
            width: THUMBNAIL_WIDTH,
            height: THUMBNAIL_HEIGHT,
            paddingX: 10,
            paddingY: 10
        })

        // 转换 Data URL 为 Blob
        const blob = dataURLtoBlob(dataUrl)
        return blob
    } catch (error) {
        console.error('Generate thumbnail error:', error)
        throw error
    }
}

/**
 * 将 Data URL 转换为 Blob
 * @param {string} dataURL - Base64 Data URL
 * @returns {Blob}
 */
function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }

    return new Blob([u8arr], { type: mime })
}

/**
 * 上传缩略图到服务器
 * @param {string} fileId - 文件 ID
 * @param {Blob} thumbnailBlob - 缩略图 Blob
 * @returns {Promise<void>}
 */
export async function uploadThumbnail(fileId, thumbnailBlob) {
    const formData = new FormData()
    formData.append('thumbnail', thumbnailBlob, 'thumbnail.png')

    const token = localStorage.getItem('token')

    const response = await fetch(`/api/files/${fileId}/thumbnail`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })

    if (!response.ok) {
        throw new Error('Upload thumbnail failed')
    }
}

/**
 * 生成并上传缩略图（组合方法）
 * @param {string} fileId - 文件 ID
 * @param {MindMap} mindMap - MindMap 实例
 * @returns {Promise<void>}
 */
export async function generateAndUploadThumbnail(fileId, mindMap) {
    try {
        const blob = await generateThumbnail(mindMap)
        await uploadThumbnail(fileId, blob)
        console.log('Thumbnail uploaded successfully')
    } catch (error) {
        // 缩略图生成失败不应阻断保存流程
        console.warn('Thumbnail generation/upload failed:', error)
    }
}
