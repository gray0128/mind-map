<template>
  <div
    class="note-content-viewer custom-scrollbar"
    ref="viewerRef"
    :style="{
      left: left + 'px',
      top: top + 'px',
      visibility: show ? 'visible' : 'hidden'
    }"
    @click.stop
    @mousedown.stop
    @mousemove.stop
    @mouseup.stop
    @wheel.stop
  >
    <div class="note-content-inner custom-scrollbar" ref="contentInnerRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'
import bus from '@/utils/bus'

const store = useMindMapStore()
const viewerRef = ref(null)
const contentInnerRef = ref(null)
const show = ref(false)
const left = ref(0)
const top = ref(0)
let viewerInstance = null
let currentNode = null

const mindMap = computed(() => store.mindMap)

onMounted(() => {
  bus.on('showNoteContent', onShowNoteContent)
  bus.on('hideNoteContent', hideNoteContent)
  bus.on('node_active', onNodeActive)
  bus.on('scale', onScale)
  bus.on('translate', onScale)
  bus.on('svg_mousedown', hideNoteContent)
  bus.on('expand_btn_click', hideNoteContent)
  
  document.body.addEventListener('click', hideNoteContent)
  
  if (viewerRef.value) {
      document.body.appendChild(viewerRef.value)
  }
  
  initViewer()
})

onBeforeUnmount(() => {
  bus.off('showNoteContent', onShowNoteContent)
  bus.off('hideNoteContent', hideNoteContent)
  bus.off('node_active', onNodeActive)
  bus.off('scale', onScale)
  bus.off('translate', onScale)
  bus.off('svg_mousedown', hideNoteContent)
  bus.off('expand_btn_click', hideNoteContent)
  
  document.body.removeEventListener('click', hideNoteContent)
  
  if (viewerRef.value && viewerRef.value.parentNode) {
      viewerRef.value.parentNode.removeChild(viewerRef.value)
  }
})

const initViewer = () => {
    if (!viewerInstance && contentInnerRef.value) {
        viewerInstance = new Viewer({
            el: contentInnerRef.value
        })
    }
}

const onNodeActive = (payload) => {
  const nodes = payload.activeNodeList || []
  if (nodes.length > 0) {
    if (nodes[0] !== currentNode) {
      hideNoteContent()
    }
  } else {
    hideNoteContent()
  }
}

const onShowNoteContent = (content, l, t, node) => {
  currentNode = node
  if (viewerInstance) {
      viewerInstance.setMarkdown(content)
  }
  handleALink()
  updateNoteContentPosition(l, t)
  show.value = true
}

const handleALink = () => {
  if (viewerRef.value) {
      const list = viewerRef.value.querySelectorAll('a')
      Array.from(list).forEach(a => {
        a.setAttribute('target', '_blank')
      })
  }
}

const updateNoteContentPosition = (l, t) => {
  if (!viewerRef.value || !mindMap.value) return
  
  const { width, height } = viewerRef.value.getBoundingClientRect() // use updated dimensions?
  // Wait, viewer content might not render immediately? 
  // Maybe nextTick not strictly needed if synchronous, but better to be safe?
  // Legacy didn't use nextTick.
  
  const { right, bottom } = mindMap.value.elRect
  
  left.value = l + width > right ? right - width : l
  top.value = t + height > bottom ? bottom - height : t
}

const onScale = () => {
  if (!currentNode || !show.value) return
  const { left: l, top: t } = currentNode.getNoteContentPosition()
  updateNoteContentPosition(l, t)
}

const hideNoteContent = () => {
  show.value = false
}

</script>

<style scoped>
.note-content-viewer {
  position: fixed;
  background-color: #fff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
  z-index: 2000; /* High z-index */
}

.note-content-inner {
  max-width: 250px;
  max-height: 300px;
  overflow-y: auto;
}
</style>
