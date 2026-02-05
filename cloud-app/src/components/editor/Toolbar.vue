<template>
  <div class="toolbarContainer">
    <div class="toolbar">
      <!-- 撤销/重做 -->
      <div class="toolbarBtn" :class="{ disabled: readonly || backEnd }" @click="execCommand('BACK')">
        <div class="icon">
          <span class="iconfont iconhoutui-shi"></span>
        </div>
        <span class="text">撤销</span>
      </div>
      <div class="toolbarBtn" :class="{ disabled: readonly || forwardEnd }" @click="execCommand('FORWARD')">
        <div class="icon">
          <span class="iconfont iconqianjin1"></span>
        </div>
        <span class="text">重做</span>
      </div>

      <div class="divider"></div>

      <!-- 格式刷 -->
      <div class="toolbarBtn" :class="{ disabled: activeNodes.length <= 0 || hasGeneralization, active: isInPainter }" @click="startPainter">
        <div class="icon">
          <span class="iconfont icongeshishua"></span>
        </div>
        <span class="text">格式刷</span>
      </div>

      <div class="divider"></div>

      <!-- 节点操作 -->
      <div class="toolbarBtn" :class="{ disabled: activeNodes.length <= 0 || hasGeneralization }" @click="execCommand('INSERT_CHILD_NODE')">
        <div class="icon">
          <span class="iconfont icontianjiazijiedian"></span>
        </div>
        <span class="text">子节点</span>
      </div>
      <div class="toolbarBtn" :class="{ disabled: activeNodes.length <= 0 || hasRoot || hasGeneralization }" @click="execCommand('INSERT_NODE')">
        <div class="icon">
          <span class="iconfont iconjiedian"></span>
        </div>
        <span class="text">同级节点</span>
      </div>
      <div class="toolbarBtn" :class="{ disabled: activeNodes.length <= 0 }" @click="execCommand('REMOVE_NODE')">
        <div class="icon danger">
          <span class="iconfont iconshanchu"></span>
        </div>
        <span class="text">删除</span>
      </div>

      <div class="divider"></div>

      <!-- 插入操作 -->
      <div class="toolbarBtn" :class="{ disabled: activeNodes.length <= 0 }" @click="showNodeImage">
        <div class="icon">
          <span class="iconfont iconimage"></span>
        </div>
        <span class="text">图片</span>
      </div>
      <div class="toolbarBtn" :class="{ disabled: activeNodes.length <= 0 || hasGeneralization }" @click="createAssociativeLine">
        <div class="icon">
          <span class="iconfont iconlianjiexian"></span>
        </div>
        <span class="text">关联线</span>
      </div>
      <div class="toolbarBtn" :class="{ disabled: activeNodes.length <= 0 }" @click="openSidebar('nodeIconSidebar')">
        <div class="icon">
          <span class="iconfont iconxiaolian"></span>
        </div>
        <span class="text">图标</span>
      </div>
      <div class="toolbarBtn" :class="{ disabled: activeNodes.length <= 0 }" @click="showNodeLink">
        <div class="icon">
          <span class="iconfont iconchaolianjie"></span>
        </div>
        <span class="text">链接</span>
      </div>
      <div class="toolbarBtn" :class="{ disabled: activeNodes.length <= 0 }" @click="showNodeNote">
        <div class="icon">
          <span class="iconfont iconflow-Mark"></span>
        </div>
        <span class="text">备注</span>
      </div>
      <div class="toolbarBtn" :class="{ disabled: activeNodes.length <= 0 }" @click="showNodeTag">
        <div class="icon">
          <span class="iconfont iconbiaoqian"></span>
        </div>
        <span class="text">标签</span>
      </div>

      <div class="divider"></div>

      <!-- 功能区 -->
      <div class="toolbarBtn" :class="{ disabled: activeNodes.length <= 0 || hasRoot || hasGeneralization }" @click="execCommand('ADD_GENERALIZATION')">
        <div class="icon">
          <span class="iconfont icongaikuozonglan"></span>
        </div>
        <span class="text">概括</span>
      </div>
      <div class="toolbarBtn" :class="{ disabled: activeNodes.length <= 0 || hasGeneralization }" @click="execCommand('ADD_OUTER_FRAME')">
        <div class="icon">
          <span class="iconfont iconwaikuang"></span>
        </div>
        <span class="text">外框</span>
      </div>

      <div class="divider"></div>

      <!-- 导入导出 -->
      <div class="toolbarBtn" @click="showImport">
        <div class="icon">
          <span class="iconfont icondaoru"></span>
        </div>
        <span class="text">导入</span>
      </div>
      <div class="toolbarBtn" @click="showExport">
        <div class="icon">
          <span class="iconfont iconexport"></span>
        </div>
        <span class="text">导出</span>
      </div>
    </div>

    <!-- 导出对话框 -->
    <Export ref="exportRef" />
    
    <!-- 导入对话框 -->
    <Import ref="importRef" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import bus from '@/utils/bus'
import Export from './Export.vue'
import Import from './Import.vue'

const mindMapStore = useMindMapStore()
const exportRef = ref(null)
const importRef = ref(null)

// 状态
const activeNodes = shallowRef([])
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

// 计算属性
const hasRoot = computed(() => {
  return activeNodes.value.findIndex(node => node.isRoot) !== -1
})

const hasGeneralization = computed(() => {
  return activeNodes.value.findIndex(node => node.isGeneralization) !== -1
})

// 执行命令
const execCommand = (command, ...args) => {
  if (readonly.value) return
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
.toolbarContainer {
  position: fixed;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 16px 0 rgba(0, 0, 0, 0.06);
  padding: 8px 20px;
  z-index: 100;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbarBtn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  min-width: 50px;
}

.toolbarBtn:hover:not(.disabled) {
  background-color: #f5f7fa;
}

.toolbarBtn.active {
  background-color: #ecf5ff;
}

.toolbarBtn.active .icon {
  border-color: #409eff;
  color: #409eff;
}

.toolbarBtn.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.toolbarBtn .icon {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e9e9e9;
  font-size: 16px;
  color: #333;
}

.toolbarBtn .icon.danger {
  color: #f56c6c;
  border-color: #fbc4c4;
}

.toolbarBtn .text {
  font-size: 12px;
  margin-top: 3px;
  color: #666;
  white-space: nowrap;
}

.divider {
  width: 1px;
  height: 40px;
  background-color: #e4e7ed;
  margin: 0 8px;
}
</style>
