# NIXIANG 原型技术栈与环境

## 目标

交付一个可运行的高保真单页原型，验证“展岛模式 + 索引模式”是否适合设计作品集。此阶段不实现 WebGL 游戏、CMS、表单后端或多人功能。

## 运行环境

- Windows PowerShell
- Node.js 24.16.0
- npm 11.10.0

## 已核验依赖版本

版本于 2026-07-15 通过 npm registry 查询：

- React 19.2.7
- React DOM 19.2.7
- Vite 8.1.4
- TypeScript 7.0.2
- Motion 12.42.2
- @vitejs/plugin-react 6.0.3
- @phosphor-icons/react 2.1.10
- @types/react 19.2.17
- @types/react-dom 19.2.3

## 技术选择

### React + TypeScript + Vite

原型包含视图切换、项目数据、键盘导航和原生 dialog。React 足够表达状态，Vite 保持启动和构建简单。

### 原生 CSS

本项目是定制作品集，不套用企业设计系统。使用 CSS variables、Grid、Container Queries 和媒体查询，避免默认 Tailwind/shadcn 视觉。

### Motion

只用于：

- Hero 与项目节点的入场。
- 模式切换。
- 索引预览切换。
- 详情弹层状态。

连续指针值使用 MotionValue，不用 React state 驱动每帧重渲染。

### Phosphor Icons

统一使用一个图标家族。strokeWeight 固定为 regular。没有手绘 SVG 图标。

## 不使用 Three.js 的理由

这一阶段验证的是内容结构和浏览效率。Three.js 会显著增加包体、移动端风险和开发成本，却不会证明案例叙事是否成立。

如果原型验证成功，第二阶段可以把展岛区域替换为独立 lazy-loaded Three.js 场景，同时保留相同项目数据和 2D 索引。

## 项目结构

~~~text
/
  public/
    portfolio-hero-moodboard.png
    projects/
  src/
    components/
    data/
    App.tsx
    main.tsx
    styles.css
  docs/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
~~~

## 数据模型

~~~text
Project
  slug
  title
  year
  disciplines[]
  summary
  role
  image
  accent
  sections[]
~~~

展岛和索引只读取同一份 Project[]。

## 命令

~~~powershell
npm install
npm run dev
npm run typecheck
npm run build
~~~

## 质量门

- TypeScript 无错误。
- Vite production build 成功。
- Playwright 桌面和移动截图通过视觉检查。
- 页面无控制台错误。
- 键盘路径与 reduced motion 完成检查。
- 不把生成图或项目图片只留在 Codex 临时目录。

## 后续扩展

正式版再评估：

- React Router 或 Next.js 路由。
- Headless CMS。
- Three.js lazy-loaded 展岛。
- 联系表单服务。
- 项目图像响应式处理与 CDN。
- SEO、OG 图、结构化数据与 sitemap。
