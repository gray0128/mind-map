<template>
  <Sidebar ref="sidebarRef" title="关联线样式" name="associativeLineStyle">
    <div class="sidebar-content" :class="{ 'is-dark': isDark }">
      <div class="title no-top">关联线</div>
      <div class="row">
        <div class="row-item">
          <span class="name">颜色</span>
          <el-color-picker v-model="style.associativeLineColor" size="small" @change="(val) => update('associativeLineColor', val)" />
        </div>
        <div class="row-item">
          <span class="name">宽度</span>
          <el-select
            v-model="style.associativeLineWidth"
            size="small"
            style="width: 80px"
            @change="(val) => update('associativeLineWidth', val)"
          >
            <el-option
              v-for="item in lineWidthList"
              :key="item"
              :label="item + ''"
              :value="item"
            >
              <span
                v-if="item > 0"
                class="border-line"
                :class="{ 'is-dark': isDark }"
                :style="{ height: item + 'px' }"
              ></span>
            </el-option>
          </el-select>
        </div>
      </div>
      <div class="row">
        <div class="row-item">
          <span class="name">激活颜色</span>
          <el-color-picker v-model="style.associativeLineActiveColor" size="small" @change="(val) => update('associativeLineActiveColor', val)" />
        </div>
        <div class="row-item">
          <span class="name">激活宽度</span>
          <el-select
            v-model="style.associativeLineActiveWidth"
            size="small"
            style="width: 80px"
            @change="(val) => update('associativeLineActiveWidth', val)"
          >
            <el-option
              v-for="item in lineWidthList"
              :key="item"
              :label="item + ''"
              :value="item"
            >
              <span
                v-if="item > 0"
                class="border-line"
                :class="{ 'is-dark': isDark }"
                :style="{ height: item + 'px' }"
              ></span>
            </el-option>
          </el-select>
        </div>
      </div>
      <div class="row">
        <div class="row-item">
          <span class="name">风格</span>
          <el-select
            v-model="style.associativeLineDasharray"
            size="small"
            style="width: 80px"
            @change="(val) => update('associativeLineDasharray', val)"
          >
            <el-option
              v-for="item in borderDasharrayList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            >
              <svg width="120" height="34" style="vertical-align: middle;">
                <line
                  x1="10"
                  y1="17"
                  x2="110"
                  y2="17"
                  stroke-width="2"
                  :stroke="style.associativeLineDasharray === item.value ? '#409eff' : (isDark ? '#fff' : '#000')"
                  :stroke-dasharray="item.value"
                ></line>
              </svg>
            </el-option>
          </el-select>
        </div>
      </div>
      
      <div class="title">关联线文字</div>
      <div class="row">
        <div class="row-item">
          <span class="name">字体</span>
          <el-select
            v-model="style.associativeLineTextFontFamily"
            size="small"
            @change="(val) => update('associativeLineTextFontFamily', val)"
          >
            <el-option
              v-for="item in fontFamilyList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
              :style="{ fontFamily: item.value }"
            >
            </el-option>
          </el-select>
        </div>
      </div>
      <div class="row">
        <div class="row-item">
          <span class="name">颜色</span>
          <el-color-picker v-model="style.associativeLineTextColor" size="small" @change="(val) => update('associativeLineTextColor', val)" />
        </div>
        <div class="row-item">
          <span class="name">字号</span>
          <el-select
            v-model="style.associativeLineTextFontSize"
            size="small"
            style="width: 80px"
            @change="(val) => update('associativeLineTextFontSize', val)"
          >
            <el-option
              v-for="item in fontSizeList"
              :key="item"
              :label="item + ''"
              :value="item"
              :style="{ fontSize: item + 'px' }"
            >
            </el-option>
          </el-select>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, reactive } from 'vue'
import Sidebar from './Sidebar.vue'
import { useMindMapStore } from '@/store/mindmap'
import {
  lineWidthList,
  fontFamilyList,
  fontSizeList,
  borderDasharrayList
} from '@/config'

const store = useMindMapStore()
const sidebarRef = ref(null)
const activeLineNode = ref(null)
const activeLineToNode = ref(null)

const defaultStyle = {
  associativeLineColor: '',
  associativeLineWidth: 0,
  associativeLineActiveWidth: 0,
  associativeLineDasharray: '',
  associativeLineActiveColor: '',
  associativeLineTextFontSize: 0,
  associativeLineTextColor: '',
  associativeLineTextFontFamily: ''
}

const style = reactive({ ...defaultStyle })

const activeSidebar = computed(() => store.activeSidebar)
const isDark = computed(() => store.localConfig.isDark)
const mindMap = computed(() => store.mindMap)

watch(activeSidebar, (val) => {
  if (sidebarRef.value) {
    sidebarRef.value.show = val === 'associativeLineStyle'
  }
})

onMounted(() => {
  if (mindMap.value) {
    mindMap.value.on('associative_line_click', onAssociativeLineClick)
    mindMap.value.on('associative_line_deactivate', associativeLineDeactivate)
  }
})

onBeforeUnmount(() => {
  if (mindMap.value) {
    mindMap.value.off('associative_line_click', onAssociativeLineClick)
    mindMap.value.off('associative_line_deactivate', associativeLineDeactivate)
  }
})

const onAssociativeLineClick = (a, b, node, toNode) => {
  activeLineNode.value = node
  activeLineToNode.value = toNode
  const styleConfig = mindMap.value.associativeLine.getStyleConfig(node, toNode)
  Object.keys(style).forEach(key => {
    style[key] = styleConfig[key]
  })
  store.setActiveSidebar('associativeLineStyle')
}

const associativeLineDeactivate = () => {
  if (activeSidebar.value === 'associativeLineStyle') {
    store.setActiveSidebar('')
  }
  activeLineNode.value = null
  activeLineToNode.value = null
  Object.assign(style, defaultStyle)
}

const update = (prop, value) => {
  style[prop] = value
  if (!activeLineNode.value || !activeLineToNode.value) return
  
  const associativeLineStyle = activeLineNode.value.getData('associativeLineStyle') || {}
  const toNodeUid = activeLineToNode.value.getData('uid')
  const lineStyle = associativeLineStyle[toNodeUid] || {}
  
  activeLineNode.value.setData({
    associativeLineStyle: {
      ...associativeLineStyle,
      [toNodeUid]: {
        ...lineStyle,
        ...style
      }
    }
  })
  mindMap.value.associativeLine.updateActiveLineStyle()
}
</script>

<style scoped>
.sidebar-content {
  padding: 20px;
  padding-top: 10px;
}

.sidebar-content.is-dark .title {
  color: #fff;
}

.sidebar-content.is-dark .row .row-item .name {
  color: hsla(0, 0%, 100%, 0.6);
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(26, 26, 26, 0.9);
  margin-bottom: 10px;
  margin-top: 20px;
}

.title.no-top {
  margin-top: 0;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.row-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.name {
  font-size: 12px;
  margin-right: 10px;
  white-space: nowrap;
}

.border-line {
  display: inline-block;
  width: 100%;
  background-color: #000;
}

.border-line.is-dark {
  background-color: #fff;
}
</style>

<style>
/* Global styles for select dropdown items */
.el-select-dropdown__item.selected .border-line {
  background-color: #409eff;
}
</style>
