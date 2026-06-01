import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ────────────────────────────────────────────────────────────────────────────
 * LoginPage — AquaNet 水眸 · Instrument Console
 *
 * The auth terminal. A single panel, two channels:
 *   - EMAIL  → Supabase email+password
 *   - PHONE  → Aliyun Dypnsapi SMS code via Edge Functions
 * Every hook, handler, and validation is preserved verbatim — only the
 * presentation is rebuilt in the instrument vocabulary.
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
    <div>
      {/* ── MASTHEAD ─────────────────────────────────────────────────── */}
      <div className="border-b border-ink">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-2.5 flex items-center justify-between gap-4">
          <span className="label">登录 · ACCESS</span>
          <span className="label-mute">观察者终端 · OBSERVER TERMINAL</span>
        </div>
      </div>

      <section className="max-w-xl mx-auto px-6 lg:px-10 py-16 md:py-24">
        <h1 className="text-ink" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 0.98, letterSpacing: '-0.03em', fontVariationSettings: '"wdth" 92, "opsz" 96' }}>
          <span className="zh">登录</span>
        </h1>

        {/* Auth panel */}
        <div className="tile mt-10">
          {/* Mode strip */}
          <div className="flex items-baseline justify-between border-b border-line pb-4">
            <span className="label">
              {channel === 'phone' ? '短信通道 · SMS' : mode === 'login' ? '邮箱登录 · EMAIL' : '邮箱注册 · SIGN UP'}
            </span>
            {channel === 'email' && (
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); reset() }}
                className="label-mute hover:text-ink transition-colors"
              >
                {mode === 'login' ? '切换到注册 →' : '← 切换到登录'}
              </button>
            )}
            {channel === 'phone' && codeSent && <span className="label-mute">已发送</span>}
          </div>

          {/* Channel tabs */}
          <div className="mt-6 flex gap-2">
            <ChannelTab active={channel === 'email'} onClick={() => switchChannel('email')} label="EMAIL" />
            <ChannelTab active={channel === 'phone'} onClick={() => switchChannel('phone')} label="PHONE" />
          </div>

          {/* Form body */}
          <div className="mt-9">
            {channel === 'email' ? (
              <form onSubmit={onEmailSubmit} className="space-y-6">
                <AlertBox error={error} info={info} />

                {mode === 'register' && (
                  <Field id="name" label="姓名 · NAME">
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="陈水眸" autoComplete="name" disabled={submitting} aria-label="姓名" className="field-box" />
                  </Field>
                )}

                <Field id="email" label="邮箱 · EMAIL">
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required disabled={submitting} aria-label="邮箱" className="field-box" />
                </Field>

                <Field id="password" label="密码 · PASSWORD">
                  <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={6} disabled={submitting} aria-label="密码" className="field-box" />
                </Field>

                <SubmitButton submitting={submitting}>
                  {mode === 'login' ? '登录 · LOG IN' : '创建账号 · CREATE'}
                </SubmitButton>
              </form>
            ) : (
              <form onSubmit={onPhoneSubmit} className="space-y-6">
                <AlertBox error={error} info={info} />

                <Field id="phone" label="手机号 · PHONE">
                  <div className="flex items-stretch gap-3">
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
                      className="field-box flex-1 tnum"
                    />
                    <button
                      type="button"
                      onClick={onSendCode}
                      disabled={sendingCode || cooldown > 0 || !MAINLAND_PHONE_RE.test(phone)}
                      className="btn-outline whitespace-nowrap text-[0.7rem] px-4 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sendingCode ? '发送中…' : cooldown > 0 ? `${cooldown}s` : codeSent ? '重发' : '发送验证码'}
                    </button>
                  </div>
                </Field>

                <Field id="code" label="验证码 · CODE">
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
                    className="field-box tnum text-2xl tracking-[0.5em] text-center"
                  />
                </Field>

                <Field id="phone-name" label="姓名（选填）· NAME">
                  <input id="phone-name" type="text" value={phoneName} onChange={e => setPhoneName(e.target.value)} placeholder="可以留空" autoComplete="name" disabled={submitting} aria-label="姓名（选填）" className="field-box" />
                </Field>

                <SubmitButton submitting={submitting}>登录 · LOG IN</SubmitButton>
              </form>
            )}
          </div>
        </div>

        {/* Footer help */}
        <p className="mt-8 flex items-baseline justify-between">
          <span className="label-mute normal-case" style={{ letterSpacing: '0.04em' }}>收不到短信？账号有问题？</span>
          <Link to="/contact" className="label hover:text-signal transition-colors">写信给我们 ↗</Link>
        </p>
      </section>
    </div>
  )
}

/* ── Subcomponents ─────────────────────────────────────────────────── */

function ChannelTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="label rounded-md px-4 py-2 border transition-colors"
      style={
        active
          ? { background: 'var(--ink)', color: 'var(--canvas)', borderColor: 'var(--ink)' }
          : { background: 'transparent', color: 'var(--mute)', borderColor: 'var(--line)' }
      }
    >
      {label}
    </button>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="label-micro block">
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
      className="rounded-md p-4 border"
      style={
        isError
          ? { borderColor: 'var(--signal)', background: 'rgba(255,90,31,0.06)' }
          : { borderColor: 'var(--line)', background: 'transparent' }
      }
    >
      <div className="article-body text-small leading-snug">{error ?? info}</div>
    </div>
  )
}

function SubmitButton({ submitting, children }: { submitting: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={submitting} className="btn w-full disabled:opacity-40 disabled:cursor-not-allowed">
      {submitting ? '处理中…' : children}
    </button>
  )
}
