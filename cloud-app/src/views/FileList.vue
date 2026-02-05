<template>
  <div class="file-list-page">
    <header class="header">
      <h1 class="header-title">我的思维导图</h1>
      <div class="header-actions">
        <el-avatar :src="user?.avatar_url" :alt="user?.username" size="default" v-if="user"></el-avatar>
        <el-button type="primary" plain @click="handleLogout" style="margin-left: 10px;">退出</el-button>
      </div>
    </header>

    <div class="page-container">
      <!-- 工具栏 -->
      <el-card shadow="hover" class="toolbar-card">
        <div class="toolbar">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索文件..." 
            clearable
            class="search-input"
            style="width: 300px; margin-right: 10px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select v-model="sortBy" placeholder="排序" class="sort-select" style="width: 150px; margin-right: 10px;">
            <el-option label="按更新时间" value="updated_at"></el-option>
            <el-option label="按创建时间" value="created_at"></el-option>
            <el-option label="按名称" value="name"></el-option>
          </el-select>
          
          <el-upload 
            class="upload-wrapper"
            action="" 
            accept=".smm,.json" 
            :auto-upload="false" 
            :show-file-list="false"
            :on-change="handleUpload"
          >
            <el-button type="primary" plain>
              <el-icon><Upload /></el-icon> 上传文件
            </el-button>
          </el-upload>
        </div>
      </el-card>

      <!-- 文件网格 -->
      <div v-loading="loading" class="file-list-content" style="min-height: 200px">
        <div class="file-grid" v-if="!loading">
          <!-- 新建卡片 -->
          <el-card shadow="hover" class="file-card create-card" @click="createNewFile">
            <div class="create-content">
              <div class="create-icon">+</div>
              <el-text>创建新思维导图</el-text>
            </div>
          </el-card>
  
          <!-- 文件卡片 -->
          <el-card shadow="hover" class="file-card" v-for="file in filteredFiles" :key="file.id" @click="openFile(file.id)">
            <div class="card-content">
              <div class="card-thumbnail">
                <el-image 
                  :src="file.thumbnail_url ? `${file.thumbnail_url}?token=${userStore.token}` : '/placeholder.svg'" 
                  :alt="file.name"
                  fit="contain"
                  style="width: 100%; height: 140px;"
                ></el-image>
              </div>
              <div class="card-info">
                <el-text class="card-title">{{ file.name }}</el-text>
                    <el-text type="info" size="small">
                      {{ formatDate(file.updated_at) }}
                    </el-text>
              </div>
              <div class="card-actions" @click.stop>
                <el-button link @click="renameFile(file)" title="重命名">
                  <el-icon><EditPen /></el-icon>
                </el-button>
                <el-button link @click="toggleShare(file)" :title="file.is_shared ? '关闭分享' : '开启分享'">
                  <el-icon>{{ file.is_shared ? 'Link' : 'Lock' }}</el-icon>
                </el-button>
                <el-button link v-if="file.is_shared" @click="copyShareLink(file)" title="复制链接">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
                <el-button link type="danger" @click="deleteFile(file)" title="删除">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty 
        v-if="!loading && filteredFiles.length === 0 && !searchQuery"
        description="还没有思维导图"
      >
        <el-button type="primary" @click="createNewFile">创建新思维导图</el-button>
      </el-empty>

      <!-- 搜索结果为空 -->
      <el-empty 
        v-if="!loading && filteredFiles.length === 0 && searchQuery"
        description="没有找到匹配的文件"
      >
        <el-button type="primary" @click="searchQuery = ''">清除搜索</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user.js'
import { fileApi } from '@/api'
import { 
  Search, Upload, EditPen, DocumentCopy, Delete
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const user = computed(() => userStore.user)
const files = ref([])
const loading = ref(true)
const searchQuery = ref('')
const sortBy = ref('updated_at')

const filteredFiles = computed(() => {
  let result = [...files.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(f => f.name.toLowerCase().includes(query))
  }
  
  result.sort((a, b) => {
    if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    }
    return new Date(b[sortBy.value]) - new Date(a[sortBy.value])
  })
  
  return result
})

onMounted(async () => {
  await loadFiles()
})

async function loadFiles() {
  loading.value = true
  try {
    const data = await fileApi.getList()
    files.value = data.files || []
  } catch (error) {
    console.error('Load files error:', error)
    ElMessage.error('加载文件列表失败')
  } finally {
    loading.value = false
  }
}

function createNewFile() {
  router.push('/edit/new')
}

function openFile(id) {
  router.push(`/edit/${id}`)
}

async function renameFile(file) {
  ElMessageBox.prompt('输入新名称:', '重命名文件', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: file.name
  }).then(async ({ value }) => {
    if (value && value !== file.name) {
      try {
        await fileApi.update(file.id, { name: value })
        file.name = value
        ElMessage.success('重命名成功')
      } catch (error) {
        ElMessage.error('重命名失败')
      }
    }
  }).catch(() => {
    // 取消操作
  })
}

async function toggleShare(file) {
  try {
    await fileApi.toggleShare(file.id, !file.is_shared)
    file.is_shared = !file.is_shared
    ElMessage.success(file.is_shared ? '分享已开启' : '分享已关闭')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

function copyShareLink(file) {
  const link = `${window.location.origin}/share/${file.id}`
  navigator.clipboard.writeText(link)
  ElMessage.success('链接已复制')
}

async function deleteFile(file) {
  ElMessageBox.confirm(`确定要删除 "${file.name}" 吗？`, '删除文件', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await fileApi.delete(file.id)
      files.value = files.value.filter(f => f.id !== file.id)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

async function handleUpload(rawFile) {
  const file = rawFile.raw
  if (!file) return
  
  try {
    const content = await file.text()
    const data = JSON.parse(content)
    const name = file.name.replace(/\.(smm|json)$/, '')
    
    const created = await fileApi.create({ name, content: data })
    files.value.unshift(created)
    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error('上传失败: 文件格式不正确')
  }
}

async function handleLogout() {
  try {
    await userStore.logout()
    ElMessage.success('退出成功')
    router.push('/')
  } catch (error) {
    ElMessage.error('退出失败')
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<style scoped>
/* 全局样式 */
.file-list-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-title {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
}

.user-avatar {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

/* 页面容器 */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 工具栏卡片 */
.toolbar-card {
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.upload-wrapper {
  display: flex;
  align-items: center;
}

/* 文件网格 */
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* 文件卡片 */
.file-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 8px;
  overflow: hidden;
}

.file-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.create-card {
  border: 2px dashed #dcdfe6 !important;
  background-color: #fafafa !important;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
}

.create-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.create-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 8px;
}

/* 卡片内容 */
.card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-thumbnail {
  background: #f1f5f9;
  overflow: hidden;
  border-radius: 4px 4px 0 0;
}

.card-info {
  padding: 12px;
  flex: 1;
}

.card-title {
  font-size: 16px !important;
  font-weight: 500;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  color: #333;
}

.card-meta {
  font-size: 12px !important;
  display: block;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 12px 12px;
  gap: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-list-page {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100% !important;
  }
  
  .sort-select {
    width: 100% !important;
  }
  
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
}
</style>
