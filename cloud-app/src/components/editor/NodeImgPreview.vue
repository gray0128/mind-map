<template>
  <el-image-viewer
    v-if="show"
    :url-list="images"
    @close="close"
  />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useMindMapStore } from '@/store/mindmap'

const mindMapStore = useMindMapStore()
const mindMap = computed(() => mindMapStore.mindMap)

const show = ref(false)
const images = ref([])

const close = () => {
    show.value = false
    images.value = []
}

const onNodeImgDblclick = (node, e) => {
    if (e) {
        e.stopPropagation()
        e.preventDefault()
    }
    let url = node.getData('image')
    // 如果是对象，尝试获取 url 属性
    if (url && typeof url === 'object' && url.url) {
        url = url.url
    }
    // 如果是相对路径，拼接 API 域名
    if (url && typeof url === 'string' && url.startsWith('/')) {
        const apiHost = import.meta.env.VITE_API_HOST || ''
        url = apiHost + url
    }

    if (url && typeof url === 'string') {
        images.value = [url]
        show.value = true
    }
}

const bindEvents = () => {
    if (mindMap.value) {
        mindMap.value.on('node_img_dblclick', onNodeImgDblclick)
    }
}

const unbindEvents = () => {
    if (mindMap.value) {
        mindMap.value.off('node_img_dblclick', onNodeImgDblclick)
    }
}

onMounted(() => {
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
    unbindEvents()
})
</script>
