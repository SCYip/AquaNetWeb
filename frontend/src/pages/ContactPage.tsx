import { useState } from 'react'
import { Send, CheckCircle, ArrowUpRight } from 'lucide-react'

/* ────────────────────────────────────────────────────────────────────────────
 * ContactPage — AquaNet 水眸 · Dispatch
 *
 * "Write to the editor" instead of "contact us". The form is framed as a
 * letter / submission, not a SaaS contact form. Continues the Field
 * Bulletin direction (masthead, mono labels, asymmetric grid, no card
 * piles, no icon circles).
 *
 * The submit is intentionally simulated — same behaviour as before.
 * Hooking up to a real backend is a separate task.
 * ──────────────────────────────────────────────────────────────────────────── */

const SUBJECTS = [
  { value: '', label: '— 选一个 · select one —' },
  { value: 'deployment', label: '在我的区域部署浮标 · Deploy a buoy here' },
  { value: 'partnership', label: '合作 · Partnership' },
  { value: 'technical', label: '技术问题 · Technical' },
  { value: 'media', label: '媒体咨询 · Press' },
  { value: 'letter', label: '一封读者来信 · A letter to the editor' },
  { value: 'other', label: '其他 · Other' },
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

  return (
    <div className="bg-sand-50 text-ocean-950">
      {/* ─── 00 · MASTHEAD ──────────────────────────────────────────────── */}
      <header className="bg-grain bg-sand-50 border-b-[3px] border-double border-ocean-900/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-20 md:pt-14 md:pb-24">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mono-label text-ocean-700 mb-12 md:mb-16 pb-3 border-b border-ocean-300/70">
            <span>AQUANET 水眸 · 第一期 · ISSUE 01</span>
            <span className="hidden sm:inline">DISPATCH · 投稿区</span>
            <span className="text-sea-700">联系我们 · WRITE IN</span>
          </div>

          <div className="grid grid-cols-12 gap-y-10 md:gap-x-10 lg:gap-x-16">
            <div className="col-span-12 lg:col-span-8">
              <p className="section-eyebrow text-sea-700 mb-7">来信 · WRITE IN</p>
              <h1 className="font-heading font-semibold text-ocean-950 leading-[0.95] tracking-tight text-[clamp(2.25rem,6vw,5rem)]">
                给水眸<span className="display-italic text-sea-700">写一封</span>
                <br />
                <span className="display-italic text-sand-700">信</span>。
              </h1>
              <div className="mt-10 flex items-center gap-4 mono-label text-ocean-600">
                <span className="rule-fade w-12 text-ocean-400" />
                EDITOR&apos;S DESK · 编辑部
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l lg:border-ocean-300/80 flex flex-col justify-end">
              <div className="mono-label text-ocean-600 mb-4">EDITORIAL NOTE · 编者按</div>
              <p className="font-body text-base md:text-lg text-ocean-800 leading-[1.7]">
                想在你的城市部署一只浮标？想说说你身边那条河？想给我们指出一个错？——
                <span className="font-semibold text-ocean-950">写下来寄给我们。</span>
              </p>
              <div className="mt-7 pt-5 border-t border-ocean-200/80 mono-label-sm text-ocean-500 leading-[1.9]">
                Letters are read by a real
                <br />
                person. We reply within
                <br />
                24 hours, 太忙的话 48.
              </div>
            </aside>
          </div>
        </div>
      </header>

      {/* ─── §01 · WHERE TO REACH US ─────────────────────────────────────── */}
      <section className="bg-sand-50 bg-grain reveal">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 md:pt-28 pb-12 md:pb-16">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-10 pb-4 border-b border-ocean-200">
            <h2 className="section-eyebrow text-ocean-900">
              01 · 通讯地址 · MASTHEAD
            </h2>
            <span className="mono-label text-ocean-500">REACH OUT · 这些路都能找到我们</span>
          </div>

          {/* Three columns of marginalia — no cards, just typed entries */}
          <div className="grid grid-cols-12 gap-y-10 gap-x-6 md:gap-x-12">
            <div className="col-span-12 md:col-span-4">
              <div className="mono-label text-sea-700 mb-2">EMAIL · 邮箱</div>
              <p className="font-heading text-2xl md:text-[1.7rem] text-ocean-950 leading-tight">
                <a
                  href="mailto:contact@aquanet.io"
                  className="border-b border-ocean-300 hover:border-ocean-900 transition-colors"
                >
                  contact@aquanet.io
                </a>
              </p>
              <p className="mt-3 mono-label-sm text-ocean-500">REPLIES IN 24H · 24 小时内回复</p>
            </div>

            <div className="col-span-12 md:col-span-4 md:pl-8 md:border-l md:border-ocean-200">
              <div className="mono-label text-sea-700 mb-2">BASED IN · 落地</div>
              <p className="font-heading text-2xl md:text-[1.7rem] text-ocean-950 leading-tight">
                广东 · 深圳
              </p>
              <p className="mt-3 mono-label-sm text-ocean-500">22.5°N · 114.0°E · CN</p>
            </div>

            <div className="col-span-12 md:col-span-4 md:pl-8 md:border-l md:border-ocean-200">
              <div className="mono-label text-sea-700 mb-2">HOURS · 联络时段</div>
              <p className="font-heading text-2xl md:text-[1.7rem] text-ocean-950 leading-tight">
                Mon–Fri · 周一至周五
              </p>
              <p className="mt-3 mono-label-sm text-ocean-500">09:00 – 18:00 · CST · GMT+8</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── §02 · THE LETTER FORM ──────────────────────────────────────── */}
      <section className="bg-sand-50 bg-grain reveal">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 md:pt-16 pb-28 md:pb-36">
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 mb-12 md:mb-16 pb-4 border-b border-ocean-200">
            <h2 className="section-eyebrow text-ocean-900">
              02 · 来信表 · THE LETTER
            </h2>
            <span className="mono-label text-ocean-500">FILL IN. WE READ. WE REPLY.</span>
          </div>

          <div className="grid grid-cols-12 gap-y-10 gap-x-6 md:gap-x-12">
            {/* Left: editorial sidebar (large pull-quote about why writing matters) */}
            <aside className="col-span-12 lg:col-span-4">
              <p className="display-italic text-[clamp(1.4rem,2.4vw,2rem)] text-ocean-900 leading-[1.25]">
                每一封来信都<br />
                被<span className="text-sea-700">人</span>读过。
              </p>
              <div className="mt-8 mb-8 rule-fade w-16 text-ocean-300" />
              <p className="text-ocean-700 leading-[1.85] text-[0.96rem]">
                我们没有自动回复机器人。读你的信、回你的信的，是水眸小组里的某一个人。所以——
                <span className="font-semibold text-ocean-950">慢一点没关系，写清楚就好。</span>
              </p>
              <div className="mt-8 mono-label-sm text-ocean-500 leading-[1.85]">
                If your letter is about<br />
                deploying a buoy in your<br />
                neighbourhood, please<br />
                include the location and<br />
                the kind of water — river,<br />
                pond, harbour, drainage<br />
                channel.
              </div>
            </aside>

            {/* Right: the actual form */}
            <div className="col-span-12 lg:col-span-8 lg:pl-10 lg:border-l lg:border-ocean-200">
              {isSubmitted ? (
                <div className="border border-ocean-300 bg-white/60 backdrop-blur-sm p-10 md:p-14 text-center">
                  <CheckCircle
                    className="w-10 h-10 text-sea-600 mx-auto mb-6"
                    strokeWidth={1.5}
                  />
                  <p className="display-italic text-3xl md:text-4xl text-ocean-950 leading-tight mb-4">
                    收到了。
                  </p>
                  <p className="mono-label text-ocean-600">
                    LETTER RECEIVED · 我们会在 24 小时内回复
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-9">
                  {/* Names — two columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-9">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block mono-label text-ocean-700 mb-3"
                      >
                        01 · 名 · FIRST NAME
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        required
                        autoComplete="given-name"
                        className="w-full bg-transparent border-0 border-b-2 border-ocean-300 focus:border-ocean-900 focus:outline-none focus:ring-0 px-0 py-3 font-heading text-xl text-ocean-950 placeholder:text-ocean-300 placeholder:font-body placeholder:font-normal placeholder:text-base transition-colors"
                        placeholder="Jane"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block mono-label text-ocean-700 mb-3"
                      >
                        02 · 姓 · LAST NAME
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        required
                        autoComplete="family-name"
                        className="w-full bg-transparent border-0 border-b-2 border-ocean-300 focus:border-ocean-900 focus:outline-none focus:ring-0 px-0 py-3 font-heading text-xl text-ocean-950 placeholder:text-ocean-300 placeholder:font-body placeholder:font-normal placeholder:text-base transition-colors"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block mono-label text-ocean-700 mb-3"
                    >
                      03 · 回信地址 · EMAIL
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      className="w-full bg-transparent border-0 border-b-2 border-ocean-300 focus:border-ocean-900 focus:outline-none focus:ring-0 px-0 py-3 font-heading text-xl text-ocean-950 placeholder:text-ocean-300 placeholder:font-body placeholder:font-normal placeholder:text-base transition-colors"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block mono-label text-ocean-700 mb-3"
                    >
                      04 · 主题 · SUBJECT
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full bg-transparent border-0 border-b-2 border-ocean-300 focus:border-ocean-900 focus:outline-none focus:ring-0 px-0 py-3 font-heading text-xl text-ocean-950 transition-colors appearance-none cursor-pointer"
                      value={formData.subject}
                      onChange={handleChange}
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23164156' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
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
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block mono-label text-ocean-700 mb-3"
                    >
                      05 · 信的内容 · YOUR LETTER
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      className="w-full bg-transparent border-2 border-ocean-300 focus:border-ocean-900 focus:outline-none focus:ring-0 px-4 py-3 font-body text-base text-ocean-950 placeholder:text-ocean-300 leading-[1.8] transition-colors resize-y"
                      placeholder="说说你看到的那条水、想做的那件事，或者只是给我们提个意见。中英文都行。"
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Submit row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-ocean-200">
                    <p className="mono-label-sm text-ocean-500 leading-[1.7]">
                      BY SENDING, YOU AGREE WE&apos;LL READ IT.<br />
                      WE WON&apos;T SHARE IT WITH ANYONE.
                    </p>
                    <button
                      type="submit"
                      className="group inline-flex items-center gap-3 px-8 py-3.5 bg-ocean-950 hover:bg-ocean-900 text-white mono-label transition-colors"
                    >
                      <Send className="w-4 h-4" strokeWidth={1.8} />
                      SEND LETTER · 寄出
                      <ArrowUpRight
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
