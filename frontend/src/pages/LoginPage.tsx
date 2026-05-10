import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, AlertCircle, Loader2, Phone, MessageSquare } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

type LoginTab = 'email' | 'phone'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, register, phoneLogin } = useAuth()

  const [activeTab, setActiveTab] = useState<LoginTab>('email')
  const [isRegister, setIsRegister] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (isRegister) {
        await register(name, email, password)
      } else {
        await login(email, password)
      }
      navigate('/devices')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendCode = async () => {
    setError('')
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setIsSubmitting(true)
    try {
      await api.sendPhoneCode(phone)
      setCodeSent(true)
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send code'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await phoneLogin(phone, code)
      navigate('/devices')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-sand-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lifted border border-ocean-100/60 overflow-hidden">
          <div className="bg-gradient-to-r from-ocean-800 to-ocean-700 px-8 py-8 text-center">
            <h2 className="font-heading text-2xl font-bold text-white">
              {isRegister ? '创建账户' : '欢迎回来'}
            </h2>
            <p className="text-ocean-300 mt-1 text-sm">
              {isRegister ? '加入 AquaNet，一起守护水环境' : '登录访问您的设备管理'}
            </p>
          </div>

          <div className="flex border-b border-ocean-100">
            <button
              type="button"
              onClick={() => { setActiveTab('email'); setError(''); setCodeSent(false) }}
              className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'email'
                  ? 'text-sea-600 border-b-2 border-sea-600'
                  : 'text-ocean-400 hover:text-ocean-600'
              }`}
            >
              <Mail className="w-4 h-4" />
              邮箱登录
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('phone'); setError(''); setCodeSent(false) }}
              className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'phone'
                  ? 'text-sea-600 border-b-2 border-sea-600'
                  : 'text-ocean-400 hover:text-ocean-600'
              }`}
            >
              <Phone className="w-4 h-4" />
              手机登录
            </button>
          </div>

          <div className="px-8 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {activeTab === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                {isRegister && (
                  <div>
                    <label className="block text-sm font-medium text-ocean-800 mb-1.5">姓名</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field pl-10"
                        placeholder="John Doe"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-ocean-800 mb-1.5">邮箱地址</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="you@example.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ocean-800 mb-1.5">密码</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-sea-600 hover:bg-sea-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? '请稍候...' : isRegister ? '创建账户' : '登录'}
                </button>

                <p className="mt-4 text-center text-sm text-ocean-600">
                  {isRegister ? '已有账户？' : '还没有账户？'}{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-sea-600 hover:text-sea-500 font-semibold"
                    disabled={isSubmitting}
                  >
                    {isRegister ? '登录' : '立即注册'}
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handlePhoneSubmit} className="space-y-5">
                {!codeSent ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-ocean-800 mb-1.5">手机号码</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ocean-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="input-field pl-10"
                          placeholder="+86 123 4567 8901"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={isSubmitting || countdown > 0}
                      className="w-full py-3 px-4 bg-sea-600 hover:bg-sea-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                      {countdown > 0 ? `${countdown}秒后重新发送` : '发送验证码'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-sea-50 border border-sea-200 rounded-xl">
                      <p className="text-sm text-sea-700">
                        验证码已发送至 {phone}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-ocean-800 mb-1.5">验证码</label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="input-field text-center text-xl tracking-[0.3em]"
                        placeholder="000000"
                        required
                        maxLength={6}
                        disabled={isSubmitting}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || code.length !== 6}
                      className="w-full py-3 px-4 bg-sea-600 hover:bg-sea-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isSubmitting ? '验证中...' : '验证并登录'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setCodeSent(false); setCode('') }}
                      className="w-full py-2 text-sm text-ocean-500 hover:text-ocean-700"
                      disabled={isSubmitting}
                    >
                      使用其他手机号
                    </button>
                  </>
                )}
              </form>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ocean-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-ocean-400">或</span>
              </div>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
              </svg>
              微信登录（即将上线）
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
