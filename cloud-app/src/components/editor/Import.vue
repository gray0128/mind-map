<template>
  <el-dialog
    v-model="dialogVisible"
    title="导入文件"
    width="500px"
    align-center
    destroy-on-close
  >
    <div class="import-content">
      <el-upload
        ref="uploadRef"
        class="upload-area"
        drag
        action=""
        :auto-upload="false"
        :limit="1"
        :on-change="handleFileChange"
        :accept="acceptTypes"
      >
        <el-icon class="el-icon--upload"><Upload /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 .smm / .json / .xmind / .md / .txt 格式
          </div>
        </template>
      </el-upload>
      
      <div v-if="fileName" class="file-info">
        <el-icon><Document /></el-icon>
        <span class="file-name">{{ fileName }}</span>
        <el-button link type="danger" @click="clearFile">删除</el-button>
      </div>
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" :disabled="!fileContent" @click="confirm">确定导入</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import { ElMessage } from 'element-plus'
import { Upload, Document } from '@element-plus/icons-vue'

const mindMapStore = useMindMapStore()
const uploadRef = ref(null)

const dialogVisible = ref(false)
const fileName = ref('')
const fileContent = ref(null)
const fileType = ref('')

const acceptTypes = '.smm,.json,.xmind,.md,.txt'

// 显示对话框
const show = () => {
  dialogVisible.value = true
  clearFile()
}

// 隐藏对话框
const cancel = () => {
  dialogVisible.value = false
  clearFile()
}

// 清除文件
const clearFile = () => {
  fileName.value = ''
  fileContent.value = null
  fileType.value = ''
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 文件选择变化
const handleFileChange = async (file) => {
  if (!file || !file.raw) return
  
  const name = file.name
  fileName.value = name
  
  // 获取文件类型
  const ext = name.split('.').pop().toLowerCase()
  fileType.value = ext
  
  try {
    if (ext === 'xmind') {
      // xmind 文件需要作为 ArrayBuffer 读取
      const arrayBuffer = await file.raw.arrayBuffer()
      fileContent.value = arrayBuffer
    } else {
      // 其他文件作为文本读取
      const text = await file.raw.text()
      fileContent.value = text
    }
  } catch (error) {
    console.error('读取文件失败:', error)
    ElMessage.error('读取文件失败')
    clearFile()
  }
}

// 确认导入
const confirm = async () => {
  if (!fileContent.value) {
    ElMessage.warning('请先选择文件')
    return
  }
  
  const mindMap = mindMapStore.getMindMap()
  if (!mindMap) {
    ElMessage.error('思维导图实例未初始化')
    return
  }
  
  try {
    let data = null
    
    switch (fileType.value) {
      case 'smm':
      case 'json':
        // SMM 和 JSON 格式
        data = JSON.parse(fileContent.value)
        if (data.root) {
          mindMap.setData(data.root)
        } else {
          mindMap.setData(data)
        }
        break
        
      case 'xmind':
        // XMind 格式
        const xmindData = await mindMap.parseXmindFile(fileContent.value)
        mindMap.setData(xmindData)
        break
        
      case 'md':
        // Markdown 格式
        const mdData = await mindMap.parseMarkdownFile(fileContent.value)
        mindMap.setData(mdData)
        break
        
      case 'txt':
        // 纯文本格式
        const txtData = await mindMap.parseTxtFile(fileContent.value)
        mindMap.setData(txtData)
        break
        
      default:
        ElMessage.warning('不支持的文件格式')
        return
    }
    
    ElMessage.success('导入成功')
    cancel()
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败：' + (error.message || '文件格式错误'))
  }
}

// 暴露方法
defineExpose({
  show
})
</script>

<style scoped>
.import-content {
  padding: 10px 0;
}

.upload-area {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
