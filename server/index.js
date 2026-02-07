import { createApp } from './app.js'

const app = createApp()
const PORT = process.env.PORT || 4000

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
  - /api/admin-data
  - /api/health
  ====================================
  `)
})
