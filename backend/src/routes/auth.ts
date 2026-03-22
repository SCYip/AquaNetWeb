import { Router } from 'express'
import {
  register,
  login,
  getProfile,
  phoneLoginSendCode,
  phoneLoginVerify,
  wechatLogin,
} from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/phone/send-code', phoneLoginSendCode)
router.post('/phone/verify', phoneLoginVerify)
router.post('/wechat', wechatLogin)

// Protected routes
router.get('/profile', authMiddleware, getProfile)

export default router
