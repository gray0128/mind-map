<template>
  <Sidebar ref="sidebarRef" title="外框样式" name="nodeOuterFrameStyle">
    <div class="sidebar-content" :class="{ 'is-dark': isDark }">
      <div class="panel-header">
        <span class="name">外框</span>
        <span class="delete-btn" @click="deleteOuterFrame">
          删除外框
          <el-icon><Delete /></el-icon>
        </span>
      </div>

      <div class="row">
         <div class="row-item">
          <span class="name">边框样式</span>
          <el-select
            v-model="styleConfig.strokeWidth"
            size="small"
            style="width: 80px"
            @change="(val) => updateOuterFrame('strokeWidth', val)"
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

          <el-select
            v-model="styleConfig.strokeDasharray"
            size="small"
            style="width: 80px; margin-left: 10px;"
             @change="(val) => updateOuterFrame('strokeDasharray', val)"
          >
            <el-option
              v-for="item in borderDasharrayList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            >
               <svg width="100%" height="20" style="vertical-align: middle">
                  <line
                    x1="0"
                    y1="10"
                    x2="100"
                    y2="10"
                    stroke-width="2"
                    :stroke="styleConfig.strokeDasharray === item.value ? '#409eff' : (isDark ? '#fff' : '#000')"
                    :stroke-dasharray="item.value"
                  ></line>
                </svg>
            </el-option>
          </el-select>
        </div>
      </div>

       <div class="row">
        <div class="row-item">
          <span class="name">边框颜色</span>
          <el-popover placement="bottom" trigger="click" width="auto">
            <template #reference>
              <span
                class="block"
                :style="{ width: '80px', backgroundColor: styleConfig.strokeColor }"
              ></span>
            </template>
            <Color :color="styleConfig.strokeColor" @change="(val) => updateOuterFrame('strokeColor', val)"></Color>
          </el-popover>
        </div>
        <div class="row-item">
          <span class="name">圆角</span>
          <el-select
            v-model="styleConfig.radius"
            size="small"
            style="width: 80px"
            @change="(val) => updateOuterFrame('radius', val)"
          >
            <el-option
              v-for="item in borderRadiusList"
              :key="item"
              :label="item + ''"
              :value="item"
            >
            </el-option>
          </el-select>
        </div>
      </div>

       <div class="row">
        <div class="row-item">
          <span class="name">填充颜色</span>
          <el-popover placement="bottom" trigger="click" width="auto">
            <template #reference>
              <span
                class="block"
                :style="{ backgroundColor: styleConfig.fill }"
              ></span>
            </template>
            <Color :color="styleConfig.fill" @change="(val) => updateOuterFrame('fill', val)"></Color>
          </el-popover>
        </div>
      </div>

      <div class="panel-header" style="margin-top: 20px;">
        <span class="name">外框文字</span>
        <span class="delete-btn" @click="deleteOuterFrameText">
          删除文字
          <el-icon><Delete /></el-icon>
        </span>
      </div>

      <div class="row">
        <div class="row-item" style="width: 100%">
          <span class="name">字体</span>
          <el-select
            v-model="styleConfig.fontFamily"
            size="small"
             @change="(val) => updateOuterFrame('fontFamily', val)"
             style="flex: 1"
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
         <div class="btn-group" style="width: 100%; justify-content: space-between;">
             <el-tooltip content="颜色" placement="bottom">
               <el-popover placement="bottom" trigger="click" width="auto">
                 <template #reference>
                   <div class="style-btn" style="flex: 1">
                     A
                     <span
                       class="color-show"
                       :style="{ backgroundColor: styleConfig.color || '#000' }"
                     ></span>
                   </div>
                 </template>
                 <Color :color="styleConfig.color" @change="(val) => updateOuterFrame('color', val)"></Color>
               </el-popover>
             </el-tooltip>

             <el-tooltip content="加粗" placement="bottom">
               <div class="style-btn" @click="toggleFontWeight" :class="{ actived: styleConfig.fontWeight === 'bold' }" style="flex: 1; margin: 0 10px;">
                 <span style="font-weight: bold;">B</span>
               </div>
             </el-tooltip>

             <el-tooltip content="斜体" placement="bottom">
              <div class="style-btn" @click="toggleFontStyle" :class="{ actived: styleConfig.fontStyle === 'italic' }" style="flex: 1">
                 <span style="font-style: italic;">I</span>
               </div>
             </el-tooltip>
         </div>
      </div>

       <div class="row">
          <div class="row-item">
             <span class="name">行高</span>
              <el-select
                v-model="styleConfig.lineHeight"
                size="small"
                style="width: 80px"
                 @change="(val) => updateOuterFrame('lineHeight', val)"
              >
                <el-option
                  v-for="item in lineHeightList"
                  :key="item"
                  :label="item + ''"
                  :value="item"
                >
                </el-option>
              </el-select>
          </div>
          <div class="row-item">
            <span class="name">字号</span>
            <el-select
              v-model="styleConfig.fontSize"
              size="small"
              style="width: 80px"
              @change="(val) => updateOuterFrame('fontSize', val)"
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

      <div class="row">
          <div class="row-item">
            <span class="name">背景填充</span>
            <el-popover placement="bottom" trigger="click" width="auto">
              <template #reference>
                <span
                  class="block"
                  :style="{ backgroundColor: styleConfig.textFill }"
                ></span>
              </template>
              <Color :color="styleConfig.textFill" @change="(val) => updateOuterFrame('textFill', val)"></Color>
            </el-popover>
          </div>
           <div class="row-item">
            <span class="name">背景圆角</span>
             <el-select
                v-model="styleConfig.textFillRadius"
                size="small"
                style="width: 80px"
                 @change="(val) => updateOuterFrame('textFillRadius', val)"
              >
                 <el-option
                  v-for="item in borderRadiusList"
                  :key="item"
                  :label="item + ''"
                  :value="item"
                >
                </el-option>
              </el-select>
          </div>
      </div>

       <div class="row">
          <div class="row-item">
             <span class="name">显示位置</span>
             <el-radio-group v-model="styleConfig.textAlign" size="small" @change="(val) => updateOuterFrame('textAlign', val)">
                <el-radio-button value="left">左</el-radio-button>
                <el-radio-button value="center">中</el-radio-button>
                <el-radio-button value="right">右</el-radio-button>
             </el-radio-group>
          </div>
       </div>

       <div class="row">
            <div class="row-item" style="width: 100%">
               <span class="name">水平内边距</span>
               <el-slider v-model="paddingStyle.paddingX" style="width: 180px" @change="(val) => updatePadding('x', val)"></el-slider>
            </div>
       </div>
        <div class="row">
            <div class="row-item" style="width: 100%">
               <span class="name">垂直内边距</span>
               <el-slider v-model="paddingStyle.paddingY" style="width: 180px" @change="(val) => updatePadding('y', val)"></el-slider>
            </div>
       </div>

    </div>
  </Sidebar>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, reactive } from 'vue'
import Sidebar from './Sidebar.vue'
import Color from './Color.vue'
import { useMindMapStore } from '@/store/mindmap'
import { Delete } from '@element-plus/icons-vue'
import OuterFrame from 'simple-mind-map/src/plugins/OuterFrame'
import {
  lineWidthList,
  borderDasharrayList,
  fontFamilyList,
  fontSizeList,
  borderRadiusList,
  lineHeightList
} from '@/config'

const store = useMindMapStore()
const sidebarRef = ref(null)

const styleConfig = reactive({
  ...OuterFrame.defaultStyle
})

const paddingStyle = reactive({
  paddingX: 0,
  paddingY: 0
})

const activeSidebar = computed(() => store.activeSidebar)
const isDark = computed(() => store.localConfig.isDark)
const mindMap = computed(() => store.mindMap)

watch(activeSidebar, (val) => {
  if (sidebarRef.value) {
    sidebarRef.value.show = val === 'nodeOuterFrameStyle'
  }
})

onMounted(() => {
    if (mindMap.value) {
        mindMap.value.on('outer_frame_active', onOuterFrameActive)
        mindMap.value.on('outer_frame_delete', hide)
        mindMap.value.on('outer_frame_deactivate', hide)
    }
})

onBeforeUnmount(() => {
    if (mindMap.value) {
        mindMap.value.off('outer_frame_active', onOuterFrameActive)
        mindMap.value.off('outer_frame_delete', hide)
        mindMap.value.off('outer_frame_deactivate', hide)
    }
})

const onOuterFrameActive = (el, parentNode, range) => {
    if (!parentNode || !parentNode.children) return

    // 兼容不同的参数结构，尝试获取激活的节点
    // simple-mind-map 0.8.0+ 可能是直接传了 outerFrame 数据或者节点
    // 这里依然沿用基于 range 的逻辑，但也做一些防错
    const firstNode = parentNode.children[range[0]]
    if (!firstNode) return

    const firstNodeOuterFrame = firstNode.getData('outerFrame') || {}

    Object.keys(styleConfig).forEach(key => {
        if (firstNodeOuterFrame[key] !== undefined) {
            styleConfig[key] = firstNodeOuterFrame[key]
        } else {
            styleConfig[key] = OuterFrame.defaultStyle[key]
        }
    })

    const [pl, pt] = styleConfig.textFillPadding || [0, 0]
    paddingStyle.paddingX = pl
    paddingStyle.paddingY = pt

    store.setActiveSidebar('nodeOuterFrameStyle')
}

const updateOuterFrame = (key, val) => {
    styleConfig[key] = val
    mindMap.value.outerFrame.updateActiveOuterFrame({
        [key]: val
    })
}

const updatePadding = (dir, value) => {
    const [pl, pt] = styleConfig.textFillPadding || [0, 0]
    let newPadding = []
    if (dir === 'x') {
        newPadding = [value, pt, value, pt]
    } else {
        newPadding = [pl, value, pl, value]
    }
    styleConfig.textFillPadding = newPadding
    updateOuterFrame('textFillPadding', newPadding)

    if (dir === 'x') paddingStyle.paddingX = value
    else paddingStyle.paddingY = value
}

const toggleFontWeight = () => {
    const newVal = styleConfig.fontWeight === 'bold' ? 'normal' : 'bold'
    updateOuterFrame('fontWeight', newVal)
}

const toggleFontStyle = () => {
    const newVal = styleConfig.fontStyle === 'italic' ? 'normal' : 'italic'
    updateOuterFrame('fontStyle', newVal)
}

const deleteOuterFrame = () => {
    mindMap.value.outerFrame.removeActiveOuterFrame()
    hide()
}

const deleteOuterFrameText = () => {
    mindMap.value.outerFrame.removeActiveOuterFrameText()
}

const hide = () => {
    if (activeSidebar.value === 'nodeOuterFrameStyle') {
        store.setActiveSidebar('')
    }
}

</script>

<style scoped>
.sidebar-content {
  padding: 20px;
  padding-top: 10px;
}

.sidebar-content.is-dark .panel-header .name {
  color: #fff;
}

.sidebar-content.is-dark .row .row-item .name {
  color: hsla(0, 0%, 100%, 0.6);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.name {
  font-size: 16px;
  font-weight: 500;
  color: rgba(26, 26, 26, 0.9);
}

.delete-btn {
  display: flex;
  align-items: center;
  color: #909090;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.delete-btn:hover {
  color: #f56c6c;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.row-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.row-item .name {
  font-size: 12px;
  margin-right: 10px;
  white-space: nowrap;
}

.block {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.border-line {
  display: inline-block;
  width: 100%;
  background-color: #000;
}

.border-line.is-dark {
  background-color: #fff;
}

.btn-group {
    display: flex;
    align-items: center;
}

.style-btn {
    position: relative;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: pointer;
    background: #fff;
    color: #606266;
}

.style-btn:hover {
  background-color: #f5f7fa;
}

.style-btn.actived {
    background-color: #ecf5ff;
    color: #409eff;
    border-color: #c6e2ff;
}

.color-show {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 4px;
    border-radius: 0 0 4px 4px;
}
</style>

<style>
.el-select-dropdown__item.selected .border-line {
  background-color: #409eff;
}
</style>
