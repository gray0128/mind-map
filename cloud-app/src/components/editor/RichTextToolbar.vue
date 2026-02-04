<template>
  <div
    class="rich-text-toolbar"
    ref="toolbarRef"
    :style="style"
    :class="{ 'is-dark': isDark }"
    v-show="show"
    @click.stop
  >
    <el-tooltip content="加粗" placement="top">
      <div class="btn" :class="{ active: formatInfo.bold }" @click="toggleBold">
        <i class="iconfont iconzitijiacu"></i>
        <span style="font-weight: bold">B</span>
      </div>
    </el-tooltip>

    <el-tooltip content="斜体" placement="top">
      <div class="btn" :class="{ active: formatInfo.italic }" @click="toggleItalic">
        <i class="iconfont iconzitixieti"></i>
        <span style="font-style: italic">I</span>
      </div>
    </el-tooltip>

    <el-tooltip content="下划线" placement="top">
      <div class="btn" :class="{ active: formatInfo.underline }" @click="toggleUnderline">
        <i class="iconfont iconzitixiahuaxian"></i>
        <span style="text-decoration: underline">U</span>
      </div>
    </el-tooltip>

    <el-tooltip content="删除线" placement="top">
      <div class="btn" :class="{ active: formatInfo.strike }" @click="toggleStrike">
        <i class="iconfont iconshanchuxian"></i>
        <span style="text-decoration: line-through">S</span>
      </div>
    </el-tooltip>

    <el-tooltip content="字体" placement="top">
      <el-popover placement="bottom" trigger="hover" :width="160">
        <template #reference>
          <div class="btn">
             <el-icon><Edit /></el-icon>
          </div>
        </template>
        <div class="font-options-list" :class="{ 'is-dark': isDark }">
          <div
            class="font-option-item"
            v-for="item in fontFamilyList"
            :key="item.value"
            :style="{ fontFamily: item.value }"
            :class="{ active: formatInfo.font === item.value }"
            @click="changeFontFamily(item.value)"
          >
            {{ item.name }}
          </div>
        </div>
      </el-popover>
    </el-tooltip>

    <el-tooltip content="字号" placement="top">
      <el-popover placement="bottom" trigger="hover" :width="100">
        <template #reference>
          <div class="btn">
            <span style="font-size: 14px">Tt</span>
          </div>
        </template>
        <div class="font-options-list" :class="{ 'is-dark': isDark }">
          <div
            class="font-option-item"
            v-for="item in fontSizeList"
            :key="item"
            :style="{ fontSize: item + 'px', lineHeight: '1.2' }"
            :class="{ active: formatInfo.size === item + 'px' }"
            @click="changeFontSize(item)"
          >
            {{ item }}px
          </div>
        </div>
      </el-popover>
    </el-tooltip>

    <el-tooltip content="字体颜色" placement="top">
      <el-popover placement="bottom" trigger="hover" :width="240">
        <template #reference>
          <div class="btn" :style="{ color: formatInfo.color }">
            <span class="color-indicator" :style="{ backgroundColor: formatInfo.color || '#000' }"></span>
            A
          </div>
        </template>
         <el-color-picker v-model="fontColor" show-alpha @change="changeFontColor" />
      </el-popover>
    </el-tooltip>

    <el-tooltip content="背景颜色" placement="top">
       <el-popover placement="bottom" trigger="hover" :width="240">
        <template #reference>
          <div class="btn">
             <div class="bg-icon" :style="{ backgroundColor: formatInfo.background || 'transparent' }"></div>
          </div>
        </template>
         <el-color-picker v-model="fontBackgroundColor" show-alpha @change="changeFontBackgroundColor" />
      </el-popover>
    </el-tooltip>
    
    <el-tooltip content="清除格式" placement="top">
      <div class="btn" @click="removeFormat">
        <el-icon><Delete /></el-icon>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, reactive, watch } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import { fontFamilyList, fontSizeList } from '@/config'
import { Edit, Delete } from '@element-plus/icons-vue'

const store = useMindMapStore()
const toolbarRef = ref(null)
const show = ref(false)
const style = reactive({
  left: '0px',
  top: '0px'
})
const formatInfo = reactive({
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  font: '',
  size: '',
  color: '',
  background: '',
  align: ''
})
const fontColor = ref('')
const fontBackgroundColor = ref('')

const isDark = computed(() => store.localConfig.isDark)
const mindMap = computed(() => store.mindMap)

const onRichTextSelectionChange = (hasRange, rect, info) => {
  if (hasRange && rect) {
    style.left = rect.left + rect.width / 2 + 'px'
    style.top = rect.top - 60 + 'px'
    Object.assign(formatInfo, info || {})
    fontColor.value = formatInfo.color
    fontBackgroundColor.value = formatInfo.background
    show.value = true
  } else {
    show.value = false
  }
}

const toggleBold = () => {
  formatInfo.bold = !formatInfo.bold
  mindMap.value.richText.formatText({ bold: formatInfo.bold })
}

const toggleItalic = () => {
  formatInfo.italic = !formatInfo.italic
  mindMap.value.richText.formatText({ italic: formatInfo.italic })
}

const toggleUnderline = () => {
  formatInfo.underline = !formatInfo.underline
  mindMap.value.richText.formatText({ underline: formatInfo.underline })
}

const toggleStrike = () => {
  formatInfo.strike = !formatInfo.strike
  mindMap.value.richText.formatText({ strike: formatInfo.strike })
}

const changeFontFamily = (font) => {
  formatInfo.font = font
  mindMap.value.richText.formatText({ font })
}

const changeFontSize = (size) => {
  formatInfo.size = size + 'px'
  mindMap.value.richText.formatText({ size: size + 'px' })
}

const changeFontColor = (color) => {
  formatInfo.color = color
  mindMap.value.richText.formatText({ color })
}

const changeFontBackgroundColor = (background) => {
  formatInfo.background = background
  mindMap.value.richText.formatText({ background })
}

const removeFormat = () => {
  mindMap.value.richText.removeFormat()
}

onMounted(() => {
    // Assuming simple-mind-map emits this event on the instance
    if (mindMap.value) {
        mindMap.value.on('rich_text_selection_change', onRichTextSelectionChange)
    }
    // Also watch for mindMap changes if it's not ready initially
})

watch(() => mindMap.value, (val) => {
    if (val) {
        val.on('rich_text_selection_change', onRichTextSelectionChange)
    }
})

onBeforeUnmount(() => {
    if (mindMap.value) {
        mindMap.value.off('rich_text_selection_change', onRichTextSelectionChange)
    }
})
</script>

<style scoped>
.rich-text-toolbar {
  position: fixed;
  z-index: 2000;
  height: 40px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transform: translateX(-50%);
  padding: 0 5px;
}

.rich-text-toolbar.is-dark {
  background: #363b3f;
  border-color: #4c4d4f;
}

.btn {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin: 0 2px;
  border-radius: 4px;
  color: #606266;
  position: relative;
}

.rich-text-toolbar.is-dark .btn {
  color: #fff;
}

.btn:hover {
  background-color: #f5f7fa;
}

.rich-text-toolbar.is-dark .btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.btn.active {
  color: #409eff;
  background-color: #ecf5ff;
}

.rich-text-toolbar.is-dark .btn.active {
    background-color: rgba(64, 158, 255, 0.2);
}

.font-options-list {
  max-height: 200px;
  overflow-y: auto;
}

.font-option-item {
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
}

.font-option-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.font-options-list.is-dark .font-option-item:hover {
    background-color: #363b3f;
}

.font-option-item.active {
  color: #409eff;
  font-weight: bold;
}

.color-indicator {
    position: absolute;
    bottom: 4px;
    left: 6px;
    right: 6px;
    height: 3px;
    border-radius: 1px;
}

.bg-icon {
    width: 16px;
    height: 16px;
    border: 1px solid #dcdfe6;
}
</style>
