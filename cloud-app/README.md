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
FRONTEND_URL=http://localhost:3000
```

### 4. 初始化数据库

```bash
cd worker

# 创建 D1 数据库
wrangler d1 create mindmap-db

# 更新 wrangler.toml 中的 database_id

# 执行 Schema
wrangler d1 execute mindmap-db --local --file=schema.sql
```

### 5. 启动开发服务器

```bash
# 终端 1: 启动后端
cd worker && npm run dev

# 终端 2: 启动前端
cd cloud-app && npm run dev
```

访问 http://localhost:3000

## 部署

### 1. 部署 Worker

```bash
cd worker

# 配置生产环境 secrets
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put JWT_SECRET

# 创建生产 D1 数据库
wrangler d1 create mindmap-db
wrangler d1 execute mindmap-db --file=schema.sql

# 创建 R2 存储桶
wrangler r2 bucket create mindmap-files

# 部署
wrangler deploy
```

### 2. 构建前端

```bash
cd cloud-app && npm run build
```

将 `dist/` 目录部署到静态托管服务或配置 Worker 提供静态文件。

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
├── worker/             # 后端项目
│   ├── src/
│   │   ├── routes/    # API 路由
│   │   ├── middleware/# 中间件
│   │   └── types/     # 类型定义
│   ├── schema.sql     # 数据库 Schema
│   └── wrangler.toml  # Worker 配置
└── simple-mind-map/   # 核心库（不修改）
```

## 许可证

MIT
