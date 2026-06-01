import { useEffect, useState } from 'react'
import type { Dispatch } from '../lib/types'
import { listDispatches } from '../services/dispatchService'

/* ────────────────────────────────────────────────────────────────────────────
 * DispatchesPage — AquaNet 水眸 · Team Notes · Instrument Console
 *
 * Typographic masthead + hero, latest dispatch in an ink tile, the rest as a
 * hairline-divided archive of (date · title · author) rows. All fetch logic
 * preserved verbatim. Dispatch model: { id, title, body, author_name, published_at }.
 * ──────────────────────────────────────────────────────────────────────────── */

function formatDateZh(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatDateEn(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()
}

export const DispatchesPage = () => {
  const [dispatches, setDispatches] = useState<Dispatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    listDispatches()
      .then((d) => alive && setDispatches(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const [featured, ...rest] = dispatches

  return (
    <div>
      {/* ── MASTHEAD + HERO ──────────────────────────────────────────── */}
      <div className="border-b border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-2.5 flex items-center justify-between gap-4">
          <span className="label">团队手记 · FIELD DISPATCHES</span>
          <span className="label-mute tnum">{loading ? '——' : `${dispatches.length} 篇`}</span>
        </div>
      </div>

      <section className="scanlines max-w-6xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-14 md:pb-20">
        <h1 className="text-ink" style={{ fontSize: 'clamp(2.75rem, 8vw, 6rem)', lineHeight: 0.95, letterSpacing: '-0.03em', fontVariationSettings: '"wdth" 92, "opsz" 96' }}>
          <span className="zh">团队手记</span>
        </h1>
        <p className="article-body mt-8 max-w-2xl" style={{ fontSize: '1.1875rem' }}>
          <span className="zh">只发已经发生过的事——观测、走访、修缮、修电路。不写预想、不写宣言。下一篇等下一次出海。</span>
        </p>
      </section>

      {/* ── STATES ───────────────────────────────────────────────────── */}
      {loading && (
        <section className="border-t border-line">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
            <p className="label-mute">读取手记中 · LOADING</p>
          </div>
        </section>
      )}

      {!loading && error && (
        <section className="border-t border-line" role="alert">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20">
            <h2 className="text-ink" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}><span className="zh">读不到手记。</span></h2>
            <div className="tile mt-6 max-w-xl">
              <div className="label mb-2">错误 · ERROR</div>
              <p className="article-body text-small">{error}</p>
            </div>
          </div>
        </section>
      )}

      {!loading && !error && dispatches.length === 0 && (
        <section className="border-t border-line">
          <div className="max-w-5xl mx-auto px-6 lg:px-10 py-24 md:py-32">
            <p className="text-ink" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}><span className="zh">还没有手记。</span></p>
          </div>
        </section>
      )}

      {/* ── FEATURED — latest dispatch on ink ────────────────────────── */}
      {!loading && !error && featured && (
        <section className="border-t border-ink bg-ink text-canvas">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20 md:py-28 grid grid-cols-12 gap-y-10 md:gap-x-12">
            <aside className="col-span-12 md:col-span-3">
              <div className="flex items-center gap-2 mb-6">
                <span className="signal-dot" aria-hidden="true" />
                <span className="label" style={{ color: 'var(--canvas)' }}>最新 · LATEST</span>
              </div>
              <div className="label-mute tnum">{formatDateEn(featured.published_at)}</div>
              <div className="label-mute tnum mt-1">{formatDateZh(featured.published_at)}</div>
              <div className="label mt-7 pt-5 border-t border-canvas/25" style={{ color: 'var(--canvas)' }}>
                {featured.author_name}
              </div>
            </aside>

            <div className="col-span-12 md:col-span-9">
              <h2 className="leading-[1.06]" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', color: 'var(--canvas)', fontVariationSettings: '"wdth" 92' }}>
                {featured.title}
              </h2>
              <div className="article-body mt-9 max-w-2xl" style={{ color: 'rgba(250,250,247,0.82)' }}>
                {featured.body.split(/\n{2,}/).map((para, j) => (
                  <p key={j} className={`whitespace-pre-line ${j > 0 ? 'mt-5' : ''}`}>
                    <span className="zh">{para}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ARCHIVE — instrument rows ────────────────────────────────── */}
      {!loading && !error && rest.length > 0 && (
        <section className="border-t border-ink">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-14 md:pt-16 pb-4">
            <span className="label">存档 · ARCHIVE · {rest.length}</span>
          </div>
          <div className="max-w-6xl mx-auto px-6 lg:px-10 divide-y divide-line">
            {rest.map((d) => (
              <article key={d.id} className="py-9 md:py-11 grid grid-cols-12 gap-y-3 md:gap-x-8 group">
                <div className="col-span-12 md:col-span-2">
                  <div className="label tnum">{formatDateEn(d.published_at)}</div>
                  <div className="label-mute tnum mt-1">{formatDateZh(d.published_at)}</div>
                </div>
                <div className="col-span-12 md:col-span-8">
                  <h3 className="text-ink leading-[1.18] group-hover:text-signal transition-colors" style={{ fontSize: 'clamp(1.375rem, 2.4vw, 2rem)' }}>
                    {d.title}
                  </h3>
                  <p className="article-body text-small mt-3 max-w-prose line-clamp-2 whitespace-pre-line" style={{ color: 'var(--mute)' }}>
                    <span className="zh">{d.body.split(/\n{2,}/)[0]}</span>
                  </p>
                </div>
                <aside className="col-span-12 md:col-span-2 md:text-right">
                  <div className="label-micro">作者 · BY</div>
                  <div className="label-mute mt-2 normal-case tracking-normal">{d.author_name}</div>
                </aside>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
