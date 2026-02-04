<template>
  <div class="toolbar-container">
    <div class="toolbar">
      <div class="toolbar-block">
        <!-- 撤销 -->
        <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom">
          <el-button 
            :icon="RefreshLeft" 
            :disabled="readonly || backEnd"
            @click="execCommand('BACK')"
          >撤销</el-button>
        </el-tooltip>
        
        <!-- 重做 -->
        <el-tooltip content="重做 (Ctrl+Y)" placement="bottom">
          <el-button 
            :icon="RefreshRight" 
            :disabled="readonly || forwardEnd"
            @click="execCommand('FORWARD')"
          >重做</el-button>
        </el-tooltip>
        
        <el-divider direction="vertical" />
        
        <!-- 格式刷 -->
        <el-tooltip content="格式刷" placement="bottom">
          <el-button 
            :icon="CopyDocument" 
            :type="isInPainter ? 'primary' : ''"
            :disabled="activeNodes.length <= 0 || hasGeneralization"
            @click="startPainter"
          >格式刷</el-button>
        </el-tooltip>
        
        <el-divider direction="vertical" />
        
        <!-- 添加子节点 -->
        <el-tooltip content="添加子节点 (Tab)" placement="bottom">
          <el-button 
            :icon="CirclePlus" 
            :disabled="activeNodes.length <= 0 || hasGeneralization"
            @click="execCommand('INSERT_CHILD_NODE')"
          >子节点</el-button>
        </el-tooltip>
        
        <!-- 添加同级节点 -->
        <el-tooltip content="添加同级节点 (Enter)" placement="bottom">
          <el-button 
            :icon="Plus" 
            :disabled="activeNodes.length <= 0 || hasRoot || hasGeneralization"
            @click="execCommand('INSERT_NODE')"
          >同级节点</el-button>
        </el-tooltip>
        
        <!-- 删除节点 -->
        <el-tooltip content="删除节点 (Delete)" placement="bottom">
          <el-button 
            :icon="Delete" 
            type="danger"
            plain
            :disabled="activeNodes.length <= 0"
            @click="execCommand('REMOVE_NODE')"
          >删除</el-button>
        </el-tooltip>
      </div>
      
      <el-divider direction="vertical" />
      
      <el-divider direction="vertical" />
      
      <!-- 插入 -->
      <div class="toolbar-block">
        <el-tooltip content="插入图片" placement="bottom">
          <el-button :icon="Picture" :disabled="activeNodes.length <= 0" @click="showNodeImage">图片</el-button>
        </el-tooltip>
        <el-tooltip content="插入关联线" placement="bottom">
          <el-button :icon="Rank" :disabled="activeNodes.length <= 0 || hasGeneralization" @click="createAssociativeLine">关联线</el-button>
        </el-tooltip>
        <el-tooltip content="插入图标" placement="bottom">
          <el-button :icon="Star" :disabled="activeNodes.length <= 0" @click="openSidebar('nodeIconSidebar')">图标</el-button>
        </el-tooltip>
        <el-tooltip content="插入超链接" placement="bottom">
          <el-button :icon="Link" :disabled="activeNodes.length <= 0" @click="showNodeLink">链接</el-button>
        </el-tooltip>
        <el-tooltip content="插入备注" placement="bottom">
          <el-button :icon="Notebook" :disabled="activeNodes.length <= 0" @click="showNodeNote">备注</el-button>
        </el-tooltip>
        <el-tooltip content="插入标签" placement="bottom">
          <el-button :icon="CollectionTag" :disabled="activeNodes.length <= 0" @click="showNodeTag">标签</el-button>
        </el-tooltip>
      </div>
      
      <el-divider direction="vertical" />
      
      <!-- 功能区 -->
      <div class="toolbar-block">
        <!-- 概括 -->
        <el-tooltip content="添加概括" placement="bottom">
          <el-button 
            :disabled="activeNodes.length <= 0 || hasRoot || hasGeneralization"
            @click="execCommand('ADD_GENERALIZATION')"
          >概括</el-button>
        </el-tooltip>
        
        <!-- 外框 -->
        <el-tooltip content="添加外框" placement="bottom">
          <el-button 
            :disabled="activeNodes.length <= 0 || hasGeneralization"
            @click="execCommand('ADD_OUTER_FRAME')"
          >外框</el-button>
        </el-tooltip>
      </div>
      
      <el-divider direction="vertical" />
      
      <!-- 外观 -->
      <div class="toolbar-block">
        <el-tooltip content="主题" placement="bottom">
          <el-button :icon="MagicStick" @click="openSidebar('theme')">主题</el-button>
        </el-tooltip>
        <el-tooltip content="节点样式" placement="bottom">
          <el-button :icon="Brush" @click="handleOpenStyle">样式</el-button>
        </el-tooltip>
        <el-tooltip content="基础样式" placement="bottom">
          <el-button :icon="EditPen" @click="openSidebar('baseStyle')">基础</el-button>
        </el-tooltip>
        <el-tooltip content="结构" placement="bottom">
          <el-button :icon="Connection" @click="openSidebar('structure')">结构</el-button>
        </el-tooltip>
      </div>
      
      <el-divider direction="vertical" />
      
      <!-- 导出导入 -->
      <div class="toolbar-block">
        <el-button :icon="Upload" @click="showImport">导入</el-button>
        <el-button :icon="Download" @click="showExport">导出</el-button>
      </div>
      
      <!-- 右侧区域 -->
      <div class="toolbar-right">
        <Scale />
        <el-tooltip content="全屏" placement="bottom">
          <el-button :icon="FullScreen" circle @click="toggleFullScreen" />
        </el-tooltip>
      </div>
    </div>
    
    <!-- 导出对话框 -->
    <Export ref="exportRef" />
    
    <!-- 导入对话框 -->
    <Import ref="importRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import bus from '@/utils/bus'
import { 
  RefreshLeft, RefreshRight, CirclePlus, Plus, Delete, 
  Download, Upload, FullScreen, MagicStick, Brush, Connection, EditPen,
  Picture, Link, Star, Notebook, CollectionTag, Rank, CopyDocument
} from '@element-plus/icons-vue'
import { fullScreen, exitFullScreen, isFullScreen } from '@/utils'
import Scale from './Scale.vue'
import Export from './Export.vue'
import Import from './Import.vue'

const mindMapStore = useMindMapStore()
const exportRef = ref(null)
const importRef = ref(null)

// 状态
const activeNodes = ref([])
const activeOuterFrame = ref(false)
const activeAssociativeLine = ref(false)
const backEnd = ref(true)
const forwardEnd = ref(true)
const readonly = ref(false)
const isInPainter = ref(false)
const mindMap = computed(() => mindMapStore.mindMap)

// 监听 mindMap 实例
watch(mindMap, (val) => {
  if (val) {
    val.on('outer_frame_active', onOuterFrameActive)
    val.on('outer_frame_deactivate', onOuterFrameDeactivate)
    val.on('associative_line_click', onAssociativeLineActive)
    val.on('associative_line_deactivate', onAssociativeLineDeactivate)
  }
})

// 外框/关联线激活状态处理
const onOuterFrameActive = () => {
  activeOuterFrame.value = true
}

const onOuterFrameDeactivate = () => {
  activeOuterFrame.value = false
}

const onAssociativeLineActive = () => {
  activeAssociativeLine.value = true
}

const onAssociativeLineDeactivate = () => {
  activeAssociativeLine.value = false
}

// 打开样式侧边栏（根据当前选中元素）
const handleOpenStyle = () => {
  if (activeOuterFrame.value) {
    openSidebar('nodeOuterFrameStyle')
  } else if (activeAssociativeLine.value) {
    openSidebar('associativeLineStyle')
  } else {
    openSidebar('style')
  }
}

// 计算属性
const hasRoot = computed(() => {
  return activeNodes.value.findIndex(node => node.isRoot) !== -1
})

const hasGeneralization = computed(() => {
  return activeNodes.value.findIndex(node => node.isGeneralization) !== -1
})

// 执行命令
const execCommand = (command, ...args) => {
  const mindMap = mindMapStore.getMindMap()
  if (mindMap) {
    mindMap.execCommand(command, ...args)
  }
}

// 创建关联线
const createAssociativeLine = () => {
  const mindMap = mindMapStore.getMindMap()
  if (mindMap) {
    mindMap.associativeLine.createLineFromActiveNode()
  }
}

// 显示导出对话框
const showExport = () => {
  if (exportRef.value) {
    exportRef.value.show()
  }
}

// 显示导入对话框
const showImport = () => {
  if (importRef.value) {
    importRef.value.show()
  }
}

// 格式刷
const startPainter = () => {
  const mindMap = mindMapStore.getMindMap()
  if (mindMap) {
    mindMap.painter.startPainter()
  }
}

const onPainterStart = () => {
  isInPainter.value = true
}

const onPainterEnd = () => {
  isInPainter.value = false
}

// 切换全屏
const toggleFullScreen = () => {
  if (isFullScreen()) {
    exitFullScreen()
    mindMapStore.setFullscreen(false)
  } else {
    fullScreen(document.documentElement)
    mindMapStore.setFullscreen(true)
  }
}

// 打开侧边栏
const openSidebar = (name) => {
  mindMapStore.setActiveSidebar(name)
}

// 显示节点图片弹窗
const showNodeImage = () => {
  bus.emit('showNodeImage')
}

// 显示节点超链接弹窗
const showNodeLink = () => {
  bus.emit('showNodeLink')
}

// 显示节点备注弹窗
const showNodeNote = () => {
  bus.emit('showNodeNote')
}

// 显示节点标签弹窗
const showNodeTag = () => {
  bus.emit('showNodeTag')
}

// 事件处理
const onModeChange = (mode) => {
  readonly.value = mode === 'readonly'
}

const onNodeActive = (args) => {
  if (args && args.activeNodeList) {
    activeNodes.value = [...args.activeNodeList]
  } else {
    activeNodes.value = []
  }
}

const onBackForward = (index, len) => {
  backEnd.value = index <= 0
  forwardEnd.value = index >= len - 1
}

onMounted(() => {
  bus.on('mode_change', onModeChange)
  bus.on('node_active', onNodeActive)
  bus.on('back_forward', onBackForward)
  bus.on('painter_start', onPainterStart)
  bus.on('painter_end', onPainterEnd)
})

onBeforeUnmount(() => {
  bus.off('mode_change', onModeChange)
  bus.off('node_active', onNodeActive)
  bus.off('back_forward', onBackForward)
  bus.off('painter_start', onPainterStart)
  bus.off('painter_end', onPainterEnd)
})
</script>

<style scoped>
.toolbar-container {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 8px 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.toolbar-block {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.el-divider--vertical) {
  height: 24px;
  margin: 0 8px;
}
</style>
