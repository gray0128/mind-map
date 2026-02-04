<template>
  <Sidebar title="主题" name="theme">
    <div class="theme-container">
      <!-- 主题分类标签 -->
      <el-tabs v-model="activeTab" class="theme-tabs">
        <el-tab-pane 
          v-for="group in themeGroups" 
          :key="group.name" 
          :label="group.name" 
          :name="group.name"
        />
      </el-tabs>

      <!-- 主题列表 -->
      <div class="theme-list">
        <div
          v-for="item in currentThemeList"
          :key="item.value"
          class="theme-item"
          :class="{ active: item.value === currentTheme }"
          @click="selectTheme(item)"
        >
          <div class="theme-preview">
            <img :src="item.img || themeImgMap[item.value]" alt="" class="theme-img" />
          </div>
          <div class="theme-name">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import Sidebar from './Sidebar.vue'
import { ElMessage } from 'element-plus'
import themeImgMap from 'simple-mind-map-plugin-themes/themeImgMap'
import themeList from 'simple-mind-map-plugin-themes/themeList'

// 合并默认主题和插件主题
const allThemeList = [
  {
    name: '默认主题',
    value: 'default',
    dark: false
  },
  ...themeList
].reverse()

const mindMapStore = useMindMapStore()
const activeTab = ref('经典')
const currentTheme = ref('default')

// 初始化分组
const baiduThemes = [
  'default',
  'skyGreen',
  'classic2',
  'classic3',
  'classicGreen',
  'classicBlue',
  'blueSky',
  'brainImpairedPink',
  'earthYellow',
  'freshGreen',
  'freshRed',
  'romanticPurple',
  'pinkGrape',
  'mint'
]

// 主题分组
const themeGroups = computed(() => {
  const baiduList = []
  const classicsList = []
  const darkList = []

  allThemeList.forEach(item => {
    if (baiduThemes.includes(item.value)) {
      baiduList.push(item)
    } else if (item.dark) {
      darkList.push(item)
    } else {
      classicsList.push(item)
    }
  })

  return [
    {
      name: '经典',
      list: classicsList
    },
    {
      name: '暗色',
      list: darkList
    },
    {
      name: '简约',
      list: baiduList
    }
  ]
})

// 当前分类的主题列表
const currentThemeList = computed(() => {
  const group = themeGroups.value.find(g => g.name === activeTab.value)
  return group ? group.list : []
})

// 选择主题
const selectTheme = (theme) => {
  if (theme.value === currentTheme.value) return
  
  const mindMap = mindMapStore.getMindMap()
  if (!mindMap) return
  
  currentTheme.value = theme.value
  mindMap.setTheme(theme.value)
  mindMapStore.setLocalConfig({ isDark: theme.dark })
  ElMessage.success(`已切换到 ${theme.name} 主题`)
}

// 初始化当前主题
const initTheme = () => {
  const mindMap = mindMapStore.getMindMap()
  if (mindMap) {
    currentTheme.value = mindMap.getTheme()
  }
}

// 主题变化事件
const handleThemeChange = () => {
  const mindMap = mindMapStore.getMindMap()
  if (mindMap) {
    currentTheme.value = mindMap.getTheme()
  }
}

onMounted(() => {
  initTheme()
  const mindMap = mindMapStore.getMindMap()
  if (mindMap) {
    mindMap.on('view_theme_change', handleThemeChange)
  }
})

onBeforeUnmount(() => {
  const mindMap = mindMapStore.getMindMap()
  if (mindMap) {
    mindMap.off('view_theme_change', handleThemeChange)
  }
})
</script>

<style scoped>
.theme-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.theme-tabs {
  flex-shrink: 0;
  margin-bottom: 16px;
}

.theme-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 4px;
}

.theme-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.theme-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.theme-item.active {
  border-color: #409eff;
  box-shadow: 0 0 0 1px #409eff;
}

.theme-preview {
  width: 100%;
  height: 80px;
  overflow: hidden;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.theme-name {
  padding: 8px;
  text-align: center;
  font-size: 13px;
  color: #606266;
  background: #fff;
  border-top: 1px solid #ebeef5;
}

.theme-container :deep(.el-tabs__header) {
  margin-bottom: 10px;
}

.theme-container :deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}
</style>
