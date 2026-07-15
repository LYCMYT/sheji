export type Project = {
  id: string
  slug: string
  title: string
  year: string
  discipline: string
  role: string
  summary: string
  challenge: string
  approach: string
  outcome: string
  coverPosition: string
  coverScale: number
  placement: {
    x: number
    y: number
    width: number
    rotation: number
    ratio: number
  }
}

export const projects = [
  {
    id: '01',
    slug: 'rive-coffee',
    title: 'Rive Coffee',
    year: '2026',
    discipline: '品牌系统 / 包装',
    role: '策略、视觉识别、包装系统',
    summary: '为一家城市烘焙品牌建立可扩展的包装与门店视觉系统。',
    challenge: '门店、零售包装和线上内容各自生长，品牌在不同接触点缺少一致的识别线索。',
    approach: '从产地信息与烘焙曲线中提取视觉语法，用比例、网格和单一高亮色建立可扩展模板。',
    outcome: '形成覆盖包装、菜单、标牌和社交内容的统一系统。此处为作品集结构演示，正式成果数据待真实项目替换。',
    coverPosition: '73% 46%',
    coverScale: 1.42,
    placement: { x: 7, y: 10, width: 35, rotation: -3.5, ratio: 1.22 },
  },
  {
    id: '02',
    slug: 'muse-digital-exhibition',
    title: 'Muse',
    year: '2025',
    discipline: '数字展览 / Web',
    role: '体验策略、信息架构、交互原型',
    summary: '将馆藏叙事转译成可探索、也可检索的数字展览体验。',
    challenge: '丰富的馆藏信息被压缩成线性页面，访客难以建立主题、年代与作品之间的关系。',
    approach: '设计探索与索引两条同等完整的路径，让空间叙事和快速检索共享同一内容模型。',
    outcome: '完成可键盘访问的展览原型与内容框架。此处为概念案例，不声称真实上线指标。',
    coverPosition: '48% 42%',
    coverScale: 1.55,
    placement: { x: 56, y: 7, width: 32, rotation: 2.8, ratio: 0.88 },
  },
  {
    id: '03',
    slug: 'northline-wayfinding',
    title: 'Northline',
    year: '2025',
    discipline: '城市导视 / Identity',
    role: '信息系统、标识规范、场景验证',
    summary: '用一套可复制的标识语言连接交通、街区和公共空间。',
    challenge: '多方维护造成信息层级、命名和视觉样式失去统一，第一次到访者难以快速确认方向。',
    approach: '先统一目的地命名和决策点，再以模块化网格适配不同尺度与安装环境。',
    outcome: '沉淀信息规则、标识家族与现场验证方法。案例内容为演示占位，需替换成真实项目证据。',
    coverPosition: '23% 58%',
    coverScale: 1.7,
    placement: { x: 13, y: 55, width: 30, rotation: 2.2, ratio: 0.92 },
  },
  {
    id: '04',
    slug: 'drift-bank',
    title: 'Drift Bank',
    year: '2024',
    discipline: '产品设计 / Motion',
    role: '产品体验、界面系统、动效规范',
    summary: '重构移动金融的关键路径，并用动效解释状态与风险。',
    challenge: '交易流程中的状态、等待和风险提示分散，用户难以判断当前进度以及下一步动作。',
    approach: '重组任务流与反馈层级，用克制的状态转场解释系统正在发生什么。',
    outcome: '完成关键流程、组件状态与动效规范原型。项目名称与结果均为演示内容。',
    coverPosition: '82% 68%',
    coverScale: 1.62,
    placement: { x: 57, y: 53, width: 37, rotation: -2.1, ratio: 1.34 },
  },
] satisfies Project[]
