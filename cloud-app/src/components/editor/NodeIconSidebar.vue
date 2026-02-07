<template>
  <Sidebar ref="sidebarRef" title="图标与贴纸" name="icon">
    <div class="box" :class="{ isDark: isDark }">
      <el-tabs v-model="activeName">
        <el-tab-pane label="图标" name="icon"></el-tab-pane>
        <el-tab-pane label="贴纸" name="image"></el-tab-pane>
      </el-tabs>
      <div class="boxContent">
        <!-- 图标 -->
        <div class="iconBox" v-if="activeName === 'icon'">
          <div class="item" v-for="item in nodeIconList" :key="item.name">
            <div class="title">{{ item.name }}</div>
            <div class="list">
              <div
                class="icon"
                v-for="icon in item.list"
                :key="icon.name"
                :class="{
                  selected: iconList.includes(item.type + '_' + icon.name)
                }"
                @click="setIcon(item.type, icon.name)"
              >
                <div v-if="isSvg(icon.icon)" v-html="icon.icon" class="svg-icon"></div>
                <img v-else :src="icon.icon" alt="" />
              </div>
            </div>
          </div>
        </div>
        <!-- 贴纸 -->
        <div class="imageBox" v-if="activeName === 'image'">
          <div class="item" v-for="item in nodeImageList" :key="item.name">
            <div class="title">{{ item.name }}</div>
            <div class="list">
              <div
                class="icon"
                v-for="image in item.list"
                :key="image.url"
                :class="{
                  selected: nodeImage === image.url
                }"
                @click="setImage(image)"
              >
                <img :src="image.url" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Sidebar from './Sidebar.vue'
import { useMindMapStore } from '@/store/mindmap'
import { nodeIconList as _nodeIconList } from 'simple-mind-map/src/svg/icons'
import { mergerIconList } from 'simple-mind-map/src/utils/index'
import icon from '@/config/icon'
import image from '@/config/image'
import bus from '@/utils/bus'

const mindMapStore = useMindMapStore()
const isDark = computed(() => mindMapStore.localConfig.isDark)
const activeSidebar = computed(() => mindMapStore.activeSidebar)

const sidebarRef = ref(null)
const activeName = ref('icon')
const nodeIconList = ref(mergerIconList([..._nodeIconList, ...icon]))
const nodeImageList = ref([...image])
const iconList = ref([])
const nodeImage = ref('')
const activeNodes = ref([])

watch(activeSidebar, (val) => {
  // Sidebar component handles visibility, but we perform checks here if needed
})

const handleNodeActive = (payload) => {
  activeNodes.value = [...(payload.activeNodeList || [])]
  if (activeNodes.value.length > 0) {
    if (activeNodes.value.length === 1) {
      let firstNode = activeNodes.value[0]
      nodeImage.value = firstNode.getData('image') || ''
      iconList.value = firstNode.getData('icon') || []
    } else {
      nodeImage.value = ''
      iconList.value = []
    }
  } else {
    iconList.value = []
    nodeImage.value = ''
  }
}

const handleShowNodeIcon = () => {
  mindMapStore.setActiveSidebar('icon')
}

onMounted(() => {
  bus.on('node_active', handleNodeActive)
  bus.on('showNodeIcon', handleShowNodeIcon)
})

onBeforeUnmount(() => {
  bus.off('node_active', handleNodeActive)
  bus.off('showNodeIcon', handleShowNodeIcon)
})

const isSvg = (icon) => {
  return /^<svg/.test(icon)
}

const getHtml = (icon) => {
  return /^<svg/.test(icon) ? icon : `<img src="${icon}" />`
}

const setIcon = (type, name) => {
  activeNodes.value.forEach(node => {
    const list = [...(node.getData('icon') || [])]
    let key = type + '_' + name
    let index = list.findIndex(item => {
      return item === key
    })
    // 删除icon
    if (index !== -1) {
      list.splice(index, 1)
    } else {
      let typeIndex = list.findIndex(item => {
        return item.split('_')[0] === type
      })
      // 替换icon
      if (typeIndex !== -1) {
        list.splice(typeIndex, 1, key)
      } else {
        // 增加icon
        list.push(key)
      }
    }
    node.setIcon(list)
    if (activeNodes.value.length === 1) {
      iconList.value = list
    }
  })
}

const setImage = (img) => {
  activeNodes.value.forEach(node => {
    nodeImage.value = img.url
    node.setImage({
      ...img
    })
  })
}
</script>

<style scoped>
.box {
  padding: 0 20px;
  width: 100%;
}

.box.isDark .title {
  color: #fff;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
}

.boxContent {
    width: 100%;
}

.iconBox .item {
  margin-bottom: 20px;
  font-weight: bold;
}

.iconBox .item .title {
  margin-bottom: 10px;
}

.iconBox .item .list {
  display: flex;
  flex-wrap: wrap;
}

.iconBox .item .list .icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  position: relative;
}

.iconBox .item .list .icon img,
.iconBox .item .list .icon .svg-icon {
  width: 100%;
  height: 100%;
}

.iconBox .item .list .icon .svg-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.iconBox .item .list .icon img {
  object-fit: contain;
}

.iconBox .item .list .icon.selected::after {
  content: '';
  position: absolute;
  left: -4px;
  top: -4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #409eff;
}

.imageBox {
    width: 100%;
}

.imageBox .item {
  margin-bottom: 20px;
  font-weight: bold;
}

.imageBox .item .title {
  margin-bottom: 10px;
}

.imageBox .item .list {
  display: flex;
  flex-wrap: wrap;
}

.imageBox .item .list .icon {
  width: 50px;
  height: 50px;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  position: relative;
}

.imageBox .item .list .icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.imageBox .item .list .icon.selected::after {
  content: '';
  position: absolute;
  left: -4px;
  top: -4px;
  width: 54px;
  height: 54px;
  border: 2px solid #409eff;
}
</style>
