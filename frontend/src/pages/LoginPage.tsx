import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  ArrowRight,
  Smartphone,
  KeyRound,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/* ────────────────────────────────────────────────────────────────────────────
 * LoginPage — 入口 · STAFF ENTRANCE
 *
 * Editorial sign-in page for AquaNet. Two channels share the same card:
 *   - 邮箱 · EMAIL   → Supabase email+password (built-in)
 *   - 手机 · PHONE   → Aliyun Dypnsapi SMS code via Edge Functions
 * Both paths end with a real Supabase session — RLS treats them
 * identically.
 * ──────────────────────────────────────────────────────────────────────────── */

type Channel = 'email' | 'phone'
type EmailMode = 'login' | 'register'

const MAINLAND_PHONE_RE = /^1[3-9]\d{9}$/

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, register, sendSmsCode, loginWithSms } = useAuth()

  const [channel, setChannel] = useState<Channel>('email')

  // Email branch state ----------------------------------------------------
  const [mode, setMode] = useState<EmailMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Phone branch state ----------------------------------------------------
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [cooldown, setCooldown] = useState(0) // seconds until resend allowed
  const [sendingCode, setSendingCode] = useState(false)
  const [phoneName, setPhoneName] = useState('') // optional name for new signups

  // Shared state ----------------------------------------------------------
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Countdown timer for SMS resend
  const tickRef = useRef<number | null>(null)
  useEffect(() => {
    if (cooldown <= 0) {
      if (tickRef.current) window.clearTimeout(tickRef.current)
      return
    }
    tickRef.current = window.setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => {
      if (tickRef.current) window.clearTimeout(tickRef.current)
    }
  }, [cooldown])

  const reset = () => {
    setError(null)
    setInfo(null)
  }

  const switchChannel = (c: Channel) => {
    if (c === channel) return
    setChannel(c)
    reset()
  }

  // ─── Email branch submit ───────────────────────────────────────────────
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

  // ─── Phone branch: send code ───────────────────────────────────────────
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

  // ─── Phone branch: submit code ─────────────────────────────────────────
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

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="bg-sand-50 bg-grain min-h-[88vh] text-ocean-950 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <div className="flex flex-wrap items-baseline justify-between gap-y-2 mono-label text-ocean-700 mb-8 pb-3 border-b border-ocean-300/70">
          <span>AQUANET 水眸 · 第一期 · ISSUE 01</span>
          <span className="text-sea-700">登录 · STAFF ENTRANCE</span>
        </div>

        <p className="section-eyebrow text-sea-700 mb-5">
          {channel === 'email' && mode === 'register'
            ? '加入 · JOIN THE TEAM'
            : '回来 · WELCOME BACK'}
        </p>
        <h1 className="font-heading font-semibold text-ocean-950 leading-[0.98] tracking-tight text-[clamp(2rem,5.2vw,3.6rem)] mb-4">
          {channel === 'phone' ? (
            <>
              用<span className="display-italic text-sea-700">手机号</span>登录。
            </>
          ) : mode === 'login' ? (
            <>
              请<span className="display-italic text-sea-700">报上你的</span>名字。
            </>
          ) : (
            <>
              <span className="display-italic text-sand-700">第一次</span>来。
            </>
          )}
        </h1>
        <p className="font-body text-ocean-700 leading-[1.7] max-w-prose mb-10">
          {channel === 'phone'
            ? '我们用短信发一次性验证码。第一次用，会自动给你建好账号。'
            : mode === 'login'
            ? '登录后，你能管理自己认领的浮标、查看你的设备，下载属于你那片水域的数据。'
            : '注册之后，你就拥有自己的设备页和一组属于自己的认领码。'}
        </p>

        <div className="border-[1.5px] border-ocean-900/80 bg-white/70 backdrop-blur-sm shadow-[0_24px_60px_-30px_rgba(8,32,52,0.4)]">
          {/* Channel tabs ------------------------------------------------- */}
          <div className="flex border-b border-ocean-900/80">
            <ChannelTab
              active={channel === 'email'}
              onClick={() => switchChannel('email')}
              icon={<Mail className="w-3.5 h-3.5" strokeWidth={1.8} />}
              label="邮箱 · EMAIL"
            />
            <ChannelTab
              active={channel === 'phone'}
              onClick={() => switchChannel('phone')}
              icon={<Smartphone className="w-3.5 h-3.5" strokeWidth={1.8} />}
              label="手机 · PHONE"
            />
          </div>

          {/* Mode strip (email branch) ----------------------------------- */}
          {channel === 'email' && (
            <div className="border-b border-ocean-200 px-7 py-5 flex items-center justify-between">
              <div className="mono-label text-ocean-700">
                {mode === 'login' ? '01 · 登录 · SIGN IN' : '01 · 注册 · CREATE ACCOUNT'}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  reset()
                }}
                className="mono-label-sm text-sea-700 hover:text-ocean-950 inline-flex items-center gap-1 transition-colors"
              >
                {mode === 'login' ? '切换到注册' : '切换到登录'}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {channel === 'phone' && (
            <div className="border-b border-ocean-200 px-7 py-5 mono-label text-ocean-700">
              01 · 登录 / 注册 · SIGN IN OR REGISTER
            </div>
          )}

          {/* ─── Forms ─── */}
          {channel === 'email' ? (
            <form onSubmit={onEmailSubmit} className="px-7 py-7 space-y-6">
              <AlertBox error={error} info={info} />

              {mode === 'register' && (
                <Field
                  label="姓名 · NAME"
                  hint="可以是真名，也可以是大家在群里叫你的"
                  icon={<User className="w-4 h-4" strokeWidth={1.8} />}
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="陈水眸"
                    autoComplete="name"
                    disabled={submitting}
                    className="aq-input"
                  />
                </Field>
              )}

              <Field
                label="邮箱 · EMAIL"
                hint="我们用这个发系统消息，比如认领提醒"
                icon={<Mail className="w-4 h-4" strokeWidth={1.8} />}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={submitting}
                  className="aq-input"
                />
              </Field>

              <Field
                label="密码 · PASSWORD"
                hint={mode === 'register' ? '至少 6 位，请别用生日' : ''}
                icon={<Lock className="w-4 h-4" strokeWidth={1.8} />}
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  disabled={submitting}
                  className="aq-input"
                />
              </Field>

              <SubmitButton
                submitting={submitting}
                submittingLabel={mode === 'login' ? 'SIGNING IN · 登录中' : 'CREATING · 注册中'}
                idleLabel={mode === 'login' ? 'SIGN IN · 登录' : 'CREATE ACCOUNT · 创建账号'}
              />
            </form>
          ) : (
            <form onSubmit={onPhoneSubmit} className="px-7 py-7 space-y-6">
              <AlertBox error={error} info={info} />

              <Field
                label="手机号 · PHONE"
                hint="只支持中国大陆 +86 号码"
                icon={<Smartphone className="w-4 h-4" strokeWidth={1.8} />}
              >
                <div className="flex gap-2">
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="13800000000"
                    autoComplete="tel"
                    maxLength={11}
                    required
                    disabled={submitting}
                    className="aq-input flex-1"
                  />
                  <button
                    type="button"
                    onClick={onSendCode}
                    disabled={sendingCode || cooldown > 0 || !MAINLAND_PHONE_RE.test(phone)}
                    className="px-5 mono-label-sm border border-ocean-900/80 text-ocean-950 hover:bg-ocean-950 hover:text-sand-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {sendingCode
                      ? '发送中…'
                      : cooldown > 0
                      ? `${cooldown}s 后重试`
                      : codeSent
                      ? '重新发送'
                      : '发送验证码'}
                  </button>
                </div>
              </Field>

              <Field
                label="验证码 · CODE"
                hint="收到的 6 位数字"
                icon={<KeyRound className="w-4 h-4" strokeWidth={1.8} />}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="••••••"
                  autoComplete="one-time-code"
                  maxLength={8}
                  required
                  disabled={submitting || !codeSent}
                  className="aq-input tabular-nums tracking-[0.4em]"
                />
              </Field>

              <Field
                label="姓名 · NAME"
                hint="第一次登录可以填，老用户留空即可"
                icon={<User className="w-4 h-4" strokeWidth={1.8} />}
              >
                <input
                  type="text"
                  value={phoneName}
                  onChange={(e) => setPhoneName(e.target.value)}
                  placeholder="可以留空"
                  autoComplete="name"
                  disabled={submitting}
                  className="aq-input"
                />
              </Field>

              <SubmitButton
                submitting={submitting}
                submittingLabel="VERIFYING · 验证中"
                idleLabel="SIGN IN · 登录"
              />
            </form>
          )}
        </div>

        <p className="mt-10 font-body text-sm text-ocean-600 leading-[1.8]">
          {channel === 'email' ? (
            <>
              忘了密码？暂时还没接通自助找回——先{' '}
              <Link
                to="/contact"
                className="border-b border-ocean-400 pb-px hover:text-ocean-950 hover:border-ocean-900 transition-colors"
              >
                联系我们
              </Link>
              ，我们手动帮你重置。或者直接用手机号登录。
            </>
          ) : (
            <>
              收不到短信？检查一下手机号有没有拼错，或者{' '}
              <Link
                to="/contact"
                className="border-b border-ocean-400 pb-px hover:text-ocean-950 hover:border-ocean-900 transition-colors"
              >
                联系我们
              </Link>
              。
            </>
          )}
        </p>
      </div>
    </div>
  )
}

/* ── Channel tab ─────────────────────────────────────────────────────── */

interface ChannelTabProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

const ChannelTab = ({ active, onClick, icon, label }: ChannelTabProps) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'flex-1 py-4 px-5 mono-label inline-flex items-center justify-center gap-2 transition-colors',
      active
        ? 'bg-ocean-950 text-sand-50'
        : 'bg-transparent text-ocean-600 hover:text-ocean-950 hover:bg-ocean-50',
    ].join(' ')}
    aria-pressed={active}
  >
    {icon}
    <span>{label}</span>
  </button>
)

/* ── Alert / info row ─────────────────────────────────────────────────── */

const AlertBox = ({ error, info }: { error: string | null; info: string | null }) => (
  <>
    {error && (
      <div className="border border-[#a24b29] bg-[#fbe9e1] text-[#7a3119] p-4 flex gap-3 items-start">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.8} />
        <div className="font-body text-sm leading-snug">{error}</div>
      </div>
    )}
    {info && (
      <div className="border border-sea-300 bg-sea-50 text-sea-700 p-4 mono-label-sm leading-relaxed">
        {info}
      </div>
    )}
  </>
)

/* ── Submit button ────────────────────────────────────────────────────── */

const SubmitButton = ({
  submitting,
  submittingLabel,
  idleLabel,
}: {
  submitting: boolean
  submittingLabel: string
  idleLabel: string
}) => (
  <button
    type="submit"
    disabled={submitting}
    className="w-full bg-ocean-950 text-sand-50 mono-label py-4 hover:bg-sea-700 disabled:bg-ocean-700 disabled:cursor-wait transition-colors flex items-center justify-center gap-2"
  >
    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
    <span>{submitting ? submittingLabel : idleLabel}</span>
  </button>
)

/* ── Editorial input field with mono label + helper hint ─────────────── */

interface FieldProps {
  label: string
  hint?: string
  icon?: React.ReactNode
  children: React.ReactNode
}

const Field = ({ label, hint, icon, children }: FieldProps) => (
  <label className="block">
    <div className="flex items-baseline justify-between mb-2">
      <span className="mono-label text-ocean-700 inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      {hint && <span className="mono-label-sm text-ocean-400 hidden sm:inline">{hint}</span>}
    </div>
    {children}
    {hint && <span className="mono-label-sm text-ocean-400 sm:hidden block mt-1.5">{hint}</span>}
  </label>
)
