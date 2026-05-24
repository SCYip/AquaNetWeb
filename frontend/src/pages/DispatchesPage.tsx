import { useEffect, useState } from 'react'
import type { Dispatch } from '../lib/types'
import { listDispatches } from '../services/dispatchService'

/* ────────────────────────────────────────────────────────────────────────────
 * DispatchesPage — AquaNet 水眸 · Team Notes
 *
 * WIRED-discipline edition. A full-bleed river photo opens the page, the
 * latest dispatch sits in a full-bleed ink slab, and the rest run as a hairline-
 * divided archive of (date · title · author) rows. All fetch logic is preserved
 * verbatim. Dispatch model: { id, title, body, author_name, published_at }.
 * ──────────────────────────────────────────────────────────────────────────── */

const HERO_IMG = 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=2400&q=80&auto=format&fit=crop'

function formatDateZh(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatDateEn(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d
    .toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    })
    .toUpperCase()
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
      {/* ── HERO: full-bleed photo, no veil ──────────────────────────── */}
      <figure className="relative">
        <img
          src={HERO_IMG}
          alt=""
          className="w-full h-[55vh] object-cover"
          loading="eager"
        />
      </figure>

      {/* ── HEADLINE + LEDE ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-20 md:pb-28">
        <h1 className="font-display text-hero text-ink">团队手记</h1>
        <p className="font-body text-lede text-ink mt-8 max-w-2xl">
          只发已经发生过的事——观测、走访、修缮、修电路。不写预想、不写宣言。下一篇等下一次出海。
        </p>
      </section>

      {/* ── STATES: LOADING / ERROR / EMPTY ──────────────────────────── */}
      {loading && (
        <section className="border-t border-line">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
            <p className="meta">读取手记中。</p>
          </div>
        </section>
      )}

      {!loading && error && (
        <section className="border-t border-line" role="alert">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20">
            <h2 className="font-display text-display text-ink">读不到手记。</h2>
            <div className="border border-ink mt-6 px-5 py-4 max-w-xl">
              <div className="meta text-ink mb-1">错误</div>
              <p className="font-body text-body text-ink">{error}</p>
            </div>
          </div>
        </section>
      )}

      {!loading && !error && dispatches.length === 0 && (
        <section className="border-t border-line">
          <div className="max-w-5xl mx-auto px-6 lg:px-10 py-24 md:py-32">
            <p className="font-display text-display text-ink">还没有手记。</p>
          </div>
        </section>
      )}

      {/* ── FEATURED — latest dispatch as full-bleed ink slab ────────── */}
      {!loading && !error && featured && (
        <section className="bg-ink text-canvas">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24 md:py-32 grid grid-cols-12 gap-y-10 md:gap-x-10">
            <aside className="col-span-12 md:col-span-3">
              <div className="font-meta text-meta uppercase tracking-[0.06em] text-canvas/70 tnum">
                {formatDateEn(featured.published_at)}
              </div>
              <div className="font-meta text-meta uppercase tracking-[0.06em] text-canvas/70 mt-2">
                {formatDateZh(featured.published_at)}
              </div>
              <div className="font-meta text-meta uppercase tracking-[0.06em] text-canvas mt-8 pt-6 border-t border-canvas/30">
                {featured.author_name}
              </div>
            </aside>

            <div className="col-span-12 md:col-span-9">
              <h2 className="font-display text-canvas leading-[1.05]" style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }}>
                {featured.title}
              </h2>

              <div className="mt-10 max-w-2xl">
                {featured.body.split(/\n{2,}/).map((para, j) => (
                  <p
                    key={j}
                    className={`font-body text-body text-canvas leading-[1.85] whitespace-pre-line ${
                      j > 0 ? 'mt-6' : ''
                    }`}
                  >
                    {para}
                  </p>
                ))}
              </div>

              <p className="font-meta text-meta uppercase tracking-[0.06em] text-canvas/70 mt-12 tnum">
                {featured.author_name} · {formatDateZh(featured.published_at)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── ARCHIVE — hairline-divided rows on canvas ────────────────── */}
      {!loading && !error && rest.length > 0 && (
        <section className="border-t border-line">
          <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-16 md:pt-20 pb-6">
            <span className="meta tnum">{rest.length} 篇</span>
          </div>

          <div className="max-w-6xl mx-auto px-6 lg:px-10 divide-y divide-line">
            {rest.map((d) => (
              <article
                key={d.id}
                className="py-10 md:py-12 grid grid-cols-12 gap-y-4 md:gap-x-8"
              >
                {/* Left: date in mono */}
                <div className="col-span-12 md:col-span-2">
                  <div className="meta tnum text-ink">{formatDateEn(d.published_at)}</div>
                  <div className="meta mt-1">{formatDateZh(d.published_at)}</div>
                </div>

                {/* Center: title in serif */}
                <div className="col-span-12 md:col-span-8">
                  <h3
                    className="font-display text-ink leading-[1.15]"
                    style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2rem)' }}
                  >
                    {d.title}
                  </h3>
                  <p className="font-body text-body text-mute leading-[1.7] mt-4 max-w-prose line-clamp-2 whitespace-pre-line">
                    {d.body.split(/\n{2,}/)[0]}
                  </p>
                </div>

                {/* Right: author in mute */}
                <aside className="col-span-12 md:col-span-2 md:text-right">
                  <div className="meta">作者</div>
                  <div className="font-body text-body text-mute mt-2">{d.author_name}</div>
                </aside>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
