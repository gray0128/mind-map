<template>
  <div class="rightToolbar" :class="{ isDark: isDark }">
    <!-- 顶部节点操作 -->
    <div class="nodeOps">
      <ToolbarNodeBtnList :list="nodeBtnList" dir="v"></ToolbarNodeBtnList>
    </div>

    <!-- 底部侧边栏触发器 -->
    <div class="sidebarTriggers customScrollbar">
      <div
        class="triggerItem"
        v-for="item in triggerList"
        :key="item.value"
        :class="{ active: activeSidebar === item.value }"
        @click="trigger(item)"
      >
        <el-tooltip :content="item.name" placement="left" effect="dark">
          <div class="triggerIcon iconfont" :class="[item.icon]"></div>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import ToolbarNodeBtnList from './ToolbarNodeBtnList.vue'
import { mapState, mapMutations } from 'vuex'
import { sidebarTriggerList } from '@/config'

// 默认节点操作按钮列表
const defaultNodeBtnList = [
  'back',
  'forward',
  'painter',
  'siblingNode',
  'childNode',
  'deleteNode',
  'image',
  'icon',
  'link',
  'note',
  'tag',
  'summary',
  'associativeLine',
  'formula',
  'outerFrame',
  'annotation',
  'ai'
]

export default {
  components: {
    ToolbarNodeBtnList
  },
  props: {
    mindMap: {
      type: Object
    }
  },
  data() {
    return {}
  },
  computed: {
    ...mapState({
      isDark: state => state.localConfig.isDark,
      activeSidebar: state => state.activeSidebar,
      isReadonly: state => state.isReadonly,
      enableAi: state => state.localConfig.enableAi,
      openNodeRichText: state => state.localConfig.openNodeRichText
    }),

    // 过滤后的节点操作按钮列表
    nodeBtnList() {
      let res = [...defaultNodeBtnList]
      if (!this.openNodeRichText) {
        res = res.filter(item => item !== 'formula')
      }
      if (!this.enableAi) {
        res = res.filter(item => item !== 'ai')
      }
      return res
    },

    // 侧边栏触发器列表
    triggerList() {
      let list = sidebarTriggerList[this.$i18n.locale] || sidebarTriggerList.zh
      if (this.isReadonly) {
        list = list.filter(item => {
          return ['outline', 'shortcutKey', 'ai'].includes(item.value)
        })
      }
      if (!this.enableAi) {
        list = list.filter(item => item.value !== 'ai')
      }
      return list
    }
  },
  mounted() {
    this.$bus.$on('node_note_dblclick', this.onNodeNoteDblclick)
  },
  beforeDestroy() {
    this.$bus.$off('node_note_dblclick', this.onNodeNoteDblclick)
  },
  methods: {
    ...mapMutations(['setActiveSidebar']),

    trigger(item) {
      if (this.activeSidebar === item.value) {
        this.setActiveSidebar('')
      } else {
        this.setActiveSidebar(item.value)
      }
    },

    onNodeNoteDblclick(node, e) {
      e.stopPropagation()
      this.$bus.$emit('showNodeNote', node)
    }
  }
}
</script>

<style lang="less" scoped>
.rightToolbar {
  position: fixed;
  right: 0;
  top: 56px;
  bottom: 0;
  width: 56px;
  background-color: #fff;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
  padding: 10px 0;
  box-shadow: -1px 0 4px rgba(0, 0, 0, 0.05);

  &.isDark {
    background-color: #262a2e;
    border-left-color: #363b3f;

    .sidebarTriggers {
      .triggerItem {
        color: rgba(255, 255, 255, 0.6);
        &:hover,
        &.active {
          color: #409eff;
          background-color: rgba(255, 255, 255, 0.05);
        }
      }
    }
  }

  .nodeOps {
    flex: 1;
    overflow-y: auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .sidebarTriggers {
    margin-top: 10px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;

    .triggerItem {
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: #666;
      border-radius: 8px;
      margin-bottom: 8px;
      transition: all 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
        color: #409eff;
      }

      &.active {
        color: #409eff;
        background-color: #ecf5ff;
      }

      .triggerIcon {
        font-size: 20px;
      }
    }
  }
}
</style>