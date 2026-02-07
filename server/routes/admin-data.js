import { Router } from 'express'
import { readData } from '../utils/db.js'
import { decryptField } from '../utils/crypto.js'

const router = Router()

const allowedDatasets = new Set([
  'users',
  'orders',
  'products',
  'categories',
  'shipping',
  'settings',
  'consents',
  'audit',
  'admin-alerts',
  'admins',
])

const decryptUser = (user) => ({
  ...user,
  email: user.email ? decryptField(user.email) : null,
  phone: user.phone ? decryptField(user.phone) : null,
  passwordHash: undefined,
})

const decryptOrder = (order) => ({
  ...order,
  customerName: order.customerName ? decryptField(order.customerName) : null,
  customerEmail: order.customerEmail ? decryptField(order.customerEmail) : null,
  customerPhone: order.customerPhone ? decryptField(order.customerPhone) : null,
  location: order.location ? decryptField(order.location) : null,
})

const sanitizeAdmins = (admin) => {
  const { password, passwordHash, ...safe } = admin
  return safe
}

router.get('/', (req, res) => {
  const dataset = String(req.query.dataset || '').trim()
  if (!allowedDatasets.has(dataset)) {
    return res.status(400).json({ error: 'Invalid dataset' })
  }

  switch (dataset) {
    case 'users':
      return res.json((readData('users') || []).map(decryptUser))
    case 'orders':
      return res.json((readData('orders') || []).map(decryptOrder))
    case 'products':
      return res.json(readData('products') || [])
    case 'categories':
      return res.json(readData('categories') || [])
    case 'shipping':
      return res.json(readData('shipping') || [])
    case 'settings':
      return res.json(readData('settings') || {})
    case 'consents':
      return res.json(readData('consents') || [])
    case 'audit':
      return res.json(readData('audit') || [])
    case 'admin-alerts':
      return res.json(readData('admin-alerts') || [])
    case 'admins':
      return res.json((readData('admins') || []).map(sanitizeAdmins))
    default:
      return res.status(400).json({ error: 'Invalid dataset' })
  }
})

export default router
