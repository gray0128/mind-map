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
    const url = node.getData('image')
    if (url) {
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
