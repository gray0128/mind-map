<template>
  <div class="navigator-container" :class="{ 'is-dark': isDark }" :style="{ right: sidebarOpen ? '340px' : '20px' }">
    <div class="item">
      <el-tooltip effect="dark" content="回到中心" placement="top">
        <el-button link :icon="Aim" class="btn" @click="backToRoot" />
      </el-tooltip>
    </div>
    <div class="item">
      <el-tooltip effect="dark" content="搜索" placement="top">
        <el-button link :icon="Search" class="btn" @click="showSearch" />
      </el-tooltip>
    </div>
    <div class="item">
      <el-tooltip effect="dark" :content="openMiniMap ? '关闭导航器' : '开启导航器'" placement="top">
        <el-button link :icon="Compass" class="btn" @click="toggleMiniMap" />
      </el-tooltip>
    </div>
    <div class="item" v-if="props.showEditToggle">
      <el-tooltip effect="dark" :content="isReadonly ? '切换为编辑模式' : '切换为只读模式'" placement="top">
        <el-button link :icon="isReadonly ? View : Edit" class="btn" @click="toggleReadonly" />
      </el-tooltip>
    </div>
    <div class="item">
      <el-tooltip effect="dark" :content="isFullscreen ? '退出全屏' : '全屏'" placement="top">
        <el-button link :icon="FullScreen" class="btn" @click="toggleFullscreen" />
      </el-tooltip>
    </div>
    <div class="item">
      <Scale />
    </div>
    <div class="item">
      <el-tooltip effect="dark" :content="isDark ? '浅色模式' : '暗色模式'" placement="top">
        <el-button link :icon="isDark ? Sunny : Moon" class="btn" @click="toggleDark" />
      </el-tooltip>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import bus from '@/utils/bus'
import Scale from './Scale.vue'
import {
  Aim, Search, Compass, View, Edit, FullScreen, Moon, Sunny
} from '@element-plus/icons-vue'
import screenfull from 'screenfull'

const props = defineProps({
  showEditToggle: {
    type: Boolean,
    default: true
  }
})

const mindMapStore = useMindMapStore()
const mindMap = computed(() => mindMapStore.mindMap)
const isDark = computed(() => mindMapStore.localConfig.isDark)
const isReadonly = computed(() => mindMapStore.isReadonly)
const isFullscreen = computed(() => mindMapStore.isFullscreen)
const sidebarOpen = computed(() => !!mindMapStore.activeSidebar)

const openMiniMap = ref(false)

const backToRoot = () => {
  if (mindMap.value) {
    mindMap.value.renderer.setRootNodeCenter()
  }
}

const showSearch = () => {
  bus.emit('show_search')
}

const toggleMiniMap = () => {
  openMiniMap.value = !openMiniMap.value
  bus.emit('toggle_mini_map', openMiniMap.value)
}

const toggleReadonly = () => {
  mindMapStore.setReadonly(!isReadonly.value)
}

const toggleFullscreen = () => {
  if (screenfull.isEnabled) {
    screenfull.toggle()
  }
}

const toggleDark = () => {
  mindMapStore.setLocalConfig({
    isDark: !isDark.value
  })
}
</script>

<style scoped>
.navigator-container {
  padding: 0 12px;
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: hsla(0, 0%, 100%, 0.8);
  border-radius: 5px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 44px;
  font-size: 12px;
  display: flex;
  align-items: center;
  z-index: 1000;
  transition: right 0.3s ease;
}

.navigator-container.is-dark {
  background: #262a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.item {
  margin-right: 15px;
  display: flex;
  align-items: center;
}

.item:last-of-type {
  margin-right: 0;
}

.btn {
  font-size: 18px;
  color: #606266;
}

.is-dark .btn {
  color: #aeb5c0;
}

.is-dark .btn:hover {
  color: #fff;
}
</style>
