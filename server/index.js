import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

// Routes
import productsRouter from './routes/products.js'
import categoriesRouter from './routes/categories.js'
import ordersRouter from './routes/orders.js'
import shippingRouter from './routes/shipping.js'
import settingsRouter from './routes/settings.js'
import usersRouter from './routes/users.js'
import adminsRouter from './routes/admins.js'
import consentsRouter from './routes/consents.js'

const app = express()
const PORT = process.env.PORT || 4000
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
  : null

// Middleware
app.disable('x-powered-by')

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1)
}

app.use(helmet())
app.use(cors({
  origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
}))
app.use(express.json({ limit: '1mb' }))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
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
app.use('/api/users', usersRouter)
app.use('/api/admins', adminsRouter)
app.use('/api/consents', consentsRouter)

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
  - /api/health
  ====================================
  `)
})
