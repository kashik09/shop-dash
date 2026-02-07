import { Router } from 'express'
import { readData, writeData } from '../utils/db.js'
import { requireAdminForWrite } from '../middleware/auth.js'
import { requireCsrfForWrite } from '../middleware/csrf.js'
import { logAudit } from '../utils/audit.js'
import {
  isNonEmptyString,
  parseBoolean,
  parseNumber,
  toTrimmedString,
  validateContactValue,
} from '../utils/validation.js'

const router = Router()
router.use(requireAdminForWrite)
router.use(requireCsrfForWrite)

const validateStorePatch = (payload) => {
  const updates = { ...payload }
  if (updates.name !== undefined && !isNonEmptyString(updates.name)) {
    return { ok: false, error: 'Invalid store name' }
  }
  if (updates.address !== undefined && !isNonEmptyString(updates.address)) {
    return { ok: false, error: 'Invalid store address' }
  }
  if (updates.currency !== undefined && !isNonEmptyString(updates.currency)) {
    return { ok: false, error: 'Invalid currency' }
  }
  if (updates.country !== undefined && !isNonEmptyString(updates.country)) {
    return { ok: false, error: 'Invalid country' }
  }
  if (updates.email !== undefined) {
    const contact = validateContactValue(updates.email)
    if (!contact.ok) return { ok: false, error: contact.error }
    updates.email = contact.value
  }
  if (updates.phone !== undefined && isNonEmptyString(updates.phone)) {
    const cleaned = updates.phone.trim()
    if (!/^\+?\d{7,15}$/.test(cleaned.replace(/[\s()-]/g, ''))) {
      return { ok: false, error: 'Invalid phone number' }
    }
  }

  if (updates.name) updates.name = toTrimmedString(updates.name)
  if (updates.address) updates.address = toTrimmedString(updates.address)
  if (updates.currency) updates.currency = toTrimmedString(updates.currency)
  if (updates.country) updates.country = toTrimmedString(updates.country)
  if (updates.phone) updates.phone = toTrimmedString(updates.phone)

  return { ok: true, data: updates }
}

const validateNotificationsPatch = (payload) => {
  const updates = { ...payload }
  const keys = ['emailEnabled', 'lowStockAlert', 'orderConfirmation', 'shippingUpdates']
  for (const key of keys) {
    if (updates[key] !== undefined) {
      const value = parseBoolean(updates[key])
      if (value === null) return { ok: false, error: `Invalid ${key} value` }
      updates[key] = value
    }
  }
  return { ok: true, data: updates }
}

const validateCookiesPatch = (payload) => {
  const updates = { ...payload }
  const keys = ['enabled', 'requireConsent']
  for (const key of keys) {
    if (updates[key] !== undefined) {
      const value = parseBoolean(updates[key])
      if (value === null) return { ok: false, error: `Invalid ${key} value` }
      updates[key] = value
    }
  }
  return { ok: true, data: updates }
}

const validateTaxPatch = (payload) => {
  const updates = { ...payload }
  if (updates.enabled !== undefined) {
    const value = parseBoolean(updates.enabled)
    if (value === null) return { ok: false, error: 'Invalid tax enabled value' }
    updates.enabled = value
  }
  if (updates.includeInPrice !== undefined) {
    const value = parseBoolean(updates.includeInPrice)
    if (value === null) return { ok: false, error: 'Invalid tax includeInPrice value' }
    updates.includeInPrice = value
  }
  if (updates.name !== undefined && !isNonEmptyString(updates.name)) {
    return { ok: false, error: 'Invalid tax name' }
  }
  if (updates.rate !== undefined) {
    const rate = parseNumber(updates.rate)
    if (rate === null || rate < 0 || rate > 100) {
      return { ok: false, error: 'Invalid tax rate' }
    }
    updates.rate = rate
  }
  if (updates.name) updates.name = toTrimmedString(updates.name)
  return { ok: true, data: updates }
}

router.get('/', (req, res) => {
  res.json(readData('settings'))
})

router.put('/', (req, res) => {
  const settings = readData('settings')
  let updated = { ...settings }

  if (req.body?.store) {
    const storeCheck = validateStorePatch(req.body.store)
    if (!storeCheck.ok) return res.status(400).json({ error: storeCheck.error })
    updated.store = { ...updated.store, ...storeCheck.data }
  }

  if (req.body?.notifications) {
    const notificationCheck = validateNotificationsPatch(req.body.notifications)
    if (!notificationCheck.ok) return res.status(400).json({ error: notificationCheck.error })
    updated.notifications = { ...updated.notifications, ...notificationCheck.data }
  }

  if (req.body?.cookies) {
    const cookieCheck = validateCookiesPatch(req.body.cookies)
    if (!cookieCheck.ok) return res.status(400).json({ error: cookieCheck.error })
    updated.cookies = { ...updated.cookies, ...cookieCheck.data }
  }

  if (req.body?.tax) {
    const taxCheck = validateTaxPatch(req.body.tax)
    if (!taxCheck.ok) return res.status(400).json({ error: taxCheck.error })
    updated.tax = { ...updated.tax, ...taxCheck.data }
  }

  writeData('settings', updated)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'update_settings',
    entity: 'settings',
    entityId: null,
    metadata: { keys: Object.keys(req.body || {}) },
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json(updated)
})

router.patch('/notifications', (req, res) => {
  const settings = readData('settings')
  const notificationCheck = validateNotificationsPatch(req.body || {})
  if (!notificationCheck.ok) return res.status(400).json({ error: notificationCheck.error })
  settings.notifications = { ...settings.notifications, ...notificationCheck.data }
  writeData('settings', settings)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'update_notifications',
    entity: 'settings',
    entityId: null,
    metadata: { keys: Object.keys(req.body || {}) },
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json(settings.notifications)
})

router.patch('/store', (req, res) => {
  const settings = readData('settings')
  const storeCheck = validateStorePatch(req.body || {})
  if (!storeCheck.ok) return res.status(400).json({ error: storeCheck.error })
  settings.store = { ...settings.store, ...storeCheck.data }
  writeData('settings', settings)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'update_store',
    entity: 'settings',
    entityId: null,
    metadata: { keys: Object.keys(req.body || {}) },
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json(settings.store)
})

router.patch('/cookies', (req, res) => {
  const settings = readData('settings')
  const cookieCheck = validateCookiesPatch(req.body || {})
  if (!cookieCheck.ok) return res.status(400).json({ error: cookieCheck.error })
  settings.cookies = { ...settings.cookies, ...cookieCheck.data }
  writeData('settings', settings)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'update_cookies',
    entity: 'settings',
    entityId: null,
    metadata: { keys: Object.keys(req.body || {}) },
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json(settings.cookies)
})

export default router
