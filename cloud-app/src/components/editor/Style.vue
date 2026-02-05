<template>
  <Sidebar ref="sidebar" title="节点样式" name="style">
    <div
      class="styleBox"
      :class="{ isDark: isDark }"
      v-if="hasActiveNodes"
    >
      <div class="sidebarContent customScrollbar">
        <!-- 文字 -->
        <div class="title noTop">文字</div>
        <div class="row">
          <div class="rowItem">
            <el-select
              size="small"
              style="width: 100px"
              v-model="style.fontFamily"
              placeholder=""
              @change="updateStyle('fontFamily')"
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
          <div class="rowItem">
            <el-select
              size="small"
              style="width: 60px"
              v-model="style.fontSize"
              placeholder=""
              @change="updateStyle('fontSize')"
            >
              <el-option
                v-for="item in fontSizeList"
                :key="item"
                :label="item"
                :value="item"
                :style="{ fontSize: item + 'px' }"
              >
              </el-option>
            </el-select>
          </div>
          <div class="rowItem">
            <el-select
              size="small"
              style="width: 80px"
              v-model="style.textAlign"
              placeholder=""
              @change="updateStyle('textAlign')"
            >
              <el-option
                v-for="item in alignList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
        </div>
        <div class="row">
          <div class="btnGroup">
            <el-tooltip content="颜色" placement="bottom">
              <el-popover placement="bottom" trigger="click" width="auto">
                <template #reference>
                  <div class="styleBtn">
                    A
                    <span
                      class="colorShow"
                      :style="{ backgroundColor: style.color || '#eee' }"
                    ></span>
                  </div>
                </template>
                <Color :color="style.color" @change="changeFontColor"></Color>
              </el-popover>
            </el-tooltip>
            <el-tooltip content="加粗" placement="bottom">
              <div
                class="styleBtn"
                :class="{
                  actived: style.fontWeight === 'bold'
                }"
                @click="toggleFontWeight"
              >
                B
              </div>
            </el-tooltip>
            <el-tooltip content="斜体" placement="bottom">
              <div
                class="styleBtn i"
                :class="{
                  actived: style.fontStyle === 'italic'
                }"
                @click="toggleFontStyle"
              >
                I
              </div>
            </el-tooltip>
            <el-tooltip
              content="划线"
              placement="bottom"
            >
              <el-popover placement="bottom" trigger="click" width="auto">
                <template #reference>
                  <div
                    class="styleBtn u"
                    :style="{ textDecoration: style.textDecoration || 'none' }"
                  >
                    U
                  </div>
                </template>
                <el-radio-group
                  size="small"
                  v-model="style.textDecoration"
                  @change="updateStyle('textDecoration')"
                >
                  <el-radio-button value="none">无</el-radio-button>
                  <el-radio-button value="underline">下划线</el-radio-button>
                  <el-radio-button value="line-through">中划线</el-radio-button>
                  <el-radio-button value="overline">上划线</el-radio-button>
                </el-radio-group>
              </el-popover>
            </el-tooltip>
          </div>
        </div>
        <!-- 边框 -->
        <div class="title">边框</div>
        <div class="row">
          <div class="rowItem">
            <span class="name">颜色</span>
            <el-popover placement="bottom" trigger="click" width="auto">
              <template #reference>
                <span
                  class="block"
                  :style="{ width: '80px', backgroundColor: style.borderColor }"
                ></span>
              </template>
              <Color
                :color="style.borderColor"
                @change="changeBorderColor"
              ></Color>
            </el-popover>
          </div>
          <div class="rowItem">
            <span class="name">样式</span>
            <el-select
              size="small"
              style="width: 80px"
              v-model="style.borderDasharray"
              placeholder=""
              @change="updateStyle('borderDasharray')"
            >
              <el-option
                v-for="item in borderDasharrayList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <svg width="120" height="34">
                  <line
                    x1="10"
                    y1="17"
                    x2="110"
                    y2="17"
                    stroke-width="2"
                    :stroke="
                      style.borderDasharray === item.value
                        ? '#409eff'
                        : isDark
                        ? '#fff'
                        : '#000'
                    "
                    :stroke-dasharray="item.value"
                  ></line>
                </svg>
              </el-option>
            </el-select>
          </div>
        </div>
        <div class="row">
          <div class="rowItem">
            <span class="name">宽度</span>
            <el-select
              size="small"
              style="width: 80px"
              v-model="style.borderWidth"
              placeholder=""
              @change="updateStyle('borderWidth')"
            >
              <el-option
                v-for="item in borderWidthList"
                :key="item"
                :label="item"
                :value="item"
              >
                <span
                  v-if="item > 0"
                  class="borderLine"
                  :class="{ isDark: isDark }"
                  :style="{ height: item + 'px' }"
                ></span>
              </el-option>
            </el-select>
          </div>
          <div class="rowItem" v-show="style.shape === 'rectangle'">
            <span class="name">圆角</span>
            <el-select
              size="small"
              style="width: 80px"
              v-model="style.borderRadius"
              placeholder=""
              @change="updateStyle('borderRadius')"
            >
              <el-option
                v-for="item in borderRadiusList"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
        </div>
        <!-- 背景 -->
        <div class="title">背景</div>
        <div class="row">
          <div class="rowItem">
            <span class="name">颜色</span>
            <el-popover placement="bottom" trigger="click" width="auto">
              <template #reference>
                <span
                  class="block"
                  :style="{ backgroundColor: style.fillColor }"
                ></span>
              </template>
              <Color :color="style.fillColor" @change="changeFillColor"></Color>
            </el-popover>
            <span class="name" style="margin-left: 20px;">渐变</span>
            <el-checkbox
              v-model="style.gradientStyle"
              @change="updateStyle('gradientStyle')"
            ></el-checkbox>
          </div>
        </div>
        <div class="row" v-if="style.gradientStyle">
          <div class="rowItem">
            <span class="name">起</span>
            <el-popover placement="bottom" trigger="click" width="auto">
              <template #reference>
                <span
                  class="block"
                  :style="{ backgroundColor: style.startColor }"
                ></span>
              </template>
              <Color
                :color="style.startColor"
                @change="changeStartColor"
              ></Color>
            </el-popover>
          </div>
          <div class="rowItem">
            <span class="name">止</span>
            <el-popover placement="bottom" trigger="click" width="auto">
              <template #reference>
                <span
                  class="block"
                  :style="{ backgroundColor: style.endColor }"
                ></span>
              </template>
              <Color :color="style.endColor" @change="changeEndColor"></Color>
            </el-popover>
          </div>
          <div class="rowItem">
            <span class="name">方向</span>
            <el-select
              size="small"
              style="width: 80px"
              v-model="style.linearGradientDir"
              placeholder=""
              @change="updateStyle('linearGradientDir')"
            >
              <el-option
                v-for="item in linearGradientDirList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
        </div>
        <!-- 形状 -->
        <div class="title">形状</div>
        <div class="row">
          <div class="rowItem">
            <span class="name">形状</span>
            <el-select
              size="small"
              style="width: 120px"
              v-model="style.shape"
              placeholder=""
              @change="updateStyle('shape')"
            >
              <el-option
                v-for="item in shapeList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
                style="display: flex; justify-content: center; align-items: center;"
              >
                <svg
                  :width="item.width || 60"
                  :height="item.height || 26"
                  style="margin-top: 5px"
                >
                  <path
                    :d="shapeListMap[item.value]"
                    fill="none"
                    :stroke="
                      style.shape === item.value
                        ? '#409eff'
                        : isDark
                        ? '#fff'
                        : '#000'
                    "
                    stroke-width="2"
                  ></path>
                </svg>
              </el-option>
            </el-select>
          </div>
        </div>
        <!-- 线条 -->
        <div class="title">线条</div>
        <div class="row">
          <div class="rowItem">
            <span class="name">颜色</span>
            <el-popover placement="bottom" trigger="click" width="auto">
              <template #reference>
                <span
                  class="block"
                  :style="{ width: '80px', backgroundColor: style.lineColor }"
                ></span>
              </template>
              <Color :color="style.lineColor" @change="changeLineColor"></Color>
            </el-popover>
          </div>
          <div class="rowItem">
            <span class="name">样式</span>
            <el-select
              size="small"
              style="width: 80px"
              v-model="style.lineDasharray"
              placeholder=""
              @change="updateStyle('lineDasharray')"
            >
              <el-option
                v-for="item in borderDasharrayList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <svg width="120" height="34">
                  <line
                    x1="10"
                    y1="17"
                    x2="110"
                    y2="17"
                    stroke-width="2"
                    :stroke="
                      style.lineDasharray === item.value
                        ? '#409eff'
                        : isDark
                        ? '#fff'
                        : '#000'
                    "
                    :stroke-dasharray="item.value"
                  ></line>
                </svg>
              </el-option>
            </el-select>
          </div>
        </div>
        <div class="row">
          <div class="rowItem">
            <span class="name">宽度</span>
            <el-select
              size="small"
              style="width: 80px"
              v-model="style.lineWidth"
              placeholder=""
              @change="updateStyle('lineWidth')"
            >
              <el-option
                v-for="item in borderWidthList"
                :key="item"
                :label="item"
                :value="item"
              >
                <span
                  v-if="item > 0"
                  class="borderLine"
                  :class="{ isDark: isDark }"
                  :style="{ height: item + 'px' }"
                ></span>
              </el-option>
            </el-select>
          </div>
          <div class="rowItem">
            <span class="name">箭头</span>
            <el-select
              size="small"
              style="width: 80px"
              v-model="style.lineMarkerDir"
              placeholder=""
              @change="updateStyle('lineMarkerDir')"
            >
              <el-option
                key="start"
                label="头部"
                value="start"
              ></el-option>
              <el-option
                key="end"
                label="尾部"
                value="end"
              ></el-option>
            </el-select>
          </div>
        </div>
        <!-- 节点内边距 -->
        <div class="title">节点内边距</div>
        <div class="row noBottom">
          <div class="rowItem">
            <span class="name">水平</span>
            <el-slider
              style="width: 200px"
              v-model="style.paddingX"
              @change="updateStyle('paddingX')"
            ></el-slider>
          </div>
        </div>
        <div class="row">
          <div class="rowItem">
            <span class="name">垂直</span>
            <el-slider
              style="width: 200px"
              v-model="style.paddingY"
              @change="updateStyle('paddingY')"
            ></el-slider>
          </div>
        </div>
        <!-- 节点图片布局 -->
        <div class="title">图片</div>
        <div class="row">
          <div class="rowItem">
            <span class="name">布局</span>
            <el-radio-group
              v-model="style.imgPlacement"
              size="small"
              @change="updateStyle('imgPlacement')"
            >
              <el-radio-button value="top">上</el-radio-button>
              <el-radio-button value="bottom">下</el-radio-button>
              <el-radio-button value="left">左</el-radio-button>
              <el-radio-button value="right">右</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <!-- 节点标签布局 -->
        <div class="title">标签</div>
        <div class="row">
          <div class="rowItem">
            <span class="name">布局</span>
            <el-radio-group
              v-model="style.tagPlacement"
              size="small"
              @change="updateStyle('tagPlacement')"
            >
              <el-radio-button value="right">右</el-radio-button>
              <el-radio-button value="bottom">下</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>
    </div>
    <div class="empty-tip" v-else>
      <el-empty description="请先选择节点" :image-size="80" />
    </div>
  </Sidebar>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import bus from '@/utils/bus'
import Sidebar from './Sidebar.vue'
import Color from './Color.vue'
import { 
  fontFamilyList, 
  fontSizeList, 
  borderWidthList, 
  borderRadiusList, 
  lineWidthList,
  borderDasharrayList,
  shapeList,
  shapeListMap,
  alignList,
  linearGradientDirList
} from '@/config'

const mindMapStore = useMindMapStore()

// 激活的节点
const activeNodes = shallowRef([])

// 样式状态
const style = reactive({
  fontFamily: '',
  fontSize: 14,
  textAlign: 'left',
  color: '#333333',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  shape: 'rectangle',
  borderColor: '#333333',
  borderWidth: 1,
  borderDasharray: 'none',
  borderRadius: 5,
  fillColor: '#ffffff',
  lineColor: '#333333',
  lineDasharray: 'none',
  lineWidth: 2,
  lineMarkerDir: 'end',
  gradientStyle: false,
  startColor: '#fff',
  endColor: '#fff',
  linearGradientDir: '',
  imgPlacement: 'top',
  tagPlacement: 'right'
})

// 是否有激活节点
const hasActiveNodes = computed(() => activeNodes.value.length > 0)

// 暗色模式
const isDark = computed(() => mindMapStore.localConfig?.isDark || false)

// MindMap instance (needed for extendShapeList)
const mindMap = computed(() => mindMapStore.getMindMap())

// Calculate extended shape list
// Note: In cloud-app, mindMap might be null initially. 
// We should probably rely on store's mindMap but be careful.
// The config import uses static lists, but shapeList needs mindMap extension.
// Adapt from web:
const extendedShapeList = computed(() => {
    if (!mindMap.value) return shapeList
    const list = [
        ...shapeList,
        ...mindMap.value.extendShapeList
          .filter(item => !['fishHead'].includes(item.name))
          .map(item => ({
             width: '40px',
             name: item.nameShow,
             value: item.name
          }))
    ]
    return list
})

const extendedShapeListMap = computed(() => {
    if (!mindMap.value) return shapeListMap
    const map2 = {}
    mindMap.value.extendShapeList.forEach(item => {
        map2[item.name] = item.path
    })
    return {
        ...shapeListMap,
        ...map2
    }
})

// 更新样式
const updateStyle = (key) => {
  const mapInstance = mindMapStore.getMindMap()
  if (!mapInstance || activeNodes.value.length === 0) return

  if (key === 'linearGradientDir') {
      const target = linearGradientDirList.find(item => item.value === style.linearGradientDir)
      if (target) {
           activeNodes.value.forEach(node => {
               node.setStyles({
                   startDir: [...target.start],
                   endDir: [...target.end]
               })
           })
      }
  } else {
      activeNodes.value.forEach(node => {
        node.setStyle(key, style[key])
      })
  }
}

// 切换加粗
const toggleFontWeight = () => {
    style.fontWeight = style.fontWeight === 'bold' ? 'normal' : 'bold'
    updateStyle('fontWeight')
}

// 切换斜体
const toggleFontStyle = () => {
    style.fontStyle = style.fontStyle === 'italic' ? 'normal' : 'italic'
    updateStyle('fontStyle')
}

// 修改字体颜色
const changeFontColor = (color) => {
    style.color = color
    updateStyle('color')
}

// 修改边框颜色
const changeBorderColor = (color) => {
    style.borderColor = color
    updateStyle('borderColor')
}

// 修改背景颜色
const changeFillColor = (color) => {
    style.fillColor = color
    updateStyle('fillColor')
}

// 修改线条颜色
const changeLineColor = (color) => {
    style.lineColor = color
    updateStyle('lineColor')
}

// 修改渐变起始颜色
const changeStartColor = (color) => {
    style.startColor = color
    updateStyle('startColor')
}

// 修改渐变结束颜色
const changeEndColor = (color) => {
    style.endColor = color
    updateStyle('endColor')
}

// 读取当前节点样式
const readNodeStyle = () => {
  if (activeNodes.value.length === 0) return
  
  const node = activeNodes.value[0]
  
  Object.keys(style).forEach(key => {
    if (key === 'linearGradientDir') {
        // Handle logic in initLinearGradientDir
        return
    }
    const value = node.getStyle(key, false)
    if (value !== undefined && value !== null) {
      style[key] = value
    }
  })
  initLinearGradientDir()
}

const initLinearGradientDir = () => {
    const node = activeNodes.value[0]
    const startDir = node.getStyle('startDir', false)
    const endDir = node.getStyle('endDir', false)
    if (startDir && endDir) {
         const target = linearGradientDirList.find(item => {
            return (
              item.start[0] === startDir[0] &&
              item.start[1] === startDir[1] &&
              item.end[0] === endDir[0] &&
              item.end[1] === endDir[1]
            )
          })
          if (target) {
            style.linearGradientDir = target.value
          }
    }
}

// 节点激活事件 (Fixed format)
const onNodeActive = (payload) => {
  activeNodes.value = [...(payload.activeNodeList || [])]
  if (activeNodes.value.length > 0) {
    readNodeStyle()
  }
}

onMounted(() => {
  bus.on('node_active', onNodeActive)
})

onBeforeUnmount(() => {
  bus.off('node_active', onNodeActive)
})
</script>

<style lang="less" scoped>
.styleBox {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  &.isDark {
    .sidebarContent {
      .title {
        color: #fff;
      }

      .row {
        .rowItem {
          .name {
            color: hsla(0, 0%, 100%, 0.6);
          }
        }

        .styleBtn {
          background-color: #363b3f;
          color: hsla(0, 0%, 100%, 0.6);
          border-color: hsla(0, 0%, 100%, 0.1);
        }
      }
    }
  }
}

.sidebarContent {
  padding: 20px;
  padding-top: 10px;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
  margin-top: 20px;

  &.noTop {
    margin-top: 0;
  }
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  flex-wrap: wrap;

  &.noBottom {
    margin-bottom: 0;
  }

  .rowItem {
    display: flex;
    align-items: center;
    margin-bottom: 5px;

    .name {
      font-size: 12px;
      margin-right: 10px;
      white-space: nowrap;
      color: #606266;
    }

    .block {
      display: inline-block;
      width: 30px;
      height: 30px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      cursor: pointer;
    }
  }

  .styleBtn {
    position: relative;
    width: 30px;
    height: 30px;
    background: #fff;
    border: 1px solid #dcdfe6;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
    color: #606266;
    border-radius: 4px;

    &:hover {
      background-color: #f5f7fa;
    }

    &.actived {
      background-color: #ecf5ff;
      color: #409eff;
      border-color: #c6e2ff;
    }

    &.i {
      font-style: italic;
    }

    &.u {
      text-decoration: underline;
    }

    .colorShow {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 4px;
    }
  }

  .btnGroup {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }
}

.borderLine {
  display: inline-block;
  width: 100%;
  background-color: #000;

  &.isDark {
    background-color: #fff;
  }
}

.empty-tip {
  padding: 40px 0;
}
</style>
