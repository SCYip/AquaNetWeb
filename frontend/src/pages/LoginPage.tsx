import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/* ────────────────────────────────────────────────────────────────────────────
 * LoginPage — 入口 · STAFF ENTRANCE
 *
 * Editorial sign-in page for the AquaNet team. Email + password only,
 * delegated to Supabase auth via AuthContext. Visually it's a stationery
 * card sitting on the sand-paper background — not the rounded-cyan
 * SaaS card the old version used.
 * ──────────────────────────────────────────────────────────────────────────── */

type Mode = 'login' | 'register'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
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

  return (
    <div className="bg-sand-50 bg-grain min-h-[88vh] text-ocean-950 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <div className="flex flex-wrap items-baseline justify-between gap-y-2 mono-label text-ocean-700 mb-8 pb-3 border-b border-ocean-300/70">
          <span>AQUANET 水眸 · 第一期 · ISSUE 01</span>
          <span className="text-sea-700">登录 · STAFF ENTRANCE</span>
        </div>

        <p className="section-eyebrow text-sea-700 mb-5">
          {mode === 'login' ? '回来 · WELCOME BACK' : '加入 · JOIN THE TEAM'}
        </p>
        <h1 className="font-heading font-semibold text-ocean-950 leading-[0.98] tracking-tight text-[clamp(2rem,5.2vw,3.6rem)] mb-4">
          {mode === 'login' ? (
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
          {mode === 'login'
            ? '登录后，你能管理自己认领的浮标、查看你的设备，下载属于你那片水域的数据。'
            : '注册之后，你就拥有自己的设备页和一组属于自己的认领码。'}
        </p>

        <div className="border-[1.5px] border-ocean-900/80 bg-white/70 backdrop-blur-sm shadow-[0_24px_60px_-30px_rgba(8,32,52,0.4)]">
          <div className="border-b border-ocean-200 px-7 py-5 flex items-center justify-between">
            <div className="mono-label text-ocean-700">
              {mode === 'login' ? '01 · 登录 · SIGN IN' : '01 · 注册 · CREATE ACCOUNT'}
            </div>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError(null)
                setInfo(null)
              }}
              className="mono-label-sm text-sea-700 hover:text-ocean-950 inline-flex items-center gap-1 transition-colors"
            >
              {mode === 'login' ? '切换到注册' : '切换到登录'}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="px-7 py-7 space-y-6">
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-ocean-950 text-sand-50 mono-label py-4 hover:bg-sea-700 disabled:bg-ocean-700 disabled:cursor-wait transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>
                {submitting
                  ? mode === 'login'
                    ? 'SIGNING IN · 登录中'
                    : 'CREATING · 注册中'
                  : mode === 'login'
                  ? 'SIGN IN · 登录'
                  : 'CREATE ACCOUNT · 创建账号'}
              </span>
            </button>
          </form>
        </div>

        <p className="mt-10 font-body text-sm text-ocean-600 leading-[1.8]">
          忘了密码？暂时还没接通自助找回——先
          <Link to="/contact" className="border-b border-ocean-400 pb-px hover:text-ocean-950 hover:border-ocean-900 transition-colors">联系我们</Link>
          ，我们手动帮你重置。
        </p>
      </div>
    </div>
  )
}

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
