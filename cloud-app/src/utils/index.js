/**
 * 工具函数
 * 从 web/src/utils/index.js 迁移
 */

// 全屏事件检测
const getOnfullscreenEvent = () => {
    if (document.documentElement.requestFullScreen) {
        return 'onfullscreenchange'
    } else if (document.documentElement.webkitRequestFullScreen) {
        return 'onwebkitfullscreenchange'
    } else if (document.documentElement.mozRequestFullScreen) {
        return 'onmozfullscreenchange'
    } else if (document.documentElement.msRequestFullscreen) {
        return 'onmsfullscreenchange'
    }
}

export const fullscreenEvent = getOnfullscreenEvent()

// 全屏
export const fullScreen = element => {
    if (element.requestFullScreen) {
        element.requestFullScreen()
    } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen()
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
    }
}

// 退出全屏
export const exitFullScreen = () => {
    if (document.exitFullscreen) {
        document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
    }
}

// 检测是否全屏
export const isFullScreen = () => {
    return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    )
}

// 文件转buffer
export const fileToBuffer = file => {
    return new Promise(r => {
        const reader = new FileReader()
        reader.onload = () => {
            r(reader.result)
        }
        reader.readAsArrayBuffer(file)
    })
}

// 复制文本到剪贴板（优先使用现代 API，降级使用 execCommand）
export const copyToClipboard = async (text) => {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text)
            return true
        } catch (e) {
            // 降级处理
        }
    }
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
}

// 保留旧函数名（向后兼容）
export const copy = copyToClipboard
export const setDataToClipboard = copyToClipboard

// 复制图片到剪贴板
export const setImgToClipboard = img => {
    if (navigator.clipboard && navigator.clipboard.write) {
        const data = [new ClipboardItem({ ['image/png']: img })]
        navigator.clipboard.write(data)
    }
}

// 打印大纲
export const printOutline = el => {
    const printContent = el.outerHTML
    const iframe = document.createElement('iframe')
    iframe.setAttribute('style', 'position: absolute; width: 0; height: 0;')
    document.body.appendChild(iframe)
    const iframeDoc = iframe.contentWindow.document
    const styleList = document.querySelectorAll('style')
    Array.from(styleList).forEach(el => {
        iframeDoc.write(el.outerHTML)
    })
    iframeDoc.write('<style media="print">@page {size: portrait;}</style>')
    iframeDoc.write('<div>' + printContent + '</div>')
    setTimeout(function () {
        iframe.contentWindow?.print()
        document.body.removeChild(iframe)
    }, 500)
}

// 获取带特定类名的父元素
export const getParentWithClass = (el, className) => {
    if (el.classList.contains(className)) {
        return el
    }
    if (el.parentNode && el.parentNode !== document.body) {
        return getParentWithClass(el.parentNode, className)
    }
    return null
}

// 防抖函数
export const debounce = (fn, delay = 300) => {
    let timer = null
    return function (...args) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, delay)
    }
}

// 节流函数
export const throttle = (fn, delay = 300) => {
    let lastTime = 0
    return function (...args) {
        const now = Date.now()
        if (now - lastTime >= delay) {
            fn.apply(this, args)
            lastTime = now
        }
    }
}

// 从 HTML 中提取文本
export const getTextFromHtml = (html) => {
    if (!html) return ''
    return html.replace(/<[^>]+>/g, "")
}
