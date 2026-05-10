import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Send, Loader2, MapPin, AlertCircle } from 'lucide-react'
import type { Report, NewReport } from '../lib/types'
import { listReports, submitReport } from '../services/reportService'

/* ────────────────────────────────────────────────────────────────────────────
 * ReportsPage — 公众来信 · LETTERS FROM THE PUBLIC
 *
 * Anyone can read; anyone can submit. No auth required (RLS opens the
 * gate). Reads as a magazine "letters from readers" column with a
 * submit-a-letter form at the bottom.
 * ──────────────────────────────────────────────────────────────────────────── */

const SEVERITY_META: Record<
  'low' | 'medium' | 'high',
  { zh: string; en: string; tone: string }
> = {
  low: { zh: '关注', en: 'NOTE', tone: 'text-ocean-700 border-ocean-300 bg-ocean-50' },
  medium: { zh: '留意', en: 'WATCH', tone: 'text-sea-800 border-sea-400 bg-sea-50' },
  high: { zh: '紧急', en: 'URGENT', tone: 'text-[#a24b29] border-[#c8704c]/60 bg-[#f5e7dd]' },
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const delta = (Date.now() - t) / 1000
  if (delta < 60) return '刚刚'
  if (delta < 3600) return `${Math.floor(delta / 60)} 分钟前`
  if (delta < 86_400) return `${Math.floor(delta / 3600)} 小时前`
  if (delta < 86_400 * 30) return `${Math.floor(delta / 86_400)} 天前`
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const SHENZHEN_LAT = 22.5431
const SHENZHEN_LNG = 114.0579

export const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Submit form state
  const [reporterName, setReporterName] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState<string>(String(SHENZHEN_LAT))
  const [lng, setLng] = useState<string>(String(SHENZHEN_LNG))
  const [severity, setSeverity] = useState<NewReport['severity']>('medium')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [justSubmitted, setJustSubmitted] = useState(false)

  useEffect(() => {
    let alive = true
    listReports()
      .then((r) => alive && setReports(r))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const created = await submitReport({
        reporter_name: reporterName.trim() || null,
        description: description.trim(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        severity,
      })
      setReports((prev) => [created, ...prev])
      setReporterName('')
      setDescription('')
      setSeverity('medium')
      setJustSubmitted(true)
      setTimeout(() => setJustSubmitted(false), 3500)
    } catch (err) {
      setSubmitError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-sand-50 text-ocean-950">
      {/* ─── 00 · MASTHEAD ──────────────────────────────────────────────── */}
      <header className="bg-grain bg-sand-50 border-b-[3px] border-double border-ocean-900/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-20 md:pt-14 md:pb-24">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mono-label text-ocean-700 mb-12 md:mb-16 pb-3 border-b border-ocean-300/70">
            <span>AQUANET 水眸 · 第一期 · ISSUE 01</span>
            <span className="hidden sm:inline">FROM THE PUBLIC · 来信栏</span>
            <span className="text-sea-700">公众来信 · LETTERS</span>
          </div>

          <div className="grid grid-cols-12 gap-y-10 md:gap-x-10 lg:gap-x-16">
            <div className="col-span-12 lg:col-span-8">
              <p className="section-eyebrow text-sea-700 mb-7">来信 · LETTERS</p>
              <h1 className="font-heading font-semibold text-ocean-950 leading-[0.95] tracking-tight text-[clamp(2.25rem,6vw,5rem)]">
                你看见的<span className="display-italic text-sea-700">那条水</span>，<br />
                请<span className="display-italic text-sand-700">告诉我们</span>。
              </h1>
              <div className="mt-10 flex items-center gap-4 mono-label text-ocean-600">
                <span className="rule-fade w-12 text-ocean-400" />
                LETTERS DESK · 编辑部
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l lg:border-ocean-300/80 flex flex-col justify-end">
              <div className="mono-label text-ocean-600 mb-4">EDITORIAL NOTE · 编者按</div>
              <p className="font-body text-base md:text-lg text-ocean-800 leading-[1.7]">
                每一份来信都会留在这里——<span className="font-semibold text-ocean-950">异味、油膜、翻白肚的鱼、突如其来的泡沫</span>——都是身边水环境的真实纹理。
              </p>
              <div className="mt-7 pt-5 border-t border-ocean-200/80 mono-label-sm text-ocean-500 leading-[1.9]">
                Letters from anyone,
                <br />
                anywhere — anonymity OK,
                <br />
                location required.
              </div>
            </aside>
          </div>
        </div>
      </header>

      {/* ─── §01 · ALL LETTERS ──────────────────────────────────────────── */}
      <section className="bg-sand-50 bg-grain reveal">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 md:py-32">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-14 md:mb-16 pb-4 border-b border-ocean-200">
            <h2 className="section-eyebrow text-ocean-900">
              01 · 来信存档 · LETTER ARCHIVE
            </h2>
            <span className="mono-label text-ocean-500">
              {loading ? 'LOADING · 加载中' : `${reports.length} ENTRIES · 共 ${reports.length} 条`}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-ocean-500" />
            </div>
          ) : error ? (
            <div className="border border-ocean-300 bg-white/60 backdrop-blur-sm p-10 text-center">
              <AlertCircle className="w-8 h-8 text-[#a24b29] mx-auto mb-4" strokeWidth={1.5} />
              <p className="display-italic text-2xl text-ocean-950 mb-2">读不到来信。</p>
              <p className="mono-label text-ocean-600">{error}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-24 text-center">
              <p className="display-italic text-3xl text-ocean-900">还没有来信。</p>
              <p className="mt-3 mono-label text-ocean-500">BE THE FIRST · 期待你写第一封</p>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-y-12 md:gap-y-14 gap-x-6 md:gap-x-12">
              {reports.map((r, i) => {
                const sev = SEVERITY_META[r.severity]
                return (
                  <article
                    key={r.id}
                    className={[
                      'col-span-12 md:col-span-6',
                      i % 2 === 1 ? 'md:mt-8' : '',
                    ].join(' ')}
                  >
                    {/* Top meta row */}
                    <div className="flex items-baseline justify-between gap-3 mb-5">
                      <div className="flex items-baseline gap-3">
                        <span className={`mono-label-sm px-2 py-1 border ${sev.tone}`}>
                          {sev.en} · {sev.zh}
                        </span>
                        <span className="mono-label-sm text-ocean-500">
                          {formatRelative(r.created_at)}
                        </span>
                      </div>
                      <span className="mono-label-sm text-ocean-400 tabular-nums">
                        №{String(i + 1).padStart(3, '0')}
                      </span>
                    </div>

                    {/* Reporter line */}
                    <div className="font-heading text-2xl md:text-[1.7rem] text-ocean-950 leading-tight">
                      <span className="display-italic text-sea-700">
                        {r.reporter_name && r.reporter_name.trim() ? r.reporter_name : '匿名'}
                      </span>
                      <span className="text-ocean-700 ml-2 font-body text-base">来信</span>
                    </div>

                    {/* Hairline */}
                    <div className="mt-4 mb-5 rule-fade w-12 text-ocean-300" />

                    {/* Body */}
                    <p className="text-ocean-800 leading-[1.85] text-[1rem] whitespace-pre-line">
                      {r.description}
                    </p>

                    {/* Footer with location */}
                    <div className="mt-6 flex items-baseline gap-3 mono-label-sm text-ocean-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                      <span className="tabular-nums">
                        {Number(r.lat).toFixed(4)}, {Number(r.lng).toFixed(4)}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── §02 · SUBMIT — invert dark for emphasis ───────────────────── */}
      <section className="relative bg-ocean-950 text-white overflow-hidden reveal">
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

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-28 md:py-36">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-14 md:mb-20 pb-4 border-b border-white/15">
            <h2 className="section-eyebrow text-sea-300">
              02 · 投信 · SUBMIT A LETTER
            </h2>
            <span className="mono-label text-ocean-300">PUBLIC FORM · 公开提交</span>
          </div>

          <div className="grid grid-cols-12 gap-y-12 gap-x-6 md:gap-x-12">
            {/* Sidebar: pull quote + instructions */}
            <aside className="col-span-12 lg:col-span-4">
              <p className="display-italic text-[clamp(1.4rem,2.5vw,2rem)] text-white leading-[1.22]">
                你看见的，<br />
                就是<span className="text-sea-300">数据</span>的开头。
              </p>
              <div className="mt-8 mb-8 rule-fade w-16 text-sea-400/60" />
              <p className="text-ocean-200 leading-[1.85] text-[0.96rem]">
                匿名也可以。具体一些更好——
                <span className="text-white">什么时候、什么地方、闻起来什么味、看到了什么。</span>
              </p>
              <div className="mt-8 mono-label-sm text-ocean-300 leading-[1.85]">
                If you don&apos;t know exact<br />
                coordinates, the Shenzhen<br />
                center is pre-filled — adjust<br />
                to the closest landmark.
              </div>
            </aside>

            {/* Form */}
            <div className="col-span-12 lg:col-span-8 lg:pl-10 lg:border-l lg:border-white/15">
              {justSubmitted ? (
                <div className="border border-sea-400/40 bg-white/[0.04] backdrop-blur-sm p-10 md:p-14 text-center">
                  <p className="display-italic text-3xl md:text-4xl text-white leading-tight mb-4">
                    收到了。谢谢你写这封信。
                  </p>
                  <p className="mono-label text-sea-300">
                    LETTER FILED · 已归档到来信存档
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-9">
                  {/* Name (optional) */}
                  <div>
                    <label htmlFor="reporter" className="block mono-label text-sea-300 mb-3">
                      01 · 署名 · NAME (OPTIONAL)
                    </label>
                    <input
                      id="reporter"
                      type="text"
                      autoComplete="name"
                      className="w-full bg-transparent border-0 border-b-2 border-white/30 focus:border-sea-300 focus:outline-none focus:ring-0 px-0 py-3 font-heading text-xl text-white placeholder:text-white/30 placeholder:font-body placeholder:font-normal placeholder:text-base transition-colors"
                      placeholder="阿May / Anonymous OK"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      maxLength={60}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="desc" className="block mono-label text-sea-300 mb-3">
                      02 · 信的内容 · YOUR LETTER
                    </label>
                    <textarea
                      id="desc"
                      rows={6}
                      required
                      className="w-full bg-white/[0.04] border-2 border-white/15 focus:border-sea-300 focus:outline-none focus:ring-0 px-4 py-3 font-body text-base text-white placeholder:text-white/30 leading-[1.8] transition-colors resize-y"
                      placeholder="说说你看到的那条水。中英文都行。"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={2000}
                    />
                  </div>

                  {/* Coords + severity row */}
                  <div className="grid grid-cols-12 gap-x-6 gap-y-9">
                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="lat" className="block mono-label text-sea-300 mb-3">
                        03 · 纬度 · LAT
                      </label>
                      <input
                        id="lat"
                        type="number"
                        step="0.0001"
                        required
                        className="w-full bg-transparent border-0 border-b-2 border-white/30 focus:border-sea-300 focus:outline-none focus:ring-0 px-0 py-3 font-heading text-xl text-white tabular-nums transition-colors"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="lng" className="block mono-label text-sea-300 mb-3">
                        04 · 经度 · LNG
                      </label>
                      <input
                        id="lng"
                        type="number"
                        step="0.0001"
                        required
                        className="w-full bg-transparent border-0 border-b-2 border-white/30 focus:border-sea-300 focus:outline-none focus:ring-0 px-0 py-3 font-heading text-xl text-white tabular-nums transition-colors"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-4">
                      <label htmlFor="sev" className="block mono-label text-sea-300 mb-3">
                        05 · 严重度 · SEVERITY
                      </label>
                      <select
                        id="sev"
                        className="w-full bg-transparent border-0 border-b-2 border-white/30 focus:border-sea-300 focus:outline-none focus:ring-0 px-0 py-3 font-heading text-xl text-white transition-colors appearance-none cursor-pointer"
                        value={severity}
                        onChange={(e) =>
                          setSeverity(e.target.value as NewReport['severity'])
                        }
                        style={{
                          backgroundImage:
                            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%237dd4ba' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.25rem center',
                        }}
                      >
                        <option value="low" className="bg-ocean-950">关注 · NOTE</option>
                        <option value="medium" className="bg-ocean-950">留意 · WATCH</option>
                        <option value="high" className="bg-ocean-950">紧急 · URGENT</option>
                      </select>
                    </div>
                  </div>

                  {submitError && (
                    <div className="border border-[#c8704c]/60 bg-[#c8704c]/10 px-4 py-3 mono-label-sm text-[#f5b08c]">
                      {submitError}
                    </div>
                  )}

                  {/* Submit row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <p className="mono-label-sm text-ocean-300 leading-[1.7]">
                      BY SENDING, YOUR LETTER<br />
                      WILL BE ARCHIVED PUBLICLY.
                    </p>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="group inline-flex items-center gap-3 px-8 py-3.5 bg-sea-400 hover:bg-sea-300 text-ocean-950 mono-label transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                          SENDING · 寄出中
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" strokeWidth={1.8} />
                          SEND · 寄出来信
                          <ArrowUpRight
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            strokeWidth={1.8}
                          />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── COLOPHON ──────────────────────────────────────────────────── */}
      <section className="bg-ocean-50 border-t border-ocean-200/80 reveal">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-24 text-center">
          <p className="mono-label text-ocean-700 mb-7">— 后记 · COLOPHON</p>
          <p className="display-italic text-[clamp(1.4rem,2.8vw,2rem)] text-ocean-900 leading-[1.18] mb-8">
            一封信不够，<br />
            <span className="text-sea-700">一千封</span>就开始<br />
            看得见。
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 mono-label text-ocean-700">
            <Link
              to="/map"
              className="border-b border-ocean-400 pb-1 hover:text-ocean-950 hover:border-ocean-900 transition-colors inline-flex items-center gap-1"
            >
              SEE THE MAP · 看实时地图
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
            <span className="text-ocean-300 select-none" aria-hidden>·</span>
            <Link
              to="/dispatches"
              className="border-b border-ocean-400 pb-1 hover:text-ocean-950 hover:border-ocean-900 transition-colors inline-flex items-center gap-1"
            >
              READ THE TEAM&apos;S NOTES · 团队手记
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
