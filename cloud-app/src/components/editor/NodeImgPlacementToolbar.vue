<template>
  <div
    class="node-img-placement-toolbar"
    ref="toolbarRef"
    :style="{ left: style.left, top: style.top }"
    @click.stop
    v-show="showToolbar"
  >
    <div
      class="item"
      v-for="item in imgPlacementList"
      :key="item"
      :class="{ selected: imgPlacement === item }"
      @click="updateImgPlacement(item)"
    >
      <el-icon :class="getIconClass(item)"><Top /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import { Top } from '@element-plus/icons-vue'

const mindMapStore = useMindMapStore()
const mindMap = computed(() => mindMapStore.mindMap)

const showToolbar = ref(false)
const style = ref({ left: '0px', top: '0px' })
const imgPlacementList = ['top', 'bottom', 'left', 'right']
const node = ref(null)
const imgNode = ref(null)
const imgPlacement = ref('')
const toolbarRef = ref(null)

const getIconClass = (item) => {
    switch(item) {
        case 'top': return ''
        case 'bottom': return 'rotate-180'
        case 'left': return 'rotate-minus-90'
        case 'right': return 'rotate-90'
        default: return ''
    }
}

const show = (targetNode, targetImgNode) => {
    node.value = targetNode
    imgPlacement.value = targetNode.getStyle('imgPlacement')
    imgNode.value = targetImgNode
    showToolbar.value = true
    nextTick(() => {
        updatePos()
    })
}

const close = () => {
    showToolbar.value = false
    node.value = null
    imgPlacement.value = ''
    imgNode.value = null
    style.value = { left: '0px', top: '0px' }
}

const updatePos = () => {
    if (!imgNode.value || !toolbarRef.value) return
    const { width, height } = toolbarRef.value.getBoundingClientRect()
    const { width: imgWidth, x, y } = imgNode.value.rbox()
    style.value.left = (x + imgWidth / 2 - width / 2) + 'px'
    style.value.top = (y - height - 5) + 'px'
}

const onScale = () => {
    if (showToolbar.value) updatePos()
}

const onNodeActive = (payload) => {
    const activeNode = payload.node
    if (activeNode === node.value) return
    close()
}

const updateImgPlacement = (item) => {
    imgPlacement.value = item
    if (node.value) {
        node.value.setStyle('imgPlacement', item)
    }
    close()
}

const bindEvents = () => {
    if (!mindMap.value) return
    mindMap.value.on('node_img_click', show)
    mindMap.value.on('draw_click', close)
    mindMap.value.on('svg_mousedown', close)
    mindMap.value.on('node_dblclick', close)
    mindMap.value.on('node_active', onNodeActive)
    mindMap.value.on('scale', onScale)
    mindMap.value.on('node_img_adjust_btn_mousedown', close)
    mindMap.value.on('delete_node_img_from_delete_btn', close)
    mindMap.value.on('translate', close)
}

const unbindEvents = () => {
    if (!mindMap.value) return
    mindMap.value.off('node_img_click', show)
    mindMap.value.off('draw_click', close)
    mindMap.value.off('svg_mousedown', close)
    mindMap.value.off('node_dblclick', close)
    mindMap.value.off('node_active', onNodeActive)
    mindMap.value.off('scale', onScale)
    mindMap.value.off('node_img_adjust_btn_mousedown', close)
    mindMap.value.off('delete_node_img_from_delete_btn', close)
    mindMap.value.off('translate', close)
}

onMounted(() => {
    document.body.appendChild(toolbarRef.value)
    if (mindMap.value) {
        bindEvents()
    } else {
        const unwatch = watch(mindMap, (val) => {
            if (val) {
                bindEvents()
                unwatch()
            }
        })
    }
})

onBeforeUnmount(() => {
    if (toolbarRef.value && toolbarRef.value.parentNode) {
        toolbarRef.value.parentNode.removeChild(toolbarRef.value)
    }
    unbindEvents()
})
</script>

<style scoped>
.node-img-placement-toolbar {
  position: fixed;
  z-index: 2000;
  height: 40px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 8px;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.item {
  width: 30px;
  height: 30px;
  margin: 0 5px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.item:hover {
  background-color: rgb(237, 237, 237);
}

.item.selected {
  background-color: rgb(237, 237, 237);
  color: #409eff;
}

.rotate-180 {
    transform: rotate(180deg);
}

.rotate-90 {
    transform: rotate(90deg);
}

.rotate-minus-90 {
    transform: rotate(-90deg);
}
</style>
