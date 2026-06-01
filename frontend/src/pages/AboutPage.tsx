import { Link } from 'react-router-dom'

/* ────────────────────────────────────────────────────────────────────────────
 * AboutPage — AquaNet 水眸 · Instrument Console
 *
 * Typographic hero (no stock-photo veneer), mission as hairline-divided
 * principles, founder note on an ink slab, six ways to participate as a
 * bento grid, closing CTA. One language per block.
 * ──────────────────────────────────────────────────────────────────────────── */

const PRINCIPLES = [
  { n: '01', title: '让数据可见', body: '水质数据不该只压在政府报告里。我们把原本困在 PDF 附件中的那些数字，搬到地图、时间轴、图表上——让它们能被看到、被引用、被追问。' },
  { n: '02', title: '汇聚社群',   body: '这一代人不靠空喊环保。能写代码的写代码，能焊电路的焊电路——把技术落到一条具体的河上，比一万个口号都来得实在。' },
  { n: '03', title: '一手证据',   body: '一手的数据，才经得起追问。盯一条河的变化、顺着污染源往上游找、跟社区一起想办法——这一切都得先有数据。' },
] as const

const PARTICIPATE = [
  { n: '01', title: '加入我们',     body: '直接参与 AquaNet 水眸——做硬件、写代码、跑数据、写来信。也欢迎你把自己手上别的水保护项目带过来。' },
  { n: '02', title: '改变生活习惯', body: '少用含磷洗涤剂、不向河道扔垃圾、节约用水——一个家庭一周的小改变，乘以一百万个家庭，就是一条河的呼吸。' },
  { n: '03', title: '传播知识',     body: '把你看到的水环境知识带到家人、朋友、社区里——一次餐桌上的提醒比一百条公众号转发都管用。' },
  { n: '04', title: '举报污染',     body: '看到偷排、异味、可疑工厂排口——拨 12369 举报、写信给我们、把照片留下时间戳。证据是有效行动的起点。' },
  { n: '05', title: '贡献数据',     body: '通过我们的浮标、小程序，或自己的工具，把你测到的温度、pH、浊度发给我们——一份数据就是一份证据。' },
  { n: '06', title: '关注与分享',   body: '关注公众号、转一篇手记、把这页发给愿意听的人。一个公民观测站，靠的是被看见。' },
] as const

export const AboutPage = () => {
  return (
    <div>
      {/* ── MASTHEAD + HERO ──────────────────────────────────────────── */}
      <div className="border-b border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-2.5 flex items-center justify-between gap-4">
          <span className="label">关于 · ABOUT</span>
          <span className="label-mute tnum">EST. 2026 · 深圳 / 惠州</span>
        </div>
      </div>

      <section className="scanlines max-w-6xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-16 md:pb-20">
        <h1 className="text-ink" style={{ fontSize: 'clamp(2.75rem, 8vw, 6rem)', lineHeight: 0.95, letterSpacing: '-0.03em', fontVariationSettings: '"wdth" 92, "opsz" 96' }}>
          <span className="zh">我们是谁。</span>
        </h1>
        <p className="article-body mt-8 max-w-2xl" style={{ fontSize: '1.1875rem' }}>
          <span className="zh">一个由高中生发起的公民科学项目。我们想让「获取水质数据」这件事——不再像现在这样难。</span>
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/map" className="btn">看实时地图</Link>
          <Link to="/contact" className="btn-outline">给我们写信</Link>
        </div>
      </section>

      {/* ── MISSION — three numbered principles ──────────────────────── */}
      <section className="border-t border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-24">
          <div className="label mb-12">使命 · MISSION</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {PRINCIPLES.map((p) => (
              <article key={p.n} className="tile reveal flex flex-col">
                <div className="flex items-baseline justify-between">
                  <span className="section-numeral" style={{ fontSize: '3rem' }}>{p.n}</span>
                </div>
                <h3 className="text-ink mt-4" style={{ fontSize: '1.375rem', lineHeight: 1.2 }}>
                  <span className="zh">{p.title}</span>
                </h3>
                <p className="article-body text-small mt-4" style={{ color: 'var(--ink)' }}>
                  <span className="zh">{p.body}</span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDER NOTE — ink slab ──────────────────────────────────── */}
      <section className="border-t border-ink bg-ink text-canvas">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <div className="label-micro mb-8" style={{ color: 'rgba(250,250,247,0.55)' }}>起点 · ORIGIN</div>
          <p className="leading-[1.2]" style={{ fontSize: 'clamp(1.625rem, 3vw, 2.75rem)', color: 'var(--canvas)', fontVariationSettings: '"wdth" 90' }}>
            <span className="zh">「为什么我们会从一片生病的水边走过，却像没看见？」</span>
          </p>
          <div className="article-body mt-10 max-w-2xl" style={{ color: 'rgba(250,250,247,0.78)' }}>
            <p><span className="zh">我每天上学，都会经过小径湾的一片人工湖。它常年泛着藻绿、带着腥味——典型的富营养化，却没有人在记录它的变化。我慢慢明白：我们缺的从来不是科学，是注意力。一台 $80 的开源浮标，就是让普通人重新看见身边这片水的眼睛。这就是 AquaNet 水眸 的起点。</span></p>
          </div>
          <p className="label-mute mt-10" style={{ color: 'rgba(250,250,247,0.6)' }}>叶承祖 · 创办人 · 17 · 深圳</p>
        </div>
      </section>

      {/* ── PARTICIPATE — six-tile bento ─────────────────────────────── */}
      <section className="border-t border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-24">
          <div className="label mb-12">参与方式 · SIX WAYS IN</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {PARTICIPATE.map((p) => (
              <article key={p.n} className="tile reveal">
                <div className="flex items-center justify-between">
                  <span className="label tnum">{p.n}</span>
                  <span className="label-mute"><span className="zh">{p.title}</span></span>
                </div>
                <p className="article-body text-small mt-5" style={{ color: 'var(--ink)' }}>
                  <span className="zh">{p.body}</span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING — ink slab ───────────────────────────────────────── */}
      <section className="border-t border-ink bg-ink text-canvas">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-24 md:py-32">
          <h2 className="leading-[1.0]" style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)', color: 'var(--canvas)', fontVariationSettings: '"wdth" 92' }}>
            <span className="zh">一起去看看这片水到底什么样。</span>
          </h2>
          <p className="article-body mt-8 max-w-2xl" style={{ fontSize: '1.1875rem', color: 'rgba(250,250,247,0.78)' }}>
            <span className="zh">不需要写代码，不需要焊电路。你能做的，是去看一眼身边那片水，告诉我们你看见了什么。</span>
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/login" className="btn" style={{ background: 'var(--canvas)', color: 'var(--ink)', borderColor: 'var(--canvas)' }}>
              登记成为观察者
            </Link>
            <Link to="/contact" className="btn-outline" style={{ borderColor: 'var(--canvas)', color: 'var(--canvas)' }}>
              先写一封信
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
