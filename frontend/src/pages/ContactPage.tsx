import { useState } from 'react'
import { Link } from 'react-router-dom'

/* ────────────────────────────────────────────────────────────────────────────
 * ContactPage — AquaNet 水眸 · Instrument Console
 *
 * Typographic hero, two-column body (boxed-field form left, contact block
 * right), ink-slab success state. Form state + submit handler preserved
 * verbatim.
 * ──────────────────────────────────────────────────────────────────────────── */

const SUBJECTS = [
  { value: '', label: '— 选一个 —' },
  { value: 'deployment', label: '在我的区域部署浮标' },
  { value: 'partnership', label: '合作' },
  { value: 'technical', label: '技术问题' },
  { value: 'media', label: '媒体咨询' },
  { value: 'letter', label: '一封读者来信' },
  { value: 'other', label: '其他' },
] as const

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  /* ───────────────── Success state — ink slab ───────────────── */
  if (isSubmitted) {
    return (
      <section className="bg-ink text-canvas min-h-[80vh] flex items-center">
        <div role="status" className="max-w-3xl mx-auto px-6 lg:px-10 py-28 md:py-40">
          <div className="flex items-center gap-2.5 mb-8">
            <span className="signal-dot" aria-hidden="true" />
            <span className="label" style={{ color: 'var(--canvas)' }}>已寄出 · TRANSMITTED</span>
          </div>
          <h1 className="leading-[1.0]" style={{ fontSize: 'clamp(2.75rem, 7vw, 5rem)', color: 'var(--canvas)', fontVariationSettings: '"wdth" 92' }}>
            <span className="zh">收到了。</span>
          </h1>
          <p className="article-body mt-8 max-w-2xl" style={{ fontSize: '1.1875rem', color: 'rgba(250,250,247,0.78)' }}>
            <span className="zh">我们会在 24 小时内回复。读你的信、回你的信的，是水眸小组里的某一个人。</span>
          </p>
          <div className="mt-10">
            <Link to="/" className="btn" style={{ background: 'var(--canvas)', color: 'var(--ink)', borderColor: 'var(--canvas)' }}>
              回首页
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div>
      {/* ── MASTHEAD + HERO ──────────────────────────────────────────── */}
      <div className="border-b border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-2.5 flex items-center justify-between gap-4">
          <span className="label">联系 · CONTACT</span>
          <span className="label-mute tnum">回复 · ~24H</span>
        </div>
      </div>

      <section className="scanlines max-w-6xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-12 md:pb-16">
        <h1 className="text-ink" style={{ fontSize: 'clamp(2.75rem, 8vw, 6rem)', lineHeight: 0.95, letterSpacing: '-0.03em', fontVariationSettings: '"wdth" 92, "opsz" 96' }}>
          <span className="zh">想说点什么？</span>
        </h1>
        <p className="article-body mt-8 max-w-2xl" style={{ fontSize: '1.1875rem' }}>
          <span className="zh">想在你的城市部署一只浮标？想说说身边那条河？想给我们指出一个错？写下来寄给我们——读你的信、回你的信的，是水眸小组里的某一个人。</span>
        </p>
      </section>

      {/* ── TWO-COLUMN BODY ──────────────────────────────────────────── */}
      <section className="border-t border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-y-14 lg:gap-x-16">
          {/* LEFT: form panel */}
          <div className="lg:col-span-7">
            <div className="label mb-8">寄信 · COMPOSE</div>
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                <Field htmlFor="firstName" label="名 · FIRST">
                  <input id="firstName" type="text" name="firstName" required autoComplete="given-name" placeholder="叶" value={formData.firstName} onChange={handleChange} className="field-box" />
                </Field>
                <Field htmlFor="lastName" label="姓 · LAST">
                  <input id="lastName" type="text" name="lastName" required autoComplete="family-name" placeholder="承祖" value={formData.lastName} onChange={handleChange} className="field-box" />
                </Field>
              </div>

              <Field htmlFor="email" label="回信地址 · EMAIL">
                <input id="email" type="email" name="email" required autoComplete="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="field-box" />
              </Field>

              <Field htmlFor="subject" label="主题 · SUBJECT">
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="field-box appearance-none cursor-pointer pr-9"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%230a0a0a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                  }}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </Field>

              <Field htmlFor="message" label="信的内容 · MESSAGE">
                <textarea id="message" name="message" rows={7} required placeholder="说说你看到的那条水、想做的那件事，或者只是给我们提个意见。" value={formData.message} onChange={handleChange} className="field-box resize-y leading-[1.7]" />
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-5 pt-7 border-t border-line">
                <p className="article-body text-small max-w-xs" style={{ color: 'var(--mute)' }}>
                  <span className="zh">寄出即表示你同意我们读它。我们不会把信转给任何人。</span>
                </p>
                <button type="submit" className="btn">寄出 · SEND</button>
              </div>
            </form>
          </div>

          {/* RIGHT: contact block */}
          <aside className="lg:col-span-5 lg:pl-12 lg:border-l border-line">
            <div className="label mb-8">联系方式 · DIRECT</div>
            <dl className="space-y-9">
              <div>
                <dt className="label-micro mb-3">邮箱 · EMAIL</dt>
                <dd>
                  <a href="mailto:contact@aquanet-water.org" className="readout readout-md hover:text-signal transition-colors break-all" style={{ fontSize: '1.25rem' }}>
                    contact@aquanet-water.org
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label-micro mb-3">地址 · BASE</dt>
                <dd className="text-ink" style={{ fontSize: '1.25rem' }}>
                  <span className="zh">广东 · 深圳 / 惠州小径湾</span>
                </dd>
              </div>
              <div>
                <dt className="label-micro mb-3">回复 · REPLY</dt>
                <dd className="article-body text-small" style={{ color: 'var(--ink)' }}>
                  <span className="zh">一般 24 小时内回信。读你的信、回你的信的，是水眸小组里的某一个人。</span>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </div>
  )
}

/* ── Subcomponents ─────────────────────────────────────────────────── */

function Field({ htmlFor, label, children }: {
  htmlFor: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label-micro block mb-2">
        {label}
      </label>
      {children}
    </div>
  )
}
