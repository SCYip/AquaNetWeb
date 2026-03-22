import { useState, createContext, useContext, useEffect, type ReactNode } from 'react'
import { api } from '../services/api'

interface UserProfile {
  id: string
  email?: string
  phone?: string
  name: string
  auth_type: 'email' | 'wechat' | 'phone'
}

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  phoneLogin: (phone: string, code: string) => Promise<void>
  wechatLogin: (code: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('aquanet_token')
    const storedUser = localStorage.getItem('aquanet_user')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('aquanet_token')
        localStorage.removeItem('aquanet_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('aquanet_token', response.token)
    localStorage.setItem('aquanet_user', JSON.stringify(response.user))
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await api.register(email, password, name)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('aquanet_token', response.token)
    localStorage.setItem('aquanet_user', JSON.stringify(response.user))
  }

  const phoneLogin = async (phone: string, code: string) => {
    const response = await api.verifyPhoneCode(phone, code)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('aquanet_token', response.token)
    localStorage.setItem('aquanet_user', JSON.stringify(response.user))
  }

  const wechatLogin = async (code: string) => {
    const response = await api.wechatLogin(code)
    setUser(response.user)
    setToken(response.token)
    localStorage.setItem('aquanet_token', response.token)
    localStorage.setItem('aquanet_user', JSON.stringify(response.user))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('aquanet_token')
    localStorage.removeItem('aquanet_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!user,
        isLoading,
        login,
        register,
        phoneLogin,
        wechatLogin,
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
