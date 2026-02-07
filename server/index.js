import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'

// Routes
import productsRouter from './routes/products.js'
import categoriesRouter from './routes/categories.js'
import ordersRouter from './routes/orders.js'
import shippingRouter from './routes/shipping.js'
import settingsRouter from './routes/settings.js'
import usersRouter from './routes/users.js'
import adminsRouter from './routes/admins.js'
import consentsRouter from './routes/consents.js'
import authRouter from './routes/auth.js'
import adminAuthRouter from './routes/admin-auth.js'
import meRouter from './routes/me.js'
import csrfRouter from './routes/csrf.js'
import { requireAdmin } from './middleware/auth.js'
import { requireAdminOrigin } from './middleware/admin-origin.js'

const app = express()
const PORT = process.env.PORT || 4000
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://127.0.0.1:5173']

// Middleware
app.disable('x-powered-by')

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1)
}

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (corsOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})

app.use('/api', apiLimiter)

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// API Routes
app.use('/api/products', productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/shipping', shippingRouter)
app.use('/api/shippingRates', shippingRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/users', requireAdminOrigin, requireAdmin, usersRouter)
app.use('/api/admins', requireAdminOrigin, requireAdmin, adminsRouter)
app.use('/api/consents', consentsRouter)
app.use('/api/csrf', csrfRouter)
app.use('/api/auth', authLimiter, authRouter)
app.use('/api/admin-auth', requireAdminOrigin, authLimiter, adminAuthRouter)
app.use('/api/me', meRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`
  ====================================
     ShopDash API Server
  ====================================
  Server running on port ${PORT}

  Endpoints:
  - /api/products
  - /api/categories
  - /api/orders
  - /api/shipping
  - /api/settings
  - /api/users
  - /api/admins
  - /api/consents
  - /api/csrf
  - /api/auth
  - /api/admin-auth
  - /api/me
  - /api/health
  ====================================
  `)
})
