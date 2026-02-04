<template>
  <div
    class="sidebar-container"
    @click.stop
    :class="{ show: show }"
  >
    <div class="sidebar-header">
      <span class="title">{{ title }}</span>
      <el-button :icon="Close" circle size="small" @click="close" />
    </div>
    <div class="sidebar-content" ref="sidebarContent">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import bus from '@/utils/bus'
import { Close } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true
  }
})

const mindMapStore = useMindMapStore()
const show = ref(false)
const sidebarContent = ref(null)

// 监听激活的侧边栏
watch(() => mindMapStore.activeSidebar, (val) => {
  show.value = val === props.name
})

// 关闭侧边栏
const close = () => {
  show.value = false
  mindMapStore.setActiveSidebar('')
}

// 监听关闭事件
bus.on('closeSideBar', close)

// 暴露方法
defineExpose({
  show,
  close,
  getEl: () => sidebarContent.value
})
</script>

<style scoped>
.sidebar-container {
  position: fixed;
  right: -320px;
  top: 90px;
  bottom: 0;
  width: 320px;
  background-color: #fff;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: right 0.3s ease;
  z-index: 100;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-container.show {
  right: 0;
}

.sidebar-header {
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.sidebar-header .title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.sidebar-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
</style>
