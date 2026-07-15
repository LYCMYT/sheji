import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import {
  ArrowRight,
  ArrowUpRight,
  EnvelopeSimple,
  List,
  SquaresFour,
  X,
} from '@phosphor-icons/react'
import { projects, type Project } from './data/projects'

type ViewMode = 'field' | 'index'
type StyleVars = CSSProperties & Record<`--${string}`, string | number>

const stageImage = `${import.meta.env.BASE_URL}assets/portfolio-stage-1586.webp`
const stageImageMobile = `${import.meta.env.BASE_URL}assets/portfolio-stage-960.webp`

function getInitialView(): ViewMode {
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
    return 'index'
  }
  return 'field'
}

function PageProgress() {
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 28,
    mass: 0.22,
  })

  if (reduceMotion) return null

  return <motion.div className="page-progress" style={{ scaleX }} aria-hidden="true" />
}

function ResponsiveStageImage({
  project,
  className = '',
  eager = false,
}: {
  project?: Project
  className?: string
  eager?: boolean
}) {
  const style = project
    ? ({
        '--cover-position': project.coverPosition,
        '--cover-scale': project.coverScale,
      } as StyleVars)
    : undefined

  return (
    <picture className={`stage-picture ${className}`}>
      <source media="(max-width: 767px)" srcSet={stageImageMobile} type="image/webp" />
      <img
        src={stageImage}
        width="1586"
        height="992"
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        alt={
          project
            ? `${project.title} 概念封面，包含海报、材质样本和数字界面的空间组合`
            : '由海报、包装材质、界面屏幕和抽象装置组成的设计展台'
        }
        style={style}
      />
    </picture>
  )
}

function SiteHeader({ onEnterField }: { onEnterField: () => void }) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="NIXIANG 首页">
        <span>NIXIANG</span>
        <small>设计现场</small>
      </a>
      <nav aria-label="主导航">
        <a href="#work">作品</a>
        <a href="#method">方法</a>
        <a href="#about">关于</a>
        <a href="#contact">联系</a>
      </nav>
      <button className="header-action" type="button" onClick={onEnterField}>
        进入设计场
        <ArrowUpRight aria-hidden="true" weight="bold" />
      </button>
    </header>
  )
}

function Hero({ onEnterField }: { onEnterField: () => void }) {
  const reduceMotion = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const rotateY = useTransform(pointerX, [-0.5, 0.5], [-3.5, 3.5])
  const rotateX = useTransform(pointerY, [-0.5, 0.5], [3, -3])
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const copyY = useTransform(heroScrollProgress, [0, 1], [0, -44])
  const stageY = useTransform(heroScrollProgress, [0, 1], [0, 82])

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion) return
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5)
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5)
  }

  const resetPointer = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <section className="hero" ref={heroRef} aria-labelledby="hero-title">
      <motion.div
        className="hero-copy"
        style={reduceMotion ? undefined : { y: copyY }}
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <p className="eyebrow">独立设计师 / 数字产品与品牌</p>
        <h1 id="hero-title">
          <span>复杂问题，</span>
          <span className="accent-text">清晰体验。</span>
        </h1>
        <p className="hero-intro">
          我把研究、信息和视觉组织成可以理解、可以使用、也可以持续生长的体验系统。
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#work">
            查看作品
            <ArrowRight aria-hidden="true" weight="bold" />
          </a>
          <button className="button button-secondary" type="button" onClick={onEnterField}>
            进入设计场
            <SquaresFour aria-hidden="true" weight="bold" />
          </button>
        </div>
      </motion.div>

      <div
        className="hero-stage-wrap"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
      >
        <motion.figure
          className="hero-stage"
          style={reduceMotion ? undefined : { y: stageY, rotateX, rotateY }}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          whileHover={reduceMotion ? undefined : { scale: 1.012 }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <ResponsiveStageImage eager />
          <span className="stage-grid" aria-hidden="true" />
          <span className="stage-scan" aria-hidden="true" />
          <figcaption>
            <span>Design field study</span>
            <span>00 / 2026</span>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  )
}

function ViewSwitch({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div className="view-switch" aria-label="作品浏览模式">
      <button
        type="button"
        aria-pressed={mode === 'field'}
        onClick={() => onChange('field')}
      >
        <SquaresFour aria-hidden="true" weight="bold" />
        展岛
      </button>
      <button
        type="button"
        aria-pressed={mode === 'index'}
        onClick={() => onChange('index')}
      >
        <List aria-hidden="true" weight="bold" />
        索引
      </button>
    </div>
  )
}

function FieldView({ onOpen }: { onOpen: (project: Project) => void }) {
  const reduceMotion = useReducedMotion()
  const [focusedIndex, setFocusedIndex] = useState(0)
  const nodeRefs = useRef<Array<HTMLButtonElement | null>>([])
  const focusedProject = projects[focusedIndex]

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = index - 1
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = index + 1
    if (nextIndex === index) return

    event.preventDefault()
    const wrappedIndex = (nextIndex + projects.length) % projects.length
    setFocusedIndex(wrappedIndex)
    nodeRefs.current[wrappedIndex]?.focus()
  }

  return (
    <motion.div
      className="field-view"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
    >
      <div className="field-instructions" id="field-instructions">
        <span>移动取景框，靠近一个作品展台。</span>
        <span>方向键切换，Enter 打开。</span>
      </div>
      <div className="field-stage" aria-describedby="field-instructions">
        <span className="field-axis field-axis-x" aria-hidden="true" />
        <span className="field-axis field-axis-y" aria-hidden="true" />

        {projects.map((project, index) => {
          const placementStyle = {
            '--x': `${project.placement.x}%`,
            '--y': `${project.placement.y}%`,
            '--width': `${project.placement.width}%`,
            '--ratio': project.placement.ratio,
          } as StyleVars

          return (
            <motion.button
              key={project.slug}
              ref={(node) => {
                nodeRefs.current[index] = node
              }}
              className={`field-node ${focusedIndex === index ? 'is-active' : ''}`}
              style={placementStyle}
              type="button"
              onFocus={() => setFocusedIndex(index)}
              onPointerEnter={() => setFocusedIndex(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onClick={() => onOpen(project)}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92, rotate: project.placement.rotation }}
              animate={{ opacity: 1, scale: 1, rotate: project.placement.rotation }}
              transition={{ duration: 0.45, delay: reduceMotion ? 0 : index * 0.07 }}
              aria-label={`打开 ${project.title} 项目`}
            >
              <span className="field-node-media">
                <ResponsiveStageImage project={project} />
                {focusedIndex === index ? (
                  <motion.span
                    className="field-focus"
                    layoutId={reduceMotion ? undefined : 'field-focus'}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                    aria-hidden="true"
                  />
                ) : null}
              </span>
              <span className="field-node-label">
                <span>{project.id}</span>
                <strong>{project.title}</strong>
                <small>{project.discipline}</small>
              </span>
            </motion.button>
          )
        })}

        <div className="field-spotlight" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
            className="field-spotlight-content"
            key={focusedProject.slug}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <span>{focusedProject.id} / {focusedProject.year}</span>
            <strong>{focusedProject.title}</strong>
            <p>{focusedProject.summary}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function IndexView({ onOpen }: { onOpen: (project: Project) => void }) {
  const reduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const activeProject = projects[activeIndex]

  return (
    <motion.div
      className="index-view"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
    >
      <ol className="project-list" aria-label="精选项目">
        {projects.map((project, index) => (
          <li key={project.slug}>
            <button
              className={activeIndex === index ? 'is-active' : ''}
              type="button"
              onPointerEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => onOpen(project)}
              aria-label={`打开 ${project.title} 项目`}
            >
              <span className="project-number">{project.id}</span>
              <span className="project-row-title">
                <strong>{project.title}</strong>
                <small>{project.discipline}</small>
              </span>
              <span className="project-year">{project.year}</span>
              <ArrowUpRight aria-hidden="true" weight="bold" />
            </button>
          </li>
        ))}
      </ol>

      <div className="index-preview" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            className="index-preview-content"
            key={activeProject.slug}
            initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -14, scale: 1.01 }}
            transition={{ duration: 0.38, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div className="index-preview-media">
              <ResponsiveStageImage project={activeProject} />
              <span>{activeProject.id}</span>
            </div>
            <div className="index-preview-copy">
              <p>{activeProject.role}</p>
              <strong>{activeProject.summary}</strong>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function WorkSection({
  mode,
  onModeChange,
  onOpen,
}: {
  mode: ViewMode
  onModeChange: (mode: ViewMode) => void
  onOpen: (project: Project) => void
}) {
  return (
    <section className="work-section" id="work" aria-labelledby="work-title">
      <div className="section-heading work-heading">
        <div>
          <p className="eyebrow">Selected work / 2024 to 2026</p>
          <h2 id="work-title">先看几个完整案例</h2>
          <p>不只展示最终画面，也说明每个关键决策为什么成立。</p>
        </div>
        <ViewSwitch mode={mode} onChange={onModeChange} />
      </div>

      <AnimatePresence mode="wait">
        {mode === 'field' ? (
          <FieldView key="field" onOpen={onOpen} />
        ) : (
          <IndexView key="index" onOpen={onOpen} />
        )}
      </AnimatePresence>
    </section>
  )
}

function CapabilitySection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="capability-section" aria-labelledby="capability-title">
      <div className="section-heading compact-heading">
        <p className="eyebrow">Capability spectrum</p>
        <h2 id="capability-title">从问题定义，到体验落地</h2>
      </div>
      <ol className="capability-spectrum">
        <motion.li
          initial={reduceMotion ? false : { opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={reduceMotion ? undefined : { y: -9 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <span>01</span>
          <strong>产品体验</strong>
          <small>信息架构、界面系统</small>
        </motion.li>
        <motion.li
          initial={reduceMotion ? false : { opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={reduceMotion ? undefined : { y: -9 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.07, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <span>02</span>
          <strong>品牌视觉</strong>
          <small>识别、包装、传播</small>
        </motion.li>
        <motion.li
          initial={reduceMotion ? false : { opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={reduceMotion ? undefined : { y: -9 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.14, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <span>03</span>
          <strong>互动叙事</strong>
          <small>Web、动效、展览</small>
        </motion.li>
        <motion.li
          initial={reduceMotion ? false : { opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={reduceMotion ? undefined : { y: -9 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.21, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <span>04</span>
          <strong>设计系统</strong>
          <small>规则、组件、治理</small>
        </motion.li>
      </ol>
    </section>
  )
}

function MethodSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="method-section" id="method" aria-labelledby="method-title">
      <div className="method-intro">
        <p className="eyebrow">Method / not a formula</p>
        <h2 id="method-title">让判断有依据，让结果能落地。</h2>
        <p>
          方法不是一排工具名称，而是从问题、系统到验证的连续选择。每个阶段都留下可以被讨论的证据。
        </p>
      </div>

      <div className="method-track">
        <motion.article
          className="method-card method-card-wide"
          initial={reduceMotion ? false : { opacity: 0, y: 54, scale: 0.975 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>01 / Define</span>
          <h3>先确定真正需要改变的事情</h3>
          <p>梳理目标、用户、约束与已有证据，把模糊需求变成可以验证的问题。</p>
          <motion.div
            className="method-diagram method-diagram-map"
            initial={reduceMotion ? false : { opacity: 0, scaleX: 0.65 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true, amount: 0.55 }}
            transition={{ duration: 0.75, delay: reduceMotion ? 0 : 0.18 }}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
          </motion.div>
        </motion.article>
        <motion.article
          className="method-card method-card-offset"
          initial={reduceMotion ? false : { opacity: 0, y: 54, scale: 0.975 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>02 / System</span>
          <h3>建立能持续扩展的视觉与行为规则</h3>
          <p>把零散页面或物料收束成信息层级、组件、状态和表达原则。</p>
          <motion.div
            className="method-diagram method-diagram-grid"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.55 }}
            transition={{ duration: 0.62, delay: reduceMotion ? 0 : 0.18 }}
            aria-hidden="true"
          >
            <i />
            <i />
            <i />
            <i />
          </motion.div>
        </motion.article>
        <motion.article
          className="method-card method-card-low"
          initial={reduceMotion ? false : { opacity: 0, y: 54, scale: 0.975 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>03 / Prove</span>
          <h3>在真实场景里验证，再决定保留什么</h3>
          <p>通过原型、内容样本和边界场景检查设计，记录结果，也说明证据的边界。</p>
          <div className="method-signal" aria-hidden="true">
            <motion.span
              initial={{ scaleX: reduceMotion ? 0.72 : 0 }}
              whileInView={{ scaleX: 0.72 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.18 }}
            />
          </div>
        </motion.article>
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section className="about-section" id="about" aria-labelledby="about-title">
      <div>
        <p className="eyebrow">About</p>
        <h2 id="about-title">我关心的不只是界面看起来新。</h2>
      </div>
      <div className="about-copy">
        <p>
          更重要的是，信息、行为与品牌能不能形成同一个系统，让使用者更快看懂，也让团队更容易继续做对。
        </p>
        <dl>
          <div>
            <dt>工作范围</dt>
            <dd>产品体验、品牌系统、互动叙事</dd>
          </div>
          <div>
            <dt>合作方式</dt>
            <dd>从方向梳理、核心设计到落地规范</dd>
          </div>
          <div>
            <dt>交付原则</dt>
            <dd>清楚署名、真实证据、可维护系统</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <p className="eyebrow">Start a project</p>
      <h2 id="contact-title">有一个需要被理清，也值得被记住的项目？</h2>
      <a className="contact-link" href="mailto:hello@yourname.design">
        联系我
        <EnvelopeSimple aria-hidden="true" weight="bold" />
      </a>
      <p className="contact-note">演示邮箱，请在发布前替换为你的真实联系方式。</p>
    </section>
  )
}

function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      className="project-dialog"
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.currentTarget === event.target) event.currentTarget.close()
      }}
      aria-labelledby="dialog-title"
    >
      <article>
        <button
          className="dialog-close"
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="关闭项目"
        >
          <X aria-hidden="true" weight="bold" />
        </button>
        <header className="dialog-header">
          <div>
            <p className="eyebrow">{project.id} / {project.year}</p>
            <h2 id="dialog-title">{project.title}</h2>
          </div>
          <p>{project.summary}</p>
        </header>
        <div className="dialog-media">
          <ResponsiveStageImage project={project} eager />
        </div>
        <dl className="dialog-meta">
          <div>
            <dt>领域</dt>
            <dd>{project.discipline}</dd>
          </div>
          <div>
            <dt>负责</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>状态</dt>
            <dd>结构演示案例</dd>
          </div>
        </dl>
        <div className="case-body">
          <section>
            <span>01 / 问题</span>
            <h3>需要解决什么</h3>
            <p>{project.challenge}</p>
          </section>
          <section>
            <span>02 / 方法</span>
            <h3>如何建立系统</h3>
            <p>{project.approach}</p>
          </section>
          <section>
            <span>03 / 结果</span>
            <h3>交付与证据边界</h3>
            <p>{project.outcome}</p>
          </section>
        </div>
      </article>
    </dialog>
  )
}

export function App() {
  const reduceMotion = useReducedMotion()
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialView)
  const [openProject, setOpenProject] = useState<Project | null>(null)

  const enterField = () => {
    setViewMode('field')
    window.requestAnimationFrame(() => {
      document.getElementById('work')?.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    })
  }

  return (
    <div className="site-shell" id="top">
      <PageProgress />
      <SiteHeader onEnterField={enterField} />
      <main>
        <Hero onEnterField={enterField} />
        <WorkSection mode={viewMode} onModeChange={setViewMode} onOpen={setOpenProject} />
        <CapabilitySection />
        <MethodSection />
        <AboutSection />
        <ContactSection />
      </main>
      <footer className="site-footer">
        <span>NIXIANG / 设计现场</span>
        <span>原型案例与封面仅用于结构演示，发布前替换为真实作品。</span>
        <a href="#top">回到顶部</a>
      </footer>
      {openProject ? (
        <ProjectDialog project={openProject} onClose={() => setOpenProject(null)} />
      ) : null}
    </div>
  )
}
