import { Router } from 'express'
import { readData, writeData } from '../utils/db.js'
import { decryptField, encryptField, hashValue, normalizeEmail, normalizePhone } from '../utils/crypto.js'
import { logAudit } from '../utils/audit.js'
import { requireUser } from '../middleware/auth.js'
import { isEmail, isPhone, parseBoolean } from '../utils/validation.js'
import { requireCsrfForWrite } from '../middleware/csrf.js'

const router = Router()
router.use(requireCsrfForWrite)

const decryptOrder = (order) => ({
  ...order,
  customerName: order.customerName ? decryptField(order.customerName) : null,
  customerEmail: order.customerEmail ? decryptField(order.customerEmail) : null,
  customerPhone: order.customerPhone ? decryptField(order.customerPhone) : null,
  location: order.location ? decryptField(order.location) : null,
})

const validatePreferencesPatch = (payload) => {
  const updates = { ...payload }
  if (updates.theme !== undefined && !['light', 'dark', 'system'].includes(updates.theme)) {
    return { ok: false, error: 'Invalid theme value' }
  }
  if (updates.notifications) {
    const next = { ...updates.notifications }
    for (const key of ['orderUpdates', 'shippingUpdates', 'marketing']) {
      if (next[key] !== undefined) {
        const value = parseBoolean(next[key])
        if (value === null) return { ok: false, error: `Invalid ${key} value` }
        next[key] = value
      }
    }
    updates.notifications = next
  }
  if (updates.shipping) {
    const next = { ...updates.shipping }
    for (const key of ['name', 'phone', 'location', 'address']) {
      if (next[key] !== undefined && typeof next[key] !== 'string') {
        return { ok: false, error: `Invalid ${key} value` }
      }
    }
    updates.shipping = next
  }
  if (updates.marketingOptIn !== undefined) {
    const value = parseBoolean(updates.marketingOptIn)
    if (value === null) return { ok: false, error: 'Invalid marketingOptIn value' }
    updates.marketingOptIn = value
  }
  return { ok: true, data: updates }
}

router.get('/orders', requireUser, (req, res) => {
  const orders = readData('orders') || []
  const userId = Number(req.user.sub)
  const filtered = orders.filter((order) => order.userId === userId)
  res.json(filtered.map(decryptOrder))
})

router.get('/preferences', requireUser, (req, res) => {
  const users = readData('users') || []
  const user = users.find((u) => u.id === Number(req.user.sub))

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json(user.preferences || {})
})

router.patch('/preferences', requireUser, (req, res) => {
  const users = readData('users') || []
  const userIndex = users.findIndex((u) => u.id === Number(req.user.sub))

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' })
  }

  const validation = validatePreferencesPatch(req.body || {})
  if (!validation.ok) {
    return res.status(400).json({ error: validation.error })
  }

  const nextPreferences = {
    ...users[userIndex].preferences,
    ...validation.data,
  }

  if (nextPreferences.shipping) {
    nextPreferences.shipping = {
      ...users[userIndex].preferences?.shipping,
      ...validation.data.shipping,
    }
  }

  users[userIndex].preferences = nextPreferences
  writeData('users', users)

  logAudit({
    actorType: 'user',
    actorId: users[userIndex].id,
    action: 'update_preferences',
    entity: 'user',
    entityId: users[userIndex].id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json(nextPreferences)
})

router.patch('/contact', requireUser, (req, res) => {
  const { email, phone } = req.body || {}
  const users = readData('users') || []
  const userIndex = users.findIndex((u) => u.id === Number(req.user.sub))

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' })
  }

  if (email) {
    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' })
    }
    const normalized = normalizeEmail(email)
    const emailHash = hashValue(normalized)
    const duplicate = users.find((u) => u.emailHash === emailHash && u.id !== users[userIndex].id)
    if (duplicate) {
      return res.status(400).json({ error: 'Email already registered' })
    }
    users[userIndex].email = encryptField(normalized)
    users[userIndex].emailHash = emailHash
  }

  if (phone) {
    if (!isPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' })
    }
    const normalized = normalizePhone(phone)
    const phoneHash = hashValue(normalized)
    const duplicate = users.find((u) => u.phoneHash === phoneHash && u.id !== users[userIndex].id)
    if (duplicate) {
      return res.status(400).json({ error: 'Phone already registered' })
    }
    users[userIndex].phone = encryptField(normalized)
    users[userIndex].phoneHash = phoneHash
  }

  writeData('users', users)

  logAudit({
    actorType: 'user',
    actorId: users[userIndex].id,
    action: 'update_contact',
    entity: 'user',
    entityId: users[userIndex].id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json({
    email: users[userIndex].email ? decryptField(users[userIndex].email) : null,
    phone: users[userIndex].phone ? decryptField(users[userIndex].phone) : null,
  })
})

export default router
