# Bruno Simon Folio 2025 逆向拆解报告

- 审计日期：2026-07-14
- 目标站点：[bruno-simon.com](https://bruno-simon.com/)
- 官方源码：[brunosimon/folio-2025](https://github.com/brunosimon/folio-2025)
- 源码基线：[41046b57eeed8d156d9c3fd7fa259900baef7816](https://github.com/brunosimon/folio-2025/commit/41046b57eeed8d156d9c3fd7fa259900baef7816)
- 范围：产品体验、前端架构、3D/物理/音频、资产流水线、网络与部署、缺陷、复刻路线

## 结论先行

1. 当前链接对应的是 Bruno Simon 的 2025 重制版，不是经常被文章分析的 2019 旧版。作者已经公开前端与 Blender 源文件，因此本报告是“运行时实测 + 官方源码复核”，不是只靠压缩产物猜测。
2. 它不是传统网页套一层 3D，而是一个小型浏览器游戏：玩家驾驶车辆探索世界，项目、履历、实验、社交、成就等内容被做成可到达的空间区域。
3. 技术核心是 Vite + 原生 ES Modules + Three.js WebGPU/TSL + Rapier + Howler.js + GSAP + Stylus。没有 React、Vue 或 Svelte。
4. 架构核心是全局 Game 单例、分阶段 Ticker、两阶段资源加载、Blender/GLB 驱动的场景与碰撞数据，以及 DOM 覆盖层。
5. 若目标是做自己的同类作品，推荐“复刻行为和系统结构，重做品牌、世界、文案与资产”。不要直接复制线上 bundle，也不建议照搬全局单例和可变步长物理。

## 1. 取证方法与边界

本次实际完成了四类检查：

- 浏览器实测：1440 × 900 桌面视口完成启动、驾驶、地图与 DOM 可访问树采样；另做 390 × 844 纵向视口探针。
- 网络实测：首页、主 JS、CSS、GLB、KTX、MP3、WASM、响应头和 Resource Timing。
- 产物检查：线上 HTML 58,809 B，主 JS 4,858,337 B，CSS 40,256 B；主 JS 无 sourcemap。
- 官方源码检查：轻量拉取官方仓库，核对 package.json、Vite 配置、148 个 sources 文件、主循环、渲染、物理、音频、地图、内容与资产压缩脚本。

不能从前端完整确认的内容：

- 服务端源码、排行榜校验、Whispers 审核与存储。
- Nginx 之前是否还有无特征头的反向代理/CDN。
- 真实 iOS/Android 设备的 GPU、触控手感和持续帧率。
- 精确生产部署脚本、TLS 终止位置与服务器供应商。

## 2. 产品与交互拆解

### 2.1 启动页

![桌面启动页](../output/playwright/bruno-intro-desktop.png)

启动页把车辆、树、长椅、路灯压缩进一个发光圆形“微缩世界”，背景是无限网格。Canvas 内的 “Click to start” 既是视觉入口，也是浏览器音频解锁所需的用户手势。

启动阶段的作用不是只展示 loading，而是同时完成：

- 建立视觉世界观和车辆主角。
- 让用户明确这是可操作体验。
- 用第一次点击解锁 Web Audio。
- 在主体资产与 Rapier 尚未完全进入玩法前，提供可停留的轻量场景。

### 2.2 从“看作品”改成“开车发现作品”

![进入世界后的驾驶视角](../output/playwright/bruno-world-desktop.png)

进入后，页面的核心循环是：

1. 输入方向和油门。
2. 车辆悬架、轮胎、碰撞体与场景发生物理交互。
3. 跟随相机保持车辆和前进方向可读。
4. 玩家穿过 Zone 或到达交互点。
5. 对应区域进入视野、加载或激活内容。
6. 项目、履历、实验、社交、成就和小游戏以空间叙事呈现。

这个设计将传统作品集的“滚动阅读”替换为“探索—发现—反馈”。代价是访问内容的效率降低，所以站点额外提供地图传送、菜单、重生和控制说明作为补偿。

### 2.3 世界分区与地图

![地图与传送点](../output/playwright/bruno-map-desktop.png)

地图 UI 暴露 12 个传送目的地：

- Achievements
- Altar
- Behind the scene
- Bowling
- Career
- Circuit
- Cookie
- Lab
- Landing
- Projects
- Social
- Time Machine

源码的 Areas 工厂实际实例化 13 个区域，额外包含 Toilet。地图不是纯图片导航：它会根据昼夜切换 day/night WebP，显示玩家位置，点击地点后调用对应 respawn 并让相机重新跟踪玩家。证据见 [Map.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Map.js) 与 [Areas.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/World/Areas/Areas.js)。

### 2.4 信息架构

| 传统作品集模块 | 站点中的空间化表达 |
|---|---|
| 首页与个人品牌 | Landing、巨大 3D 姓名、车辆出生点 |
| 项目案例 | Projects Area |
| 职业经历 | Career Area |
| 实验作品 | Lab Area |
| 社交链接 | Social Area |
| 技术说明 | Behind the scene |
| 留言 | Whispers |
| 作品集彩蛋/留存 | Achievements、Cookie、Altar、Bowling、Circuit、Time Machine |

关键洞察：这不是把卡片贴到 3D 场景里，而是用“地点”代替“页面”，用“驾驶”代替“导航”，用“碰撞/触发区”代替“点击卡片”。

### 2.5 输入与反馈

输入层统一接收键盘、鼠标/指针、触摸、虚拟摇杆、滚轮和标准 Gamepad，再映射为语义 action；玩法系统不直接依赖单一 keycode。输入还通过 intro、wandering、racing、cinematic、modal 等 context 过滤，避免弹窗与驾驶同时响应。证据见 [Inputs.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Inputs/Inputs.js)。

反馈由多个层级叠加：

- 车辆：转向、发动机力、制动、轮胎摩擦、四轮悬架和翻车/重生。
- 相机：跟随、聚焦点、过场和自由调试相机。
- 地面：车辙、草、树叶、雪、水面和碰撞对象。
- 环境：昼夜、季节、天气、风、雾、雨、雷电、龙卷风。
- 音频：车辆、环境、撞击、UI 和音乐分组；空间声根据相机与声源距离、方位动态衰减。
- 元系统：成就、车辆外观奖励、通知、赛道计时、地图传送。

## 3. 技术栈

版本来自官方 lockfile/package.json 和线上 bundle；详见 [package.json](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/package.json)。

| 层 | 原站实现 | 作用 |
|---|---|---|
| 构建 | Vite 7.2.4 | ESM 开发与生产打包 |
| 语言 | JavaScript ES Modules | 148 个 sources 文件，无 TypeScript |
| UI | 原生 HTML + Stylus 0.64 | 菜单、地图、弹窗、控制说明 |
| 3D | Three.js 0.183.2 | 场景、材质、相机、实例化、加载器 |
| GPU | three/webgpu + TSL | WebGPU 优先，WebGL 后端回退 |
| 后处理 | RenderPipeline + Bloom + 自定义 cheapDOF | 发光、景深、最终合成 |
| 物理 | @dimforge/rapier3d 0.17.3 | 刚体、碰撞、车辆 raycast controller |
| 音频 | Howler.js 2.2.4 | 音乐、音效、空间声与播放池 |
| 动画 | GSAP 3.12.5 | UI、相机和演出补间 |
| 相机 | camera-controls 3.1.2 + 自定义 View | 跟随、自由相机、过场 |
| 调试 | Tweakpane + stats-gl | 参数面板与性能观测 |
| 网络 | WebSocket + MessagePack + UUID | 排行榜、Whispers、匿名客户端标识 |
| 资产 | Blender → glTF/GLB → glTF Transform → Draco/KTX2 | 场景、碰撞和 GPU 友好纹理 |
| 部署 | Nginx 1.24.0 Ubuntu | 同源分发 HTML、JS 与媒体资产 |

Vite 配置明确以 sources/ 为 root、static/ 为 publicDir、dist/ 为输出，并关闭生产 sourcemap。证据见 [vite.config.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/vite.config.js)。

## 4. 运行时架构

~~~mermaid
flowchart TD
    A["HTML / DOM 覆盖层"] --> G["Game 单例"]
    C["Canvas"] --> G
    G --> B["启动系统：Quality / Inputs / Audio / Rendering"]
    B --> L1["阶段 1：Intro 四项轻资源"]
    L1 --> I["可交互启动场景"]
    I --> L2["阶段 2：主体资源与 Rapier 并行加载"]
    L2 --> W["World / Terrain / Physics / Vehicle / Player / Areas"]
    X["Keyboard / Pointer / Touch / Gamepad"] --> R["Action + Context 路由"]
    R --> P["Player intent"]
    P --> V["Vehicle pre-physics"]
    V --> PH["Rapier step"]
    PH --> PO["post-physics / object sync"]
    PO --> VW["View / World / FX"]
    VW --> AU["Spatial Audio"]
    AU --> RE["WebGPU/WebGL RenderPipeline"]
~~~

### 4.1 Game 单例

Game 构造器先建立 Scene、Debug、ResourcesLoader、Quality、Server、Ticker、Time、Cycles、Inputs、Audio、Viewport、Modals、Menu 和 Rendering；随后建立 View、天气、风、地形表现、材质、对象、世界等系统；主体资源和 Rapier 就绪后再创建 Physics、PhysicsVehicle、Player、Zones、Achievements、Map 等玩法系统。证据见 [Game.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Game.js)。

优点是开发速度快、跨系统取用方便；缺点是依赖隐式、单元测试困难、初始化顺序敏感。复刻版不建议继续扩大这个单例。

### 4.2 两阶段加载

阶段 1 仅加载 respawn 引用、Behind the scene 星空、Intro 声音纹理和 palette，快速构成启动场景。阶段 2 将主体 GLB/KTX/MP3 与 Rapier 动态 import 并行。加载器由 GLTFLoader + DRACOLoader + KTX2Loader 组合，见 [ResourcesLoader.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/ResourcesLoader.js)。

这是一种适合中型单地图的折中：不用先实现复杂流式世界，也不会让用户盯着空白 loading。

### 4.3 分阶段 Ticker

作者把每帧按数字优先级排序，而不是让所有系统无序监听 requestAnimationFrame：

1. Time / Inputs
2. Player pre-physics
3. Vehicle pre-physics
4. Rapier Physics
5. PhysicsWireframe / Objects 同步
6. Vehicle 与 Player post-physics
7. View
8. 昼夜、季节、天气、Zones、Vehicle Visual
9. 风、灯光、轨迹、交互点
10. Areas、植被、雾、地形、水面和天气特效
11. 实例对象同步
12. Audio / Notifications / Title
13. Rendering

完整顺序见官方 [README Game loop](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/readme.md#game-loop)。

当前 Ticker 将 delta 裁剪到 1/30 秒，但物理仍跟随帧 delta，不是严格固定 60 Hz。对作品集体验通常够用；若要做可复现计时、回放或严肃排行，应改 fixed-step accumulator。

### 4.4 渲染

Rendering 使用 THREE.WebGPURenderer，设置 high-performance、阴影、DPR 上限 2，并由 renderer.setAnimationLoop 驱动 Ticker。高质量输出是 cheapDOF + Bloom，低质量减少部分效果。移动 UA 默认低质量。证据见 [Rendering.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Rendering.js)、[Quality.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Quality.js) 与 [Viewport.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Viewport.js)。

本次运行时页面选项显示 Renderer 为 WebGPU；没有在无 WebGPU 真机上复测回退路径。

### 4.5 场景与物理数据

Blender/GLB 不只是视觉模型，也是关卡数据库：

- 节点命名决定 fixed、dynamic、kinematicPositionBased 等刚体类型。
- trimesh、hull、cuboid、tube、ball 前缀决定 collider 类型。
- userData 保存质量、摩擦、弹性和碰撞分类。
- zoneBounding、zoneFrustum 等 reference 节点定义进入范围和可见范围。
- Areas GLB 子节点名称映射到具体 Area 类。

重复树木、砖块、围栏和长椅使用 InstancedMesh；只有 reference 改变时才更新实例矩阵。证据见 [Objects.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Objects.js)、[Area.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/World/Areas/Area.js) 与 [InstancedGroup.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/InstancedGroup.js)。

### 4.6 内容与网络

项目、实验、社交和成就使用独立数据文件；3D 文本通过 Canvas2D 生成 Three texture。这让内容可更新，而不必每次回 Blender 改几何。示例见 [projects.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/data/projects.js) 与 [TextCanvas.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/TextCanvas.js)。

联网只增强排行榜与 Whispers。客户端使用原生 WebSocket、MessagePack 和持久化 UUID；本次实测服务状态为 Offline，但世界仍可正常驾驶，证明核心体验是 offline-first。服务端源码未公开。证据见 [Server.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Server.js)。

## 5. 资产与性能

### 5.1 一次冷启动资源快照

浏览器记录到 149 个请求；Resource Timing 中 114 个唯一同源资源约传输 7,510,926 B（7.16 MiB，不含部分跨域与 blob）。

| 格式 | 数量 | 本次传输量 |
|---|---:|---:|
| GLB | 23 | 1,004,144 B |
| KTX/KTX2 | 36 | 878,053 B |
| MP3 | 42 | 1,975,037 B |
| WASM | 3 | 2,512,467 B |
| JS | 4 | 1,092,555 B |
| CSS | 1 | 6,836 B |

补充：

- 主 JS：4,858,337 B 解压后，约 1,029,550 B gzip。
- Rapier WASM：1,698,487 B。
- areas-compressed.glb：约 639 KB。
- 生产 bundle 中可识别 74 个 MP3、54 个 KTX、4 个 KTX2、3 个 WASM 和多组 GLB 字符串。
- 本次未得到可信 FPS、draw call、GPU 显存或长时热稳定数据；不能用网络字节数代替渲染性能结论。

### 5.2 压缩管线

- GLB：嵌入纹理先用 glTF Transform ETC1S，再用 Draco edgebreaker 压缩几何。
- 纹理：Khronos toktx --t2，默认 ETC1S，特定纹理用 UASTC。虽然线上后缀常为 .ktx，生成物实际是 KTX2。
- UI：PNG/JPG 转 WebP，图标保留 SVG。
- 音频：生产使用 MP3；仓库中的 WAV 源文件不应直接进入 dist。

脚本和参数见 [scripts/compress.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/scripts/compress.js)。

### 5.3 部署

已验证响应头：

- Server: nginx/1.24.0 (Ubuntu)
- HTML/JS/CSS 支持 gzip。
- 二进制资产带 ETag、Last-Modified、Accept-Ranges。
- 抽样响应没有 Cache-Control。
- 应用资产同源；第三方请求主要是 Google Fonts、GTM 与 Analytics。

不能仅凭这些头断言没有隐藏 CDN。

## 6. 问题与改进优先级

| 优先级 | 问题 | 证据/影响 | 建议 |
|---|---|---|---|
| P1 | 核心内容缺少语义替代入口 | 启动后可访问树主要只有两个无名称按钮；Canvas 内项目对屏幕阅读器不可见 | 提供可键盘访问的 2D 项目/履历导航，与 3D 世界双向同步 |
| P1 | 地图地点是 click-only div | Map.js 创建 div.location，仅监听 click，无 tabindex/keydown/role | 改为 button 或 link，补可访问名称、焦点样式和键盘操作 |
| P1 | 菜单/地图图标按钮无可访问名称 | HTML button 内只有图形，无 aria-label/文本 | 添加 aria-label、title 与可见 tooltip |
| P2 | 4 个 preload URL 与运行时 URL 不一致 | preload 无 ?cb=1，运行时带 ?cb=1，浏览器成对下载并警告未使用 | 统一 URL 或改为内容哈希 manifest |
| P2 | 静态资产缺少显式长缓存 | 哈希 JS/CSS 和抽样 GLB/KTX 无 Cache-Control | 哈希资源 immutable 一年；HTML 短缓存 + revalidate |
| P2 | 启动传输和解码成本较高 | 约 7.16 MiB，同步涉及主 JS、3 个 WASM、42 个 MP3 请求 | 音频按区/按总线延迟加载，拆 boot/core/area/optional |
| P2 | 物理不是固定步长 | Ticker 只裁剪 delta | 60 Hz fixed-step，最多 3 个 substep，渲染插值 |
| P3 | Game 全局单例耦合 | 多数系统 Game.getInstance() | 显式 GameContext/依赖注入，按 phase 注册系统 |
| P3 | 许可证元数据冲突 | 根 license.md 为 MIT，package.json 写 ISC | 发布前明确许可证清单，保留根 MIT notice 并记录冲突 |
| P3 | 纵向视口构图有裁切风险 | 390 × 844 探针中 Click to start 文字右侧被裁切 | 在真实移动设备复测；将启动 CTA 做成 DOM 或按 safe-area 重排 |

纵向视口探针只模拟尺寸，没有完整模拟移动 UA、触控与 GPU，因此它是复测线索，不是最终移动兼容性判定。

![纵向视口探针](../output/playwright/bruno-portrait-probe.png)

## 7. 推荐复刻方案

### 7.1 路线选择

| 路线 | 适用情况 | 评价 |
|---|---|---|
| 直接 fork 官方 MIT 前端 | 学习、内部原型、明确保留许可且能完成第三方资产审计 | 最快，但会继承耦合、内容和品牌风险 |
| Clean rebuild | 商业作品、个人品牌站、新世界与新内容 | 推荐：复刻系统行为，重做内容与资产 |
| 只做视觉仿制 | 只需要首屏营销视觉 | 成本低，但失去原站最重要的驾驶—探索闭环 |

### 7.2 推荐技术栈

- Node.js 24.x、npm lockfile、精确版本。
- TypeScript strict + Vite 7。
- Three.js three/webgpu + TSL，WebGPU 优先、WebGL 回退。
- Rapier3D。
- Howler.js。
- GSAP 仅用于 UI、相机和策划演出，不参与核心物理。
- Blender → GLB → glTF Transform → Draco/KTX2。
- 原生 DOM + CSS Custom Properties 作为覆盖层，不为少量菜单强行引入 React。
- Vitest、Playwright、glTF Validator。

推荐目录：

~~~text
src/
  app/             bootstrap、能力检测、生命周期
  core/            GameContext、SystemScheduler、事件与日志
  render/          renderer、TSL materials、postprocessing、quality
  assets/          manifest、load groups、cache、dispose、progress
  physics/         world、vehicle、collider factory、sync
  input/           keyboard、pointer、touch、gamepad、ActionRouter
  audio/           buses、spatial emitters、music、SFX
  world/
    areas/         Area 基类与具体区域
    objects/       object registry、instancing、pool
    zones/         trigger、visibility、respawn
  content/         projects、career、lab、social、achievements
  ui/              intro、menu、map、controls、modal、2D fallback
  persistence/     versioned local save 与 migration
  network/         offline adapter、WebSocket adapter
tools/assets/      Blender 导出检查、压缩与预算验证
server/            仅在排行榜/留言阶段加入
~~~

### 7.3 必须先定义的接口

1. 调度 phase：INPUT → GAMEPLAY_INTENT → PRE_PHYSICS → PHYSICS → POST_PHYSICS → CAMERA_WORLD → FX_AUDIO → RENDER。
2. 资产组：boot、core、area、optional-audio。
3. Blender 命名约定：VIS_*、PHY_FIXED_*、PHY_DYNAMIC_*、COL_BOX_*、COL_HULL_*、COL_MESH_*、REF_SPAWN_*、ZONE_*、INTERACT_*。
4. 内容 schema：项目、履历、实验、社交与成就必须数据驱动；新增内容不能修改 Area 核心类。
5. Offline adapter：无服务端或 WebSocket 失败时，隐藏排行/留言，但绝不阻塞启动。

### 7.4 里程碑

1. M0 文档与环境：技术栈 ADR、资产规范、内容 schema、性能预算、许可证清单、Node/lockfile。
2. M1 灰盒垂直切片：双后端 renderer、占位车、Rapier、跟随相机、键鼠/触摸、respawn、质量档位。
3. M2 单一区域：Blender 导出、视觉/物理/reference 解析、GLB/KTX2 压缩、一个完整交互区域。
4. M3 世界系统：AreaFactory、zones、instancing、天气/昼夜、数据驱动内容。
5. M4 UI/音频/存档：Intro、地图、控制说明、无障碍 2D 入口、空间声与版本化 localStorage。
6. M5 可选联网：排行榜、留言、限流、审核与 offline fallback。
7. M6 性能与发布：浏览器矩阵、真实移动设备、资产 CI、缓存/CDN、安全头、回滚。

### 7.5 首个垂直切片预算

| 指标 | 桌面高质量 | 移动低质量 |
|---|---:|---:|
| 目标帧率 | 60 FPS，P95 ≤ 16.7 ms | 30 FPS，P95 ≤ 33.3 ms |
| DPR | ≤ 2，必要时降至 1.25 | 默认 1–1.25 |
| playable 前 JS + WASM | gzip ≤ 1.2 MB | gzip ≤ 1.0 MB |
| playable 前总传输，不含音乐 | ≤ 2.5 MB | ≤ 2.0 MB |
| draw calls | ≤ 120 | ≤ 80 |
| 可见三角面 | ≤ 500k | ≤ 250k |
| GPU 纹理估算 | ≤ 160 MB | ≤ 80 MB |
| active dynamic bodies | ≤ 100 | ≤ 60 |
| 物理 P95 | ≤ 3 ms | ≤ 6 ms |

这些是复刻项目的工程门槛，不是对原站实测帧率的陈述。

## 8. 许可证与复制边界

| 内容 | 处理建议 |
|---|---|
| 官方前端源码、TSL shader、仓库内 Blender 文件 | 根仓库声明 [MIT](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/license.md)；使用时保留版权与许可证文本 |
| Kounine 三首音乐 | 仓库提供独立 [CC0 许可](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/static/sounds/musics/license.md) |
| 服务端 | 未公开，不能复制；只能依据公开客户端协议自行实现 |
| 其他音效 | 未见完整逐项授权清单，不能默认全部由根 MIT 覆盖 |
| 字体 | 按各字体自己的许可证使用 |
| 客户截图、品牌 Logo、奖项标志 | 涉及第三方版权/商标，应替换或单独授权 |
| Bruno 的姓名、履历、联系方式与项目叙事 | 不应复制到新产品，避免身份或背书混淆 |
| 世界布局、车体造型、配色、地图、成就文案和彩蛋 | 商业复刻建议原创重制，即使部分文件在 MIT 仓库内 |

## 9. 事实、推断与待补充验证

### 已核验

- 官方仓库、依赖版本、主要前端架构、Game loop、WebGPU/TSL、Rapier、Howler、资源加载与压缩管线。
- 桌面端启动、驾驶、地图、12 个传送地点、离线仍可运行。
- 当前线上 HTML/JS/CSS 尺寸、资源请求快照、Nginx 可见响应头。
- 可访问名称缺失、地图 click-only div、preload URL 不一致、无显式 Cache-Control。

### 高概率但非密码学确认

- 线上部署与 41046b57 提交的内容和时间高度吻合；由于没有 sourcemap/构建证明，不能证明线上每个字节都来自该提交。
- 可见出口像 Nginx 源站直出；不能排除隐藏上游代理/CDN。
- 若按源码条件，WebGPU 不可用时应走 WebGL 后端；本次没有在无 WebGPU 真机上完成验证。

### 待补充

- iOS Safari、Android Chrome、Firefox、Safari 的真实兼容与持续性能。
- FPS、draw call、GPU memory、长时间驾驶、雨雪/爆炸压力场景。
- WebSocket 恢复后的排行榜/Whispers 行为。
- 第三方音效、字体、品牌素材的逐项许可证清单。

## 10. 关键一手来源

- [官方源码仓库](https://github.com/brunosimon/folio-2025)
- [package.json](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/package.json)
- [Vite 配置](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/vite.config.js)
- [Game.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Game.js)
- [Rendering.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Rendering.js)
- [Physics.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Physics/Physics.js)
- [PhysicsVehicle.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Physics/PhysicsVehicle.js)
- [ResourcesLoader.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/ResourcesLoader.js)
- [Audio.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Audio.js)
- [Server.js](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/sources/Game/Server.js)
- [资产压缩脚本](https://github.com/brunosimon/folio-2025/blob/41046b57eeed8d156d9c3fd7fa259900baef7816/scripts/compress.js)
- [作者开发日志播放列表](https://www.youtube.com/playlist?list=PL5nApUt6Z8sTZxEsEMd8x89OCKCAAfNL0)
