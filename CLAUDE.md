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

- **前端**: https://mind-map-front.bobocai.win
- **后端**: https://mindmap-worker.amd2.workers.dev

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
wrangler pages deploy dist --project-name=mind-map-front --commit-dirty=true

# 方式二：手动部署
# 1. 登录 Cloudflare Dashboard (https://dash.cloudflare.com)
# 2. 进入 Workers & Pages > Pages
# 3. 选择 mind-map-front 项目
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
wrangler pages deploy dist --project-name=mind-map-front --commit-dirty=true
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
