// Dev: localhost:3000. Production: /api (same origin, no CORS)
const envUrl = import.meta.env.VITE_API_URL
const API_BASE_URL =
  envUrl && envUrl.trim()
    ? envUrl.trim()
    : import.meta.env.DEV
      ? 'http://localhost:3000/api'
      : '/api'

interface ApiOptions {
  method?: string
  body?: unknown
  token?: string | null
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const { method = 'GET', body, token } = options

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const config: RequestInit = {
      method,
      headers,
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config)
    const data: ApiResponse<T> = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'API request failed')
    }

    return data.data as T
  }

  // Auth
  async register(email: string, password: string, name: string) {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    })
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  }

  async sendPhoneCode(phone: string) {
    return this.request<{ code?: string }>('/auth/phone/send-code', {
      method: 'POST',
      body: { phone },
    })
  }

  async verifyPhoneCode(phone: string, code: string) {
    return this.request<{ user: User; token: string }>('/auth/phone/verify', {
      method: 'POST',
      body: { phone, code },
    })
  }

  async wechatLogin(code: string) {
    return this.request<{ user: User; token: string }>('/auth/wechat', {
      method: 'POST',
      body: { code },
    })
  }

  async getProfile(token: string) {
    return this.request<User>('/auth/profile', { token })
  }

  // Buoys
  async getBuoys(token?: string | null) {
    return this.request<Buoy[]>('/buoys', { token })
  }

  async getBuoyById(id: string, token?: string | null) {
    return this.request<Buoy>(`/buoys/${id}`, { token })
  }

  async getMyBuoys(token: string) {
    return this.request<Buoy[]>('/buoys/my/list', { token })
  }

  async createBuoy(token: string, data: CreateBuoyData) {
    return this.request<Buoy>('/buoys', {
      method: 'POST',
      body: data,
      token,
    })
  }

  async updateBuoy(token: string, id: string, data: Partial<Buoy>) {
    return this.request<Buoy>(`/buoys/${id}`, {
      method: 'PUT',
      body: data,
      token,
    })
  }

  async deleteBuoy(token: string, id: string) {
    return this.request<void>(`/buoys/${id}`, {
      method: 'DELETE',
      token,
    })
  }

  async updateTelemetry(token: string, id: string, data: TelemetryData) {
    return this.request<Buoy>(`/buoys/${id}/telemetry`, {
      method: 'POST',
      body: data,
      token,
    })
  }
}

interface User {
  id: string
  email?: string
  phone?: string
  name: string
  auth_type: 'email' | 'wechat' | 'phone'
}

interface Buoy {
  id: string
  name: string
  owner_id: string
  lat: number
  lng: number
  temp: number
  ph: number
  turbidity: number
  created_at?: string
  updated_at?: string
}

interface CreateBuoyData {
  name: string
  lat: number
  lng: number
  temp?: number
  ph?: number
  turbidity?: number
}

interface TelemetryData {
  temp?: number
  ph?: number
  turbidity?: number
}

export const api = new ApiClient(API_BASE_URL)
export type { User, Buoy, CreateBuoyData, TelemetryData }
