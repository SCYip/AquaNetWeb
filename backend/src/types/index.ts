export interface User {
  id: string
  email: string | null
  phone: string | null
  name: string
  password: string | null
  auth_type: 'email' | 'wechat' | 'phone'
  wechat_openid: string | null
  created_at: Date
  updated_at: Date
}

export interface Buoy {
  id: string
  name: string
  owner_id: string
  lat: number
  lng: number
  temp: number
  ph: number
  turbidity: number
  created_at: Date
  updated_at: Date
}

export interface Telemetry {
  id: string
  buoy_id: string
  temp: number | null
  ph: number | null
  turbidity: number | null
  recorded_at: Date
}

export interface AuthRequest extends Express.Request {
  user?: {
    id: string
    email?: string
    phone?: string
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface JwtPayload {
  id: string
  email?: string
  phone?: string
  iat?: number
  exp?: number
}

export interface WeChatTokenResponse {
  access_token?: string
  expires_in?: number
  refresh_token?: string
  openid?: string
  scope?: string
  errcode?: number
  errmsg?: string
}

export interface WeChatUserInfo {
  openid?: string
  nickname?: string
  sex?: number
  province?: string
  city?: string
  country?: string
  headimgurl?: string
  errcode?: number
  errmsg?: string
}
