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

const maskString = (value) => {
  if (!value) return value
  const str = String(value)
  if (str.length <= 2) return '*'.repeat(str.length)
  return `${str[0]}${'*'.repeat(str.length - 2)}${str[str.length - 1]}`
}

const maskEmail = (value) => {
  if (!value) return value
  const [local, domain] = String(value).split('@')
  if (!domain) return maskString(value)
  const localMasked = local.length <= 1 ? '*' : `${local[0]}${'*'.repeat(local.length - 1)}`
  return `${localMasked}@${domain}`
}

const maskPhone = (value) => {
  if (!value) return value
  const raw = String(value)
  const digits = raw.replace(/\D/g, '')
  if (digits.length <= 3) return '*'.repeat(digits.length)
  const masked = `${'*'.repeat(Math.max(digits.length - 3, 3))}${digits.slice(-3)}`
  return raw.startsWith('+') ? `+${masked}` : masked
}

const maskIp = (value) => {
  if (!value) return value
  const raw = String(value)
  if (raw.includes('.')) {
    const parts = raw.split('.')
    if (parts.length === 4) {
      return `***.***.***.${parts[3]}`
    }
  }
  return maskString(raw)
}

const maskUserAgent = (value) => {
  if (!value) return value
  return 'Hidden'
}

const decryptUser = (user, unmask) => {
  const email = user.email ? decryptField(user.email) : null
  const phone = user.phone ? decryptField(user.phone) : null
  return {
    ...user,
    name: unmask ? user.name : maskString(user.name),
    email: unmask ? email : maskEmail(email),
    phone: unmask ? phone : maskPhone(phone),
    passwordHash: undefined,
  }
}

const decryptOrder = (order, unmask) => {
  const customerName = order.customerName ? decryptField(order.customerName) : null
  const customerEmail = order.customerEmail ? decryptField(order.customerEmail) : null
  const customerPhone = order.customerPhone ? decryptField(order.customerPhone) : null
  const location = order.location ? decryptField(order.location) : null

  return {
    ...order,
    customerName: unmask ? customerName : maskString(customerName),
    customerEmail: unmask ? customerEmail : maskEmail(customerEmail),
    customerPhone: unmask ? customerPhone : maskPhone(customerPhone),
    location: unmask ? location : maskString(location),
  }
}

const sanitizeAdmins = (admin) => {
  const { password, passwordHash, ...safe } = admin
  return safe
}

router.get('/', (req, res) => {
  const unmask = req.cookies?.admin_unmask === '1'
  const dataset = String(req.query.dataset || '').trim()
  if (!allowedDatasets.has(dataset)) {
    return res.status(400).json({ error: 'Invalid dataset' })
  }

  switch (dataset) {
    case 'users':
      return res.json((readData('users') || []).map((user) => decryptUser(user, unmask)))
    case 'orders':
      return res.json((readData('orders') || []).map((order) => decryptOrder(order, unmask)))
    case 'products':
      return res.json(readData('products') || [])
    case 'categories':
      return res.json(readData('categories') || [])
    case 'shipping':
      return res.json(readData('shipping') || [])
    case 'settings':
      {
        const settings = readData('settings') || {}
        if (!unmask && settings.store) {
          settings.store = {
            ...settings.store,
            email: maskEmail(settings.store.email),
            phone: maskPhone(settings.store.phone),
          }
        }
        return res.json(settings)
      }
    case 'consents':
      return res.json(
        (readData('consents') || []).map((consent) => ({
          ...consent,
          email: unmask ? consent.email : maskEmail(consent.email),
        }))
      )
    case 'audit':
      return res.json(
        (readData('audit') || []).map((entry) => ({
          ...entry,
          ip: unmask ? entry.ip : maskIp(entry.ip),
          userAgent: unmask ? entry.userAgent : maskUserAgent(entry.userAgent),
        }))
      )
    case 'admin-alerts':
      return res.json(
        (readData('admin-alerts') || []).map((entry) => ({
          ...entry,
          email: unmask ? entry.email : maskEmail(entry.email),
          ip: unmask ? entry.ip : maskIp(entry.ip),
          userAgent: unmask ? entry.userAgent : maskUserAgent(entry.userAgent),
        }))
      )
    case 'admins':
      return res.json(
        (readData('admins') || []).map((admin) => {
          const safe = sanitizeAdmins(admin)
          return {
            ...safe,
            name: unmask ? safe.name : maskString(safe.name),
            email: unmask ? safe.email : maskEmail(safe.email),
          }
        })
      )
    default:
      return res.status(400).json({ error: 'Invalid dataset' })
  }
})

export default router
