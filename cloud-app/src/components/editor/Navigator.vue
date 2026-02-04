<template>
  <div
    v-show="showMiniMap"
    class="navigator-box"
    :class="{ 'is-dark': isDark }"
    ref="navigatorBoxRef"
    :style="{ width: width + 'px' }"
    @mousedown="onMousedown"
    @mousemove="onMousemove"
  >
    <div
      class="svg-box"
      ref="svgBoxRef"
      :style="{
        transform: `scale(${svgBoxScale})`,
        left: svgBoxLeft + 'px',
        top: svgBoxTop + 'px'
      }"
    >
      <img :src="mindMapImg" @mousedown.prevent draggable="false" />
    </div>
    <div
      class="window-box"
      :style="{
        left: viewBoxStyle.left + 'px',
        top: viewBoxStyle.top + 'px',
        bottom: viewBoxStyle.bottom + 'px',
        right: viewBoxStyle.right + 'px'
      }"
      :class="{ 'with-transition': withTransition }"
      @mousedown.stop="onViewBoxMousedown"
      @mousemove="onViewBoxMousemove"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import bus from '@/utils/bus'

const mindMapStore = useMindMapStore()
const mindMap = computed(() => mindMapStore.mindMap)
const isDark = computed(() => mindMapStore.localConfig.isDark)

const showMiniMap = ref(false)
const timer = ref(null)
const boxWidth = ref(0)
const boxHeight = ref(0)
const svgBoxScale = ref(1)
const svgBoxLeft = ref(0)
const svgBoxTop = ref(0)
const viewBoxStyle = ref({
  left: 0,
  top: 0,
  bottom: 0,
  right: 0
})
const mindMapImg = ref('')
const width = ref(0)
const setSizeTimer = ref(null)
const withTransition = ref(true)

const navigatorBoxRef = ref(null)
const svgBoxRef = ref(null)

const setSize = () => {
  if (setSizeTimer.value) clearTimeout(setSizeTimer.value)
  setSizeTimer.value = setTimeout(() => {
    width.value = Math.min(window.innerWidth - 80, 370)
    nextTick(() => {
      if (showMiniMap.value) {
        init()
        drawMiniMap()
      }
    })
  }, 300)
}

const toggleMiniMap = (show) => {
  showMiniMap.value = show
  nextTick(() => {
    if (show) {
      init()
      drawMiniMap()
    }
  })
}

const dataChange = () => {
  if (!showMiniMap.value) return
  if (timer.value) clearTimeout(timer.value)
  timer.value = setTimeout(() => {
    drawMiniMap()
  }, 500)
}

const init = () => {
  if (navigatorBoxRef.value) {
    const { width, height } = navigatorBoxRef.value.getBoundingClientRect()
    boxWidth.value = width
    boxHeight.value = height
  }
}

const drawMiniMap = () => {
  if (!mindMap.value || !mindMap.value.miniMap) return
  const {
    getImgUrl,
    viewBoxStyle: newViewBoxStyle,
    miniMapBoxScale,
    miniMapBoxLeft,
    miniMapBoxTop
  } = mindMap.value.miniMap.calculationMiniMap(boxWidth.value, boxHeight.value)
  
  getImgUrl((img) => {
    mindMapImg.value = img
  })
  
  viewBoxStyle.value = newViewBoxStyle
  svgBoxScale.value = miniMapBoxScale
  svgBoxLeft.value = miniMapBoxLeft
  svgBoxTop.value = miniMapBoxTop
}

const onMousedown = (e) => {
  if (mindMap.value && mindMap.value.miniMap) {
    mindMap.value.miniMap.onMousedown(e)
  }
}

const onMousemove = (e) => {
  if (mindMap.value && mindMap.value.miniMap) {
    mindMap.value.miniMap.onMousemove(e)
  }
}

const onMouseup = (e) => {
  if (!withTransition.value) {
    withTransition.value = true
  }
  if (mindMap.value && mindMap.value.miniMap) {
    mindMap.value.miniMap.onMouseup(e)
  }
}

const onViewBoxMousedown = (e) => {
  if (mindMap.value && mindMap.value.miniMap) {
    mindMap.value.miniMap.onViewBoxMousedown(e)
  }
}

const onViewBoxMousemove = (e) => {
  if (mindMap.value && mindMap.value.miniMap) {
    mindMap.value.miniMap.onViewBoxMousemove(e)
  }
}

const onViewBoxPositionChange = ({ left, right, top, bottom }) => {
  withTransition.value = false
  viewBoxStyle.value = { left, right, top, bottom }
}

const bindEvents = () => {
  if (!mindMap.value) return
  mindMap.value.on('mini_map_view_box_position_change', onViewBoxPositionChange)
}

const unbindEvents = () => {
  if (!mindMap.value) return
  mindMap.value.off('mini_map_view_box_position_change', onViewBoxPositionChange)
}

onMounted(() => {
  setSize()
  window.addEventListener('resize', setSize)
  bus.on('toggle_mini_map', toggleMiniMap)
  bus.on('data_change', dataChange) // Assuming 'data_change' is emitted by something, or we listen to mindMap event directly? 
  // Original code listened to bus for data_change. In Editor.vue we emit data_change? No, Editor.vue listens to mindMap data_change and auto-saves.
  // Wait, original code: this.$bus.$on('data_change', this.data_change)
  // In Editor.vue (cloud-app), we have: mindMap.value.on('data_change', handleDataChange)
  // We need to verify if 'data_change' is emitted to bus. Editor.vue line 240 listens to mindMap.
  // It seems Editor.vue does NOT emit 'data_change' to bus. 
  // Let's modify this to listen to mindMap directly or have Editor.vue emit it. 
  // Better: listen to mindMap directly if possible.

  window.addEventListener('mouseup', onMouseup)
  
  if (mindMap.value) {
    bindEvents()
    // Original code listened to bus for data_change. Let's listen to mindMap directly here as well.
    mindMap.value.on('data_change', dataChange)
    mindMap.value.on('view_data_change', dataChange)
    mindMap.value.on('node_tree_render_end', dataChange)
  } else {
     const unwatch = watch(mindMap, (val) => {
        if (val) {
            bindEvents()
             mindMap.value.on('data_change', dataChange)
            mindMap.value.on('view_data_change', dataChange)
            mindMap.value.on('node_tree_render_end', dataChange)
            unwatch()
        }
    })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setSize)
  bus.off('toggle_mini_map', toggleMiniMap)
  // bus.off('data_change', dataChange) // Not using bus for this anymore
  window.removeEventListener('mouseup', onMouseup)
  unbindEvents()
  if (mindMap.value) {
    mindMap.value.off('data_change', dataChange)
    mindMap.value.off('view_data_change', dataChange)
    mindMap.value.off('node_tree_render_end', dataChange)
  }
})
</script>

<style scoped>
.navigator-box {
  position: fixed;
  height: 220px;
  background-color: #fff;
  bottom: 80px;
  right: 70px;
  box-shadow: 0 0 16px #989898;
  border-radius: 4px;
  border: 1px solid #eee;
  cursor: pointer;
  user-select: none;
  z-index: 1000;
}

.navigator-box.is-dark {
  background-color: #262a2e;
}

.svg-box {
  position: absolute;
  left: 0;
  transform-origin: left top;
}

.window-box {
  position: absolute;
  border: 2px solid rgb(238, 69, 69);
  background-color: rgba(238, 69, 69, 0.2);
}

.window-box.with-transition {
  transition: all 0.3s;
}
</style>
