/**
 * MindMap Store
 * 管理思维导图实例和全局状态
 */
import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'

export const useMindMapStore = defineStore('mindmap', () => {
    // 使用 shallowRef 存储 MindMap 实例，避免深度响应式导致的性能问题
    const mindMap = shallowRef(null)

    // 当前激活的侧边栏
    const activeSidebar = ref('')

    // 是否只读模式
    const isReadonly = ref(false)

    // 是否全屏模式
    const isFullscreen = ref(false)

    // 当前缩放比例
    const scale = ref(100)

    // 当前文件名称
    const currentFileName = ref('思维导图')

    // 本地配置
    const localConfig = ref({
        isZenMode: false,
        openNodeRichText: true,
        isDark: false
    })

    // 设置 MindMap 实例
    function setMindMap(instance) {
        mindMap.value = instance
    }

    // 获取 MindMap 实例
    function getMindMap() {
        return mindMap.value
    }

    // 设置激活的侧边栏
    function setActiveSidebar(name) {
        activeSidebar.value = name
    }

    // 设置只读模式
    function setReadonly(value) {
        isReadonly.value = value
        if (mindMap.value) {
            mindMap.value.setMode(value ? 'readonly' : 'edit')
        }
    }

    // 设置全屏模式
    function setFullscreen(value) {
        isFullscreen.value = value
    }

    // 设置缩放比例
    function setScale(value) {
        scale.value = value
    }

    // 设置当前文件名称
    function setFileName(name) {
        currentFileName.value = name
    }

    // 更新本地配置
    function setLocalConfig(config) {
        localConfig.value = { ...localConfig.value, ...config }
        localStorage.setItem('SIMPLE_MIND_MAP_LOCAL_CONFIG', JSON.stringify(localConfig.value))
    }

    // 加载本地配置
    function loadLocalConfig() {
        const saved = localStorage.getItem('SIMPLE_MIND_MAP_LOCAL_CONFIG')
        if (saved) {
            try {
                localConfig.value = { ...localConfig.value, ...JSON.parse(saved) }
            } catch (e) {
                console.error('Failed to load local config:', e)
            }
        }
    }

    return {
        mindMap,
        activeSidebar,
        isReadonly,
        isFullscreen,
        scale,
        currentFileName,
        localConfig,
        setMindMap,
        getMindMap,
        setActiveSidebar,
        setReadonly,
        setFullscreen,
        setScale,
        setFileName,
        setLocalConfig,
        loadLocalConfig
    }
})
