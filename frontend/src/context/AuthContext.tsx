import { useState, createContext, useContext, useEffect, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase/client'

/**
 * AuthContext — Supabase-backed authentication.
 *
 * The auth source of truth is `supabase.auth`. We subscribe to session
 * changes and mirror them into React state so consumers (Navbar,
 * ProtectedRoute, DevicesPage) get the right values immediately.
 *
 * Two sign-in paths, ONE session backbone:
 *  - email + password  → supabase.auth.signInWithPassword (built-in)
 *  - phone + SMS code  → Edge Functions `sms-send` + `sms-verify`,
 *                         which call Aliyun Dypnsapi and then mint a
 *                         real Supabase session that we install via
 *                         supabase.auth.setSession(). RLS sees both
 *                         user kinds identically.
 */

interface UserProfile {
  id: string
  email: string
  phone?: string
  name: string
  authType?: 'email' | 'phone' | 'wechat'
}

interface AuthContextType {
  user: UserProfile | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  sendSmsCode: (phone: string) => Promise<void>
  loginWithSms: (phone: string, code: string, name?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Edge Function errors arrive as FunctionsHttpError. The thrown error
 * only contains the HTTP status; the JSON body sits on error.context.body
 * (already a Response or Blob depending on version). We try a few shapes
 * before falling back to the original message.
 */
function parseFunctionError(ctxBody: unknown): string | null {
  if (!ctxBody) return null
  if (typeof ctxBody === 'object' && ctxBody !== null) {
    const err = (ctxBody as { error?: string; message?: string }).error
      ?? (ctxBody as { message?: string }).message
    if (err && typeof err === 'string') return err
  }
  if (typeof ctxBody === 'string') {
    try {
      const parsed = JSON.parse(ctxBody) as { error?: string; message?: string }
      return parsed.error || parsed.message || null
    } catch {
      return ctxBody.slice(0, 200)
    }
  }
  return null
}

function profileFromSession(session: Session | null): UserProfile | null {
  const u = session?.user
  if (!u) return null
  const meta = (u.user_metadata ?? {}) as {
    name?: string
    full_name?: string
    phone?: string
    auth_type?: UserProfile['authType']
  }
  // Phone-only users have a synthetic email like <phone>@phone.aquanet.local
  // — hide it from the UI; surface phone instead.
  const isSyntheticEmail = u.email?.endsWith('@phone.aquanet.local') ?? false
  const phone = u.phone ?? meta.phone
  const fallbackName = phone
    ? `用户${phone.slice(-4)}`
    : u.email && !isSyntheticEmail
    ? u.email.split('@')[0]
    : '匿名用户'
  return {
    id: u.id,
    email: isSyntheticEmail ? '' : u.email ?? '',
    phone,
    name: meta.name || meta.full_name || fallbackName,
    authType: meta.auth_type || (phone ? 'phone' : 'email'),
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let alive = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      setUser(profileFromSession(data.session))
      setIsLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(profileFromSession(session))
      setIsLoading(false)
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  const register = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw new Error(error.message)
  }

  /**
   * Trigger an Aliyun SMS code to the given phone. The code is generated
   * and stored by Aliyun; we never see it. Errors map to friendly Chinese
   * messages built server-side.
   */
  const sendSmsCode = async (phone: string) => {
    const { data, error } = await supabase.functions.invoke('sms-send', {
      body: { phone },
    })
    // FunctionsHttpError carries the body in error.context.body
    if (error) {
      const ctxBody = (error as { context?: { body?: unknown } }).context?.body
      const parsed = parseFunctionError(ctxBody) ?? error.message
      throw new Error(parsed)
    }
    if (data && typeof data === 'object' && (data as { success?: boolean }).success === false) {
      throw new Error(
        (data as { error?: string }).error || '短信发送失败',
      )
    }
  }

  /**
   * Submit a code the user typed. On success, the Edge Function returns
   * real Supabase session tokens — install them so RLS works exactly
   * like an email-signed-in user.
   */
  const loginWithSms = async (phone: string, code: string, name?: string) => {
    const { data, error } = await supabase.functions.invoke('sms-verify', {
      body: { phone, code, name },
    })
    if (error) {
      const ctxBody = (error as { context?: { body?: unknown } }).context?.body
      const parsed = parseFunctionError(ctxBody) ?? error.message
      throw new Error(parsed)
    }

    const payload = data as
      | {
          success: boolean
          session?: { access_token: string; refresh_token: string }
          error?: string
        }
      | null

    if (!payload?.success || !payload.session) {
      throw new Error(payload?.error || '登录失败')
    }

    const { error: setErr } = await supabase.auth.setSession({
      access_token: payload.session.access_token,
      refresh_token: payload.session.refresh_token,
    })
    if (setErr) throw new Error(setErr.message)
    // onAuthStateChange listener will update React state.
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        register,
        sendSmsCode,
        loginWithSms,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
