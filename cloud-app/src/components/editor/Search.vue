<template>
  <div class="search-container" :class="{ 'is-dark': isDark, 'show': show }">
    <div class="close-btn-box" @click="close">
      <el-icon class="close-btn"><Close /></el-icon>
    </div>
    <div class="search-input-box">
      <el-input
        ref="searchInputRef"
        placeholder="搜索节点内容"
        size="small"
        v-model="searchText"
        @keyup.enter.stop="onSearchNext"
        @keydown.stop
        @focus="onFocus"
        @blur="onBlur"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button v-if="searchText" @click="showReplaceInput = true">
            替换
          </el-button>
        </template>
      </el-input>
      <div class="search-info" v-if="showSearchInfo && searchText">
        {{ currentIndex }} / {{ total }}
      </div>
    </div>
    
    <div v-if="showReplaceInput" class="replace-input-box" style="margin: 12px 0;">
      <el-input
        ref="replaceInputRef"
        placeholder="替换为"
        size="small"
        v-model="replaceText"
        @keydown.stop
        @focus="onFocus"
        @blur="onBlur"
      >
        <template #prefix>
          <el-icon><Edit /></el-icon>
        </template>
        <template #append>
          <el-button @click="hideReplaceInput">取消</el-button>
        </template>
      </el-input>
    </div>

    <div class="btn-list" v-if="showReplaceInput">
      <el-button size="small" :disabled="isReadonly" @click="replace">替换</el-button>
      <el-button size="small" :disabled="isReadonly" @click="replaceAll">全部替换</el-button>
    </div>

    <div
      class="search-result-list"
      :style="{ height: searchResultListHeight + 'px' }"
      v-if="showSearchResultList"
    >
      <div
        class="search-result-item"
        v-for="(item, index) in searchResultList"
        :key="item.id"
        :title="item.name"
        @click.stop="onSearchResultItemClick(index)"
      >
        <span v-html="item.text"></span>
      </div>
      <div class="empty" v-if="searchResultList.length <= 0">
        <span class="text">无搜索结果</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import bus from '@/utils/bus'
import { Search, Edit, Close } from '@element-plus/icons-vue'
import { getTextFromHtml } from '@/utils' // Need to ensure utils has this

const mindMapStore = useMindMapStore()
// Retrieve mindMap instance via helper
// NOTE: mindMapStore.mindMap is raw object
const mindMap = computed(() => mindMapStore.mindMap)
const isReadonly = computed(() => mindMapStore.isReadonly)
const isDark = computed(() => mindMapStore.localConfig.isDark)

const show = ref(false)
const searchText = ref('')
const replaceText = ref('')
const showReplaceInput = ref(false)
const currentIndex = ref(0)
const total = ref(0)
const showSearchInfo = ref(false)
const searchResultListHeight = ref(0)
const searchResultList = ref([])
const showSearchResultList = ref(false)

const searchInputRef = ref(null)
const replaceInputRef = ref(null)

watch(searchText, (val) => {
  if (!val) {
    currentIndex.value = 0
    total.value = 0
    showSearchInfo.value = false
  }
})

const handleSearchInfoChange = (data) => {
  currentIndex.value = data.currentIndex + 1
  total.value = data.total
  showSearchInfo.value = true
}

const showSearch = () => {
  bus.emit('closeSideBar')
  show.value = true
  // nextTick usually needed for focus
  setTimeout(() => {
    searchInputRef.value?.focus()
  }, 100)
}

const hideReplaceInput = () => {
  showReplaceInput.value = false
  replaceText.value = ''
}

const onFocus = () => {
  if (mindMap.value) {
    mindMap.value.updateConfig({
      enableAutoEnterTextEditWhenKeydown: false
    })
  }
}

const onBlur = () => {
  if (mindMap.value) {
    mindMap.value.updateConfig({
      enableAutoEnterTextEditWhenKeydown: true
    })
  }
}

const blur = () => {
  searchInputRef.value?.blur()
  replaceInputRef.value?.blur()
}

const onSearchNext = () => {
  showSearchResultList.value = true
  if (mindMap.value) {
    mindMap.value.search.search(searchText.value)
  }
}

const replace = () => {
  if (mindMap.value) {
    mindMap.value.search.replace(replaceText.value, true)
  }
}

const replaceAll = () => {
  if (mindMap.value) {
    mindMap.value.search.replaceAll(replaceText.value)
  }
}

const close = () => {
  show.value = false
  showSearchResultList.value = false
  showSearchInfo.value = false
  total.value = 0
  currentIndex.value = 0
  searchText.value = ''
  hideReplaceInput()
  if (mindMap.value) {
    mindMap.value.search.endSearch()
  }
}

const onSearchMatchNodeListChange = (list) => {
  searchResultList.value = list.map(item => {
    const data = item.data || item.nodeData.data
    let name = data.text
    const id = data.uid
    if (data.richText) {
      name = getTextFromHtml(name)
    }
    const reg = new RegExp(`${searchText.value.trim()}`, 'g')
    const text = name.replace(reg, a => {
      return `<span class="match" style="color: #409eff; font-weight: bold;">${a}</span>`
    })
    return {
      data: item,
      id,
      text,
      name
    }
  })
}

const setSearchResultListHeight = () => {
  searchResultListHeight.value = window.innerHeight - 267 - 24
}

const onSearchResultItemClick = (index) => {
  if (mindMap.value) {
    mindMap.value.search.jump(index)
  }
}

const bindEvents = () => {
  if (!mindMap.value) return
  mindMap.value.on('search_info_change', handleSearchInfoChange)
  mindMap.value.on('node_click', blur)
  mindMap.value.on('draw_click', blur)
  mindMap.value.on('expand_btn_click', blur)
  mindMap.value.on('search_match_node_list_change', onSearchMatchNodeListChange)
  // mindMap keyboard shortcuts are usually handled by the library if configured
  // but here we manually add logical shortcut if needed or rely on global event
  // The original code used `mindMap.keyCommand.addShortcut`
  mindMap.value.keyCommand.addShortcut('Control+f', showSearch)
}

const unbindEvents = () => {
  if (!mindMap.value) return
  mindMap.value.off('search_info_change', handleSearchInfoChange)
  mindMap.value.off('node_click', blur)
  mindMap.value.off('draw_click', blur)
  mindMap.value.off('expand_btn_click', blur)
  mindMap.value.off('search_match_node_list_change', onSearchMatchNodeListChange)
  mindMap.value.keyCommand.removeShortcut('Control+f', showSearch)
}

onMounted(() => {
  bus.on('show_search', showSearch)
  bus.on('setData', close)
  window.addEventListener('resize', setSearchResultListHeight)
  setSearchResultListHeight()
  // Wait for mindMap to be ready in store if not immediately available
  // In Editor.vue, mindMap is set in onMounted. This component is child of Editor.vue,
  // so it might need to watch for mindMap availability or wait nextTick.
  if (mindMap.value) {
    bindEvents()
  } else {
    const unwatch = watch(mindMap, (val) => {
        if (val) {
            bindEvents()
            unwatch()
        }
    })
  }
})

onBeforeUnmount(() => {
  bus.off('show_search', showSearch)
  bus.off('setData', close)
  window.removeEventListener('resize', setSearchResultListHeight)
  unbindEvents()
})
</script>

<style scoped>
.search-container {
  position: fixed;
  top: 110px;
  right: -296px;
  width: 296px;
  background-color: #fff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  z-index: 2000;
}

.search-container.is-dark {
  background-color: #363b3f;
}

.search-container.is-dark .close-btn-box {
  background-color: #363b3f;
  color: #fff;
}

.search-container.show {
  right: 20px;
}

.close-btn-box {
  position: absolute;
  right: -5px;
  top: -5px;
  width: 20px;
  height: 20px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
}

.btn-list {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 10px;
}

.search-input-box {
  position: relative;
}

.search-info {
  position: absolute;
  right: 70px;
  top: 50%;
  transform: translateY(-50%);
  color: #909090;
  font-size: 14px;
}

.search-result-list {
  position: absolute;
  left: 0;
  top: 100%;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  margin-top: 5px;
  overflow-y: auto;
  padding: 12px 0;
}

.search-result-item {
  height: 30px;
  line-height: 30px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 12px 0 22px;
  font-size: 14px;
  cursor: pointer;
  position: relative;
}

.search-result-item::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 5px;
  height: 5px;
  background-color: #606266;
  border-radius: 50%;
}

.search-result-item:hover {
  background-color: #f2f4f7;
}

.empty {
  width: 100%;
  padding: 20px;
  text-align: center;
  color: rgba(26, 26, 26, 0.8);
  font-size: 14px;
}
</style>
