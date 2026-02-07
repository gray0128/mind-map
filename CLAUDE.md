# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory Requirement

- **Always communicate in Chinese.**
- 非必要不要使用 emoji

## Project Structure

- **cloud-app/**: 云端版前端应用
  - `src/`: Vue 3 应用源码
  - `src/api/`: API 封装
  - `src/views/`: 页面组件
  - `src/store/`: Pinia 状态管理
  - `src/router/`: 路由配置
- **worker/**: 云端版后端服务
  - `src/`: Cloudflare Workers 源码
  - `schema.sql`: 数据库 Schema
  - `wrangler.toml`: Worker 配置

## Common Commands

### Frontend (`cloud-app/` directory)

- **Install dependencies**: `npm install`
- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

### Backend (`worker/` directory)

- **Install dependencies**: `npm install`
- **Start development server**: `wrangler dev`
- **Deploy to Cloudflare**: `wrangler deploy`
- **Initialize local database**: `wrangler d1 execute mindmap-db --local --file=schema.sql`

## Architecture

- **Frontend**: Vue 3 + Vite + Pinia，使用 Element Plus 作为 UI 组件库，依赖 npm 包 `simple-mind-map`
- **Backend**: Cloudflare Workers + Hono 框架，使用 D1 (SQLite) 数据库和 R2 对象存储
- **Authentication**: GitHub OAuth 登录

## Environment Variables

后端需要在 `worker/.dev.vars` 中配置：

```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

## Code Style

- **Frontend**: Vue 3 Composition API, JavaScript, Less
- **Backend**: TypeScript
- **Formatting**: Prettier
- **Communication**: As per user instructions, always communicate in Chinese.

## Deployment

### 生产环境地址

- **前端**: https://mind-map.bobocai.win
- **后端**: https://mindmap-worker.amd2.workers.dev
- **Cloudflare Pages 项目名**: mind-map

### 部署流程

#### 1. 前端部署

```bash
# 进入前端目录
cd cloud-app

# 安装依赖（如果需要）
npm install

# 构建生产版本
npm run build

# 方式一：命令行部署到 Cloudflare Pages
wrangler pages deploy dist --project-name=mind-map --commit-dirty=true

# 方式二：手动部署
# 1. 登录 Cloudflare Dashboard (https://dash.cloudflare.com)
# 2. 进入 Workers & Pages > Pages
# 3. 选择 mind-map 项目
# 4. 点击 "Create deployment"
# 5. 上传 dist/ 目录下的所有文件
```

#### 2. 后端部署

```bash
# 进入后端目录
cd worker

# 安装依赖（如果需要）
npm install

# 部署到 Cloudflare Workers
wrangler deploy
```

#### 3. 完整发布流程

```bash
# 1. 提交代码
git add .
git commit -m "your commit message"
git push

# 2. 构建前端
cd cloud-app
npm run build

# 3. 部署后端
cd ../worker
wrangler deploy

# 4. 部署前端
cd ../cloud-app
wrangler pages deploy dist --project-name=mind-map --commit-dirty=true
```

### 部署注意事项

1. **环境变量配置**
   - 后端密钥需要通过 `wrangler secret` 命令配置：
     ```bash
     cd worker
     wrangler secret put GITHUB_CLIENT_ID
     wrangler secret put GITHUB_CLIENT_SECRET
     wrangler secret put JWT_SECRET
     ```

2. **数据库初始化**
   - 生产环境数据库只需初始化一次：
     ```bash
     cd worker
     wrangler d1 execute mindmap-db --file=schema.sql
     ```

3. **前端环境变量**
   - 生产环境 API 地址在 `cloud-app/.env.production` 中配置
   - 确保指向正确的后端地址

4. **部署验证**
   - 部署完成后访问前端地址验证功能是否正常
   - 检查后端 API 是否可访问
   - 测试 GitHub OAuth 登录流程

## 常见问题与修复经验

### 1. 工具栏按钮点击后弹窗/侧边栏不显示（透明）

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

### 2. 节点图标显示异常（Icons Display Issues）

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
