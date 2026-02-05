<template>
  <div class="toolbarContainer" :class="{ isDark: isDark }">
    <div class="toolbar">
      <!-- 文件操作区 -->
      <div class="toolbarBlock">
        <div class="toolbarBtn" @click="openDirectory" v-if="!isMobile">
          <span class="icon iconfont icondakai"></span>
          <span class="text">{{ $t('toolbar.directory') }}</span>
        </div>
        <el-tooltip
          effect="dark"
          :content="$t('toolbar.newFileTip')"
          placement="bottom"
          v-if="!isMobile"
        >
          <div class="toolbarBtn" @click="createNewLocalFile">
            <span class="icon iconfont iconxinjian"></span>
            <span class="text">{{ $t('toolbar.newFile') }}</span>
          </div>
        </el-tooltip>
        <el-tooltip
          effect="dark"
          :content="$t('toolbar.openFileTip')"
          placement="bottom"
          v-if="!isMobile"
        >
          <div class="toolbarBtn" @click="openLocalFile">
            <span class="icon iconfont iconwenjian1"></span>
            <span class="text">{{ $t('toolbar.openFile') }}</span>
          </div>
        </el-tooltip>
        <div class="toolbarBtn" @click="saveLocalFile" v-if="!isMobile">
          <span class="icon iconfont iconlingcunwei"></span>
          <span class="text">{{ $t('toolbar.saveAs') }}</span>
        </div>
        <div class="toolbarBtn" @click="$bus.$emit('showImport')">
          <span class="icon iconfont icondaoru"></span>
          <span class="text">{{ $t('toolbar.import') }}</span>
        </div>
        <div class="toolbarBtn" @click="$bus.$emit('showExport')">
          <span class="icon iconfont iconexport"></span>
          <span class="text">{{ $t('toolbar.export') }}</span>
        </div>

        <!-- 本地文件树 -->
        <div
          class="fileTreeBox"
          v-if="fileTreeVisible"
          :class="{ expand: fileTreeExpand }"
        >
          <div class="fileTreeToolbar">
            <div class="fileTreeName">
              {{ rootDirName ? '/' + rootDirName : '' }}
            </div>
            <div class="fileTreeActionList">
              <div
                class="btn"
                :class="[
                  fileTreeExpand ? 'el-icon-arrow-up' : 'el-icon-arrow-down'
                ]"
                @click="fileTreeExpand = !fileTreeExpand"
              ></div>
              <div
                class="btn el-icon-close"
                @click="fileTreeVisible = false"
              ></div>
            </div>
          </div>
          <div class="fileTreeWrap">
            <el-tree
              :props="fileTreeProps"
              :load="loadFileTreeNode"
              :expand-on-click-node="false"
              node-key="id"
              lazy
            >
              <span class="customTreeNode" slot-scope="{ node, data }">
                <div class="treeNodeInfo">
                  <span
                    class="treeNodeIcon iconfont"
                    :class="[
                      data.type === 'file' ? 'iconwenjian' : 'icondakai'
                    ]"
                  ></span>
                  <span class="treeNodeName">{{ node.label }}</span>
                </div>
                <div class="treeNodeBtnList" v-if="data.type === 'file'">
                  <el-button
                    type="text"
                    size="mini"
                    v-if="data.enableEdit"
                    @click="editLocalFile(data)"
                    >编辑</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
                    v-else
                    @click="importLocalFile(data)"
                    >导入</el-button
                  >
                </div>
              </span>
            </el-tree>
          </div>
        </div>
      </div>
    </div>
    <NodeImage></NodeImage>
    <NodeHyperlink></NodeHyperlink>
    <NodeIcon></NodeIcon>
    <NodeNote></NodeNote>
    <NodeTag></NodeTag>
    <Export></Export>
    <Import ref="ImportRef"></Import>
  </div>
</template>

<script>
import NodeImage from './NodeImage.vue'
import NodeHyperlink from './NodeHyperlink.vue'
import NodeIcon from './NodeIcon.vue'
import NodeNote from './NodeNote.vue'
import NodeTag from './NodeTag.vue'
import Export from './Export.vue'
import Import from './Import.vue'
import { mapState } from 'vuex'
import { Notification } from 'element-ui'
import exampleData from 'simple-mind-map/example/exampleData'
import { getData } from '../../../api'
import { isMobile } from 'simple-mind-map/src/utils/index'

let fileHandle = null

export default {
  components: {
    NodeImage,
    NodeHyperlink,
    NodeIcon,
    NodeNote,
    NodeTag,
    Export,
    Import
  },
  data() {
    return {
      isMobile: isMobile(),
      fileTreeProps: {
        label: 'name',
        children: 'children',
        isLeaf: 'leaf'
      },
      fileTreeVisible: false,
      rootDirName: '',
      fileTreeExpand: true,
      waitingWriteToLocalFile: false
    }
  },
  computed: {
    ...mapState({
      isDark: state => state.localConfig.isDark,
      isHandleLocalFile: state => state.isHandleLocalFile
    })
  },
  watch: {
    isHandleLocalFile(val) {
      if (!val) {
        Notification.closeAll()
      }
    }
  },
  created() {
    this.$bus.$on('write_local_file', this.onWriteLocalFile)
  },
  mounted() {
    window.addEventListener('beforeunload', this.onUnload)
  },
  beforeDestroy() {
    this.$bus.$off('write_local_file', this.onWriteLocalFile)
    window.removeEventListener('beforeunload', this.onUnload)
  },
  methods: {
    // 监听本地文件读写
    onWriteLocalFile(content) {
      clearTimeout(this.timer)
      if (fileHandle && this.isHandleLocalFile) {
        this.waitingWriteToLocalFile = true
      }
      this.timer = setTimeout(() => {
        this.writeLocalFile(content)
      }, 1000)
    },

    onUnload(e) {
      if (this.waitingWriteToLocalFile) {
        const msg = '存在未保存的数据'
        e.returnValue = msg
        return msg
      }
    },

    // 加载本地文件树
    async loadFileTreeNode(node, resolve) {
      try {
        let dirHandle
        if (node.level === 0) {
          dirHandle = await window.showDirectoryPicker()
          this.rootDirName = dirHandle.name
        } else {
          dirHandle = node.data.handle
        }
        const dirList = []
        const fileList = []
        for await (const [key, value] of dirHandle.entries()) {
          const isFile = value.kind === 'file'
          if (isFile && !/\.(smm|xmind|md|json)$/.test(value.name)) {
            continue
          }
          const enableEdit = isFile && /\.smm$/.test(value.name)
          const data = {
            id: key,
            name: value.name,
            type: value.kind,
            handle: value,
            leaf: isFile,
            enableEdit
          }
          if (isFile) {
            fileList.push(data)
          } else {
            dirList.push(data)
          }
        }
        resolve([...dirList, ...fileList])
      } catch (error) {
        console.log(error)
        this.fileTreeVisible = false
        resolve([])
        if (error.toString().includes('aborted')) {
          return
        }
        this.$message.warning(this.$t('toolbar.notSupportTip'))
      }
    },

    // 扫描本地文件夹
    openDirectory() {
      this.fileTreeVisible = false
      this.fileTreeExpand = true
      this.rootDirName = ''
      this.$nextTick(() => {
        this.fileTreeVisible = true
      })
    },

    // 编辑指定文件
    editLocalFile(data) {
      if (data.handle) {
        fileHandle = data.handle
        this.readFile()
      }
    },

    // 导入指定文件
    async importLocalFile(data) {
      try {
        const file = await data.handle.getFile()
        this.$refs.ImportRef.onChange({
          raw: file,
          name: file.name
        })
        this.$refs.ImportRef.confirm()
      } catch (error) {
        console.log(error)
      }
    },

    // 打开本地文件
    async openLocalFile() {
      try {
        let [_fileHandle] = await window.showOpenFilePicker({
          types: [
            {
              description: '',
              accept: {
                'application/json': ['.smm']
              }
            }
          ],
          excludeAcceptAllOption: true,
          multiple: false
        })
        if (!_fileHandle) {
          return
        }
        fileHandle = _fileHandle
        if (fileHandle.kind === 'directory') {
          this.$message.warning(this.$t('toolbar.selectFileTip'))
          return
        }
        this.readFile()
      } catch (error) {
        console.log(error)
        if (error.toString().includes('aborted')) {
          return
        }
        this.$message.warning(this.$t('toolbar.notSupportTip'))
      }
    },

    // 读取本地文件
    async readFile() {
      let file = await fileHandle.getFile()
      let fileReader = new FileReader()
      fileReader.onload = async () => {
        this.$store.commit('setIsHandleLocalFile', true)
        this.setData(fileReader.result)
        Notification.closeAll()
        Notification({
          title: this.$t('toolbar.tip'),
          message: `${this.$t('toolbar.editingLocalFileTipFront')}${
            file.name
          }${this.$t('toolbar.editingLocalFileTipEnd')}`,
          duration: 0,
          showClose: true
        })
      }
      fileReader.readAsText(file)
    },

    // 渲染读取的数据
    setData(str) {
      try {
        let data = JSON.parse(str)
        if (typeof data !== 'object') {
          throw new Error(this.$t('toolbar.fileContentError'))
        }
        if (data.root) {
          this.isFullDataFile = true
        } else {
          this.isFullDataFile = false
          data = {
            ...exampleData,
            root: data
          }
        }
        this.$bus.$emit('setData', data)
      } catch (error) {
        console.log(error)
        this.$message.error(this.$t('toolbar.fileOpenFailed'))
      }
    },

    // 写入本地文件
    async writeLocalFile(content) {
      if (!fileHandle || !this.isHandleLocalFile) {
        this.waitingWriteToLocalFile = false
        return
      }
      if (!this.isFullDataFile) {
        content = content.root
      }
      let string = JSON.stringify(content)
      const writable = await fileHandle.createWritable()
      await writable.write(string)
      await writable.close()
      this.waitingWriteToLocalFile = false
    },

    // 创建本地文件
    async createNewLocalFile() {
      await this.createLocalFile(exampleData)
    },

    // 另存为
    async saveLocalFile() {
      let data = getData()
      await this.createLocalFile(data)
    },

    // 创建本地文件
    async createLocalFile(content) {
      try {
        let _fileHandle = await window.showSaveFilePicker({
          types: [
            {
              description: '',
              accept: { 'application/json': ['.smm'] }
            }
          ],
          suggestedName: this.$t('toolbar.defaultFileName')
        })
        if (!_fileHandle) {
          return
        }
        const loading = this.$loading({
          lock: true,
          text: this.$t('toolbar.creatingTip'),
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        fileHandle = _fileHandle
        this.$store.commit('setIsHandleLocalFile', true)
        this.isFullDataFile = true
        await this.writeLocalFile(content)
        await this.readFile()
        loading.close()
      } catch (error) {
        console.log(error)
        if (error.toString().includes('aborted')) {
          return
        }
        this.$message.warning(this.$t('toolbar.notSupportTip'))
      }
    }
  }
}
</script>

<style lang="less" scoped>
.toolbarContainer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 56px;
  background-color: #fff;
  border-bottom: 1px solid #e8e8e8;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

  &.isDark {
    background-color: #262a2e;
    border-bottom-color: #363b3f;

    .toolbarBtn {
      .icon {
        background: transparent !important;
        color: rgba(255, 255, 255, 0.9);
        border: 1px solid transparent;
      }
      .text {
        color: rgba(255, 255, 255, 0.9);
      }
      &:hover {
        .icon {
          background: rgba(255, 255, 255, 0.1) !important;
        }
      }
    }
  }

  .toolbar {
    width: 100%;
    display: flex;
    align-items: center;

    .toolbarBlock {
      display: flex;
      align-items: center;
    }
  }

  .toolbarBtn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-right: 24px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s;

    &:last-child {
      margin-right: 0;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .icon {
      font-size: 20px;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      color: #333;
    }

    .text {
      font-size: 12px;
      color: #666;
      line-height: 1;
    }
  }

  .fileTreeBox {
    position: absolute;
    left: 20px;
    top: 60px;
    width: 300px;
    background-color: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    padding: 10px;
    z-index: 200;
    border: 1px solid #ebeef5;

    &.expand {
      height: auto;
      min-height: 300px;
    }

    .fileTreeToolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
      margin-bottom: 10px;

      .fileTreeName {
        font-weight: bold;
        color: #333;
        font-size: 14px;
      }

      .fileTreeActionList {
        .btn {
          cursor: pointer;
          margin-left: 10px;
          color: #909399;
          &:hover {
            color: #409eff;
          }
        }
      }
    }

    .fileTreeWrap {
      max-height: 400px;
      overflow-y: auto;
    }
  }
}
</style>