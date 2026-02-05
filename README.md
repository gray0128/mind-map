# 云端思维导图

基于 [simple-mind-map](https://github.com/wanglin2/mind-map) 的云端思维导图服务，支持登录、云端存储和分享功能。

## 技术栈

**前端 (cloud-app/)**
- Vue 3 + Vite + Pinia
- simple-mind-map

**后端 (worker/)**
- Cloudflare Workers + Hono
- Cloudflare D1 (SQLite)
- Cloudflare R2 (对象存储)

## 本地开发

### 1. 安装依赖

```bash
# 前端
cd cloud-app && npm install

# 后端
cd worker && npm install
```

### 2. 配置 GitHub OAuth

1. 在 GitHub Settings > Developer settings > OAuth Apps 创建新应用
2. 设置 Callback URL: `http://localhost:8787/api/auth/callback`
3. 获取 Client ID 和 Client Secret

### 3. 配置环境变量

在 `worker/` 目录创建 `.dev.vars` 文件：

```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

### 4. 初始化本地数据库

```bash
cd worker

# 执行 Schema（本地开发环境）
wrangler d1 execute mindmap-db --local --file=schema.sql
```

> 注意：本地开发使用 `--local` 参数，数据存储在 `.wrangler/state/v3/d1` 目录

### 5. 启动开发服务器

```bash
# 终端 1: 启动后端（端口 8787）
cd worker && npm run dev

# 终端 2: 启动前端（端口 5173）
cd cloud-app && npm run dev
```

访问 http://localhost:5173

## 生产环境部署

### 1. 创建 Cloudflare 资源

```bash
cd worker

# 创建 D1 数据库（仅首次）
wrangler d1 create mindmap-db

# 更新 wrangler.toml 中的 database_id 为返回的 ID

# 创建 R2 存储桶（仅首次）
wrangler r2 bucket create mindmap-files
```

### 2. 初始化生产数据库

```bash
# 执行 Schema（生产环境，使用 --remote）
wrangler d1 execute mindmap-db --remote --file=schema.sql
```

### 3. 构建并部署前端到 Cloudflare Pages

```bash
cd cloud-app

# 构建前端
npm run build

# 创建 Pages 项目（仅首次）
wrangler pages project create mind-map --production-branch=main

# 部署到 Cloudflare Pages
wrangler pages deploy dist --project-name=mind-map
```

部署成功后会获得访问地址，如 `https://mind-map-xxx.pages.dev`。

**配置自定义域名（可选）：**

1. 进入 Cloudflare Dashboard > Pages > mind-map
2. 点击 "Custom domains"
3. 添加自定义域名（如 `mind-map-front.bobocai.win`）

### 4. 配置生产环境

**更新 Worker 配置：**

编辑 `worker/wrangler.toml`，将 `FRONTEND_URL` 更新为前端实际地址：

```toml
[vars]
FRONTEND_URL = "https://your-frontend-domain.com"
```

**配置生产环境密钥：**

```bash
cd worker
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put JWT_SECRET
```

**更新 GitHub OAuth App：**

在 GitHub OAuth App 设置中，将 Callback URL 更新为：
`https://your-worker-domain.com/api/auth/callback`

### 5. 部署 Worker

```bash
cd worker
wrangler deploy
```

> 注意：Worker 部署时会自动编译 TypeScript，无需手动构建。

## 功能特性

- GitHub OAuth 登录
- 文件列表管理（创建、重命名、删除）
- 云端自动保存
- 分享链接生成
- 缩略图预览

## 项目结构

```
mind-map/
├── cloud-app/          # 前端项目
│   ├── src/
│   │   ├── api/       # API 封装
│   │   ├── router/    # 路由配置
│   │   ├── store/     # 状态管理
│   │   ├── utils/     # 工具函数
│   │   └── views/     # 页面组件
│   └── ...
└── worker/             # 后端项目
    ├── src/
    │   ├── routes/    # API 路由
    │   ├── middleware/# 中间件
    │   └── types/     # 类型定义
    ├── schema.sql     # 数据库 Schema
    └── wrangler.toml  # Worker 配置
```

## 许可证

MIT
