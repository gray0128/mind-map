<template>
  <div class="scale-container">
    <el-tooltip content="缩小" placement="top">
      <el-button :icon="Minus" circle size="small" @click="narrow" />
    </el-tooltip>
    <div class="scale-info">
      <input
        ref="inputRef"
        type="text"
        v-model="scaleNum"
        @input="onScaleNumInput"
        @change="onScaleNumChange"
        @focus="onScaleNumInputFocus"
        @keydown.stop
        @keyup.stop
      />%
    </div>
    <el-tooltip content="放大" placement="top">
      <el-button :icon="Plus" circle size="small" @click="enlarge" />
    </el-tooltip>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import { Minus, Plus } from '@element-plus/icons-vue'

const mindMapStore = useMindMapStore()

const inputRef = ref(null)
const scaleNum = ref(100)
const cacheScaleNum = ref(0)

// 转换成百分数
const toPer = (scale) => {
  return (scale * 100).toFixed(0)
}

// 缩小
const narrow = () => {
  const mindMap = mindMapStore.getMindMap()
  if (mindMap) {
    mindMap.view.narrow()
  }
}

// 放大
const enlarge = () => {
  const mindMap = mindMapStore.getMindMap()
  if (mindMap) {
    mindMap.view.enlarge()
  }
}

// 聚焦时缓存当前缩放倍数
const onScaleNumInputFocus = () => {
  cacheScaleNum.value = scaleNum.value
}

// 禁止输入非数字
const onScaleNumInput = () => {
  scaleNum.value = String(scaleNum.value).replace(/[^0-9]+/g, '')
}

// 手动输入缩放倍数
const onScaleNumChange = () => {
  const mindMap = mindMapStore.getMindMap()
  if (!mindMap) return
  
  const num = Number(scaleNum.value)
  if (Number.isNaN(num) || num <= 0) {
    scaleNum.value = cacheScaleNum.value
  } else {
    const cx = mindMap.width / 2
    const cy = mindMap.height / 2
    mindMap.view.setScale(num / 100, cx, cy)
  }
}

// 监听缩放事件
const onScale = (scale) => {
  scaleNum.value = toPer(scale)
  mindMapStore.setScale(Number(scaleNum.value))
}

const onDrawClick = () => {
  if (inputRef.value) inputRef.value.blur()
}

// 监听 mindMap 实例变化
watch(() => mindMapStore.mindMap, (val) => {
  if (val) {
    val.on('scale', onScale)
    val.on('draw_click', onDrawClick)
    scaleNum.value = toPer(val.view.scale)
  }
}, { immediate: true })

onBeforeUnmount(() => {
  const mindMap = mindMapStore.getMindMap()
  if (mindMap) {
    mindMap.off('scale', onScale)
    mindMap.off('draw_click', onDrawClick)
  }
})
</script>

<style scoped>
.scale-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.scale-info {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
}

.scale-info input {
  width: 35px;
  text-align: center;
  background-color: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: #606266;
}
</style>
