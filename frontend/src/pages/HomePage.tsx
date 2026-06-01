import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { BuoyRow, Report, Dispatch } from '../lib/types'
import { gsap, useGSAP, SplitText } from '../lib/gsap'
import { getDeployedBuoys } from '../services/buoyService'
import { listReports } from '../services/reportService'
import { listDispatches } from '../services/dispatchService'

/* ────────────────────────────────────────────────────────────────────────────
 * HomePage — AquaNet 水眸 · Instrument Console
 *
 * The site is the eye of the water. The page opens as a console — a live
 * readings panel (the memorable moment), then a varied stack: how it works,
 * the buoy itself, the three principles, recent letters, and the founder
 * story. Every section uses a distinct layout so the page never reads as a
 * pile of identical cards. Data is real with honest empty states.
 * ──────────────────────────────────────────────────────────────────────────── */

const PORTRAIT_IMG = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=2000&q=80&auto=format&fit=crop'

type Severity = 'low' | 'medium' | 'high'
const SEVERITY_LABEL: Record<Severity, string> = { low: '关注', medium: '留意', high: '紧急' }
const sevColor = (s: Severity): string =>
  s === 'high' ? 'var(--signal)' : s === 'medium' ? 'var(--ink)' : 'var(--mute)'

function fmtRelative(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const delta = (Date.now() - t) / 1000
  if (delta < 60) return '刚刚'
  if (delta < 3600) return `${Math.floor(delta / 60)} 分钟前`
  if (delta < 86_400) return `${Math.floor(delta / 3600)} 小时前`
  if (delta < 86_400 * 30) return `${Math.floor(delta / 86_400)} 天前`
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function fmtDateEn(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()
}

const STEPS = [
  { n: '01', zh: '替你留意', en: 'SEE', body: '一台小浮标漂在水面，每五分钟，替你看一眼水的温度、酸碱和浑浊。' },
  { n: '02', zh: '自动上传', en: 'SHARE', body: '它看到的，自动传上网——不锁在任何人的抽屉里。' },
  { n: '03', zh: '公开可查', en: 'OPEN', body: '任何人都能在地图上查到、下载、拿去追问与引用。' },
] as const

const PRINCIPLES = [
  { n: '01', zh: '让数据可见', body: '把困在 PDF 附件里的数字，搬到地图、时间轴、图表上——让它们能被看到、被引用、被追问。' },
  { n: '02', zh: '汇聚社群', body: '能写代码的写代码，能焊电路的焊电路。把技术落到一条具体的河上，比一万个口号都实在。' },
  { n: '03', zh: '一手证据', body: '盯一条河的变化、顺着污染源往上游找、跟社区一起想办法——这一切都得先有数据。' },
] as const

export const HomePage = () => {
  const [buoys, setBuoys] = useState<BuoyRow[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [latestDispatch, setLatestDispatch] = useState<Dispatch | null>(null)
  const [loaded, setLoaded] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let alive = true
    Promise.allSettled([getDeployedBuoys(), listReports(5), listDispatches(1)]).then((res) => {
      if (!alive) return
      if (res[0].status === 'fulfilled') setBuoys(res[0].value)
      if (res[1].status === 'fulfilled') setReports(res[1].value)
      if (res[2].status === 'fulfilled') setLatestDispatch(res[2].value[0] ?? null)
      setLoaded(true)
    })
    return () => {
      alive = false
    }
  }, [])

  // ── Boot sequence: the hero headline rises in character-by-character
  //    (SplitText with per-char masks), then the supporting copy fades up. ──
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const root = heroRef.current
        if (!root) return
        const h1 = root.querySelector('h1')
        const split = h1 ? SplitText.create(h1, { type: 'chars', mask: 'chars' }) : null
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        if (split) tl.from(split.chars, { yPercent: 115, opacity: 0, duration: 0.7, stagger: 0.045 })
        tl.from(
          root.querySelectorAll('[data-hero-fade]'),
          { y: 16, opacity: 0, duration: 0.6, stagger: 0.12 },
          split ? '-=0.35' : 0,
        )
        return () => split?.revert()
      })
    },
    { scope: heroRef },
  )

  // Most-recently-updated deployed buoy that has a temperature reading.
  const liveBuoy =
    [...buoys]
      .filter((b) => b.temp !== null)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0] ?? null

  const latestReport = reports[0] ?? null
  const recentReports = reports.slice(0, 4)

  return (
    <div>
      {/* ── MASTHEAD STRIP ───────────────────────────────────────────── */}
      <div className="border-b border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-2.5 flex items-center justify-between gap-4">
          <span className="label">AQUANET 水眸</span>
          <span className="label-mute hidden sm:inline">公民水质观测站 · CITIZEN WATER OBSERVATORY</span>
          <span className="label-mute tnum">NO. 01 / 2026</span>
        </div>
      </div>

      {/* ── HERO STATEMENT ───────────────────────────────────────────── */}
      <section ref={heroRef} className="scanlines max-w-6xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-12 md:pb-16">
        <h1
          className="text-ink"
          style={{ fontSize: 'clamp(2.75rem, 8vw, 6.5rem)', lineHeight: 0.95, letterSpacing: '-0.03em', fontVariationSettings: '"wdth" 92, "opsz" 96' }}
        >
          <span className="zh">看见身边的水。</span>
        </h1>
        <div className="mt-7 grid grid-cols-12 gap-y-6 md:gap-x-10 items-end">
          <p data-hero-fade className="col-span-12 md:col-span-7 text-ink" style={{ fontSize: 'clamp(1.0625rem, 1.5vw, 1.3125rem)', lineHeight: 1.55 }}>
            <span className="zh">
              水质数据不该只压在政府报告里。AquaNet 水眸 用一台 $80 的开源浮标，把 pH、温度、浊度搬到一张所有人都看得见的地图上——每五分钟，记录一次。
            </span>
          </p>
          <div className="col-span-12 md:col-span-5 md:text-right">
            <p data-hero-fade className="label-mute leading-relaxed">
              THE WATER YOU DON&#39;T LOOK AT,<br className="hidden md:inline" /> DISAPPEARS.
            </p>
          </div>
        </div>
      </section>

      {/* ── CONSOLE BENTO ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pb-6">
        <div className="grid grid-cols-12 gap-3 md:gap-4">

          {/* LIVE READINGS — the memorable tile */}
          <div className="tile tile-ink col-span-12 lg:col-span-8 reveal" style={{ minHeight: '20rem' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="signal-dot" aria-hidden="true" />
                <span className="label" style={{ color: 'var(--canvas)' }}>实时观测 · LIVE</span>
              </div>
              <span className="label-mute">每 5 分钟 · EVERY 5 MIN</span>
            </div>

            {liveBuoy ? (
              <>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <Readout label="温度 · TEMP" value={liveBuoy.temp} decimals={1} unit="°C" />
                  <Readout label="酸碱 · pH" value={liveBuoy.ph} decimals={2} unit="" />
                  <Readout label="浊度 · TURB" value={liveBuoy.turbidity} decimals={0} unit="NTU" />
                </div>
                <div className="mt-8 pt-5 border-t border-canvas/20 flex flex-wrap items-baseline justify-between gap-3">
                  <span className="label" style={{ color: 'var(--canvas)' }}>{liveBuoy.name}</span>
                  <span className="label-mute tnum">
                    {liveBuoy.lat?.toFixed(4)}°N · {liveBuoy.lng?.toFixed(4)}°E · 更新于 {fmtRelative(liveBuoy.updated_at)}
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-8">
                <div className="readout readout-lg" style={{ color: 'var(--canvas)' }}>—— · —— · ——</div>
                <p className="article-body mt-6 max-w-md" style={{ color: 'rgba(250,250,247,0.72)' }}>
                  <span className="zh">第一台浮标还没下水。</span>
                </p>
                <div className="mt-7 pt-5 border-t border-canvas/20 flex flex-wrap items-baseline justify-between gap-3">
                  <span className="label" style={{ color: 'var(--canvas)' }}>等待首次部署</span>
                  <span className="label-mute">小径湾 · 惠州 · MID-JUNE 2026</span>
                </div>
              </div>
            )}
          </div>

          {/* MAP tile */}
          <Link to="/map" className="tile tile-link col-span-12 sm:col-span-6 lg:col-span-4 reveal flex flex-col justify-between" style={{ minHeight: '20rem' }}>
            <div className="flex items-center justify-between">
              <span className="label">地图 · MAP</span>
              <Arrow />
            </div>
            <div>
              <div className="readout readout-lg tnum">{loaded ? <Counter value={buoys.length} /> : '–'}</div>
              <p className="label-mute mt-3">个浮标在线 · BUOYS DEPLOYED</p>
            </div>
            <p className="article-body text-small" style={{ color: 'var(--mute)' }}>
              <span className="zh">在地图上看每一台浮标的实时读数与公众来信。</span>
            </p>
          </Link>

          {/* LATEST DISPATCH tile */}
          <Link to="/dispatches" className="tile tile-link col-span-12 sm:col-span-6 lg:col-span-7 reveal flex flex-col justify-between" style={{ minHeight: '13rem' }}>
            <div className="flex items-center justify-between">
              <span className="label">团队手记 · FIELD</span>
              <Arrow />
            </div>
            {latestDispatch ? (
              <div className="mt-5">
                <h3 className="text-ink" style={{ fontSize: 'clamp(1.375rem, 2.2vw, 1.875rem)', lineHeight: 1.15 }}>{latestDispatch.title}</h3>
                <p className="label-mute mt-3 tnum">{latestDispatch.author_name} · {fmtDateEn(latestDispatch.published_at)}</p>
              </div>
            ) : (
              <p className="article-body mt-5" style={{ color: 'var(--mute)' }}><span className="zh">第一篇手记，等下一次出海。</span></p>
            )}
          </Link>

          {/* LATEST LETTER tile */}
          <Link to="/reports" className="tile tile-link col-span-12 sm:col-span-6 lg:col-span-5 reveal flex flex-col justify-between" style={{ minHeight: '13rem' }}>
            <div className="flex items-center justify-between">
              <span className="label">公众来信 · LETTERS</span>
              <Arrow />
            </div>
            {latestReport ? (
              <div className="mt-5">
                <p className="article-body line-clamp-3" style={{ color: 'var(--ink)' }}><span className="zh">{latestReport.description}</span></p>
                <p className="label-mute mt-3 tnum">{latestReport.reporter_name?.trim() || '匿名'} · {fmtRelative(latestReport.created_at)}</p>
              </div>
            ) : (
              <p className="article-body mt-5" style={{ color: 'var(--mute)' }}><span className="zh">还没有来信。期待你写第一封。</span></p>
            )}
          </Link>

          {/* CTA band */}
          <div className="tile col-span-12 reveal flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-ink" style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)', lineHeight: 1.1 }}>
                <span className="zh">想一起把这条河看清楚？</span>
              </h2>
              <p className="article-body text-small mt-3 max-w-xl" style={{ color: 'var(--mute)' }}>
                <span className="zh">不需要写代码，不需要焊电路。去看一眼身边那片水，告诉我们你看见了什么。</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link to="/login" className="btn">登记观察者</Link>
              <Link to="/reports" className="btn-outline">写一封来信</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — numbered flow ─────────────────────────────── */}
      <section className="border-t border-ink mt-12">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-24">
          <div className="flex items-baseline justify-between mb-12">
            <span className="label">怎么运作 · HOW IT WORKS</span>
            <span className="label-mute hidden sm:inline">SENSE → UPLOAD → OPEN</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-x-12">
            {STEPS.map((s, i) => (
              <div key={s.n} className={`reveal ${i > 0 ? 'md:border-l border-line md:pl-12' : ''}`}>
                <div className="flex items-baseline gap-4">
                  <span className="section-numeral" style={{ fontSize: '3.5rem' }}>{s.n}</span>
                  <span className="label-micro" style={{ transform: 'translateY(-0.4rem)' }}>{s.en}</span>
                </div>
                <h3 className="text-ink mt-3" style={{ fontSize: '1.5rem' }}><span className="zh">{s.zh}</span></h3>
                <p className="article-body text-small mt-4" style={{ color: 'var(--ink)' }}><span className="zh">{s.body}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE BUOY — hardware showcase (asymmetric) ────────────────── */}
      <section className="border-t border-ink bg-ink text-canvas">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20 md:py-28 grid grid-cols-12 gap-y-12 md:gap-x-14 items-center">
          <figure className="col-span-12 md:col-span-5 reveal">
            <div className="rounded-lg overflow-hidden border border-canvas/20" style={{ background: 'rgba(250,250,247,0.04)' }}>
              <img src="/buoy-hero.png" alt="AquaNet 水眸 浮标 — Blender render" className="w-full object-cover" loading="lazy" />
            </div>
            <figcaption className="mt-3">
              <span className="label-micro" style={{ color: 'rgba(250,250,247,0.55)' }}>水眸浮标 · 3D 渲染</span>
            </figcaption>
          </figure>

          <div className="col-span-12 md:col-span-7 reveal">
            <div className="label-micro" style={{ color: 'rgba(250,250,247,0.55)' }}>这台小仪器 · THE INSTRUMENT</div>
            <div className="flex items-baseline gap-4 mt-4">
              <span className="zh" style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', fontFamily: '"Noto Serif SC", serif', lineHeight: 0.9 }}>水眸</span>
              <span className="label" style={{ color: 'rgba(250,250,247,0.7)' }}>AQUANET</span>
            </div>
            <p className="mt-4" style={{ fontSize: '1.25rem', fontStyle: 'italic', color: 'rgba(250,250,247,0.75)', fontFamily: '"Noto Serif SC", serif' }}>
              The eye of the water.
            </p>

            <p className="article-body mt-9 max-w-xl" style={{ fontSize: '1.0625rem', color: 'rgba(250,250,247,0.85)' }}>
              <span className="zh">
                一个能漂在水面的小仪器，替你盯着身边那片水。它把看不见的变化——水温升高、酸碱失衡、悄悄变浑——变成一条任何人都能读懂的曲线。
              </span>
            </p>

            <p className="article-body text-small mt-6 max-w-xl" style={{ color: 'rgba(250,250,247,0.6)' }}>
              <span className="zh">开源、便宜、人人可造。我们想让它像一盏路灯那样普通——哪里有水，哪里就能有一台。</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── THREE PRINCIPLES — ruled columns ─────────────────────────── */}
      <section className="border-t border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-24">
          <span className="label">三条主张 · PRINCIPLES</span>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-y-10 md:gap-x-10">
            {PRINCIPLES.map((p) => (
              <article key={p.n} className="reveal border-t border-ink pt-6">
                <div className="flex items-baseline justify-between">
                  <span className="label tnum">{p.n}</span>
                  <h3 className="text-ink" style={{ fontSize: '1.375rem' }}><span className="zh">{p.zh}</span></h3>
                </div>
                <p className="article-body text-small mt-5" style={{ color: 'var(--ink)' }}><span className="zh">{p.body}</span></p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT LETTERS — instrument rows ─────────────────────────── */}
      {recentReports.length > 0 && (
        <section className="border-t border-ink">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-24">
            <div className="flex items-baseline justify-between mb-10">
              <span className="label">近期来信 · RECENT LETTERS</span>
              <Link to="/reports" className="label hover:text-signal transition-colors">全部来信 ↗</Link>
            </div>
            <div className="divide-y divide-line border-t border-line">
              {recentReports.map((r) => (
                <Link key={r.id} to="/reports" className="group py-6 md:py-7 grid grid-cols-12 gap-y-2 md:gap-x-8">
                  <div className="col-span-12 md:col-span-2">
                    <div className="label-mute tnum">{fmtRelative(r.created_at)}</div>
                    <span
                      className="label inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full"
                      style={{ border: `1px solid ${sevColor(r.severity)}`, color: sevColor(r.severity) }}
                    >
                      {r.severity === 'high' && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--signal)' }} />}
                      {SEVERITY_LABEL[r.severity]}
                    </span>
                  </div>
                  <div className="col-span-12 md:col-span-8">
                    <p className="article-body line-clamp-2 group-hover:text-signal transition-colors" style={{ color: 'var(--ink)' }}>
                      <span className="zh">{r.description}</span>
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-2 md:text-right">
                    <span className="label-mute normal-case tracking-normal">{r.reporter_name?.trim() || '匿名'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOUNDER NOTE — the heart of it ───────────────────────────── */}
      <section className="border-t border-ink bg-ink text-canvas">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20 md:py-28 grid grid-cols-12 gap-y-12 md:gap-x-12">
          <figure className="col-span-12 md:col-span-5">
            <img src={PORTRAIT_IMG} alt="A river bank at dusk." className="w-full h-[52vh] object-cover rounded-lg" loading="lazy" />
            <figcaption className="mt-3 flex items-baseline justify-between gap-4">
              <span className="label-micro" style={{ color: 'rgba(250,250,247,0.6)' }}><span className="zh">湖南 · 黄昏</span></span>
              <span className="label-micro" style={{ color: 'rgba(250,250,247,0.4)' }}>PHOTO · 叶承祖</span>
            </figcaption>
          </figure>

          <div className="col-span-12 md:col-span-7 md:pl-2">
            <span className="section-numeral" style={{ color: 'var(--canvas)' }}>01</span>
            <div className="label-micro mt-4" style={{ color: 'rgba(250,250,247,0.55)' }}>起点 · A NOTE FROM THE FOUNDER</div>
            <p className="mt-8 leading-[1.25]" style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.5rem)', color: 'var(--canvas)', fontVariationSettings: '"wdth" 90' }}>
              <span className="zh">「这两片水教我同一件事：水问题不是远方的事，是身边的事。」</span>
            </p>
            <div className="article-body mt-9 max-w-2xl" style={{ color: 'rgba(250,250,247,0.78)' }}>
              <p>
                <span className="zh">
                  小时候过年回湖南，爷爷指着村后那条又黑又臭的河说：「这条河小时候是清的。」我当时没听懂。后来到惠州小径湾念书，学校外那片人工湖一到夏天就泛绿、发臭，离商业街只有十五米，却没人在意。我每天从它旁边走过——几百次。AquaNet 水眸 不是一家公司，是一个高中生的笨办法：在那片水边放一台浮标，让它替我们一直看着。
                </span>
              </p>
            </div>
            <p className="label-mute mt-9" style={{ color: 'rgba(250,250,247,0.6)' }}>叶承祖 · YIP SHING CHO · 17 · 创办人</p>
          </div>
        </div>
      </section>

      {/* ── COMMITMENT BAND — mid-June first deployment ──────────────── */}
      <section className="border-t border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="max-w-md">
            <span className="label-micro">承诺 · COMMITMENT</span>
            <h2 className="text-ink mt-4" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', lineHeight: 1.05, fontVariationSettings: '"wdth" 92' }}>
              <span className="zh">六月中，第一台浮标，下水。</span>
            </h2>
            <p className="article-body text-small mt-4" style={{ color: 'var(--mute)' }}>
              <span className="zh">就放进小径湾那片泛绿的人工湖。从那天起，这片水第一次有人盯着——每五分钟，记录一次，全部公开。</span>
            </p>
          </div>
          <div className="flex items-end gap-8 shrink-0">
            <div>
              <div className="readout readout-md tnum">5</div>
              <div className="label-micro mt-2">分钟一次 · EVERY 5 MIN</div>
            </div>
            <div>
              <div className="readout readout-md tnum">{loaded ? <Counter value={buoys.length} /> : '–'}</div>
              <div className="label-micro mt-2">在线 · ONLINE</div>
            </div>
            <div>
              <div className="readout readout-md">∞</div>
              <div className="label-micro mt-2">开放 · OPEN SOURCE</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ── Subcomponents ─────────────────────────────────────────────────── */

/* Counts up to `value` when scrolled into view (instrument settling its reading).
 * Renders the real value by default so no-JS / reduced-motion users see it static;
 * tabular-nums keeps the width fixed so the count-up never shifts layout. */
function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const obj = { v: 0 }
        el.textContent = (0).toFixed(decimals)
        const tween = gsap.to(obj, {
          v: value,
          duration: 1.1,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = obj.v.toFixed(decimals)
          },
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        })
        return () => {
          tween.scrollTrigger?.kill()
          tween.kill()
          el.textContent = value.toFixed(decimals)
        }
      })
    },
    { dependencies: [value, decimals], scope: ref },
  )
  return (
    <span ref={ref} className="tnum">
      {value.toFixed(decimals)}
    </span>
  )
}

function Readout({ label, value, unit, decimals = 0 }: { label: string; value: number | null; unit: string; decimals?: number }) {
  return (
    <div>
      <div className="label-mute" style={{ color: 'rgba(250,250,247,0.55)' }}>{label}</div>
      <div className="readout readout-lg mt-2" style={{ color: 'var(--canvas)' }}>
        {value !== null ? <Counter value={value} decimals={decimals} /> : '—'}
        {unit && <span style={{ fontSize: '0.4em', marginLeft: '0.15em', color: 'rgba(250,250,247,0.55)' }}>{unit}</span>}
      </div>
    </div>
  )
}

function Arrow() {
  return <span className="label" aria-hidden="true" style={{ fontSize: '0.875rem' }}>↗</span>
}
