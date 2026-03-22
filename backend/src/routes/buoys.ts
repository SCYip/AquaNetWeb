import { Router } from 'express'
import {
  getBuoys,
  getBuoyById,
  getMyBuoys,
  createBuoy,
  updateBuoy,
  deleteBuoy,
  updateBuoyTelemetry,
} from '../controllers/buoyController.js'
import { authMiddleware, optionalAuth } from '../middleware/auth.js'

const router = Router()

// Public routes
router.get('/', optionalAuth, getBuoys)
router.get('/:id', optionalAuth, getBuoyById)

// Protected routes
router.get('/my/list', authMiddleware, getMyBuoys)
router.post('/', authMiddleware, createBuoy)
router.put('/:id', authMiddleware, updateBuoy)
router.delete('/:id', authMiddleware, deleteBuoy)
router.post('/:id/telemetry', authMiddleware, updateBuoyTelemetry)

export default router
