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
- **Start development server**: `npm run dev`
- **Deploy to Cloudflare**: `npm run deploy`
- **Initialize local database**: `npx wrangler d1 execute mindmap-db --local --file=schema.sql`

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
