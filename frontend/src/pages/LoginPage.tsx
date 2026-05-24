import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ────────────────────────────────────────────────────────────────────────────
 * LoginPage — WIRED-discipline edition.
 *
 * The form IS the page. No photo hero, no veils, no decorative tags.
 * Two channels share the same restrained frame:
 *   - EMAIL  → Supabase email+password
 *   - PHONE  → Aliyun Dypnsapi SMS code via Edge Functions
 * Auth logic preserved verbatim.
 * ──────────────────────────────────────────────────────────────────────────── */

type Channel = 'email' | 'phone'
type EmailMode = 'login' | 'register'

const MAINLAND_PHONE_RE = /^1[3-9]\d{9}$/

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, register, sendSmsCode, loginWithSms } = useAuth()

  const [channel, setChannel] = useState<Channel>('email')

  // Email branch
  const [mode, setMode]         = useState<EmailMode>('login')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  // Phone branch
  const [phone, setPhone]             = useState('')
  const [code, setCode]               = useState('')
  const [codeSent, setCodeSent]       = useState(false)
  const [cooldown, setCooldown]       = useState(0)
  const [sendingCode, setSendingCode] = useState(false)
  const [phoneName, setPhoneName]     = useState('')

  // Shared
  const [error, setError]       = useState<string | null>(null)
  const [info, setInfo]         = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Cooldown timer
  const tickRef = useRef<number | null>(null)
  useEffect(() => {
    if (cooldown <= 0) {
      if (tickRef.current) window.clearTimeout(tickRef.current)
      return
    }
    tickRef.current = window.setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => { if (tickRef.current) window.clearTimeout(tickRef.current) }
  }, [cooldown])

  const reset = () => { setError(null); setInfo(null) }

  const switchChannel = (c: Channel) => {
    if (c === channel) return
    setChannel(c)
    reset()
  }

  // ─── Email branch submit ─────────────────────────────────────────────
  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    reset()
    setSubmitting(true)
    try {
      if (mode === 'register') {
        await register(name.trim() || email.split('@')[0], email, password)
        setInfo('注册成功 · 请查邮箱完成验证后登录')
        setMode('login')
        setPassword('')
      } else {
        await login(email, password)
        navigate('/devices')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Phone branch: send code ────────────────────────────────────────
  const onSendCode = async () => {
    reset()
    if (!MAINLAND_PHONE_RE.test(phone)) {
      setError('请输入正确的 11 位大陆手机号')
      return
    }
    setSendingCode(true)
    try {
      await sendSmsCode(phone)
      setCodeSent(true)
      setCooldown(60)
      setInfo('验证码已发送，5 分钟内有效')
    } catch (err) {
      setError(err instanceof Error ? err.message : '验证码发送失败')
    } finally {
      setSendingCode(false)
    }
  }

  // ─── Phone branch: verify ───────────────────────────────────────────
  const onPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    reset()
    if (!MAINLAND_PHONE_RE.test(phone)) {
      setError('请输入正确的 11 位大陆手机号')
      return
    }
    if (!/^\d{4,8}$/.test(code)) {
      setError('请输入正确的验证码')
      return
    }
    setSubmitting(true)
    try {
      await loginWithSms(phone, code, phoneName.trim() || undefined)
      navigate('/devices')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="bg-canvas">
      <section className="max-w-2xl mx-auto px-6 lg:px-10 py-20 md:py-28">
        {/* Headline — Fraunces, no italic on CJK */}
        <h1 className="font-display text-display text-ink">
          登录
        </h1>

        {/* Mode strip — eyebrow left, mute toggle right */}
        <div className="mt-10 flex items-baseline justify-between border-b border-line pb-4">
          <span className="eyebrow">
            {channel === 'phone'
              ? '短信通道'
              : mode === 'login'
              ? '邮箱登录'
              : '邮箱注册'}
          </span>
          {channel === 'email' && (
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); reset() }}
              className="meta hover:text-ink transition-colors"
            >
              {mode === 'login' ? '切换到注册 →' : '← 切换到登录'}
            </button>
          )}
          {channel === 'phone' && codeSent && (
            <span className="meta">验证码已发送</span>
          )}
        </div>

        {/* Channel tabs — plain text with ink underline on active */}
        <div className="mt-8 flex gap-8">
          <ChannelTab
            active={channel === 'email'}
            onClick={() => switchChannel('email')}
            label="EMAIL"
          />
          <ChannelTab
            active={channel === 'phone'}
            onClick={() => switchChannel('phone')}
            label="PHONE"
          />
        </div>

        {/* Form body */}
        <div className="mt-12">
          {channel === 'email' ? (
            <form onSubmit={onEmailSubmit} className="space-y-8">
              <AlertBox error={error} info={info} />

              {mode === 'register' && (
                <Field id="name" label="姓名">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="陈水眸"
                    autoComplete="name"
                    disabled={submitting}
                    aria-label="姓名"
                    className="field"
                  />
                </Field>
              )}

              <Field id="email" label="邮箱">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={submitting}
                  aria-label="邮箱"
                  className="field"
                />
              </Field>

              <Field id="password" label="密码">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  disabled={submitting}
                  aria-label="密码"
                  className="field"
                />
              </Field>

              <SubmitButton submitting={submitting}>
                {mode === 'login' ? '登录' : '创建账号'}
              </SubmitButton>
            </form>
          ) : (
            <form onSubmit={onPhoneSubmit} className="space-y-8">
              <AlertBox error={error} info={info} />

              <Field id="phone" label="手机号">
                <div className="flex items-end gap-4">
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="13800000000"
                    autoComplete="tel"
                    inputMode="numeric"
                    pattern="1[3-9]\d{9}"
                    required
                    disabled={submitting}
                    aria-label="手机号"
                    className="field flex-1 tnum"
                  />
                  <button
                    type="button"
                    onClick={onSendCode}
                    disabled={sendingCode || cooldown > 0 || !MAINLAND_PHONE_RE.test(phone)}
                    className="meta hover:text-ink transition-colors whitespace-nowrap pb-3 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sendingCode
                      ? '发送中…'
                      : cooldown > 0
                      ? `${cooldown}s 后重发`
                      : codeSent
                      ? '重新发送'
                      : '发送验证码'}
                  </button>
                </div>
              </Field>

              <Field id="code" label="验证码">
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="••••••"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  disabled={submitting}
                  aria-label="验证码"
                  className="field tnum font-meta text-2xl tracking-[0.5em] text-center"
                />
              </Field>

              <Field id="phone-name" label="姓名（选填）">
                <input
                  id="phone-name"
                  type="text"
                  value={phoneName}
                  onChange={e => setPhoneName(e.target.value)}
                  placeholder="可以留空"
                  autoComplete="name"
                  disabled={submitting}
                  aria-label="姓名（选填）"
                  className="field"
                />
              </Field>

              <SubmitButton submitting={submitting}>
                登录
              </SubmitButton>
            </form>
          )}
        </div>

        {/* Footer — quiet help link */}
        <p className="mt-16 pt-6 border-t border-line flex items-baseline justify-between">
          <span className="meta">收不到短信？账号有问题？</span>
          <Link to="/contact" className="meta hover:text-ink transition-colors">
            写信给我们 ↗
          </Link>
        </p>
      </section>
    </div>
  )
}

/* ── Subcomponents ─────────────────────────────────────────────────── */

function ChannelTab({ active, onClick, label }: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pb-3 border-b-2 transition-colors ${
        active
          ? 'border-ink text-ink'
          : 'border-transparent text-mute hover:text-ink'
      }`}
    >
      <span className="eyebrow">{label}</span>
    </button>
  )
}

function Field({ id, label, children }: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="meta block">
        {label}
      </label>
      {children}
    </div>
  )
}

function AlertBox({ error, info }: { error: string | null; info: string | null }) {
  if (!error && !info) return null
  const isError = !!error
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={
        isError
          ? 'border border-link bg-link/5 text-ink p-4'
          : 'border border-line bg-canvas text-ink p-4'
      }
    >
      <div className="text-body leading-snug">{error ?? info}</div>
    </div>
  )
}

function SubmitButton({ submitting, children }: {
  submitting: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="btn w-full disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {submitting ? '处理中…' : children}
    </button>
  )
}
