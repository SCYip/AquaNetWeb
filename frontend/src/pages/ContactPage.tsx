import { useState } from 'react'
import { Link } from 'react-router-dom'

/* ────────────────────────────────────────────────────────────────────────────
 * ContactPage — WIRED-discipline edition.
 *
 * Photo at full intensity, headline below on canvas. Two-column body: a
 * clean form on the left, an address block on the right. Success state is
 * a solid ink slab — no photo veil. Form state and submit handler are
 * preserved verbatim.
 * ──────────────────────────────────────────────────────────────────────────── */

const HERO_IMG = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=2400&q=80&auto=format&fit=crop'

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

  /* ───────────────── Success state — ink slab, no veil ───────────────── */
  if (isSubmitted) {
    return (
      <section className="bg-ink text-canvas min-h-[80vh] flex items-center">
        <div role="status" className="max-w-3xl mx-auto px-6 lg:px-10 py-28 md:py-40">
          <h1 className="font-display text-hero text-canvas">
            收到了。
          </h1>
          <p className="font-body text-lede text-canvas/80 mt-8 max-w-2xl">
            我们会在 24 小时内回复。读你的信、回你的信的，是水眸小组里的某一个人。
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/" className="btn bg-canvas text-ink border-canvas hover:bg-link hover:border-link hover:text-canvas">
              回首页
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div>
      {/* ── HERO: photo at full intensity, headline BELOW on canvas ─── */}
      <figure>
        <img
          src={HERO_IMG}
          alt=""
          className="w-full h-[60vh] md:h-[72vh] object-cover"
          loading="eager"
        />
      </figure>

      <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-16 md:pt-24 pb-12 md:pb-16">
        <h1 className="font-display text-hero text-ink">
          想说点什么？
        </h1>
        <p className="font-body text-lede text-ink mt-10 max-w-3xl">
          想在你的城市部署一只浮标？想说说你身边那条河？想给我们指出一个错？写下来寄给我们——读你的信、回你的信的，是水眸小组里的某一个人。
        </p>
      </section>

      {/* ── TWO-COLUMN BODY — form + address block ──────────────────── */}
      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-y-16 lg:gap-x-16">
          {/* ── LEFT: the letter form ─────────────────────────────── */}
          <div className="lg:col-span-7">
            <div className="eyebrow mb-8">寄信</div>
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                <Field htmlFor="firstName" label="名">
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    required
                    autoComplete="given-name"
                    placeholder="叶"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="field"
                  />
                </Field>
                <Field htmlFor="lastName" label="姓">
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    required
                    autoComplete="family-name"
                    placeholder="承祖"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="field"
                  />
                </Field>
              </div>

              <Field htmlFor="email" label="回信地址">
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="field"
                />
              </Field>

              <Field htmlFor="subject" label="主题">
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="field appearance-none cursor-pointer pr-8"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%231a1a1a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.25rem center',
                  }}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field htmlFor="message" label="信的内容">
                <textarea
                  id="message"
                  name="message"
                  rows={8}
                  required
                  placeholder="说说你看到的那条水、想做的那件事，或者只是给我们提个意见。"
                  value={formData.message}
                  onChange={handleChange}
                  className="field resize-y leading-[1.75]"
                />
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-line">
                <p className="font-body text-small text-mute max-w-xs">
                  寄出即表示你同意我们读它。我们不会把信转给任何人。
                </p>
                <button type="submit" className="btn">
                  寄出
                </button>
              </div>
            </form>
          </div>

          {/* ── RIGHT: address block ─────────────────────────────── */}
          <aside className="lg:col-span-5 lg:pl-10 lg:border-l border-line">
            <div className="eyebrow mb-8">联系方式</div>
            <dl className="space-y-10">
              <div>
                <dt className="meta mb-3">邮箱</dt>
                <dd>
                  <a
                    href="mailto:contact@aquanet.io"
                    className="font-display text-subhead text-ink hover:text-link transition-colors"
                  >
                    contact@aquanet.io
                  </a>
                </dd>
              </div>

              <div>
                <dt className="meta mb-3">地址</dt>
                <dd className="font-display text-subhead text-ink">
                  广东 · 深圳
                </dd>
              </div>

              <div>
                <dt className="meta mb-3">回复</dt>
                <dd className="font-body text-body text-ink">
                  一般 24 小时内回信。读你的信、回你的信的，是水眸小组里的某一个人。
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
      <label htmlFor={htmlFor} className="meta block mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}
