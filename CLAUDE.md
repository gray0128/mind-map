# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory Requirement

- **Always communicate in Chinese.**
- 非必要不要使用 emoji

## Project Structure

- **simple-mind-map/**: The core framework-agnostic JavaScript library for mind maps.
  - `src/`: Source code for the library.
  - `plugins/`: Plugin implementations (the library is plugin-based).
- **web/**: The Vue 2.x based web application/client.
  - `src/`: Vue application source code.
- **dist/**: Build output directory.

## Common Commands

### Web Application (`web/` directory)

- **Install dependencies**: `npm install`
- **Start development server**: `npm run serve`
- **Build for production**: `npm run build` (Output includes `dist/` in root)
- **Lint code**: `npm run lint`
- **Build Core Library**: `npm run buildLibrary` (Updates `simple-mind-map/dist` using `esbuild`)

### Core Library (`simple-mind-map/` directory)

- **Install dependencies**: `npm install`
- **Lint code**: `npm run lint`
- **Generate Types**: `npm run types` (Generates `.d.ts` files from JSDoc)
- **Start WebSocket Server**: `npm run wsServe` (For local collaboration testing)

## Architecture

- **Core Library**: The `simple-mind-map` package is a vanilla JavaScript library dependent on `svg.js`. It uses a plugin architecture where features like RichText, Dragging, and Export are implemented as plugins.
- **Web Client**: The `web` directory contains a Vue 2 application that consumes `simple-mind-map`. It uses `ElementUI` for the UI components and `Vuex` for state management.
- **Plugins**: Most functionality is modular. If adding a new feature to the mind map core, consider if it should be a core function or a separate plugin.

## Code Style

- **Linting**: ESLint is used in both projects (`.eslintrc.js` or `package.json` config).
- **Formatting**: Prettier is used for formatting.
- **Language**: The codebase uses JavaScript. TypeScript definitions are generated but the source is JS.
- **Communication**: As per user instructions, always communicate in Chinese.
