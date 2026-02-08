# 常见问题与修复经验

本文档记录了项目开发过程中遇到的常见问题及其解决方案。

## 1. 工具栏按钮点击后弹窗/侧边栏不显示（透明）

**问题描述**：点击工具栏上的按钮（如图标、样式等）后，预期的弹窗或侧边栏不出现，看起来像是透明的。

**根本原因**：`Toolbar.vue` 中调用 `openSidebar()` 时传入的侧边栏名称与实际侧边栏组件定义的 `name` 属性不匹配。

**示例**：
- 错误：`openSidebar('nodeIconSidebar')`
- 正确：`openSidebar('icon')`（需与 `NodeIconSidebar.vue` 中的 `name="icon"` 一致）

**解决方案**：
1. 检查 `Sidebar.vue` 基础组件的 `name` prop
2. 确保 `Toolbar.vue` 中 `openSidebar()` 的参数与目标侧边栏的 `name` 一致
3. 侧边栏名称映射关系：
   - `icon` → NodeIconSidebar（图标与贴纸）
   - `style` → StyleSidebar（节点样式）
   - `theme` → ThemeSidebar（主题）
   - `structure` → Structure（结构）
   - `baseStyle` → BaseStyle（基础样式）

## 2. 节点图标显示异常（Icons Display Issues）

**问题描述**：
1.  **Sidebar显示问题**：部分图标（如 "Colorful Marker Icons"）在侧边栏无法显示，显示为破碎的图片。
2.  **SVG尺寸问题**：修复Sidebar显示后，SVG图标（如 "Avatar", "Flag"）变得巨大，撑破容器。
3.  **Canvas显示问题**：侧边栏显示正常后，拖拽到画布上的节点图标仍然不显示。

**根本原因**：
1.  **Sidebar**：原逻辑统一使用 `v-html` 渲染图标，但 "Colorful Marker Icons" 是 base64 格式的 PNG 图片，`v-html` 无法正确解析（它期望的是 SVG 字符串）。
2.  **SVG CSS**：Vue 的 Scoped CSS 无法穿透应用到 `v-html` 注入的 SVG 内容上，导致 SVG 缺少宽高限制而按默认尺寸渲染。
3.  **Canvas**：`simple-mind-map` 实例在初始化时未注册自定义图标列表，导致画布渲染器在渲染节点时找不到对应的图标数据。

**解决方案**：

**1. 修复 Sidebar (`NodeIconSidebar.vue`)**
-   **分流渲染**：使用 `isSvg` 函数判断图标类型。SVG 继续使用 `v-html`，非 SVG (base64 PNG) 使用 `<img>` 标签。
    ```vue
    <div v-if="isSvg(icon.icon)" v-html="icon.icon" class="svg-icon"></div>
    <img v-else :src="icon.icon" alt="" />
    ```
-   **CSS 穿透**：使用 `:deep()` 选择器强制给注入的 SVG 应用样式。
    ```css
    .svg-icon :deep(svg) {
      width: 100%;
      height: 100%;
    }
    ```
-   **图片适配**：给 `<img>` 添加 `object-fit: contain` 防止变形。

**2. 修复 Canvas (`Editor.vue`)**
-   **注册图标**：在初始化 `MindMap` 实例时，显式传入 `iconList` 选项。
-   **合并配置**：需要同时导入默认图标（`simple-mind-map/src/svg/icons`）和自定义图标（`@/config/icon`）进行合并。
    ```javascript
    import { nodeIconList as _nodeIconList } from 'simple-mind-map/src/svg/icons'
    import icon from '@/config/icon'

    new MindMap({
      // ...
      iconList: [..._nodeIconList, ...icon]
    })
    ```

## 3. 列表页缩略图无法显示（Thumbnail 404）

**问题描述**：思维导图列表页的缩略图在本地开发环境显示正常，但部署到生产环境后无法显示（404 Not Found）。

**根本原因**：
后端返回的缩略图 URL 是相对路径（如 `/api/files/xxx/thumbnail`）。
- **本地环境**：Vite 配置了 proxy，`/api` 请求会被正确转发到后端。
- **生产环境**：前端部署在 Cloudflare Pages，后端在 Cloudflare Workers。前端直接访问相对路径 `/api/...` 会请求 Pages 域名下的资源，而该路径不存在。

**解决方案**：
在前端渲染图片 URL 时，显式拼接后端 API 域名（通过环境变量 `VITE_API_HOST` 配置）。

```javascript
// 修改前
:src="file.thumbnail_url ? `${file.thumbnail_url}?token=${userStore.token}` : '/placeholder.svg'"

// 修改后
const apiHost = import.meta.env.VITE_API_HOST || ''
:src="file.thumbnail_url ? `${apiHost}${file.thumbnail_url}?token=${userStore.token}` : '/placeholder.svg'"
```

## 4. Wrangler 部署报错 "Invalid commit message"

**问题描述**：执行 `wrangler pages deploy` 时报错：
`[ERROR] A request to the Cloudflare API failed. Invalid commit message, it must be a valid UTF-8 string.`

**根本原因**：
本地 Git 环境的提交信息包含特殊字符或编码问题，或者 workspace 状态导致 Wrangler 无法正确读取最新的 commit message。

**解决方案**：
在部署命令中显式指定 commit message，覆盖自动读取的值。

```bash
wrangler pages deploy dist --project-name=mind-map --commit-message="Deploy update"
```

## 5. 图片大图预览无法加载（Base64 图片存储插件相关）

**问题描述**：思维导图中的图片缩略图可以正常展示，但双击查看大图时，图片无法正常加载（显示 "FAILED"）。

**现象分析**：
- 缩略图正常显示（由 simple-mind-map 库内部渲染）
- 大图预览失败，请求 URL 类似 `https://xxx/edit/smm_img_key_xxxx`（`smm_img_key_` 没有被转换为真实图片）

**根本原因**：
`NodeImgPreview.vue` 中获取 `imgMap` 的路径错误。`NodeBase64ImageStorage` 插件将 base64 图片存储在 `renderTree.data.imgMap` 中，而不是 `getData()` 返回值的顶层。

**为什么缩略图没问题**：
缩略图由 simple-mind-map 库内部渲染，库内部已正确处理 `smm_img_key_` 到 base64 的转换。而 `NodeImgPreview.vue` 是在库外部编写的代码，需要手动从正确路径获取 `imgMap`。

**解决方案**：

```javascript
// 错误的获取方式
const imgMap = mindMap.value.getData().imgMap  // undefined

// 正确的获取方式
const renderTree = mindMap.value.renderer.renderTree
const imgMap = renderTree?.data?.imgMap  // 正确获取到 imgMap
```

**修改文件**：`cloud-app/src/components/editor/NodeImgPreview.vue`

**关键点**：在库外部处理 `smm_img_key_` 格式的图片时，必须通过 `mindMap.renderer.renderTree.data.imgMap` 获取图片映射表。

## 6. 视图变化误触发"未保存的本地备份"提示

**问题描述**：仅拖动画布（未修改节点内容）后关闭浏览器，再次打开时也会提示"检测到未保存的本地备份"，造成用户困惑。

**根本原因**：
`Editor.vue` 中 `handleViewChange` 和 `handleDataChange` 都调用同一个 `localSave()` 函数，而该函数始终将备份标记为 `synced: false`。

```javascript
// 问题代码
function localSave() {
  const backupData = {
    content: data,
    timestamp: Date.now(),
    synced: false  // 始终标记为未同步，导致视图变化也触发恢复提示
  }
}
```

**解决方案**：
区分"数据变化"和"视图变化"，只有真正的数据变化才标记为 `synced: false`。

```javascript
// 修改后的 localSave 函数
function localSave(isDataChange = true) {
  const backupKey = `MINDMAP_BACKUP_${currentId}`

  // 视图变化时，保留原有的 synced 状态
  let synced = !isDataChange
  if (!isDataChange) {
    const existingBackup = localStorage.getItem(backupKey)
    if (existingBackup) {
      try {
        synced = JSON.parse(existingBackup).synced !== false
      } catch {}
    }
  }

  const backupData = {
    content: data,
    timestamp: Date.now(),
    synced: isDataChange ? false : synced  // 数据变化才标记未同步
  }
}

// 调用方式
function handleDataChange() {
  localSaveTimer.value = setTimeout(() => localSave(true), 1000)  // 数据变化
}

function handleViewChange() {
  localSaveTimer.value = setTimeout(() => localSave(false), 1000)  // 视图变化
}
```

**修改文件**：`cloud-app/src/views/Editor.vue`

**关键点**：本地备份的 `synced` 字段应区分数据变化和视图变化，视图变化应保留原有同步状态，避免误导用户。
