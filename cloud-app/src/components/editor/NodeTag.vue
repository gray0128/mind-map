<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="isMobile ? '90%' : '50%'"
    :top="isMobile ? '20px' : '15vh'"
    custom-class="node-tag-dialog"
  >
    <el-input
      v-model="tag"
      @keyup.enter="add"
      @keyup.stop
      @keydown.stop
      :disabled="tagArr.length >= max"
      placeholder="请输入标签内容，按回车键添加"
    >
    </el-input>
    <div class="tag-list">
      <div
        class="tag-item"
        v-for="(item, index) in tagArr"
        :key="index"
        :style="{
          backgroundColor: generateColorByContent(item)
        }"
      >
        {{ typeof item === 'string' ? item : item.text }}
        <div class="del-btn" @click="del(index)">
          <el-icon><Delete /></el-icon>
        </div>
      </div>
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
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { generateColorByContent, isMobile as isMobileDevice } from 'simple-mind-map/src/utils/index'
import bus from '@/utils/bus'
import { Delete } from '@element-plus/icons-vue'

const dialogVisible = ref(false)
const tagArr = ref([])
const tag = ref('')
const activeNodes = ref([])
const max = ref(5)

const isMobile = computed(() => isMobileDevice())
const title = computed(() => '设置标签')

watch(dialogVisible, (val, oldVal) => {
  if (!val && oldVal) {
    bus.emit('endTextEdit')
  }
})

onMounted(() => {
  bus.on('node_active', handleNodeActive)
  bus.on('showNodeTag', handleShowNodeTag)
})

onBeforeUnmount(() => {
  bus.off('node_active', handleNodeActive)
  bus.off('showNodeTag', handleShowNodeTag)
})

const handleNodeActive = (payload) => {
  activeNodes.value = [...(payload.activeNodeList || [])]
  if (activeNodes.value.length > 0) {
    let firstNode = activeNodes.value[0]
    tagArr.value = [...(firstNode.getData('tag') || [])]
  } else {
    tagArr.value = []
    tag.value = ''
  }
}

const handleShowNodeTag = () => {
  bus.emit('startTextEdit')
  dialogVisible.value = true
  // Re-fetch tags just in case
  if (activeNodes.value.length > 0) {
      let firstNode = activeNodes.value[0]
      tagArr.value = [...(firstNode.getData('tag') || [])]
  }
}

const add = () => {
  const text = tag.value.trim()
  if (!text) return
  tagArr.value.push(text)
  tag.value = ''
}

const del = (index) => {
  tagArr.value.splice(index, 1)
}

const cancel = () => {
  dialogVisible.value = false
}

const confirm = () => {
  activeNodes.value.forEach(node => {
    node.setTag([...tagArr.value])
  })
  cancel()
}
</script>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 15px;
}

.tag-item {
  position: relative;
  padding: 3px 8px;
  margin-right: 10px;
  margin-bottom: 10px;
  color: #fff;
  border-radius: 4px;
}

.del-btn {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  visibility: hidden;
  border-radius: 4px;
}

.tag-item:hover .del-btn {
  visibility: visible;
}
</style>
