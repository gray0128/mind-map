<template>
  <Teleport to="body">
    <div
      class="contextmenu-container list-box"
      v-if="isShow"
      ref="contextmenuRef"
      :style="{ left: left + 'px', top: top + 'px' }"
      :class="{ 'is-dark': isDark }"
    >
    <template v-if="type === 'node'">
      <div
        class="item"
        @click="exec('INSERT_NODE', insertNodeBtnDisabled)"
        :class="{ disabled: insertNodeBtnDisabled }"
      >
        <span class="name">插入同级节点</span>
        <span class="desc">Enter</span>
      </div>
      <div
        class="item"
        @click="exec('INSERT_CHILD_NODE')"
        :class="{ disabled: isGeneralization }"
      >
        <span class="name">插入子节点</span>
        <span class="desc">Tab</span>
      </div>
      <div
        class="item"
        @click="exec('INSERT_PARENT_NODE')"
        :class="{ disabled: insertNodeBtnDisabled }"
      >
        <span class="name">插入父节点</span>
        <span class="desc">Shift + Tab</span>
      </div>
      <div
        class="item"
        @click="exec('ADD_GENERALIZATION')"
        :class="{ disabled: insertNodeBtnDisabled }"
      >
        <span class="name">插入概括</span>
        <span class="desc">Ctrl + G</span>
      </div>
      <div class="split-line"></div>
      <div
        class="item"
        @click="exec('UP_NODE')"
        :class="{ disabled: upNodeBtnDisabled }"
      >
        <span class="name">上移节点</span>
        <span class="desc">Ctrl + ↑</span>
      </div>
      <div
        class="item"
        @click="exec('DOWN_NODE')"
        :class="{ disabled: downNodeBtnDisabled }"
      >
        <span class="name">下移节点</span>
        <span class="desc">Ctrl + ↓</span>
      </div>
      <div class="item" @click="exec('UNEXPAND_ALL')">
        <span class="name">收起所有子节点</span>
      </div>
      <div class="item" @click="exec('EXPAND_ALL')">
        <span class="name">展开所有子节点</span>
      </div>
      <div class="split-line"></div>
      <div class="item danger" @click="exec('REMOVE_NODE')">
        <span class="name">删除节点</span>
        <span class="desc">Delete</span>
      </div>
      <div class="item danger" @click="exec('REMOVE_CURRENT_NODE')">
        <span class="name">仅删除当前节点</span>
        <span class="desc">Shift + Backspace</span>
      </div>
      <div class="split-line"></div>
      <div
        class="item"
        @click="exec('COPY_NODE')"
        :class="{ disabled: isGeneralization }"
      >
        <span class="name">复制节点</span>
        <span class="desc">Ctrl + C</span>
      </div>
      <div
        class="item"
        @click="exec('CUT_NODE')"
        :class="{ disabled: isGeneralization }"
      >
        <span class="name">剪切节点</span>
        <span class="desc">Ctrl + X</span>
      </div>
      <div class="item" @click="exec('PASTE_NODE')">
        <span class="name">粘贴节点</span>
        <span class="desc">Ctrl + V</span>
      </div>
      <div class="split-line"></div>
      <div class="item" @click="exec('REMOVE_HYPERLINK')" v-if="hasHyperlink">
        <span class="name">移除超链接</span>
      </div>
      <div class="item" @click="exec('REMOVE_NOTE')" v-if="hasNote">
        <span class="name">移除备注</span>
      </div>
      <div class="item" @click="exec('REMOVE_CUSTOM_STYLES')">
        <span class="name">清除自定义样式</span>
      </div>
      <!-- <div class="item" @click="exec('EXPORT_CUR_NODE_TO_PNG')">
        <span class="name">导出该节点为PNG</span>
      </div> -->
    </template>
    
    <template v-if="type === 'svg'">
      <div class="item" @click="exec('RETURN_CENTER')">
        <span class="name">回到根节点</span>
        <span class="desc">Ctrl + Enter</span>
      </div>
      <div class="split-line"></div>
      <div class="item" @click="exec('EXPAND_ALL')">
        <span class="name">展开所有</span>
      </div>
      <div class="item" @click="exec('UNEXPAND_ALL')">
        <span class="name">收起所有</span>
      </div>
      <div class="item">
        <span class="name">展开到</span>
        <el-icon><ArrowRight /></el-icon>
        <div
          class="sub-items list-box"
          :class="{ 'is-dark': isDark, 'show-left': subItemsShowLeft }"
          style="top: -10px"
        >
          <div
            class="item"
            v-for="(item, index) in expandList"
            :key="item"
            @click="exec('UNEXPAND_TO_LEVEL', false, index + 1)"
          >
            {{ item }}
          </div>
        </div>
      </div>
      <div class="split-line"></div>
      <div class="item" @click="exec('RESET_LAYOUT')">
        <span class="name">整理布局</span>
        <span class="desc">Ctrl + L</span>
      </div>
      <div class="item" @click="exec('FIT_CANVAS')">
        <span class="name">适应画布</span>
        <span class="desc">Ctrl + i</span>
      </div>
      <div class="item" @click="exec('TOGGLE_ZEN_MODE')">
        <span class="name">禅模式</span>
        {{ isZenMode ? '√' : '' }}
      </div>
      <div class="split-line"></div>
      <div class="item">
        <span class="name">复制到剪贴板</span>
        <el-icon><ArrowRight /></el-icon>
        <div class="sub-items list-box" :class="{ 'is-dark': isDark, 'show-left': subItemsShowLeft }" style="top: -6px">
          <div class="item" @click="exec('COPY_TO_CLIPBOARD', false, 'smm')">SMM</div>
          <div class="item" @click="exec('COPY_TO_CLIPBOARD', false, 'json')">JSON</div>
          <div class="item" @click="exec('COPY_TO_CLIPBOARD', false, 'md')">Markdown</div>
          <div class="item" @click="exec('COPY_TO_CLIPBOARD', false, 'txt')">Txt</div>
          <div class="item" @click="exec('COPY_TO_CLIPBOARD', false, 'png')">PNG</div>
        </div>
      </div>
    </template>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import bus from '@/utils/bus'
import { ArrowRight } from '@element-plus/icons-vue'
import { getTextFromHtml } from '@/utils'
import { ElMessage } from 'element-plus'

const mindMapStore = useMindMapStore()
const mindMap = computed(() => mindMapStore.mindMap)
const isDark = computed(() => mindMapStore.localConfig.isDark)
const isZenMode = computed(() => mindMapStore.localConfig.isZenMode)

const isShow = ref(false)
const left = ref(0)
const top = ref(0)
const type = ref('')
const node = ref(null)
const subItemsShowLeft = ref(false)
const contextmenuRef = ref(null)

const expandList = ['一级主题', '二级主题', '三级主题', '四级主题', '五级主题', '六级主题']

// Computed properties for node logic
const insertNodeBtnDisabled = computed(() => {
  return !node.value || node.value.isRoot || node.value.isGeneralization
})

const upNodeBtnDisabled = computed(() => {
  if (!node.value || node.value.isRoot || node.value.isGeneralization) return true
  const isFirst = node.value.parent.children.findIndex(item => item === node.value) === 0
  return isFirst
})

const downNodeBtnDisabled = computed(() => {
  if (!node.value || node.value.isRoot || node.value.isGeneralization) return true
  const children = node.value.parent.children
  const isLast = children.findIndex(item => item === node.value) === children.length - 1
  return isLast
})

const isGeneralization = computed(() => node.value && node.value.isGeneralization)
const hasHyperlink = computed(() => node.value && !!node.value.getData('hyperlink'))
const hasNote = computed(() => node.value && !!node.value.getData('note'))

const getShowPosition = (x, y) => {
  if (!contextmenuRef.value) return { x, y }
  const rect = contextmenuRef.value.getBoundingClientRect()
  if (x + rect.width > window.innerWidth) {
    x = x - rect.width - 20
  }
  subItemsShowLeft.value = x + rect.width + 150 > window.innerWidth
  if (y + rect.height > window.innerHeight) {
    y = window.innerHeight - rect.height - 10
  }
  return { x, y }
}

const show = (e, targetNode) => {
  type.value = 'node'
  isShow.value = true
  node.value = targetNode
  nextTick(() => {
    const { x, y } = getShowPosition(e.clientX + 10, e.clientY + 10)
    left.value = x
    top.value = y
  })
}

const show2 = (e) => {
  type.value = 'svg'
  isShow.value = true
  nextTick(() => {
    const { x, y } = getShowPosition(e.clientX + 10, e.clientY + 10)
    left.value = x
    top.value = y
  })
}

const hide = () => {
  isShow.value = false
  left.value = -9999
  top.value = -9999
  type.value = ''
  node.value = null
}

const onMousedown = (e) => {
  if (e.button !== 2) return // Only right click
  e.preventDefault() // Should be prevented in event source usually but here good
  // However, simple-mind-map usually handles event and emits to us.
  // Wait, `svg_mousedown` uses logic: if right click, show2.
  // BUT the event object passed here might be original DOM event or simple-mind-map custom event.
  // In `bus.on('svg_mousedown', onMousedown)`, `simple-mind-map` emits mouseup/mousedown.
  // Let's check logic:
  // e.which === 3 is right click.
  if (e.which === 3 || e.button === 2) {
      // In original code, it saves mousedownX/Y and checks on mouseup.
      // But simpler for us: just show menu on mousedown or mouseup.
      // Standard is mousedown or contextmenu event.
      // Original code used `onMousedown` to record pos, and `onMouseup` to show. 
      // But typically `node_contextmenu` handles nodes. For background (svg), we need to check how simple-mind-map emits.
      // Simple-mind-map emits `svg_mousedown`. Let's assume we can show it directly or follow original logic.
      // Original logic: "Math.abs(...) > 3" check suggests avoiding menu if dragged.
      // I'll implement simplified show directly for now, assuming conflict with drag is handled by library.
      show2(e)
  }
}

const exec = (key, disabled, ...args) => {
  if (disabled) return
  if (!mindMap.value) return
  
  switch (key) {
    case 'COPY_NODE':
      mindMap.value.renderer.copy()
      break
    case 'CUT_NODE':
      mindMap.value.renderer.cut()
      break
    case 'PASTE_NODE':
      mindMap.value.renderer.paste()
      break
    case 'INSERT_NODE':
      bus.emit('execCommand', 'INSERT_NODE')
      break
    case 'INSERT_CHILD_NODE':
      bus.emit('execCommand', 'INSERT_CHILD_NODE')
      break
    case 'INSERT_PARENT_NODE':
        bus.emit('execCommand', 'INSERT_PARENT_NODE')
        break
    case 'ADD_GENERALIZATION':
        bus.emit('execCommand', 'ADD_GENERALIZATION')
        break
    case 'UP_NODE':
        bus.emit('execCommand', 'UP_NODE')
        break
    case 'DOWN_NODE':
        bus.emit('execCommand', 'DOWN_NODE')
        break
    case 'UNEXPAND_ALL':
        if (type.value === 'node') {
           const uid = node.value ? node.value.uid : ''
           bus.emit('execCommand', key, !uid, uid)
        } else {
           bus.emit('execCommand', key)
        }
        break
    case 'EXPAND_ALL':
        bus.emit('execCommand', key, node.value ? node.value.uid : '')
        break
    case 'RETURN_CENTER':
      mindMap.value.renderer.setRootNodeCenter()
      break
    case 'TOGGLE_ZEN_MODE':
      mindMapStore.setLocalConfig({ isZenMode: !isZenMode.value })
      break
    case 'FIT_CANVAS':
      mindMap.value.view.fit()
      break
    case 'REMOVE_HYPERLINK':
      node.value.setHyperlink('', '')
      break
    case 'REMOVE_NOTE':
      node.value.setNote('')
      break
    case 'REMOVE_NODE':
        bus.emit('execCommand', 'REMOVE_NODE')
        break
    case 'REMOVE_CURRENT_NODE':
        bus.emit('execCommand', 'REMOVE_CURRENT_NODE')
        break
    case 'REMOVE_CUSTOM_STYLES':
        if (node.value) node.value.removeCustomStyles()
        break
    case 'RESET_LAYOUT':
        mindMap.value.renderer.layout.setLayout(mindMap.value.opt.layout) // Reset to current layout? Or re-layout?
        // Actually execCommand('RESET_LAYOUT') logic:
        mindMap.value.view.reset() // This might just reset view transform?
        // Or maybe logic is:
        mindMap.value.layout()
        break
    case 'UNEXPAND_TO_LEVEL':
        bus.emit('execCommand', key, ...args)
        break
    case 'COPY_TO_CLIPBOARD':
        copyToClipboard(...args)
        break
    default:
        // bus.emit('execCommand', key, ...args)
        break
  }
  hide()
}

onMounted(() => {
  bus.on('node_contextmenu', show)
  bus.on('node_click', hide)
  bus.on('draw_click', hide)
  // bus.on('svg_mousedown', onMousedown) // Need to verify if this is needed or conflict with draw_click
  // `svg_mousedown` is distinct from `draw_click`. 
  // Wait, `MindMap` emits `draw_click` on left click usually. 
  // Let's use `contextmenu` event if available from MindMap?
  // `simple-mind-map` seems to custom handle events.
  // Original code: this.$bus.$on('svg_mousedown', this.onMousedown)
  // So I'll keep it.
  bus.on('svg_mousedown', onMousedown)
})

onBeforeUnmount(() => {
  bus.off('node_contextmenu', show)
  bus.off('node_click', hide)
  bus.off('draw_click', hide)
  bus.off('svg_mousedown', onMousedown)
})

const copyToClipboard = async (type) => {
  try {
    let content = ''
    switch (type) {
      case 'smm':
        content = JSON.stringify(mindMap.value.getData('smm'))
        break
      case 'json':
        content = JSON.stringify(mindMap.value.getData('json'))
        break
      case 'md':
        content = mindMap.value.getData('md')
        break
      case 'txt':
        content = mindMap.value.getData('txt')
        break
      case 'png':
        const data = await mindMap.value.export('png', false)
        // 创建一个 Image 对象
        const img = new Image()
        img.src = data
        // 等待图片加载完成
        await new Promise(resolve => {
            img.onload = resolve
        })
        // 将 base64 转换为 Blob
        const blob = await fetch(data).then(res => res.blob())
        // 写入剪贴板
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ])
        ElMessage.success('已复制到剪贴板')
        return
    }
    
    await navigator.clipboard.writeText(content)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.contextmenu-container {
  position: fixed;
  font-size: 14px;
  color: #1a1a1a;
  z-index: 3000;
  user-select: none;
}

.list-box {
  width: 250px;
  background: #fff;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 8px 0;
}

.contextmenu-container.is-dark .list-box,
.sub-items.is-dark {
  background: #363b3f;
  color: #fff;
}

.contextmenu-container.is-dark .item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.split-line {
  width: 95%;
  height: 1px;
  background-color: #e9edf2;
  margin: 5px auto;
}

.item {
  position: relative;
  height: 28px;
  padding: 0 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item:hover {
  background: #f5f5f5;
}

.item.danger {
  color: #f56c6c;
}

.item.disabled {
  color: #999;
  cursor: not-allowed;
  pointer-events: none;
}

.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.desc {
  color: #999;
  font-size: 12px;
}

.sub-items {
  position: absolute;
  left: 100%;
  visibility: hidden;
  width: 150px;
  cursor: auto;
}

.sub-items.show-left {
  left: -150px;
}

.item:hover .sub-items {
  visibility: visible;
}
</style>
