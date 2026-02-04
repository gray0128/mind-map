<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="isMobile ? '90%' : '50%'"
    :top="isMobile ? '20px' : '15vh'"
    custom-class="node-note-dialog"
    destroy-on-close
  >
    <div class="note-editor" ref="noteEditorRef" @keyup.stop @keydown.stop></div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import bus from '@/utils/bus'
import { isMobile as isMobileDevice } from 'simple-mind-map/src/utils/index'

const dialogVisible = ref(false)
const note = ref('')
const activeNodes = ref([])
const appointNode = ref(null) // 指定的节点，如果有的话
const noteEditorRef = ref(null)
let editorInstance = null

const isMobile = computed(() => isMobileDevice())
const title = computed(() => '备注')

// 监听 dialog 关闭，结束文本编辑状态
watch(dialogVisible, (val, oldVal) => {
  if (!val && oldVal) {
    bus.emit('endTextEdit')
  }
})

onMounted(() => {
  bus.on('node_active', handleNodeActive)
  bus.on('showNodeNote', handleShowNodeNote)
})

onBeforeUnmount(() => {
  bus.off('node_active', handleNodeActive)
  bus.off('showNodeNote', handleShowNodeNote)
})

const handleNodeActive = (payload) => {
  activeNodes.value = [...(payload.activeNodeList || [])]
}

const handleShowNodeNote = (node) => {
  bus.emit('startTextEdit')
  appointNode.value = node || null
  
  // 获取初始备注内容
  let initialContent = ''
  if (appointNode.value) {
    initialContent = appointNode.value.getData('note') || ''
  } else if (activeNodes.value.length > 0) {
    initialContent = activeNodes.value[0].getData('note') || ''
  }
  
  note.value = initialContent
  dialogVisible.value = true
  
  nextTick(() => {
    initEditor()
  })
}

const initEditor = () => {
  if (editorInstance) {
    editorInstance.destroy()
  }
  
  editorInstance = new Editor({
    el: noteEditorRef.value,
    height: '400px',
    initialEditType: 'markdown',
    previewStyle: 'vertical',
    initialValue: note.value
  })
}

const cancel = () => {
  dialogVisible.value = false
}

const confirm = () => {
  const content = editorInstance.getMarkdown()
  
  if (appointNode.value) {
    appointNode.value.setNote(content)
  } else if (activeNodes.value.length > 0) {
    activeNodes.value.forEach(node => {
      node.setNote(content)
    })
  }
  
  cancel()
}
</script>

<style scoped>
.note-editor {
  text-align: left;
}
</style>
