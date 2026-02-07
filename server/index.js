import express from 'express'
import cors from 'cors'

// Routes
import productsRouter from './routes/products.js'
import categoriesRouter from './routes/categories.js'
import ordersRouter from './routes/orders.js'
import shippingRouter from './routes/shipping.js'
import settingsRouter from './routes/settings.js'
import usersRouter from './routes/users.js'
import adminsRouter from './routes/admins.js'

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())

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
  - /api/health
  ====================================
  `)
})
