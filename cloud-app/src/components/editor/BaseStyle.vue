<template>
  <Sidebar ref="sidebarRef" title="基础样式" name="baseStyle">
    <div class="sidebar-content" :class="{ 'is-dark': isDark }">
      <!-- 背景 -->
      <div class="title no-top">背景</div>
      <div class="row">
        <el-tabs class="tab" v-model="activeTab" style="width: 100%">
          <el-tab-pane label="颜色" name="color">
            <div class="row-item">
              <el-color-picker v-model="style.backgroundColor" size="small" show-alpha @change="(val) => update('backgroundColor', val)" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="图片" name="image">
             <div class="row-item">
                <el-input v-model="style.backgroundImage" size="small" placeholder="图片地址" @change="(val) => update('backgroundImage', val)">
                    <template #append>
                        <el-upload
                            action=""
                            :auto-upload="false"
                            :show-file-list="false"
                            :on-change="handleFileChange"
                            accept="image/*"
                        >
                            <el-button :icon="Upload" />
                        </el-upload>
                    </template>
                </el-input>
             </div>
             
             <div class="row-item" style="margin-top: 10px;">
              <span class="name">重复方式</span>
              <el-select
                v-model="style.backgroundRepeat"
                size="small"
                style="width: 120px"
                @change="(val) => update('backgroundRepeat', val)"
              >
                <el-option
                  v-for="item in backgroundRepeatList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
            
            <div class="row-item">
              <span class="name">图片位置</span>
              <el-select
                v-model="style.backgroundPosition"
                size="small"
                style="width: 120px"
                @change="(val) => update('backgroundPosition', val)"
              >
                <el-option
                  v-for="item in backgroundPositionList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
            
            <div class="row-item">
              <span class="name">图片大小</span>
              <el-select
                v-model="style.backgroundSize"
                size="small"
                style="width: 120px"
                @change="(val) => update('backgroundSize', val)"
              >
                <el-option
                  v-for="item in backgroundSizeList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 连线 -->
      <div class="title">连线</div>
      <div class="row">
        <div class="row-item">
          <span class="name">颜色</span>
          <el-color-picker v-model="style.lineColor" size="small" @change="(val) => update('lineColor', val)" />
        </div>
        <div class="row-item">
          <span class="name">宽度</span>
          <el-select
            v-model="style.lineWidth"
            size="small"
            style="width: 80px"
            @change="(val) => update('lineWidth', val)"
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
            <el-checkbox v-model="style.rainbowLines" @change="(val) => update('rainbowLines', val)">彩虹线条</el-checkbox>
         </div>
      </div>
      
      <div class="row">
        <div class="row-item">
             <span class="name">风格</span>
             <el-select
                v-model="style.lineStyle"
                size="small"
                style="width: 80px"
                @change="(val) => update('lineStyle', val)"
             >
                <el-option
                  v-for="item in lineStyleList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                >
                </el-option>
             </el-select>
        </div>
        
        <div class="row-item" v-if="style.lineStyle === 'curve'">
            <span class="name">根节点样式</span>
             <el-select
                v-model="style.rootLineKeepSameInCurve"
                size="small"
                style="width: 80px"
                @change="(val) => update('rootLineKeepSameInCurve', val)"
             >
                <el-option
                  v-for="item in rootLineKeepSameInCurveList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                >
                </el-option>
             </el-select>
        </div>
      </div>
       <div class="row">
        <div class="row-item">
            <el-checkbox v-model="style.showLineMarker" @change="(val) => update('showLineMarker', val)">显示箭头</el-checkbox>
        </div>
      </div>

      <!-- 概要连线 -->
      <div class="title">概要连线</div>
      <div class="row">
         <div class="row-item">
          <span class="name">颜色</span>
          <el-color-picker v-model="style.generalizationLineColor" size="small" @change="(val) => update('generalizationLineColor', val)" />
        </div>
        <div class="row-item">
          <span class="name">宽度</span>
          <el-select
            v-model="style.generalizationLineWidth"
            size="small"
            style="width: 80px"
            @change="(val) => update('generalizationLineWidth', val)"
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

      <!-- 关联线 -->
      <div class="title">关联线</div>
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

       <!-- 内边距 -->
      <div class="title">节点内边距</div>
      <div class="row">
        <div class="row-item" style="width: 100%">
          <span class="name">水平</span>
          <el-slider v-model="style.paddingX" style="width: 200px" @change="(val) => update('paddingX', val)"></el-slider>
        </div>
      </div>
      <div class="row">
        <div class="row-item" style="width: 100%">
          <span class="name">垂直</span>
          <el-slider v-model="style.paddingY" style="width: 200px" @change="(val) => update('paddingY', val)"></el-slider>
        </div>
      </div>
      
       <!-- 图片 -->
      <div class="title">图片</div>
      <div class="row">
        <div class="row-item" style="width: 100%">
          <span class="name">最大宽度</span>
          <el-slider v-model="style.imgMaxWidth" :min="10" :max="500" style="width: 200px" @change="(val) => update('imgMaxWidth', val)"></el-slider>
        </div>
      </div>
      <div class="row">
        <div class="row-item" style="width: 100%">
          <span class="name">最大高度</span>
           <el-slider v-model="style.imgMaxHeight" :min="10" :max="500" style="width: 200px" @change="(val) => update('imgMaxHeight', val)"></el-slider>
        </div>
      </div>
      
      <!-- 图标 -->
      <div class="title">图标</div>
      <div class="row">
        <div class="row-item" style="width: 100%">
          <span class="name">大小</span>
          <el-slider v-model="style.iconSize" :min="12" :max="50" style="width: 200px" @change="(val) => update('iconSize', val)"></el-slider>
        </div>
      </div>
      
      <!-- 节点外边距 -->
      <div class="title">节点外边距</div>
       <div class="row">
        <el-tabs class="tab" v-model="marginActiveTab" style="width: 100%" @tab-click="initMarginStyle">
          <el-tab-pane label="二级节点" name="second"></el-tab-pane>
          <el-tab-pane label="二级以下节点" name="node"></el-tab-pane>
        </el-tabs>
       </div>
       <div class="row">
        <div class="row-item" style="width: 100%">
          <span class="name">水平</span>
          <el-slider v-model="style.marginX" :max="200" style="width: 200px" @change="(val) => updateMargin('marginX', val)"></el-slider>
        </div>
      </div>
      <div class="row">
        <div class="row-item" style="width: 100%">
          <span class="name">垂直</span>
          <el-slider v-model="style.marginY" :max="200" style="width: 200px" @change="(val) => updateMargin('marginY', val)"></el-slider>
        </div>
      </div>

    </div>
  </Sidebar>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, reactive } from 'vue'
import Sidebar from './Sidebar.vue'
import { useMindMapStore } from '@/store/mindmap'
import { Upload } from '@element-plus/icons-vue'
import {
  lineWidthList,
  lineStyleList,
  backgroundRepeatList,
  backgroundPositionList,
  backgroundSizeList,
  rootLineKeepSameInCurveList
} from '@/config'

const store = useMindMapStore()
const sidebarRef = ref(null)
const activeTab = ref('color')
const marginActiveTab = ref('second')

const style = reactive({
  backgroundColor: '',
  backgroundImage: '',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center',
  backgroundSize: 'cover',
  lineColor: '',
  lineWidth: 1,
  lineStyle: 'straight',
  rainbowLines: false,
  rootLineKeepSameInCurve: false,
  showLineMarker: false,
  generalizationLineColor: '',
  generalizationLineWidth: 1,
  associativeLineColor: '',
  associativeLineWidth: 1,
  paddingX: 10,
  paddingY: 5,
  imgMaxWidth: 100,
  imgMaxHeight: 100,
  iconSize: 20,
  marginX: 20,
  marginY: 20
})

const activeSidebar = computed(() => store.activeSidebar)
const isDark = computed(() => store.localConfig.isDark)
const mindMap = computed(() => store.mindMap)

watch(activeSidebar, (val) => {
  if (sidebarRef.value) {
    sidebarRef.value.show = val === 'baseStyle'
    if (val === 'baseStyle') {
        initStyle()
    }
  }
})

onMounted(() => {
    if (activeSidebar.value === 'baseStyle') {
        initStyle()
    }
    // Listen to theme change? 
    // Usually theme change updates config, but we might want to refresh if event exists.
})

const initStyle = () => {
    if (!mindMap.value) return
    const config = mindMap.value.getThemeConfig()
    Object.keys(style).forEach(key => {
        if (config[key] !== undefined) {
            style[key] = config[key]
        }
    })
    initMarginStyle()
}

const initMarginStyle = () => {
   if (!mindMap.value) return
   const config = mindMap.value.getThemeConfig()
   if (marginActiveTab.value === 'second') {
       style.marginX = config.secondX || 20
       style.marginY = config.secondY || 20
   } else {
       style.marginX = config.nodeX || 20
       style.marginY = config.nodeY || 20
   }
}

const update = (key, val) => {
    if (!mindMap.value) return
    style[key] = val
    mindMap.value.setThemeConfig({
        [key]: val
    })
}

const updateMargin = (key, val) => {
    if (!mindMap.value) return
    if (marginActiveTab.value === 'second') {
        const map = {
            marginX: 'secondX',
            marginY: 'secondY'
        }
        update(map[key], val)
    } else {
         const map = {
            marginX: 'nodeX',
            marginY: 'nodeY'
        }
        update(map[key], val)
    }
}

const handleFileChange = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        const url = e.target.result
        style.backgroundImage = url
        update('backgroundImage', url)
    }
    reader.readAsDataURL(file.raw)
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
  margin-bottom: 15px;
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
.el-select-dropdown__item.selected .border-line {
  background-color: #409eff;
}
</style>
