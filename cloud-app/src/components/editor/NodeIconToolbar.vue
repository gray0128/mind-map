<template>
    <div class="nodeIconToolbar" ref="nodeIconToolbarRef" :style="style" @click.stop v-show="showNodeIconToolbar">
        <div class="iconListBox">
            <div class="icon" v-for="icon in iconList" :key="icon.name" v-html="getHtml(icon.icon)" :class="{
                selected: nodeIconList.includes(iconType + '_' + icon.name)
            }" @click="setIcon(icon.name)"></div>
        </div>
        <div class="btnBox">
            <span class="btn" @click="deleteIcon">删除</span>
        </div>
    </div>
</template>
  
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { nodeIconList as _nodeIconList } from 'simple-mind-map/src/svg/icons'
import icon from '@/config/icon'
import { useMindMapStore } from '@/store/mindmap'
import bus from '@/utils/bus'

const allIconList = [..._nodeIconList, ...icon]

const mindMapStore = useMindMapStore()
const mindMap = computed(() => mindMapStore.mindMap)
const activeSidebar = computed(() => mindMapStore.activeSidebar)

const showNodeIconToolbar = ref(false)
const style = ref({
    left: 0,
    top: 0
})
const node = ref(null)
const iconType = ref('')
const iconName = ref('')
const nodeIconList = ref([])
const iconList = ref([])
const nodeIconToolbarRef = ref(null)

const updatePos = () => {
    if (!node.value) return
    const rect = node.value.getRect()
    style.value = {
        left: rect.x + 'px',
        top: rect.y + rect.height + 'px'
    }
}

const show = (targetNode, icon) => {
    node.value = targetNode
    iconType.value = icon.split('_')[0]
    iconName.value = icon.split('_')[1]
    nodeIconList.value = targetNode.getData('icon') || []
    const foundType = allIconList.find((item) => item.type === iconType.value)
    iconList.value = foundType ? [...foundType.list] : []
    updatePos()
    showNodeIconToolbar.value = true
    if (activeSidebar.value === 'icon') {
        mindMapStore.setActiveSidebar('')
    }
}

const close = () => {
    showNodeIconToolbar.value = false
    node.value = null
    iconType.value = ''
    iconName.value = ''
    nodeIconList.value = []
    iconList.value = []
    style.value = { left: 0, top: 0 }
}

const deleteIcon = () => {
    setIcon(iconName.value)
    close()
}

const getHtml = (icon) => {
    return /^<svg/.test(icon) ? icon : `<img src="${icon}" />`
}

const setIcon = (name) => {
    if (!node.value) return
    
    let key = iconType.value + '_' + name
    let list = [...nodeIconList.value]
    let index = list.findIndex(item => item === key)
    
    // 删除icon
    if (index !== -1) {
        list.splice(index, 1)
    } else {
        let typeIndex = list.findIndex(item => {
            return item.split('_')[0] === iconType.value
        })
        // 替换icon
        if (typeIndex !== -1) {
            list.splice(typeIndex, 1, key)
            iconName.value = name
        } else {
            // 增加icon
            list.push(key)
        }
    }
    node.value.setIcon(list)
    nodeIconList.value = list
}

const onScale = () => {
    updatePos()
}

const onNodeActive = (payload) => {
    if (!payload) {
        close()
        return
    }
    const activeNode = payload.node
    if (activeNode === node.value) {
        return
    }
    close()
}

// Watch for mindMap availability to bind events
watch(mindMap, (val) => {
    if (val) {
        val.on('node_icon_click', show)
        val.on('draw_click', close)
        val.on('svg_mousedown', close)
        val.on('node_dblclick', close)
        val.on('node_active', onNodeActive)
        val.on('scale', onScale)
    }
})

onMounted(() => {
    if (mindMap.value) {
        mindMap.value.on('node_icon_click', show)
        mindMap.value.on('draw_click', close)
        mindMap.value.on('svg_mousedown', close)
        mindMap.value.on('node_dblclick', close)
        mindMap.value.on('node_active', onNodeActive)
        mindMap.value.on('scale', onScale)
    }
    bus.on('close_node_icon_toolbar', close)
    // Append to body if not already there, though Vue 3 teleport is better, appending manually works too
    // But since this is a component inside Editor, we can position it relative to editor or use fixed.
    // Legacy used document.body.append. Fixed positioning needs viewport coordinates. 
    // Mindmap node.getRect() returns coordinates relative to canvas or viewport depending on implementation.
    // In simple-mind-map, getRect returns view coordinates (relative to container). 
    // If we put this component inside #app or body, we need page coordinates.
    // If we put it inside Editor relative container, we need relative coordinates.
    // Let's assume it's placed in Editor.vue which might be the container. 
    // Actually, style uses fixed positioning in legacy.
})

onBeforeUnmount(() => {
    if (mindMap.value) {
        mindMap.value.off('node_icon_click', show)
        mindMap.value.off('draw_click', close)
        mindMap.value.off('svg_mousedown', close)
        mindMap.value.off('node_dblclick', close)
        mindMap.value.off('node_active', onNodeActive)
        mindMap.value.off('scale', onScale)
    }
    bus.off('close_node_icon_toolbar', close)
})
</script>

<style scoped>
.nodeIconToolbar {
    position: fixed;
    z-index: 2000;
    width: 210px;
    max-height: 220px;
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 8px;
    box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    opacity: 1;
}

.iconListBox {
    width: 100%;
    height: 180px;
    overflow-y: auto;
    padding: 10px;
}

.iconListBox .icon {
    width: 24px;
    height: 24px;
    margin: 5px;
    cursor: pointer;
    position: relative;
    float: left;
}

.iconListBox .icon :deep(img),
.iconListBox .icon :deep(svg) {
    width: 100%;
    height: 100%;
}

.iconListBox .icon.selected::after {
    content: '';
    position: absolute;
    left: -4px;
    top: -4px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid #409eff;
}

.btnBox {
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid #eee;
    flex-shrink: 0;
    background: #f5f7fa;
}

.btn {
    cursor: pointer;
    color: #606266;
    font-size: 14px;
}

.btn:hover {
    color: #409eff;
}
</style>
