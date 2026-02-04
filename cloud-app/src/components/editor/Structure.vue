<template>
  <Sidebar ref="sidebarRef" title="结构" name="structure">
    <div class="layout-group-list" :class="{ 'is-dark': isDark }">
      <div
        class="layout-group"
        v-for="group in groupList"
        :key="group.name"
      >
        <div class="group-name">{{ group.name }}</div>
        <div class="layout-list">
          <div
            class="layout-item"
            v-for="item in group.list"
            :key="item"
            @click="useLayout(item)"
            :class="{ active: item === layout }"
          >
            <img :src="layoutImgMap[item]" alt="" />
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Sidebar from './Sidebar.vue'
import { useMindMapStore } from '@/store/mindmap'
import { layoutImgMap } from '@/config/constant.js'
import { layoutGroupList } from '@/config/index.js'
import { fileApi } from '@/api' // Assuming we don't have storeData util, use fileApi or just save via auto-save handled by Editor?
// Original used storeData to save local config or something? 
// No, storeData typically saves to local storage or backend. 
// In Editor.vue, data change triggers save. mindMap.setLayout triggers data_change.
// So we just need to call mindMap.setLayout.
// But original code imported `storeData` from `@/api`, likely to save preference?
// Actually `mindMap.setLayout` changes data, which triggers `data_change` in Editor.vue, which saves content including layout.
// So we fine.

const mindMapStore = useMindMapStore()
const mindMap = computed(() => mindMapStore.mindMap)
const isDark = computed(() => mindMapStore.localConfig.isDark)
const activeSidebar = computed(() => mindMapStore.activeSidebar)

const layout = ref('')
const sidebarRef = ref(null)

const groupList = computed(() => {
    return layoutGroupList.map(group => {
        let list = [...group.list].filter(item => {
            return !['rightFishbone', 'rightFishbone2'].includes(item) // Filter out if needed or just keep
        })
        return {
            name: group.name,
            list
        }
    })
})

watch(activeSidebar, (val) => {
    if (val === 'structure') {
        if (mindMap.value) {
            layout.value = mindMap.value.getLayout()
        }
        // Sidebar component handles show/hide based on name prop and store state
    }
})

const useLayout = (item) => {
    layout.value = item
    if (mindMap.value) {
        mindMap.value.setLayout(item)
    }
}
</script>

<style scoped>
.layout-group-list {
  width: 100%;
}

.layout-group-list.is-dark .group-name {
  color: #fff;
}

.layout-group {
  width: 100%;
  margin-bottom: 20px;
}

.group-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 10px;
  font-size: 14px;
}

.layout-list {
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.layout-item {
  width: 130px;
  height: 80px;
  cursor: pointer;
  border: 1px solid #e9e9e9;
  transition: all 0.2s;
  overflow: hidden;
  border-radius: 6px;
  padding: 4px;
  box-sizing: border-box;
}

.layout-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.layout-item.active {
  border: 1px solid #409eff;
}

.layout-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
