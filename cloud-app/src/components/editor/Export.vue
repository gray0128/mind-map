<template>
  <el-dialog
    v-model="dialogVisible"
    title="导出"
    width="600px"
    :close-on-click-modal="false"
  >
    <div class="export-container">
      <!-- 导出类型选择 -->
      <div class="export-type-list">
        <el-radio-group v-model="exportType" class="type-group">
          <el-radio-button 
            v-for="item in exportTypes" 
            :key="item.type" 
            :value="item.type"
          >
            {{ item.name }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 文件名输入 -->
      <el-form label-width="80px" class="export-form">
        <el-form-item label="文件名">
          <el-input v-model="fileName" placeholder="请输入文件名" />
        </el-form-item>

        <!-- 格式说明 -->
        <el-form-item label="格式">
          <el-tag type="info">.{{ exportType }}</el-tag>
          <span class="format-desc">{{ currentTypeDesc }}</span>
        </el-form-item>

        <!-- PNG/PDF 选项 -->
        <template v-if="['png', 'pdf'].includes(exportType)">
          <el-form-item label="透明背景">
            <el-switch v-model="isTransparent" />
          </el-form-item>
          <el-form-item label="边距X">
            <el-input-number v-model="paddingX" :min="0" :max="200" />
          </el-form-item>
          <el-form-item label="边距Y">
            <el-input-number v-model="paddingY" :min="0" :max="200" />
          </el-form-item>
        </template>

        <!-- JSON/SMM 选项 -->
        <template v-if="['json', 'smm'].includes(exportType)">
          <el-form-item label="包含配置">
            <el-switch v-model="withConfig" />
          </el-form-item>
        </template>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="confirm" :loading="loading">
        导出
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import { ElMessage } from 'element-plus'

const mindMapStore = useMindMapStore()

// 导出类型列表
const exportTypes = [
  { type: 'png', name: 'PNG', desc: 'PNG 图片格式' },
  { type: 'svg', name: 'SVG', desc: 'SVG 矢量图格式' },
  { type: 'pdf', name: 'PDF', desc: 'PDF 文档格式' },
  { type: 'json', name: 'JSON', desc: 'JSON 数据格式' },
  { type: 'smm', name: 'SMM', desc: 'SMM 专有格式' },
  { type: 'md', name: 'Markdown', desc: 'Markdown 文档' },
  { type: 'txt', name: 'TXT', desc: '纯文本格式' }
]

// 状态
const dialogVisible = ref(false)
const exportType = ref('png')
const fileName = ref('思维导图')
const isTransparent = ref(false)
const paddingX = ref(10)
const paddingY = ref(10)
const withConfig = ref(true)
const loading = ref(false)

// 计算当前类型描述
const currentTypeDesc = computed(() => {
  const item = exportTypes.find(t => t.type === exportType.value)
  return item ? item.desc : ''
})

// 暴露方法
const show = () => {
  dialogVisible.value = true
}

const cancel = () => {
  dialogVisible.value = false
}

const confirm = async () => {
  const mindMap = mindMapStore.getMindMap()
  if (!mindMap) {
    ElMessage.error('思维导图未初始化')
    return
  }

  loading.value = true
  
  try {
    let result
    const type = exportType.value
    
    if (type === 'svg') {
      result = await mindMap.export(type, true, fileName.value, `* { margin: 0; padding: 0; box-sizing: border-box; }`)
    } else if (['json', 'smm'].includes(type)) {
      result = await mindMap.export(type, true, fileName.value, withConfig.value)
    } else if (type === 'png') {
      result = await mindMap.export(type, true, fileName.value, isTransparent.value)
    } else if (type === 'pdf') {
      result = await mindMap.export(type, true, fileName.value, isTransparent.value)
    } else {
      result = await mindMap.export(type, true, fileName.value)
    }
    
    ElMessage.success('导出成功')
    dialogVisible.value = false
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

defineExpose({
  show
})
</script>

<style scoped>
.export-container {
  padding: 10px 0;
}

.export-type-list {
  margin-bottom: 20px;
}

.type-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.export-form {
  margin-top: 20px;
}

.format-desc {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}
</style>
