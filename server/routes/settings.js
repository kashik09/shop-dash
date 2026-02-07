import { Router } from 'express'
import { readData, writeData } from '../utils/db.js'
import { requireAdminForWrite } from '../middleware/auth.js'
import { logAudit } from '../utils/audit.js'

const router = Router()
router.use(requireAdminForWrite)

router.get('/', (req, res) => {
  res.json(readData('settings'))
})

router.put('/', (req, res) => {
  const settings = readData('settings')
  const updated = { ...settings, ...req.body }
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
  settings.notifications = { ...settings.notifications, ...req.body }
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
  settings.store = { ...settings.store, ...req.body }
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
  settings.cookies = { ...settings.cookies, ...req.body }
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
