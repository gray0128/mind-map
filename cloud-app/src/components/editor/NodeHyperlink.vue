<template>
  <el-dialog
    v-model="dialogVisible"
    title="超链接"
    :width="isMobile ? '90%' : '50%'"
    align-center
  >
    <div class="item">
      <span class="name">链接地址</span>
      <el-input
        v-model="link"
        placeholder="http://xxxx.com/"
        @keyup.stop
        @keydown.stop
        @blur="handleUrl(false)"
      >
        <template #prepend>
          <el-select v-model="protocol" style="width: 80px;">
            <el-option label="https" value="https"></el-option>
            <el-option label="http" value="http"></el-option>
            <el-option label="无" value="none"></el-option>
          </el-select>
        </template>
      </el-input>
    </div>
    <div class="item">
      <span class="name">链接名称</span>
      <el-input
        v-model="linkTitle"
        @keyup.stop
        @keydown.stop
      ></el-input>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import bus from '@/utils/bus'

const mindMapStore = useMindMapStore()
// Simplified mobile check
const isMobile = computed(() => window.innerWidth < 768)

const dialogVisible = ref(false)
const link = ref('')
const linkTitle = ref('')
const protocol = ref('https')
const activeNodes = ref([])

const removeProtocol = (url) => {
  return url.replace(/^https?:\/\//, '')
}

const handleUrl = (setProtocolNoneIfNotExist) => {
  const res = link.value.match(/^(https?):\/\//)
  if (res && res[1]) {
    protocol.value = res[1]
  } else if (!link.value) {
    protocol.value = 'https'
  } else if (setProtocolNoneIfNotExist) {
    protocol.value = 'none'
  }
  link.value = removeProtocol(link.value)
}

const handleNodeActive = (payload) => {
  activeNodes.value = [...(payload.activeNodeList || [])]
  if (activeNodes.value.length > 0) {
    const firstNode = activeNodes.value[0]
    link.value = firstNode.getData('hyperlink') || ''
    handleUrl(true)
    linkTitle.value = firstNode.getData('hyperlinkTitle') || ''
  } else {
    link.value = ''
    linkTitle.value = ''
  }
}

const handleShowNodeLink = () => {
  dialogVisible.value = true
}

const cancel = () => {
  dialogVisible.value = false
}

const confirm = () => {
  activeNodes.value.forEach(node => {
    node.setHyperlink(
      (protocol.value === 'none' ? '' : protocol.value + '://') + link.value,
      linkTitle.value
    )
  })
  cancel()
}

onMounted(() => {
  bus.on('node_active', handleNodeActive)
  bus.on('showNodeLink', handleShowNodeLink)
})

onBeforeUnmount(() => {
  bus.off('node_active', handleNodeActive)
  bus.off('showNodeLink', handleShowNodeLink)
})
</script>

<style scoped>
.item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.name {
  display: block;
  width: 80px;
  flex-shrink: 0;
}
</style>
