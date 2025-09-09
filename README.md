## PocketCoffer · 方寸匣

轻量、安全的本地口袋式宝匣。基于 Tauri + Next.js 构建的桌面应用。

### 环境要求

- Node.js + pnpm
- Rust (stable)
- Tauri 2 CLI（项目已本地开发依赖）

### 开发与调试

```bash
pnpm install

# 启动前端 + Tauri 调试
pnpm tauri dev
```

### 构建

```bash
# 仅构建前端静态导出
pnpm build

# 构建 Tauri 包（会先执行 pnpm build 并打包）
pnpm tauri build
```

### 目录说明

- `src/`：Next.js 前端代码（静态导出至 `out/`）。
- `src-tauri/`：Tauri Rust 工程与应用配置。
- `public/`：静态资源。

### 应用元信息

- 应用名：PocketCoffer（方寸匣）
- 应用标识：`com.teexue.pocketcoffer`

### 许可证
