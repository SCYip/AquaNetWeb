import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Loader2, AlertCircle } from 'lucide-react'
import type { Dispatch } from '../lib/types'
import { listDispatches } from '../services/dispatchService'

/* ────────────────────────────────────────────────────────────────────────────
 * DispatchesPage — 团队手记 · FIELD DISPATCHES
 *
 * Long-form team notes from the AquaNet 水眸 crew. Read-only public view.
 * Each dispatch reads as its own magazine feature: author byline, dateline,
 * big italic title, body with drop-cap on the first paragraph.
 * ──────────────────────────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
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

  return (
    <div className="bg-sand-50 text-ocean-950">
      {/* ─── 00 · MASTHEAD ──────────────────────────────────────────────── */}
      <header className="bg-grain bg-sand-50 border-b-[3px] border-double border-ocean-900/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-20 md:pt-14 md:pb-24">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mono-label text-ocean-700 mb-12 md:mb-16 pb-3 border-b border-ocean-300/70">
            <span>AQUANET 水眸 · 第一期 · ISSUE 01</span>
            <span className="hidden sm:inline">FROM THE TEAM · 团队栏</span>
            <span className="text-sea-700">团队手记 · DISPATCHES</span>
          </div>

          <div className="grid grid-cols-12 gap-y-10 md:gap-x-10 lg:gap-x-16">
            <div className="col-span-12 lg:col-span-8">
              <p className="section-eyebrow text-sea-700 mb-7">手记 · DISPATCHES</p>
              <h1 className="font-heading font-semibold text-ocean-950 leading-[0.95] tracking-tight text-[clamp(2.25rem,6vw,5rem)]">
                我们<span className="display-italic text-sea-700">在水边</span>
                <br />
                <span className="display-italic text-sand-700">看见的</span>。
              </h1>
              <div className="mt-10 flex items-center gap-4 mono-label text-ocean-600">
                <span className="rule-fade w-12 text-ocean-400" />
                FIELD NOTES · 田野手记
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l lg:border-ocean-300/80 flex flex-col justify-end">
              <div className="mono-label text-ocean-600 mb-4">EDITOR&apos;S NOTE · 编者按</div>
              <p className="font-body text-base md:text-lg text-ocean-800 leading-[1.7]">
                每次部署、每次联调、每条让我们想停下来记一笔的事——
                <span className="font-semibold text-ocean-950">慢慢攒成这一栏。</span>
              </p>
              <div className="mt-7 pt-5 border-t border-ocean-200/80 mono-label-sm text-ocean-500 leading-[1.9]">
                Long-form notes from
                <br />
                the people doing the work
                <br />
                at the water&apos;s edge.
              </div>
            </aside>
          </div>
        </div>
      </header>

      {/* ─── DISPATCHES LIST ────────────────────────────────────────────── */}
      <section className="bg-sand-50 bg-grain reveal">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24 md:py-32">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-14 md:mb-16 pb-4 border-b border-ocean-200">
            <h2 className="section-eyebrow text-ocean-900">
              01 · 全部手记 · ALL DISPATCHES
            </h2>
            <span className="mono-label text-ocean-500">
              {loading
                ? 'LOADING · 加载中'
                : `${dispatches.length} ENTRIES · 共 ${dispatches.length} 篇`}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-ocean-500" />
            </div>
          ) : error ? (
            <div className="border border-ocean-300 bg-white/60 backdrop-blur-sm p-10 text-center">
              <AlertCircle className="w-8 h-8 text-[#a24b29] mx-auto mb-4" strokeWidth={1.5} />
              <p className="display-italic text-2xl text-ocean-950 mb-2">读不到手记。</p>
              <p className="mono-label text-ocean-600">{error}</p>
            </div>
          ) : dispatches.length === 0 ? (
            <div className="py-24 text-center">
              <p className="display-italic text-3xl text-ocean-900">还没写出来。</p>
              <p className="mt-3 mono-label text-ocean-500">DRAFTS IN PROGRESS · 还在写</p>
            </div>
          ) : (
            <div className="space-y-24 md:space-y-32">
              {dispatches.map((d, i) => (
                <article key={d.id} className="reveal">
                  {/* Top byline strip */}
                  <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-10 pb-4 border-b border-ocean-200">
                    <div className="flex items-baseline gap-3 mono-label text-ocean-500">
                      <span className="text-ocean-400 tabular-nums">
                        DISPATCH №{String(i + 1).padStart(2, '0')}
                      </span>
                      <span aria-hidden className="text-ocean-300">·</span>
                      <span>{formatDateEn(d.published_at)}</span>
                    </div>
                    <div className="mono-label text-sea-700">
                      BY <span className="text-ocean-950">{d.author_name}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-semibold text-ocean-950 leading-[1.05] tracking-tight text-[clamp(2rem,5vw,3.5rem)] mb-6">
                    {d.title}
                  </h3>

                  {/* Date in Chinese */}
                  <div className="mono-label-sm text-ocean-500 mb-10">
                    {formatDate(d.published_at)} · 写于深圳
                  </div>

                  {/* Hairline */}
                  <div className="rule-fade w-16 text-ocean-300 mb-10" />

                  {/* Body — preserve the line breaks the author wrote */}
                  <div className="prose-aquanet">
                    {d.body.split(/\n{2,}/).map((para, j) => (
                      <p
                        key={j}
                        className={[
                          'text-ocean-800 leading-[1.95] text-[1.05rem]',
                          j === 0 ? 'drop-cap' : 'mt-6',
                          'whitespace-pre-line',
                        ].join(' ')}
                      >
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Sign-off */}
                  <div className="mt-12 flex items-center gap-4 mono-label text-ocean-600">
                    <span className="inline-block w-12 h-px bg-ocean-300" />
                    <span className="text-ocean-950">{d.author_name}</span>
                    <span className="text-ocean-300" aria-hidden>·</span>
                    <span>{formatDate(d.published_at)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── COLOPHON ──────────────────────────────────────────────────── */}
      <section className="bg-ocean-50 border-t border-ocean-200/80 reveal">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-24 text-center">
          <p className="mono-label text-ocean-700 mb-7">— 后记 · COLOPHON</p>
          <p className="display-italic text-[clamp(1.4rem,2.8vw,2rem)] text-ocean-900 leading-[1.18] mb-8">
            写得不快，<br />
            <span className="text-sea-700">但是真的</span>。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 mono-label text-ocean-700">
            <Link
              to="/reports"
              className="border-b border-ocean-400 pb-1 hover:text-ocean-950 hover:border-ocean-900 transition-colors inline-flex items-center gap-1"
            >
              READ THE LETTERS · 公众来信
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
            <span className="text-ocean-300 select-none" aria-hidden>·</span>
            <Link
              to="/map"
              className="border-b border-ocean-400 pb-1 hover:text-ocean-950 hover:border-ocean-900 transition-colors inline-flex items-center gap-1"
            >
              SEE THE LIVE MAP · 实时地图
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
