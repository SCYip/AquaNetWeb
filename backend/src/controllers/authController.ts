import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import pool from '../config/database.js'
import { sendSms } from '../services/smsService.js'
import type { ApiResponse, User, JwtPayload, WeChatTokenResponse, WeChatUserInfo } from '../types/index.js'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

const generateToken = (user: { id: string; email?: string; phone?: string }): string => {
  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    phone: user.phone,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

export const register = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
      })
      return
    }

    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existing.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Email already registered',
      })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    await pool.query(
      'INSERT INTO users (id, email, name, password, auth_type) VALUES ($1, $2, $3, $4, $5)',
      [userId, email, name, hashedPassword, 'email']
    )

    const token = generateToken({ id: userId, email })

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: userId,
          email,
          name,
          auth_type: 'email',
        },
        token,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      error: 'Registration failed',
    })
  }
}

export const login = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      })
      return
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND auth_type = $2',
      [email, 'email']
    )

    const users = result.rows as User[]

    if (users.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      })
      return
    }

    const user = users[0]

    const isValidPassword = await bcrypt.compare(password, user.password || '')

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      })
      return
    }

    const token = generateToken({ id: user.id, email: user.email || undefined })

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          auth_type: user.auth_type,
        },
        token,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Login failed',
    })
  }
}

export const getProfile = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = (req as Request & { user: JwtPayload }).user.id

    const result = await pool.query(
      'SELECT id, email, phone, name, auth_type, created_at FROM users WHERE id = $1',
      [userId]
    )

    const users = result.rows as User[]

    if (users.length === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      })
      return
    }

    res.json({
      success: true,
      data: users[0],
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    })
  }
}

export const phoneLoginSendCode = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { phone } = req.body

    if (!phone) {
      res.status(400).json({
        success: false,
        error: 'Phone number is required',
      })
      return
    }

    const phoneRegex = /^[\d]{10,15}$/
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
      })
      return
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    const codeId = uuidv4()
    await pool.query(
      'INSERT INTO sms_codes (id, phone, code, expires_at) VALUES ($1, $2, $3, $4)',
      [codeId, phone, code, expiresAt]
    )

    const smsConfig = {
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
      signName: process.env.ALIYUN_SMS_SIGN_NAME || 'AquaNet',
      templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || 'SMS_xxxxxxx',
    }

    const smsResult = await sendSms(phone, code, smsConfig)
    const isDev = process.env.NODE_ENV === 'development'

    res.json({
      success: true,
      message: isDev ? `Verification code: ${code}` : smsResult.message,
      data: isDev ? { code } : undefined,
    })
  } catch (error) {
    console.error('Send SMS error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send verification code',
    })
  }
}

export const phoneLoginVerify = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { phone, code } = req.body

    if (!phone || !code) {
      res.status(400).json({
        success: false,
        error: 'Phone and code are required',
      })
      return
    }

    const result = await pool.query(
      'SELECT * FROM sms_codes WHERE phone = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [phone, code]
    )

    const codes = result.rows as { id: string; phone: string }[]

    if (codes.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired verification code',
      })
      return
    }

    await pool.query('DELETE FROM sms_codes WHERE id = $1', [codes[0].id])

    const existing = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    )

    let user: User
    const existingUsers = existing.rows as User[]

    if (existingUsers.length > 0) {
      user = existingUsers[0]
    } else {
      const userId = uuidv4()
      await pool.query(
        'INSERT INTO users (id, phone, name, auth_type) VALUES ($1, $2, $3, $4)',
        [userId, phone, `User${phone.slice(-4)}`, 'phone']
      )
      user = {
        id: userId,
        phone,
        name: `User${phone.slice(-4)}`,
        auth_type: 'phone',
        email: undefined,
        password: undefined,
        wechat_openid: undefined,
        created_at: new Date(),
        updated_at: new Date(),
      }
    }

    const token = generateToken({ id: user.id, phone: user.phone || undefined })

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          auth_type: user.auth_type,
        },
        token,
      },
    })
  } catch (error) {
    console.error('Phone verify error:', error)
    res.status(500).json({
      success: false,
      error: 'Verification failed',
    })
  }
}

export const wechatLogin = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { code } = req.body

    if (!code) {
      res.status(400).json({
        success: false,
        error: 'Authorization code is required',
      })
      return
    }

    const wechatAppId = process.env.WECHAT_APP_ID
    const wechatAppSecret = process.env.WECHAT_APP_SECRET

    if (!wechatAppId || !wechatAppSecret || wechatAppId === 'your_wechat_app_id') {
      res.status(501).json({
        success: false,
        error: 'WeChat login not configured. Please set WECHAT_APP_ID and WECHAT_APP_SECRET',
      })
      return
    }

    const tokenResponse = await fetch(
      `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wechatAppId}&secret=${wechatAppSecret}&code=${code}&grant_type=authorization_code`
    )

    const tokenData = (await tokenResponse.json()) as WeChatTokenResponse

    if (tokenData.errcode) {
      res.status(400).json({
        success: false,
        error: tokenData.errmsg || 'WeChat authentication failed',
      })
      return
    }

    const openid = tokenData.openid as string
    const accessToken = tokenData.access_token as string

    if (!openid || !accessToken) {
      res.status(400).json({
        success: false,
        error: 'Invalid WeChat token response',
      })
      return
    }

    const existing = await pool.query(
      'SELECT * FROM users WHERE wechat_openid = $1',
      [openid]
    )

    let user: User
    const existingUsers = existing.rows as User[]

    if (existingUsers.length > 0) {
      user = existingUsers[0]
    } else {
      const userInfoResponse = await fetch(
        `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}`
      )
      const userInfo = (await userInfoResponse.json()) as WeChatUserInfo

      const userId = uuidv4()
      const name = userInfo.nickname || `WeChat User`

      await pool.query(
        'INSERT INTO users (id, name, wechat_openid, auth_type) VALUES ($1, $2, $3, $4)',
        [userId, name, openid, 'wechat']
      )

      user = {
        id: userId,
        name,
        wechat_openid: openid,
        auth_type: 'wechat',
        email: undefined,
        phone: undefined,
        password: undefined,
        created_at: new Date(),
        updated_at: new Date(),
      }
    }

    const token = generateToken({ id: user.id })

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          auth_type: user.auth_type,
        },
        token,
      },
    })
  } catch (error) {
    console.error('WeChat login error:', error)
    res.status(500).json({
      success: false,
      error: 'WeChat login failed',
    })
  }
}
