<template>
  <div class="sidebarTrigger" :style="{ right: sidebarOpen ? '320px' : '0' }">
    <div 
      v-for="item in triggerList" 
      :key="item.value"
      class="triggerBtn"
      :class="{ active: isActive(item.value) }"
      @click="toggleSidebar(item.value)"
    >
      <div class="icon">
        <span class="iconfont" :class="item.icon"></span>
      </div>
      <span class="text">{{ item.name }}</span>
    </div>
  </div>
</template>
 
<script setup>
import { computed } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
 
const mindMapStore = useMindMapStore()
 
// 侧边栏触发器列表
const triggerList = [
  { name: '样式', value: 'style', icon: 'iconzhuti' },
  { name: '基础', value: 'baseStyle', icon: 'iconyangshi' },
  { name: '主题', value: 'theme', icon: 'iconjingzi' },
  { name: '结构', value: 'structure', icon: 'iconjiegou' }
]
 
// 当前激活的侧边栏
const activeSidebar = computed(() => mindMapStore.activeSidebar)
 
// 侧边栏是否展开
const sidebarOpen = computed(() => !!mindMapStore.activeSidebar)

// 判断按钮是否激活
const isActive = (value) => {
  if (value === 'style') {
    return ['style', 'associativeLineStyle', 'nodeOuterFrameStyle'].includes(activeSidebar.value)
  }
  return activeSidebar.value === value
}
 
// 切换侧边栏（再次点击折叠）
const toggleSidebar = (name) => {
  if (name === 'style') {
    const mindMap = mindMapStore.getMindMap()
    if (mindMap) {
      if (mindMap.renderer.activeNodeList.length > 0) {
        name = 'style'
      } else if (mindMap.associativeLine && mindMap.associativeLine.activeLine) {
        name = 'associativeLineStyle'
      } else if (mindMap.outerFrame && mindMap.outerFrame.activeOuterFrame) {
        name = 'nodeOuterFrameStyle'
      }
    }
  }

  if (activeSidebar.value === name) {
    mindMapStore.setActiveSidebar('')
  } else {
    mindMapStore.setActiveSidebar(name)
  }
}
</script>
 
<style scoped>
.sidebarTrigger {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background-color: #fff;
  border-radius: 5px 0 0 5px;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.06);
  padding: 8px 0;
  z-index: 101;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: right 0.3s ease;
}
 
.triggerBtn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px 12px;
  transition: all 0.2s;
  min-width: 48px;
}
 
.triggerBtn:hover {
  background-color: #f5f7fa;
}
 
.triggerBtn.active {
  background-color: #ecf5ff;
}
 
.triggerBtn.active .icon {
  color: #409eff;
}
 
.triggerBtn.active .text {
  color: #409eff;
}
 
.triggerBtn .icon {
  font-size: 18px;
  color: #333;
  margin-bottom: 2px;
}
 
.triggerBtn .text {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}
</style>
