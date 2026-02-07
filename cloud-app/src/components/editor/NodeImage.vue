<template>
  <el-dialog
    v-model="dialogVisible"
    title="图片节点"
    :width="isMobile ? '90%' : '600px'"
    align-center
  >
    <div class="title">方式一：上传本地图片</div>
    <div class="upload-box">
      <el-upload
        action=""
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        :show-file-list="false"
        accept="image/*"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
      </el-upload>
      <div v-if="img" class="img-preview">
        <img :src="img" style="max-width: 100%; max-height: 200px;" />
      </div>
    </div>

    <div class="title">方式二：图片链接</div>
    <div class="input-box">
      <span class="label">图片地址</span>
      <el-input
        v-model="imgUrl"
        placeholder="http://xxx.com/xx.jpg"
        @keydown.stop
        @change="onUrlChange"
      />
    </div>

    <div class="title">可选</div>
    <div class="input-box">
      <span class="label">图片标题</span>
      <el-input v-model="imgTitle" @keydown.stop />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useMindMapStore } from '@/store/mindmap'
import bus from '@/utils/bus'
import { UploadFilled } from '@element-plus/icons-vue'
import { getImageSize } from 'simple-mind-map/src/utils/index'

const mindMapStore = useMindMapStore()
// utils/index.js might not have isMobile, simple-mind-map has it but let's check basic mobile width
const isMobile = computed(() => window.innerWidth < 768)

const dialogVisible = ref(false)
const img = ref('')
const imgUrl = ref('')
const imgTitle = ref('')
const activeNodes = ref([])

const handleNodeActive = (payload) => {
  activeNodes.value = [...(payload.activeNodeList || [])]
}

const handleShowNodeImage = () => {
  reset()
  if (activeNodes.value.length > 0) {
    const firstNode = activeNodes.value[0]
    const image = firstNode.getData('image') || ''
    if (image) {
      if (/^https?:\/\//.test(image) || /^data:image/.test(image)) {
        if (/^data:image/.test(image)) {
            img.value = image
        } else {
            imgUrl.value = image
        }
      } else {
        imgUrl.value = image
      }
    }
    imgTitle.value = firstNode.getData('imageTitle') || ''
  }
  dialogVisible.value = true
}

const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = () => {
    img.value = reader.result
    imgUrl.value = '' // Clear URL if upload used
  }
}

const onUrlChange = () => {
    if (imgUrl.value) {
        img.value = '' // Clear uploaded img if URL is typed
    }
}

const cancel = () => {
  dialogVisible.value = false
  reset()
}

const reset = () => {
  img.value = ''
  imgTitle.value = ''
  imgUrl.value = ''
}

const confirm = async () => {
  try {
    if (!img.value && !imgUrl.value) {
      // Remove image
      cancel()
      activeNodes.value.forEach(node => {
        node.setImage(null)
      })
      return
    }

    let res = null
    let finalImg = ''

    if (img.value) {
      finalImg = img.value
      res = await getImageSize(finalImg)
    } else if (imgUrl.value) {
      finalImg = imgUrl.value
      res = await getImageSize(finalImg)
    }

    activeNodes.value.forEach(node => {
      node.setImage({
        url: finalImg || 'none',
        title: imgTitle.value,
        width: res.width || 100,
        height: res.height || 100
      })
    })
    cancel()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  bus.on('node_active', handleNodeActive)
  bus.on('showNodeImage', handleShowNodeImage)
})

onBeforeUnmount(() => {
  bus.off('node_active', handleNodeActive)
  bus.off('showNodeImage', handleShowNodeImage)
})
</script>

<style scoped>
.title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
  margin-top: 12px;
}

.title:first-child {
  margin-top: 0;
}

.input-box {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.label {
  width: 80px;
  flex-shrink: 0;
}

.upload-box {
    margin-bottom: 20px;
}

.img-preview {
    margin-top: 10px;
    text-align: center;
}
</style>
