import { useEffect, useState } from 'react'
import type { Report, NewReport } from '../lib/types'
import { listReports, submitReport } from '../services/reportService'

/* ────────────────────────────────────────────────────────────────────────────
 * ReportsPage — AquaNet 水眸 · Public Letters
 *
 * WIRED-discipline edition. A full-bleed wetland photo opens the page, a
 * centred bare-underline form invites a letter, a plain-text tab strip filters
 * the archive, and each letter sits as a hairline-divided row with date in
 * mono, body in serif, coords in mono. All form state and handlers are
 * preserved verbatim.
 * ──────────────────────────────────────────────────────────────────────────── */

const HERO_IMG = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=2400&q=80&auto=format&fit=crop'

type Severity = 'low' | 'medium' | 'high'

const SEVERITY_LABEL: Record<Severity, string> = {
  low: '关注',
  medium: '留意',
  high: '紧急',
}

function formatExact(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d
    .toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })
    .toUpperCase()
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const delta = (Date.now() - t) / 1000
  if (delta < 60) return '刚刚'
  if (delta < 3600) return `${Math.floor(delta / 60)} 分钟前`
  if (delta < 86_400) return `${Math.floor(delta / 3600)} 小时前`
  if (delta < 86_400 * 30) return `${Math.floor(delta / 86_400)} 天前`
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const SHENZHEN_LAT = 22.5431
const SHENZHEN_LNG = 114.0579

export const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Submit form state — preserved verbatim
  const [reporterName, setReporterName] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState<string>(String(SHENZHEN_LAT))
  const [lng, setLng] = useState<string>(String(SHENZHEN_LNG))
  const [severity, setSeverity] = useState<NewReport['severity']>('medium')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [justSubmitted, setJustSubmitted] = useState(false)

  // Filter — does not alter source list, only the rendered slice
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all')

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

  const visible =
    severityFilter === 'all'
      ? reports
      : reports.filter((r) => r.severity === severityFilter)

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

      {/* ── SECTION 1 · SUBMIT FORM ──────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-20 md:pb-28">
          <h1 className="font-display text-hero text-ink">投信</h1>
          <p className="font-body text-lede text-ink mt-8">
            异味、油膜、翻白肚的鱼、突变的水色——具体一些就好。不需要专业，匿名也可以。
          </p>

          {justSubmitted ? (
            <div className="mt-16 py-12 border-y border-line">
              <p className="font-display text-display text-ink">收到了。</p>
              <p className="font-body text-body text-mute mt-6">已归档到来信存档。</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-14 space-y-10">
              {submitError && (
                <div role="alert" className="border border-ink px-5 py-4">
                  <div className="meta text-ink mb-1">错误</div>
                  <div className="font-body text-body text-ink">{submitError}</div>
                </div>
              )}

              <Field label="署名" hint="留空即匿名">
                <input
                  id="reporter"
                  type="text"
                  autoComplete="name"
                  className="field"
                  placeholder="阿May 或留空"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  maxLength={60}
                  disabled={submitting}
                />
              </Field>

              <Field label="信的内容" hint="中英文都行">
                <textarea
                  id="desc"
                  rows={6}
                  required
                  className="field resize-y leading-[1.7]"
                  placeholder="说说你看到的那条水——什么时候、什么地方、闻起来什么、看到了什么。"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  disabled={submitting}
                />
              </Field>

              <div className="grid grid-cols-2 gap-x-8">
                <Field label="纬度" hint="十进制">
                  <input
                    id="lat"
                    type="number"
                    step="0.0001"
                    required
                    className="field tnum font-meta"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    disabled={submitting}
                  />
                </Field>
                <Field label="经度" hint="十进制">
                  <input
                    id="lng"
                    type="number"
                    step="0.0001"
                    required
                    className="field tnum font-meta"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    disabled={submitting}
                  />
                </Field>
              </div>

              <div>
                <div className="meta mb-4">严重度</div>
                <div className="flex flex-wrap gap-6" role="radiogroup" aria-label="严重度">
                  {(['low', 'medium', 'high'] as Severity[]).map((s) => {
                    const active = severity === s
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSeverity(s)}
                        disabled={submitting}
                        className={`font-body text-body pb-1.5 border-b-2 transition-colors ${
                          active
                            ? 'border-ink text-ink'
                            : 'border-transparent text-mute hover:text-ink'
                        }`}
                      >
                        {SEVERITY_LABEL[s]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-8 border-t border-line flex flex-wrap items-center justify-between gap-4">
                <p className="meta max-w-xs">寄出后，信件将公开归档。</p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? '寄出中…' : '寄出来信'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── SECTION 2 · FILTER TABS ──────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 flex flex-wrap items-baseline justify-between gap-y-4">
          <div className="flex flex-wrap gap-x-8 gap-y-2" role="radiogroup" aria-label="筛选">
            {(['all', 'low', 'medium', 'high'] as const).map((s) => {
              const active = severityFilter === s
              const label = s === 'all' ? '全部' : SEVERITY_LABEL[s]
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSeverityFilter(s)}
                  className={`font-body text-body pb-1.5 border-b-2 transition-colors ${
                    active
                      ? 'border-ink text-ink'
                      : 'border-transparent text-mute hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <span className="meta tnum">{visible.length} / {reports.length}</span>
        </div>
      </section>

      {/* ── SECTION 3 · LETTERS ARCHIVE ──────────────────────────────── */}
      <section>
        {loading ? (
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
            <p className="meta">读取来信中。</p>
          </div>
        ) : error ? (
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20" role="alert">
            <h2 className="font-display text-display text-ink">读不到来信。</h2>
            <div className="border border-ink mt-6 px-5 py-4 max-w-xl">
              <div className="meta text-ink mb-1">错误</div>
              <p className="font-body text-body text-ink">{error}</p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="max-w-3xl mx-auto px-6 lg:px-10 py-24 md:py-32">
            <p className="font-display text-display text-ink">还没有来信。</p>
            <p className="font-body text-lede text-mute mt-6">期待你写第一封。</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20">
            <p className="font-body text-lede text-mute">这个筛选下，没有信。</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-6 lg:px-10 divide-y divide-line">
            {visible.map((r) => (
              <article
                key={r.id}
                className="py-10 md:py-12 grid grid-cols-12 gap-y-4 md:gap-x-8"
              >
                {/* Left: date in mono */}
                <div className="col-span-12 md:col-span-2">
                  <div className="meta tnum text-ink">{formatExact(r.created_at)}</div>
                  <div className="meta mt-1">{formatRelative(r.created_at)}</div>
                  <div className="meta mt-4 text-ink">{SEVERITY_LABEL[r.severity]}</div>
                </div>

                {/* Center: body in serif */}
                <div className="col-span-12 md:col-span-7">
                  <div className="font-body text-body text-ink">
                    <span className="font-display">
                      {r.reporter_name && r.reporter_name.trim() ? r.reporter_name : '匿名'}
                    </span>
                    <span className="text-mute"> · 来信</span>
                  </div>
                  <p className="font-body text-body text-ink leading-[1.8] whitespace-pre-line max-w-prose mt-4">
                    {r.description}
                  </p>
                </div>

                {/* Right: coords in mono */}
                <aside className="col-span-12 md:col-span-3 md:text-right">
                  <div className="meta">坐标</div>
                  <div className="font-meta tnum text-ink text-small mt-2 leading-snug">
                    {Number(r.lat).toFixed(4)}°N
                    <br />
                    {Number(r.lng).toFixed(4)}°E
                  </div>
                </aside>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

/* ── Subcomponents ─────────────────────────────────────────────────── */

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="meta text-ink">{label}</span>
        {hint && <span className="meta">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
