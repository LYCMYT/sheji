# NIXIANG 设计作品集

一个面向设计师个人作品展示的交互式作品集原型。项目以快速浏览为主入口，并提供“展岛”和“索引”两种作品浏览方式。

线上地址：[https://lycmyt.github.io/sheji/](https://lycmyt.github.io/sheji/)

## 技术栈

- React 19
- TypeScript
- Vite
- Motion
- Phosphor Icons
- 原生 CSS

## 本地运行

```powershell
npm install
npm run dev
```

默认地址：`http://127.0.0.1:5173/`

## 验证与构建

```powershell
npm run typecheck
npm run build
npm run preview
```

## 部署

`main` 分支的每次推送都会通过 GitHub Actions 构建并发布到 GitHub Pages。Vite 的公共路径固定为 `/sheji/`，与仓库站点地址保持一致。

## 体验特性

- 响应式非对称作品集首页
- 展岛与索引双模式作品浏览
- 项目详情对话框与键盘操作
- 首屏纵深、滚动揭示和状态切换动效
- 深色、浅色主题适配
- `prefers-reduced-motion` 动效降级

当前项目名称、项目案例和联系邮箱均为结构演示内容，正式发布前请替换为真实信息。
