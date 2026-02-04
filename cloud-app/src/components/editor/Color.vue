<template>
  <div class="colorContainer" :class="{ isDark: isDark }">
    <div class="colorList">
      <span
        class="colorItem iconfont"
        v-for="item in colorList"
        :style="{ backgroundColor: item }"
        :class="{ icontouming: item === 'transparent' }"
        :key="item"
        @click="clickColorItem(item)"
      ></span>
    </div>
    <div class="moreColor">
      <span>更多颜色</span>
      <el-color-picker
        size="small"
        show-alpha
        v-model="selectColor"
        @change="changeColor"
      ></el-color-picker>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue'
import { colorList } from '@/config'
import { useMindMapStore } from '@/store/mindmap'

const props = defineProps({
  color: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['change'])

const mindMapStore = useMindMapStore()
const isDark = computed(() => mindMapStore.localConfig.isDark)

const selectColor = ref(props.color)

watch(() => props.color, (val) => {
  selectColor.value = val
})

const clickColorItem = (color) => {
  emit('change', color)
}

const changeColor = () => {
  emit('change', selectColor.value)
}
</script>

<style lang="less" scoped>
.colorContainer {
  &.isDark {
    .moreColor {
      color: hsla(0, 0%, 100%, 0.6);
    }
  }
}

.colorList {
  width: 240px;
  display: flex;
  flex-wrap: wrap;

  .colorItem {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 15px;
    height: 15px;
    margin-right: 5px;
    margin-bottom: 5px;
    cursor: pointer;
    border: 1px solid #e6e6e6;
    border-radius: 2px;
  }
}

.moreColor {
  display: flex;
  align-items: center;
  margin-top: 10px;

  span {
    margin-right: 5px;
    font-size: 14px;
  }
}
</style>
