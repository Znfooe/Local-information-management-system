# 桌面端应用Plus (DesktopAppPlus)

基于 Electron + React + TypeScript + Tailwind CSS 构建的 Windows 桌面应用程序。

## 功能模块
1.  **API 管理**: 保存、编辑、搜索 API 信息 (本地存储)。
2.  **账密管理**: 安全保存网站账号密码 (本地存储)。
3.  **AI 智能体**: 集成 ModelScope API 的对话助手。
4.  **设置**: 多语言切换 (6种语言) 和 主题切换 (黑/白/灰/跟随系统)。

## 技术栈
*   Electron
*   React 19
*   TypeScript
*   Tailwind CSS v3
*   shadcn/ui
*   lowdb (本地 JSON 数据库)
*   i18next

## 开发与构建

### 安装依赖
```bash
npm install
```

### 启动开发环境
```bash
npm run dev
```

### 打包 (生成 .exe)
```bash
npm run build
```
*注意：打包过程需要下载 Electron 和 winCodeSign 二进制文件，请确保网络连接正常。*
打包产物位于 `release` 目录。

## 目录结构
*   `src/`: 前端 React 代码
    *   `components/`: UI 组件
    *   `pages/`: 页面逻辑
    *   `lib/`: 工具函数与数据库封装
    *   `locales/`: 语言包
*   `electron/`: Electron 主进程代码
*   `db.json`: 本地数据库文件 (运行时生成)

## 注意事项
*   本项目设计为“无安装其他软件”，依赖均已打包或包含在 `node_modules` 中。
*   数据库使用 `lowdb` 存储于 `db.json`，无需安装 SQL 服务。
