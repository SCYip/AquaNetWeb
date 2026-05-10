import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

/* ────────────────────────────────────────────────────────────────────────────
 * HomePage — AquaNet 水眸 · Field Bulletin
 *
 * Editorial citizen-science publication mood, not SaaS landing page.
 * Six numbered movements:
 *   00  Masthead       — issue stamp + asymmetric editorial headline
 *   01  Epigraph       — the question that started the project
 *   §01 Three Principles — numbered editorial columns
 *   §02 Origin         — founder note in dark inverted section
 *   §03 Today's Readings — live data block (Bedrock-style cinematic chrome)
 *   --  Colophon       — restrained closing CTA
 *
 * Design tokens live in index.css (mono-label, section-eyebrow, bg-grain,
 * bulletin-card, display-italic, column-numeral, etc.)
 * ──────────────────────────────────────────────────────────────────────────── */

const PRINCIPLES = [
  {
    no: '01',
    title: '让数据可见',
    titleEn: 'MAKE THE DATA VISIBLE',
    body:
      '水质数据不该只压在政府报告里。我们把原本困在 PDF 附件中的那些数字，搬到地图、时间轴、图表上——让它们能被看到、被引用、被追问。',
  },
  {
    no: '02',
    title: '汇聚社群',
    titleEn: 'GATHER THE COMMONS',
    body:
      '我们这一代人不靠空喊环保。能写代码的写代码，能焊电路的焊电路——把技术落到一条具体的河上，比一万个口号都来得实在。',
  },
  {
    no: '03',
    title: '一手证据',
    titleEn: 'FIRST-HAND EVIDENCE',
    body:
      '一手的数据，才经得起追问。盯一条河的变化、顺着污染源往上游找、跟社区一起想办法——这一切都得先有数据。',
  },
] as const

const OBSERVATIONS = [
  '把获取水质数据这件事，做成不需要再重新发明',
  '让普通人不靠门槛也能参与一次水环境监测',
  '让每一个公民观察、社群行动，都能在数据上留痕',
  '让每一份决定背后，都有一份看得见、对得上的证据',
] as const

const READINGS = [
  { value: '5', label: 'BUOYS', label_zh: '在线浮标' },
  { value: '3', label: 'METRICS', label_zh: '观测指标' },
  { value: '24/7', label: 'UPTIME', label_zh: '持续记录' },
] as const

export const HomePage = () => {
  return (
    <div className="bg-sand-50 text-ocean-950">
      {/* ─── 00 · MASTHEAD ──────────────────────────────────────────────── */}
      <header className="bg-grain bg-sand-50 border-b-[3px] border-double border-ocean-900/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-20 md:pt-14 md:pb-28">
          {/* Issue line — runs the full width like a publication slug */}
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mono-label text-ocean-700 mb-12 md:mb-16 pb-3 border-b border-ocean-300/70">
            <span>AQUANET 水眸 · 第一期 · ISSUE 01 · 2026</span>
            <span className="hidden sm:inline">22.5°N · 114.0°E · SHENZHEN BASIN</span>
            <span className="text-sea-700 flex items-center gap-2">
              <span className="live-dot" /> LIVE · 实时通讯
            </span>
          </div>

          {/* Headline — asymmetric. Left: editorial display. Right: editor's note. */}
          <div className="grid grid-cols-12 gap-y-10 md:gap-x-10 lg:gap-x-16">
            <div className="col-span-12 lg:col-span-8">
              <p className="section-eyebrow text-sea-700 mb-7">A FIELD BULLETIN · 卷首</p>
              <h1 className="font-heading font-semibold text-ocean-950 leading-[0.95] tracking-tight text-[clamp(2.5rem,7vw,6rem)]">
                看一眼<span className="display-italic text-sea-700">这水</span>
                <br />
                到底什么样——
                <br />
                <span className="display-italic text-sand-700">就是关心的</span>
                <br />
                第一步。
              </h1>
              <div className="mt-10 flex items-center gap-4 mono-label text-ocean-600">
                <span className="rule-fade w-12 text-ocean-400" />
                EDITED IN SHENZHEN · 编于深圳
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l lg:border-ocean-300/80 flex flex-col justify-end">
              <div className="mono-label text-ocean-600 mb-4">FROM THE EDITOR · 编者按</div>
              <p className="font-body text-base md:text-lg text-ocean-800 leading-[1.7]">
                <span className="font-semibold text-ocean-950">AquaNet 水眸</span>{' '}
                是一份用开源浮标、公开地图、公众来信组成的「公民观测站」——一份你也可以投稿的水环境通讯。
              </p>
              <div className="mt-7 pt-5 border-t border-ocean-200/80 mono-label-sm text-ocean-500 leading-[1.9]">
                A bilingual citizen-science
                <br />
                bulletin for the waters
                <br />
                we live next to.
              </div>
            </aside>
          </div>
        </div>
      </header>

      {/* ─── 01 · EPIGRAPH ──────────────────────────────────────────────── */}
      <section className="bg-ocean-50 bg-grain border-b border-ocean-100/80 reveal">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-24 md:py-32 grid grid-cols-12 gap-y-8 gap-x-6 md:gap-x-10">
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <span className="mono-label text-sea-700">引文 · CITATION</span>
            <span className="block mt-2 mono-label-sm text-ocean-500">2025 / 09</span>
          </div>

          <blockquote className="col-span-12 md:col-span-9 lg:col-span-10">
            <p className="display-italic text-ocean-900 text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.18] tracking-tight">
              如果连「<span className="text-sea-700">看一眼这水什么样</span>」<br className="hidden md:inline" />
              都这么难，那后面的关心和保护，<br className="hidden md:inline" />
              又从哪一步开始呢？
            </p>
            <footer className="mt-10 flex items-center gap-4 mono-label text-ocean-600">
              <span className="inline-block w-12 h-px bg-ocean-400" />
              JOEY · 项目发起人 · 广东惠州
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ─── §01 · THREE PRINCIPLES ─────────────────────────────────────── */}
      <section className="bg-sand-50 bg-grain reveal">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-28 md:py-36">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-16 md:mb-24 pb-4 border-b border-ocean-200">
            <h2 className="section-eyebrow text-ocean-900">
              01 · 三条准则 · THREE PRINCIPLES
            </h2>
            <span className="mono-label text-ocean-500">DRAFTED · 2025 / 09 · SHENZHEN</span>
          </div>

          {/* Asymmetric staircase — middle column drops, third drops further */}
          <div className="grid grid-cols-12 gap-y-16 gap-x-6 md:gap-x-10 lg:gap-x-12">
            {PRINCIPLES.map((p, i) => (
              <article
                key={p.no}
                className={[
                  'col-span-12 md:col-span-4',
                  i === 1 ? 'md:mt-12' : '',
                  i === 2 ? 'md:mt-24' : '',
                ].join(' ')}
              >
                <div className="column-numeral text-sea-700 mb-7 leading-none">
                  {p.no}
                </div>
                <h3 className="font-heading text-2xl md:text-[1.7rem] font-bold text-ocean-950 leading-tight">
                  {p.title}
                </h3>
                <p className="mt-2 mono-label text-ocean-500">— {p.titleEn}</p>
                <div className="mt-5 mb-5 rule-fade w-16 text-ocean-300" />
                <p className="text-ocean-700 leading-[1.75] text-[0.96rem]">
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── §02 · ORIGIN — dark inverted founder's note ────────────────── */}
      <section className="relative bg-ocean-950 text-white overflow-hidden reveal">
        {/* Decorative bathymetry contour lines — subtle, behind everything */}
        <svg
          aria-hidden
          className="absolute inset-0 w-full h-full text-bathy pointer-events-none"
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <path
              key={i}
              d={`M-50,${80 + i * 60} Q360,${50 + i * 65} 720,${100 + i * 60} T1500,${70 + i * 60}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
            />
          ))}
        </svg>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-28 md:py-40">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-16 md:mb-20 pb-4 border-b border-white/15">
            <h2 className="section-eyebrow text-sea-300">
              02 · 起点 · ORIGIN
            </h2>
            <span className="mono-label text-ocean-300">FOUNDER&apos;S NOTE · 手记</span>
          </div>

          <div className="grid grid-cols-12 gap-y-14 gap-x-6 md:gap-x-12">
            {/* Founder's quote + body — left dominant */}
            <div className="col-span-12 lg:col-span-7">
              <p className="display-italic text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.22] mb-12 text-white">
                去年，在一项水体富营养化的研究里，我满心希望能深入分析藻华的成因——
                <span className="text-sea-300">却被一个最朴素的问题卡住：</span>
              </p>

              <div className="border-l-2 border-sea-400/50 pl-6 md:pl-8 space-y-7 text-ocean-100 text-[1.05rem] leading-[1.85]">
                <p>
                  <span className="text-white font-medium">
                    「我很难找到我想研究的那条水的具体指标。」
                  </span>{' '}
                  数据覆盖太稀，公开渠道太碎——到了真正想动手的人那里，常常什么都没有。
                </p>
                <p>
                  那一刻我才真正明白：水污染不是教科书上的概念，
                  更是发生在我们身边的现实——只是，
                  我们对它的了解，还隔着一层厚重的迷雾。
                </p>
                <p className="text-white">所以，AquaNet 水眸 从这里开始。</p>
              </div>

              <div className="mt-10 flex items-center gap-4 mono-label text-ocean-300">
                <span className="inline-block w-12 h-px bg-sea-400/60" />
                JOEY · 2025 / 09 · 惠州
              </div>
            </div>

            {/* Observations panel — right column */}
            <aside className="col-span-12 lg:col-span-5 lg:col-start-8 self-end">
              <div className="bg-white/[0.04] border border-white/10 backdrop-blur-sm p-8 md:p-10">
                <div className="flex items-baseline justify-between mb-7 pb-3 border-b border-white/15">
                  <h3 className="mono-label text-sea-300">OBSERVATIONS</h3>
                  <span className="mono-label-sm text-ocean-300">水眸·要做什么</span>
                </div>
                <ol className="space-y-5">
                  {OBSERVATIONS.map((item, i) => (
                    <li key={i} className="flex items-baseline gap-4">
                      <span className="font-mono text-xs text-sea-400 tabular-nums shrink-0 pt-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-ocean-100 leading-[1.7] text-[0.96rem]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ─── §03 · TODAY'S READINGS — live data bulletin ────────────────── */}
      <section className="bg-sand-50 bg-grain reveal">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-28 md:py-36">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-12 md:mb-16 pb-4 border-b border-ocean-200">
            <h2 className="section-eyebrow text-ocean-900">
              03 · 今日观测 · TODAY&apos;S READINGS
            </h2>
            <span className="mono-label text-sea-700 flex items-center gap-2">
              <span className="live-dot" /> 实时 · LIVE FEED
            </span>
          </div>

          <Link
            to="/map"
            className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-sea-400 focus-visible:ring-offset-4 focus-visible:ring-offset-sand-50"
          >
            <article className="bulletin-card text-white p-8 md:p-12 lg:p-16 transition-all duration-500 group-hover:-translate-y-1">
              {/* Top row — title + place */}
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 mb-12 md:mb-16">
                <div>
                  <span className="mono-label text-sea-300">深圳周边 · SHENZHEN BASIN</span>
                  <h3 className="mt-3 font-heading text-[clamp(2rem,4.5vw,4rem)] leading-[1.05] font-semibold">
                    实时水质<span className="display-italic text-sea-300">通讯</span>。
                  </h3>
                </div>
                <p className="text-ocean-200 max-w-md leading-[1.7] text-[0.96rem]">
                  点开地图，看每个浮标这一刻量到的温度、pH、浊度——每 30 秒自己刷一次。
                </p>
              </div>

              {/* Stat rail — research-bulletin style */}
              <div className="grid grid-cols-3 gap-x-4 md:gap-x-8">
                {READINGS.map((r) => (
                  <div
                    key={r.label}
                    className="border-l border-white/15 pl-3 md:pl-5 py-1"
                  >
                    <div className="font-heading font-medium text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] tabular-nums">
                      {r.value}
                    </div>
                    <div className="mt-3 mono-label text-sea-300">{r.label}</div>
                    <div className="mt-1 mono-label-sm text-ocean-300">{r.label_zh}</div>
                  </div>
                ))}
              </div>

              {/* Footer rule + open-map link */}
              <div className="mt-14 md:mt-16 pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="mono-label text-sea-300">
                  → 打开地图 · OPEN THE FULL MAP
                </span>
                <ArrowUpRight
                  className="w-5 h-5 text-sea-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  strokeWidth={1.5}
                />
              </div>
            </article>
          </Link>
        </div>
      </section>

      {/* ─── COLOPHON · closing afterword ──────────────────────────────── */}
      <section className="bg-ocean-50 border-t border-ocean-200/80 reveal">
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
          <p className="mono-label text-ocean-700 mb-7">— 后记 · COLOPHON</p>
          <p className="display-italic text-[clamp(1.6rem,3.2vw,2.4rem)] text-ocean-900 leading-[1.18] mb-10">
            一份没有你<br className="md:hidden" />
            就<span className="text-sea-700">不成立</span>的<br />
            水环境通讯。
          </p>
          <p className="text-ocean-700 leading-[1.85] mb-12 max-w-xl mx-auto">
            你看见水边的什么、记录什么、写信告诉我们什么——
            都会变成下一期可以追问、可以验证、可以引用的数据。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 mono-label text-ocean-700">
            <Link
              to="/about"
              className="border-b border-ocean-400 pb-1 hover:text-ocean-950 hover:border-ocean-900 transition-colors"
            >
              READ THE STORY · 项目故事 →
            </Link>
            <span className="text-ocean-300 select-none" aria-hidden>·</span>
            <Link
              to="/contact"
              className="border-b border-ocean-400 pb-1 hover:text-ocean-950 hover:border-ocean-900 transition-colors"
            >
              GET IN TOUCH · 联系我们 →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
