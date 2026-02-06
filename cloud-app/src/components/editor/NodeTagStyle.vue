<template>
  <Teleport to="body">
    <div
      class="node-tag-style-container"
      ref="elRef"
      :style="{ left: position.left, top: position.top }"
      v-show="show"
      :class="{ 'is-dark': isDark }"
      @click.stop
    >
    <div class="row">
      <el-input
        v-model="text"
        placeholder="标签内容"
        size="small"
        @blur="updateTagText"
        @keydown.stop
        @keyup.enter.stop="updateTagText"
      ></el-input>
      <div class="delete-btn" @click.stop="deleteTag">
        <el-icon><Delete /></el-icon>
        <span class="text">删除</span>
      </div>
    </div>
    <div class="row">
      <el-color-picker v-model="fill" size="small" @change="updateTagFill" />
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import { Delete } from '@element-plus/icons-vue'

const store = useMindMapStore()
const elRef = ref(null)
const show = ref(false)
const position = ref({ left: 0, top: 0 })
const node = ref(null)
const index = ref(0)
const text = ref('')
const fill = ref('')

const isDark = computed(() => store.localConfig.isDark)
const mindMap = computed(() => store.mindMap)

onMounted(() => {
  if (mindMap.value) {
    mindMap.value.on('node_tag_click', onNodeTagClick)
    mindMap.value.on('scale', hide)
    mindMap.value.on('translate', hide)
    mindMap.value.on('svg_mousedown', hide)
    mindMap.value.on('expand_btn_click', hide)
  }
  document.body.appendChild(elRef.value)
})

onBeforeUnmount(() => {
  if (mindMap.value) {
    mindMap.value.off('node_tag_click', onNodeTagClick)
    mindMap.value.off('scale', hide)
    mindMap.value.off('translate', hide)
    mindMap.value.off('svg_mousedown', hide)
    mindMap.value.off('expand_btn_click', hide)
  }
  if (elRef.value && elRef.value.parentNode) {
    elRef.value.parentNode.removeChild(elRef.value)
  }
})

const onNodeTagClick = (n, tag, idx, el) => {
  node.value = n
  index.value = idx
  
  if (typeof tag === 'string') {
    text.value = tag
    fill.value = '' // Default color?
  } else {
    text.value = tag.text
    fill.value = (tag.style && tag.style.fill) ? tag.style.fill : ''
  }
  
  // Calculate position
  const { x, y, width, height } = el.rbox()
  const boxWidth = 260
  const boxHeight = 100 // Estimate
  
  let left = x + width / 2 - boxWidth / 2
  if (left < 0) left = 0
  if (left + boxWidth > window.innerWidth) left = window.innerWidth - boxWidth
  
  let top = y + height + 5
  if (top + boxHeight > window.innerHeight) top = window.innerHeight - boxHeight
  
  position.value = {
    left: left + 'px',
    top: top + 'px'
  }
  
  show.value = true
}

const updateTagText = () => {
  const t = text.value.trim()
  if (!t) return
  updateTagInfo({ text: t })
}

const updateTagFill = (color) => {
  // el-color-picker returns null if cleared, handle it
  const c = color || ''
  updateTagInfo({ style: { fill: c } })
  fill.value = c
}

const updateTagInfo = ({ text: newText, style }) => {
  if (!node.value) return
  const tagData = [...(node.value.getData('tag') || [])]
  let item = null
  
  if (typeof tagData[index.value] === 'string') {
    item = {
      text: tagData[index.value],
      style: {}
    }
  } else {
    item = tagData[index.value]
    if (!item.style) item.style = {}
  }
  
  if (newText) item.text = newText
  if (style) {
    Object.keys(style).forEach(key => {
      item.style[key] = style[key]
    })
  }
  
  tagData[index.value] = item
  mindMap.value.execCommand('SET_NODE_TAG', node.value, tagData)
}

const deleteTag = () => {
  if (!node.value) return
  const tagData = [...(node.value.getData('tag') || [])]
  tagData.splice(index.value, 1)
  mindMap.value.execCommand('SET_NODE_TAG', node.value, tagData)
  hide()
}

const hide = () => {
  show.value = false
  node.value = null
  index.value = 0
  text.value = ''
  fill.value = ''
}
</script>

<style scoped>
.node-tag-style-container {
  position: fixed;
  width: 260px;
  padding: 12px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
  z-index: 3000;
}

.node-tag-style-container.is-dark {
  background-color: #262a2e;
  border-color: hsla(0, 0%, 100%, 0.1);
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.row:last-child {
  margin-bottom: 0;
}

.delete-btn {
  white-space: nowrap;
  display: flex;
  align-items: center;
  margin-left: 10px;
  cursor: pointer;
  color: #9aa5b8;
  font-size: 12px;
  user-select: none;
}

.delete-btn:hover {
  color: #f56c6c;
}

.delete-btn .text {
  margin-left: 2px;
}
</style>
