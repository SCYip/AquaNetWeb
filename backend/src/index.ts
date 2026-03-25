import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './config/database.js'
import authRoutes from './routes/auth.js'
import buoyRoutes from './routes/buoys.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// CORS
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
      return callback(null, true)
    }

    // Allow exact matches or subdomain matching
    const isAllowed = corsOrigins.some(allowed => {
      const allowedUrl = new URL(allowed)
      const originUrl = new URL(origin)
      return (
        origin === allowed ||
        (originUrl.hostname === allowedUrl.hostname && originUrl.protocol === allowedUrl.protocol)
      )
    })

    if (isAllowed) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed. Allowed: ${corsOrigins.join(', ')}`))
    }
  },
  credentials: true,
}))

// Body parser
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/buoys', buoyRoutes)

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message)
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

// Start server
const startServer = async () => {
  try {
    await initDatabase()
    app.listen(PORT, () => {
      console.log(`🚀 AquaNet API server running on port ${PORT}`)
      console.log(`   Health check: http://localhost:${PORT}/health`)
      console.log(`   Auth endpoints: http://localhost:${PORT}/api/auth`)
      console.log(`   Buoys endpoints: http://localhost:${PORT}/api/buoys`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
