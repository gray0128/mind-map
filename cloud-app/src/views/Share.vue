<template>
  <div class="share-page">
    <el-header class="share-header" height="60px" v-if="!loading && !error">
      <div class="header-left">
        <el-icon class="header-icon"><DocumentCopy /></el-icon>
        <h1 class="header-title">{{ fileInfo?.name }}</h1>
      </div>
      
      <div class="header-right">
        <el-button type="primary" @click="downloadFile">
          <el-icon><Download /></el-icon> 下载
        </el-button>
      </div>
    </el-header>

    <el-main class="share-container-wrapper" v-if="!loading && !error">
      <div class="share-container" ref="shareContainer">
        <!-- simple-mind-map 将在这里渲染 -->
      </div>
      
      <!-- 悬浮组件 -->
      <NavigatorToolbar :show-edit-toggle="false" />
      <NodeNoteContentShow />
      <NodeImgPreview />
      <NodeHyperlink />
      <NodeTagStyle />
    </el-main>

    <!-- 加载遮罩 -->
    <el-overlay :show="loading" :lock-scroll="true" class="loading-overlay">
      <template #overlay>
        <div class="loading-content">
          <el-spinner type="dots" :size="40"></el-spinner>
          <div style="margin-top: 20px;">正在加载思维导图...</div>
        </div>
      </template>
    </el-overlay>

    <!-- 错误页面 -->
    <div class="error-page" v-if="error">
      <el-result
        icon="warning"
        title="分享已失效"
        sub-title="该思维导图不存在或分享已关闭"
      >
        <template #extra>
          <el-button type="primary" @click="handleBack">返回首页</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { shareApi } from '@/api'
import { DocumentCopy, Download, ArrowLeft } from '@element-plus/icons-vue'
import MindMap from 'simple-mind-map'
import { useMindMapStore } from '@/store/mindmap'
import MiniMap from 'simple-mind-map/src/plugins/MiniMap.js'
import Watermark from 'simple-mind-map/src/plugins/Watermark.js'
import KeyboardNavigation from 'simple-mind-map/src/plugins/KeyboardNavigation.js'
import ExportPDF from 'simple-mind-map/src/plugins/ExportPDF.js'
import ExportXMind from 'simple-mind-map/src/plugins/ExportXMind.js'
import Export from 'simple-mind-map/src/plugins/Export.js'
import Select from 'simple-mind-map/src/plugins/Select.js'
import RichText from 'simple-mind-map/src/plugins/RichText.js'
import AssociativeLine from 'simple-mind-map/src/plugins/AssociativeLine.js'
import TouchEvent from 'simple-mind-map/src/plugins/TouchEvent.js'
import NodeImgAdjust from 'simple-mind-map/src/plugins/NodeImgAdjust.js'
import SearchPlugin from 'simple-mind-map/src/plugins/Search.js'
import Painter from 'simple-mind-map/src/plugins/Painter.js'
import ScrollbarPlugin from 'simple-mind-map/src/plugins/Scrollbar.js'
import Formula from 'simple-mind-map/src/plugins/Formula.js'
import RainbowLines from 'simple-mind-map/src/plugins/RainbowLines.js'
import Demonstrate from 'simple-mind-map/src/plugins/Demonstrate.js'
import OuterFrame from 'simple-mind-map/src/plugins/OuterFrame.js'
import MindMapLayoutPro from 'simple-mind-map/src/plugins/MindMapLayoutPro.js'
import NodeBase64ImageStorage from 'simple-mind-map/src/plugins/NodeBase64ImageStorage.js'
import Themes from 'simple-mind-map-plugin-themes'

// Viewer components
import NavigatorToolbar from '@/components/editor/NavigatorToolbar.vue'
import NodeNoteContentShow from '@/components/editor/NodeNoteContentShow.vue'
import NodeImgPreview from '@/components/editor/NodeImgPreview.vue'
import NodeHyperlink from '@/components/editor/NodeHyperlink.vue'
import NodeTagStyle from '@/components/editor/NodeTagStyle.vue'
import NodeIconToolbar from '@/components/editor/NodeIconToolbar.vue'

// 注册插件
MindMap.usePlugin(MiniMap)
  .usePlugin(Watermark)
  .usePlugin(KeyboardNavigation)
  .usePlugin(ExportPDF)
  .usePlugin(ExportXMind)
  .usePlugin(Export)
  .usePlugin(Select)
  .usePlugin(RichText)
  .usePlugin(AssociativeLine)
  .usePlugin(NodeImgAdjust)
  .usePlugin(TouchEvent)
  .usePlugin(SearchPlugin)
  .usePlugin(Painter)
  .usePlugin(Formula)
  .usePlugin(RainbowLines)
  .usePlugin(Demonstrate)
  .usePlugin(OuterFrame)
  .usePlugin(MindMapLayoutPro)
  .usePlugin(NodeBase64ImageStorage)

Themes.init(MindMap)

const route = useRoute()
const router = useRouter()

const shareContainer = ref(null)
const loading = ref(true)
const error = ref('')
const fileInfo = ref(null)
const fileContent = ref(null)
const mindMap = ref(null)

onMounted(async () => {
  const id = route.params.id
  await loadShareContent(id)
})

onBeforeUnmount(() => {
  if (mindMap.value) {
    mindMap.value.destroy()
  }
})

async function loadShareContent(id) {
  try {
    const data = await shareApi.getContent(id)
    fileInfo.value = data.file
    fileContent.value = data.content
    loading.value = false
    
    // 等待 DOM 更新后初始化
    setTimeout(() => {
      initMindMap()
    }, 0)
  } catch (err) {
    loading.value = false
    error.value = '加载失败'
    console.error('加载分享内容失败:', err)
  }
}

async function initMindMap() {
  if (!shareContainer.value || !fileContent.value) return
  
  // 销毁旧实例
  if (mindMap.value) {
    mindMap.value.destroy()
  }
  
  mindMap.value = new MindMap({
    el: shareContainer.value,
    data: fileContent.value.root || fileContent.value,
    layout: fileContent.value.layout || 'logicalStructure',
    theme: fileContent.value.theme ? fileContent.value.theme.template : 'default',
    themeConfig: fileContent.value.theme ? fileContent.value.theme.config : {},
    viewData: fileContent.value.view,
    readonly: true // 只读模式
  })
  
  // 注册到 store
  const mindMapStore = useMindMapStore()
  mindMapStore.setMindMap(mindMap.value)
}

function downloadFile() {
  if (!fileContent.value || !fileInfo.value) return
  
  try {
    const blob = new Blob([JSON.stringify(fileContent.value, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileInfo.value.name}.smm`
    a.click()
    URL.revokeObjectURL(url)
    
    ElMessage.success('下载成功')
  } catch (err) {
    console.error('下载失败:', err)
    ElMessage.error('下载失败')
  }
}

function handleBack() {
  router.push('/')
}
</script>

<style scoped>
.share-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden;
}

/* 头部 */
.share-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 20px;
  color: #606266;
}

.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 分享容器 */
.share-container-wrapper {
  flex: 1;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.share-container {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  overflow: hidden;
}

/* 加载遮罩 */
.loading-overlay {
  z-index: 1000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 错误页面 */
.error-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .share-header {
    flex-direction: column;
    height: auto;
    padding: 10px;
    gap: 10px;
    align-items: stretch;
  }
  
  .header-left {
    justify-content: center;
  }
  
  .header-right {
    justify-content: center;
  }
}
</style>
