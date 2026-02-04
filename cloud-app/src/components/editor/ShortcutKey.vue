<template>
  <Sidebar title="快捷键" name="shortcutKey">
    <div class="shortcut-key-container" :class="{ 'is-dark': isDark }">
      <div v-for="group in shortcutKeyList" :key="group.type" class="group">
        <div class="group-title">{{ group.type }}</div>
        <div class="list">
          <div v-for="item in group.list" :key="item.value" class="item">
            <div class="name">
              <span class="icon iconfont" :class="item.icon" v-if="item.icon"></span>
              {{ item.name }}
            </div>
            <div class="value">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </div>
  </Sidebar>
</template>

<script setup>
import { computed } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import Sidebar from './Sidebar.vue'
import { shortcutKeyList } from '@/config'

const mindMapStore = useMindMapStore()
const isDark = computed(() => mindMapStore.localConfig?.isDark || false)
</script>

<style scoped>
.shortcut-key-container {
  padding: 20px;
  padding-top: 10px;
  height: 100%;
  overflow-y: auto;
}

.shortcut-key-container.is-dark .group-title {
  color: #fff;
}

.shortcut-key-container.is-dark .item .name {
  color: hsla(0, 0%, 100%, 0.9);
}

.shortcut-key-container.is-dark .item .value {
  color: hsla(0, 0%, 100%, 0.6);
  background: rgba(255, 255, 255, 0.1);
}

.group {
  margin-bottom: 20px;
}

.group-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.name {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
}

.value {
  color: #909399;
  font-family: monospace;
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.icon {
  font-size: 16px;
}
</style>
