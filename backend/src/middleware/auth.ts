import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { ApiResponse } from '../types/index.js'

export interface JwtPayload {
  id: string
  email?: string
  phone?: string
}

export const authMiddleware = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'No token provided' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret'
    ) as JwtPayload

    ;(req as Request & { user: JwtPayload }).user = decoded
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' })
  }
}

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_secret'
      ) as JwtPayload
      ;(req as Request & { user: JwtPayload }).user = decoded
    } catch {
      // Token invalid, but continue without user
    }
  }

  next()
}
