<template>
  <Sidebar ref="sidebarRef" title="备注" name="noteSidebar">
    <div class="note-content-wrap" ref="noteContentWrap"></div>
  </Sidebar>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import Sidebar from './Sidebar.vue'
import { useMindMapStore } from '@/store/mindmap'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'
import bus from '@/utils/bus'

const store = useMindMapStore()
const sidebarRef = ref(null)
const noteContentWrap = ref(null)
let viewerInstance = null
let noteNode = null

const activeSidebar = computed(() => store.activeSidebar)
const mindMap = computed(() => store.mindMap)

watch(activeSidebar, (val) => {
  if (sidebarRef.value) {
    sidebarRef.value.show = val === 'noteSidebar'
  }
})

onMounted(() => {
  bus.on('node_active', onNodeActive)
  if (mindMap.value) {
    mindMap.value.on('node_note_click', onNodeNoteClick)
  }
  
  // Create viewer instance
  initViewer()
})

onBeforeUnmount(() => {
  bus.off('node_active', onNodeActive)
  if (mindMap.value) {
    mindMap.value.off('node_note_click', onNodeNoteClick)
  }
})

const initViewer = () => {
    if (!viewerInstance && noteContentWrap.value) {
        viewerInstance = new Viewer({
            el: noteContentWrap.value
        })
    }
}

const onNodeActive = (payload) => {
  if (activeSidebar.value !== 'noteSidebar') {
    return
  }
  const nodes = payload.activeNodeList || []
  if (nodes.length > 0) {
    if (nodes[0] !== noteNode) {
      store.setActiveSidebar('')
    }
  } else {
    store.setActiveSidebar('')
  }
}

const onNodeNoteClick = (node) => {
  noteNode = node
  store.setActiveSidebar('noteSidebar')
  if (viewerInstance) {
      viewerInstance.setMarkdown(node.getData('note') || '')
  }
}
</script>

<style scoped>
.note-content-wrap {
  padding: 12px 20px;
}
</style>
