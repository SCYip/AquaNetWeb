import { useState, createContext, useContext, useEffect, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase/client'

/**
 * AuthContext — Supabase-backed authentication.
 *
 * The auth source of truth is `supabase.auth`. We subscribe to session
 * changes and mirror them into React state so consumers (Navbar,
 * ProtectedRoute, DevicesPage) get the right values immediately. Email +
 * password is the only flow — phone/WeChat were stripped when the
 * Express backend was removed.
 */

interface UserProfile {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: UserProfile | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function profileFromSession(session: Session | null): UserProfile | null {
  const u = session?.user
  if (!u) return null
  const meta = (u.user_metadata ?? {}) as { name?: string; full_name?: string }
  const fallbackName = u.email ? u.email.split('@')[0] : '匿名用户'
  return {
    id: u.id,
    email: u.email ?? '',
    name: meta.name || meta.full_name || fallbackName,
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
