<template>
  <div class="editor-container" v-loading="loading" :element-loading-text="loadingText">
    <!-- 文件操作栏 -->
    <el-header class="file-bar" height="40px">
      <div class="file-bar-left">
        <el-button type="primary" text @click="handleGoBack">
          <el-icon><ArrowLeft /></el-icon> 返回
        </el-button>
        <el-divider direction="vertical" />
        
        <el-input
          v-if="!isFileNameEditing"
          v-model="fileName"
          placeholder="文件名称"
          size="small"
          :readonly="true"
          class="file-name-input"
          @dblclick="startFileNameEdit"
        ></el-input>
        
        <el-input
          v-else
          v-model="fileName"
          placeholder="文件名称"
          size="small"
          class="file-name-input"
          ref="fileNameInputRef"
          @keyup.enter="endFileNameEdit"
          @blur="endFileNameEdit"
        ></el-input>
        
        <el-button
          v-if="isFileNameEditing"
          type="success"
          size="small"
          @click="endFileNameEdit"
          style="margin-left: 5px;"
        >
          <el-icon><Check /></el-icon>
        </el-button>
        
        <el-button
          v-if="isFileNameEditing"
          type="danger"
          size="small"
          @click="cancelFileNameEdit"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      
      <div class="file-bar-right">
        <el-tag :type="saveStatusType" size="small">
          {{ saveStatus }}
        </el-tag>
        <el-button type="primary" size="small" @click="handleManualSave">
          <el-icon><Upload /></el-icon> 保存
        </el-button>
      </div>
    </el-header>
    
    <!-- 编辑工具栏 -->
    <EditorToolbar />
    
    <el-main class="mind-map-container-wrapper">
      <div ref="mindMapContainer" class="mind-map-container"></div>
    </el-main>
    
    <!-- 悬浮组件 -->
    <Search />
    <Navigator />
    <NavigatorToolbar />
    <Contextmenu />
    <NodeImage />
    <NodeImgPreview />
    <NodeImgPlacementToolbar />
    <NodeHyperlink />
    <NodeIconToolbar />
    <NodeNoteContentShow />
    <NodeNote />
    <NodeTag />
    <NodeTagStyle />
    
    <!-- 侧边栏 -->
    <ThemeSidebar />
    <StyleSidebar />
    <Structure />
    <NodeIconSidebar />
    <NodeNoteSidebar />
    <AssociativeLineStyle />
    <BaseStyle />
    <ShortcutKey />
    <NodeOuterFrame />
    <RichTextToolbar />
    
    <!-- 右侧边栏触发器 -->
    <SidebarTrigger />
    

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick, shallowRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import MindMap from 'simple-mind-map'
import { useMindMapStore } from '@/store/mindmap'
import bus from '@/utils/bus'
import EditorToolbar from '@/components/editor/Toolbar.vue'
import ThemeSidebar from '@/components/editor/Theme.vue'
import StyleSidebar from '@/components/editor/Style.vue'
import Structure from '@/components/editor/Structure.vue'
import Search from '@/components/editor/Search.vue'
import Navigator from '@/components/editor/Navigator.vue'
import NavigatorToolbar from '@/components/editor/NavigatorToolbar.vue'
import Contextmenu from '@/components/editor/Contextmenu.vue'
import NodeImage from '@/components/editor/NodeImage.vue'
import NodeImgPreview from '@/components/editor/NodeImgPreview.vue'
import NodeImgPlacementToolbar from '@/components/editor/NodeImgPlacementToolbar.vue'
import NodeHyperlink from '@/components/editor/NodeHyperlink.vue'
import NodeIconSidebar from '@/components/editor/NodeIconSidebar.vue'
import NodeIconToolbar from '@/components/editor/NodeIconToolbar.vue'
import NodeNote from '@/components/editor/NodeNote.vue'
import NodeNoteSidebar from '@/components/editor/NodeNoteSidebar.vue'
import NodeNoteContentShow from '@/components/editor/NodeNoteContentShow.vue'
import NodeTag from '@/components/editor/NodeTag.vue'
import NodeTagStyle from '@/components/editor/NodeTagStyle.vue'
import AssociativeLineStyle from '@/components/editor/AssociativeLineStyle.vue'
import BaseStyle from '@/components/editor/BaseStyle.vue'
import ShortcutKey from '@/components/editor/ShortcutKey.vue'
import NodeOuterFrame from '@/components/editor/NodeOuterFrame.vue'
import RichTextToolbar from '@/components/editor/RichTextToolbar.vue'
import SidebarTrigger from '@/components/editor/SidebarTrigger.vue'
import MiniMap from 'simple-mind-map/src/plugins/MiniMap.js'
import Watermark from 'simple-mind-map/src/plugins/Watermark.js'
import KeyboardNavigation from 'simple-mind-map/src/plugins/KeyboardNavigation.js'
import ExportPDF from 'simple-mind-map/src/plugins/ExportPDF.js'
import ExportXMind from 'simple-mind-map/src/plugins/ExportXMind.js'
import Export from 'simple-mind-map/src/plugins/Export.js'
import Drag from 'simple-mind-map/src/plugins/Drag.js'
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
import { fileApi } from '@/api'
import { 
  ArrowLeft, Upload, Check, Close
} from '@element-plus/icons-vue'
import { nodeIconList as _nodeIconList } from 'simple-mind-map/src/svg/icons'
import icon from '@/config/icon'

// 配置常量
const AUTOSAVE_DELAY = 30000 // 30秒自动保存

// 默认数据
const defaultData = {
  root: {
    data: {
      text: '中心主题'
    },
    children: []
  },
  layout: 'logicalStructure',
  theme: {
    template: 'avocado',
    config: {}
  }
}

// 注册插件
MindMap.usePlugin(MiniMap)
  .usePlugin(Watermark)
  .usePlugin(Drag)
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

const router = useRouter()
const route = useRoute()
const mindMapStore = useMindMapStore()
const mindMapContainer = ref(null)
const mindMap = shallowRef(null)
const fileName = ref('')
const originalFileName = ref('') // 用于取消重命名
const saveStatus = ref('')
const saveTimer = ref(null)
const localSaveTimer = ref(null)
const loading = ref(false)
const loadingText = ref('')
const isFileNameEditing = ref(false)
const fileNameInputRef = ref(null)

// 计算保存状态类型
const saveStatusType = computed(() => {
  if (saveStatus.value.includes('保存中')) return 'warning'
  if (saveStatus.value.includes('已保存') || saveStatus.value.includes('已创建')) return 'success'
  if (saveStatus.value.includes('未保存')) return 'info'
  if (saveStatus.value.includes('失败')) return 'danger'
  return 'info'
})

onMounted(async () => {
  await initEditor()
})

onBeforeUnmount(() => {
  if (saveTimer.value) clearTimeout(saveTimer.value)
  if (mindMap.value) {
    mindMap.value.destroy()
  }
})

async function initEditor() {
  loading.value = true
  loadingText.value = '正在加载思维导图...'
  
  let initialData = defaultData
  const currentId = route.params.id

  if (currentId && currentId !== 'new') {
    try {
      const res = await fileApi.getContent(currentId)
      
      if (res && res.root) {
        initialData = res
      } else if (res && res.content) {
         initialData = typeof res.content === 'string' ? JSON.parse(res.content) : res.content
      }
      
      const fileInfo = await fileApi.getDetail(currentId)
      fileName.value = fileInfo.name
      originalFileName.value = fileInfo.name
      saveStatus.value = '已加载'
    } catch (e) {
      console.error('加载文件失败', e)
      ElMessage.error('加载文件失败')
      saveStatus.value = '加载失败'
    }
  } else {
    fileName.value = '新建思维导图'
    originalFileName.value = '新建思维导图'
  }

  // 如果实例已存在，先销毁（防止路由切换组件复用问题）
  if (mindMap.value) {
      mindMap.value.destroy()
  }

  mindMap.value = new MindMap({
    el: mindMapContainer.value,
    data: initialData.root || initialData,
    layout: initialData.layout || 'logicalStructure',
    theme: initialData.theme ? initialData.theme.template : 'default',
    themeConfig: initialData.theme ? initialData.theme.config : {},
    viewData: initialData.view,
    enableAutoEnterTextEditWhenKeydown: true,
    iconList: [..._nodeIconList, ...icon]
  })

  mindMap.value.on('data_change', handleDataChange)
  mindMap.value.on('view_data_change', handleDataChange)
  mindMap.value.on('node_active', onNodeActive)
  mindMap.value.on('selection_change', onSelectionChange)
  mindMap.value.on('back_forward', onBackForward)
  mindMap.value.on('draw_click', () => {
    mindMapStore.setActiveSidebar('')
  })
  
  // 注册到 store
  mindMapStore.setMindMap(mindMap.value)

  // 检查本地备份
  checkLocalBackup(currentId || 'new')

  loading.value = false
}

// 节点激活事件
function onNodeActive(...args) {
  // args[0] is node, args[1] is activeNodeList
  const node = args[0]
  const activeNodeList = args[1] || []
  bus.emit('node_active', { node, activeNodeList })
}

// 选择变化事件（多选插件）
function onSelectionChange() {
    // 获取当前激活的节点列表
    const activeNodes = mindMap.value.renderer.activeNodeList
    bus.emit('node_active', { node: null, activeNodeList: activeNodes })
}

// 前进后退事件
function onBackForward(index, len) {
  bus.emit('back_forward', index, len)
}

// 生成默认文件名：思维导图_YYYYMMDD_HHmmss
function generateDefaultFileName() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  return `思维导图_${year}${month}${day}_${hour}${minute}${second}`
}

function handleDataChange() {
  saveStatus.value = '未保存'
  if (saveTimer.value) clearTimeout(saveTimer.value)
  saveTimer.value = setTimeout(() => saveContent(true), AUTOSAVE_DELAY)

  // 本地秒级备份
  if (localSaveTimer.value) clearTimeout(localSaveTimer.value)
  localSaveTimer.value = setTimeout(localSave, 1000)
}

async function saveContent(isAutoSave = false) {
  const currentId = route.params.id
  saveStatus.value = '保存中...'

  try {
    const data = mindMap.value.getData(true)
    const thumbnail = await generateThumbnail()

    // 如果是新建文件
    if (!currentId || currentId === 'new') {
        let inputName = fileName.value

        // 自动保存且未修改文件名 -> 静默生成
        if (isAutoSave && fileName.value === '新建思维导图') {
            inputName = generateDefaultFileName()
        }
        // 手动保存且未修改文件名 -> 弹窗确认
        else if (fileName.value === '新建思维导图') {
            try {
                const defaultName = generateDefaultFileName()
                const { value } = await ElMessageBox.prompt('请输入文件名称', '保存思维导图', {
                    confirmButtonText: '保存',
                    cancelButtonText: '取消',
                    inputValue: defaultName,
                    inputPlaceholder: '请输入文件名称',
                    inputPattern: /^.{1,50}$/,
                    inputErrorMessage: '文件名称不能为空且不超过50个字符'
                })
                inputName = value || defaultName
            } catch {
                // 用户取消
                saveStatus.value = '未保存'
                return
            }
        }

        fileName.value = inputName
        originalFileName.value = inputName

        // 创建文件
        const res = await fileApi.create({
            name: inputName,
            content: data
        })

        // 更新路由到新 ID，不刷新页面
        await router.replace(`/edit/${res.id}`)
        saveStatus.value = '已创建'

        if (!isAutoSave) {
            ElMessage.success('文件已创建')
        }

        // 创建接口不支持传缩略图，所以创建完立刻再保存一次以更新缩略图
        await fileApi.saveContent(res.id, {
            ...data,
            thumbnail: thumbnail
        })

        // 清除本地备份
        localStorage.removeItem(`MINDMAP_BACKUP_${currentId || 'new'}`)

        saveStatus.value = '已保存'
        return
    }

    // 更新现有文件
    await fileApi.saveContent(currentId, {
      ...data,
      thumbnail: thumbnail
    })

    // 如果文件名有变化，更新文件名
    if (fileName.value !== originalFileName.value) {
      await fileApi.update(currentId, { name: fileName.value })
      originalFileName.value = fileName.value
    }

    // 清除本地备份
    localStorage.removeItem(`MINDMAP_BACKUP_${currentId}`)

    saveStatus.value = '已保存'
  } catch (e) {
    console.error('保存失败', e)
    saveStatus.value = '保存失败'
    if (!isAutoSave) {
        ElMessage.error('保存失败')
    }
  }
}

// 手动保存
async function handleManualSave() {
  if (saveTimer.value) clearTimeout(saveTimer.value)
  await saveContent(false)
  ElMessage.success('保存成功')
}

async function generateThumbnail() {
    try {
        const base64 = await mindMap.value.export('png', false, 'thumbnail')
        if (!base64) return null
        
        // 压缩/裁剪图片逻辑
        return new Promise((resolve) => {
            const img = new Image()
            img.src = base64
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const targetWidth = 300
                const targetHeight = 200
                canvas.width = targetWidth
                canvas.height = targetHeight
                const ctx = canvas.getContext('2d')
                
                ctx.fillStyle = '#fff'
                ctx.fillRect(0, 0, targetWidth, targetHeight)
                
                // 保持比例缩放 (Contain)
                const scale = Math.min(targetWidth / img.width, targetHeight / img.height)
                const w = img.width * scale
                const h = img.height * scale
                const x = (targetWidth - w) / 2
                const y = (targetHeight - h) / 2
                
                ctx.drawImage(img, x, y, w, h)
                resolve(canvas.toDataURL('image/png'))
            }
            img.onerror = () => resolve(null)
        })
    } catch (e) {
        console.error('缩略图失败', e)
        return null
    }
}

function handleGoBack() {
  if (saveStatus.value === '未保存') {
    ElMessageBox.confirm('当前修改未保存，确定要离开吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push('/files')
    }).catch(() => {
      // 取消操作
    })
    return
  }
  router.push('/files')
}

// 开始编辑文件名
function startFileNameEdit() {
  isFileNameEditing.value = true
  nextTick(() => {
    if (fileNameInputRef.value) {
      fileNameInputRef.value.focus()
      fileNameInputRef.value.select()
    }
  })
}

// 结束编辑文件名
function endFileNameEdit() {
  if (!fileName.value.trim()) {
    fileName.value = originalFileName.value
  }
  isFileNameEditing.value = false
  
  // 如果文件名有变化，触发保存
  if (fileName.value !== originalFileName.value) {
    handleDataChange()
  }
}

// 取消编辑文件名
function cancelFileNameEdit() {
  fileName.value = originalFileName.value
  isFileNameEditing.value = false
}

// 本地备份逻辑
function localSave() {
  try {
    const currentId = route.params.id || 'new'
    const data = mindMap.value.getData(true)
    const backupKey = `MINDMAP_BACKUP_${currentId}`
    const backupData = {
      content: data,
      timestamp: Date.now(),
      synced: false
    }
    localStorage.setItem(backupKey, JSON.stringify(backupData))
  } catch (e) {
    console.warn('本地备份失败 (可能是存储空间不足)', e)
  }
}

// 检查本地备份
async function checkLocalBackup(id) {
  try {
    const backupKey = `MINDMAP_BACKUP_${id}`
    const backupStr = localStorage.getItem(backupKey)
    if (!backupStr) return

    const backup = JSON.parse(backupStr)
    // 只有未同步的备份才提示恢复
    if (backup.synced === false) {
      const date = new Date(backup.timestamp)
      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`

      try {
        await ElMessageBox.confirm(
          `检测到有未保存的本地备份（时间：${timeStr}），是否恢复？`,
          '恢复未保存的内容',
          {
            confirmButtonText: '恢复',
            cancelButtonText: '放弃',
            type: 'warning',
            closeOnClickModal: false,
            closeOnPressEscape: false
          }
        )
        // 用户确认恢复
        mindMap.value.setData(backup.content)
        ElMessage.success('已恢复本地备份，正在同步到云端...')

        // 恢复后立即触发一次云端保存
        saveContent(true)
      } catch {
        // 用户取消，删除备份
        localStorage.removeItem(backupKey)
        ElMessage.info('已放弃本地备份')
      }
    }
  } catch (e) {
    console.error('检查本地备份失败', e)
  }
}
</script>

<style scoped>
.editor-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f5f7fa;
}

/* 文件操作栏 */
.file-bar {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 10;
  flex-shrink: 0;
}

.file-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 文件名称输入框 */
.file-name-input {
  width: 200px;
  font-weight: 500;
}

:deep(.file-name-input.el-input .el-input__wrapper) {
  box-shadow: none;
  background-color: transparent;
}

:deep(.file-name-input.el-input .el-input__wrapper:hover) {
  background-color: #f5f7fa;
}

/* 思维导图容器 */
.mind-map-container-wrapper {
  flex: 1;
  padding: 0 !important;
  margin: 0;
  overflow: hidden;
  position: relative;
}

.mind-map-container {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  overflow: hidden;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    height: auto;
    padding: 10px;
    gap: 10px;
    align-items: stretch;
  }
  
  .toolbar-left {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .toolbar-right {
    justify-content: center;
  }
  
  .file-name-input {
    width: 150px;
  }
}
</style>

<!-- 编辑器页面的全局样式，确保没有滚动条泄漏 -->
<style>
html:has(.editor-container),
html:has(.editor-container) body {
  overflow: hidden !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>
