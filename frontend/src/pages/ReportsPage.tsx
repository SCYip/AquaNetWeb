import { useEffect, useState } from 'react'
import type { Report, NewReport } from '../lib/types'
import { listReports, submitReport } from '../services/reportService'

/* ────────────────────────────────────────────────────────────────────────────
 * ReportsPage — AquaNet 水眸 · Public Letters · Instrument Console
 *
 * A telegram-style submission panel (boxed fields, mono labels), a tab strip
 * to filter by severity, and a hairline-divided archive where each letter is
 * an instrument row: timestamp + severity badge left, body center, coords
 * right. All form state + handlers preserved verbatim.
 * ──────────────────────────────────────────────────────────────────────────── */

type Severity = 'low' | 'medium' | 'high'

const SEVERITY_LABEL: Record<Severity, string> = {
  low: '关注',
  medium: '留意',
  high: '紧急',
}

const SEVERITY_EN: Record<Severity, string> = {
  low: 'NOTE',
  medium: 'WATCH',
  high: 'URGENT',
}

function severityColor(s: Severity): string {
  return s === 'high' ? 'var(--signal)' : s === 'medium' ? 'var(--ink)' : 'var(--mute)'
}

function formatExact(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()
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
    severityFilter === 'all' ? reports : reports.filter((r) => r.severity === severityFilter)

  return (
    <div>
      {/* ── MASTHEAD + HERO ──────────────────────────────────────────── */}
      <div className="border-b border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-2.5 flex items-center justify-between gap-4">
          <span className="label">公众来信 · PUBLIC LETTERS</span>
          <span className="label-mute tnum">{loading ? '——' : `${reports.length} 封`}</span>
        </div>
      </div>

      <section className="scanlines max-w-6xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-12 md:pb-16">
        <h1 className="text-ink" style={{ fontSize: 'clamp(2.75rem, 8vw, 6rem)', lineHeight: 0.95, letterSpacing: '-0.03em', fontVariationSettings: '"wdth" 92, "opsz" 96' }}>
          <span className="zh">投信</span>
        </h1>
        <p className="article-body mt-8 max-w-2xl" style={{ fontSize: '1.1875rem' }}>
          <span className="zh">异味、油膜、翻白肚的鱼、突变的水色——具体一些就好。不需要专业，匿名也可以。</span>
        </p>
      </section>

      {/* ── SUBMIT PANEL ─────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 pb-16">
        {justSubmitted ? (
          <div className="tile tile-ink py-12 text-center">
            <div className="flex items-center justify-center gap-2.5 mb-5">
              <span className="signal-dot" aria-hidden="true" />
              <span className="label" style={{ color: 'var(--canvas)' }}>已归档 · FILED</span>
            </div>
            <p className="leading-tight" style={{ fontSize: '2rem', color: 'var(--canvas)', fontVariationSettings: '"wdth" 92' }}>
              <span className="zh">收到了。</span>
            </p>
            <p className="article-body text-small mt-4" style={{ color: 'rgba(250,250,247,0.7)' }}>
              <span className="zh">已归档到来信存档。</span>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="tile">
            <div className="flex items-center gap-2.5 mb-7">
              <span className="signal-dot" aria-hidden="true" />
              <span className="label">新来信 · NEW LETTER</span>
            </div>

            {submitError && (
              <div role="alert" className="border border-signal rounded-md px-4 py-3 mb-6">
                <div className="label mb-1" style={{ color: 'var(--signal)' }}>错误 · ERROR</div>
                <div className="article-body text-small">{submitError}</div>
              </div>
            )}

            <div className="space-y-6">
              <Field label="署名 · NAME" hint="留空即匿名">
                <input id="reporter" type="text" autoComplete="name" className="field-box" placeholder="阿May 或留空" value={reporterName} onChange={(e) => setReporterName(e.target.value)} maxLength={60} disabled={submitting} />
              </Field>

              <Field label="信的内容 · MESSAGE" hint="中英文都行">
                <textarea id="desc" rows={6} required className="field-box resize-y leading-[1.7]" placeholder="说说你看到的那条水——什么时候、什么地方、闻起来什么、看到了什么。" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} disabled={submitting} />
              </Field>

              <div className="grid grid-cols-2 gap-x-6">
                <Field label="纬度 · LAT" hint="十进制">
                  <input id="lat" type="number" step="0.0001" required className="field-box tnum" value={lat} onChange={(e) => setLat(e.target.value)} disabled={submitting} />
                </Field>
                <Field label="经度 · LNG" hint="十进制">
                  <input id="lng" type="number" step="0.0001" required className="field-box tnum" value={lng} onChange={(e) => setLng(e.target.value)} disabled={submitting} />
                </Field>
              </div>

              <div>
                <div className="label-micro mb-3">严重度 · SEVERITY</div>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="严重度">
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
                        className="label rounded-md px-3.5 py-2 border transition-colors"
                        style={
                          active
                            ? { background: severityColor(s), color: 'var(--canvas)', borderColor: severityColor(s) }
                            : { background: 'transparent', color: 'var(--mute)', borderColor: 'var(--line)' }
                        }
                      >
                        {SEVERITY_LABEL[s]} · {SEVERITY_EN[s]}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4">
                <p className="label-micro max-w-xs normal-case" style={{ letterSpacing: '0.04em' }}>
                  寄出后，信件将公开归档。
                </p>
                <button type="submit" disabled={submitting} className="btn disabled:opacity-40 disabled:cursor-not-allowed">
                  {submitting ? '寄出中…' : '寄出来信 · SEND'}
                </button>
              </div>
            </div>
          </form>
        )}
      </section>

      {/* ── FILTER TABS ──────────────────────────────────────────────── */}
      <section className="border-y border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-5 flex flex-wrap items-center justify-between gap-y-3">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="筛选">
            {(['all', 'low', 'medium', 'high'] as const).map((s) => {
              const active = severityFilter === s
              const label = s === 'all' ? '全部 · ALL' : `${SEVERITY_LABEL[s]} · ${SEVERITY_EN[s]}`
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSeverityFilter(s)}
                  className="label rounded-md px-3 py-1.5 border transition-colors"
                  style={
                    active
                      ? { background: 'var(--ink)', color: 'var(--canvas)', borderColor: 'var(--ink)' }
                      : { background: 'transparent', color: 'var(--mute)', borderColor: 'var(--line)' }
                  }
                >
                  {label}
                </button>
              )
            })}
          </div>
          <span className="label-mute tnum">{visible.length} / {reports.length}</span>
        </div>
      </section>

      {/* ── LETTERS ARCHIVE ──────────────────────────────────────────── */}
      <section>
        {loading ? (
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-24">
            <p className="label-mute">读取来信中 · LOADING</p>
          </div>
        ) : error ? (
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20" role="alert">
            <h2 className="text-ink" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}><span className="zh">读不到来信。</span></h2>
            <div className="tile mt-6 max-w-xl">
              <div className="label mb-2">错误 · ERROR</div>
              <p className="article-body text-small">{error}</p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="max-w-3xl mx-auto px-6 lg:px-10 py-24 md:py-32">
            <p className="text-ink" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}><span className="zh">还没有来信。</span></p>
            <p className="article-body mt-5" style={{ fontSize: '1.1875rem', color: 'var(--mute)' }}><span className="zh">期待你写第一封。</span></p>
          </div>
        ) : visible.length === 0 ? (
          <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20">
            <p className="article-body" style={{ fontSize: '1.1875rem', color: 'var(--mute)' }}><span className="zh">这个筛选下，没有信。</span></p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-6 lg:px-10 divide-y divide-line">
            {visible.map((r) => (
              <article key={r.id} className="py-9 md:py-11 grid grid-cols-12 gap-y-4 md:gap-x-8">
                {/* Left: timestamp + severity badge */}
                <div className="col-span-12 md:col-span-2">
                  <div className="label tnum">{formatExact(r.created_at)}</div>
                  <div className="label-mute tnum mt-1">{formatRelative(r.created_at)}</div>
                  <span
                    className="label rounded-full inline-flex items-center gap-1.5 mt-4 px-2.5 py-1"
                    style={{ border: `1px solid ${severityColor(r.severity)}`, color: severityColor(r.severity) }}
                  >
                    {r.severity === 'high' && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--signal)' }} />}
                    {SEVERITY_LABEL[r.severity]}
                  </span>
                </div>

                {/* Center: body */}
                <div className="col-span-12 md:col-span-7">
                  <div className="label">
                    {r.reporter_name && r.reporter_name.trim() ? r.reporter_name : '匿名'}
                    <span className="label-mute"> · 来信</span>
                  </div>
                  <p className="article-body mt-3 whitespace-pre-line max-w-prose">
                    <span className="zh">{r.description}</span>
                  </p>
                </div>

                {/* Right: coords */}
                <aside className="col-span-12 md:col-span-3 md:text-right">
                  <div className="label-micro">坐标 · COORDS</div>
                  <div className="readout tnum text-ink mt-2 leading-snug" style={{ fontSize: '0.9375rem' }}>
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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className="label-micro">{label}</span>
        {hint && <span className="label-micro normal-case" style={{ letterSpacing: '0.04em' }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}
