import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'
import { hashPassword } from '../utils/auth.js'
import { requireSuperAdmin } from '../middleware/auth.js'
import { logAudit } from '../utils/audit.js'
import { isEmail, isNonEmptyString } from '../utils/validation.js'
import { requireCsrfForWrite } from '../middleware/csrf.js'
import { logAdminAlert } from '../utils/admin-alerts.js'

const router = Router()
router.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next()
  return requireSuperAdmin(req, res, next)
})
router.use(requireCsrfForWrite)

const allowedRoles = new Set(['admin', 'super_admin'])

// GET all admins
router.get('/', (req, res) => {
  const admins = readData('admins')
  // Don't expose sensitive data
  const safeAdmins = admins.map(({ password, passwordHash, ...admin }) => admin)
  res.json(safeAdmins)
})

// GET single admin
router.get('/:id', (req, res) => {
  const admins = readData('admins')
  const admin = admins.find(a => a.id === parseInt(req.params.id))

  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' })
  }

  const { password, passwordHash, ...safeAdmin } = admin
  res.json(safeAdmin)
})

// GET admin by email
router.get('/email/:email', (req, res) => {
  const admins = readData('admins')
  if (!isEmail(req.params.email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }
  const admin = admins.find(a => a.email === req.params.email)

  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' })
  }

  const { password, passwordHash, ...safeAdmin } = admin
  res.json(safeAdmin)
})

// POST new admin
router.post('/', async (req, res) => {
  const admins = readData('admins')

  // Check if email already exists
  if (!isNonEmptyString(req.body?.name) || !isNonEmptyString(req.body?.email)) {
    return res.status(400).json({ error: 'Name and email are required' })
  }

  if (!isEmail(req.body.email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  if (admins.find(a => a.email === req.body.email)) {
    return res.status(400).json({ error: 'Email already registered' })
  }

  if (req.body.role && !allowedRoles.has(req.body.role)) {
    return res.status(400).json({ error: 'Invalid admin role' })
  }

  if (req.body.password && String(req.body.password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const newAdmin = {
    id: getNextId(admins),
    ...req.body,
    role: req.body.role || 'admin',
    permissions: req.body.permissions || ['products', 'orders'],
    createdAt: new Date().toISOString()
  }

  if (req.body.password) {
    newAdmin.passwordHash = await hashPassword(req.body.password)
    delete newAdmin.password
  }

  admins.push(newAdmin)
  writeData('admins', admins)

  logAdminAlert({
    adminId: newAdmin.id,
    type: 'admin_created',
    message: `Admin account created for ${newAdmin.email}.`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    email: newAdmin.email,
  })

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'create_admin',
    entity: 'admin',
    entityId: newAdmin.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  const { password, passwordHash, ...safeAdmin } = newAdmin
  res.status(201).json(safeAdmin)
})

// PUT update admin
router.put('/:id', (req, res) => {
  const admins = readData('admins')
  const index = admins.findIndex(a => a.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ error: 'Admin not found' })
  }

  const previousRole = admins[index].role
  if (req.body?.email && !isEmail(req.body.email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }
  if (req.body?.name && !isNonEmptyString(req.body.name)) {
    return res.status(400).json({ error: 'Invalid name' })
  }
  if (req.body?.role && !allowedRoles.has(req.body.role)) {
    return res.status(400).json({ error: 'Invalid admin role' })
  }

  admins[index] = { ...admins[index], ...req.body }
  writeData('admins', admins)

  if (req.body?.role && previousRole !== req.body.role) {
    logAdminAlert({
      adminId: admins[index].id,
      type: 'role_changed',
      message: `Admin role changed from ${previousRole} to ${req.body.role}.`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      email: admins[index].email,
      metadata: { previousRole, nextRole: req.body.role },
    })
  }

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'update_admin',
    entity: 'admin',
    entityId: admins[index].id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  const { password, passwordHash, ...safeAdmin } = admins[index]
  res.json(safeAdmin)
})

// PATCH partial update
router.patch('/:id', (req, res) => {
  const admins = readData('admins')
  const index = admins.findIndex(a => a.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ error: 'Admin not found' })
  }

  const previousRole = admins[index].role
  if (req.body?.email && !isEmail(req.body.email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }
  if (req.body?.name && !isNonEmptyString(req.body.name)) {
    return res.status(400).json({ error: 'Invalid name' })
  }
  if (req.body?.role && !allowedRoles.has(req.body.role)) {
    return res.status(400).json({ error: 'Invalid admin role' })
  }

  admins[index] = { ...admins[index], ...req.body }
  writeData('admins', admins)

  if (req.body?.role && previousRole !== req.body.role) {
    logAdminAlert({
      adminId: admins[index].id,
      type: 'role_changed',
      message: `Admin role changed from ${previousRole} to ${req.body.role}.`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      email: admins[index].email,
      metadata: { previousRole, nextRole: req.body.role },
    })
  }

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'update_admin',
    entity: 'admin',
    entityId: admins[index].id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  const { password, passwordHash, ...safeAdmin } = admins[index]
  res.json(safeAdmin)
})

// DELETE admin
router.delete('/:id', (req, res) => {
  const admins = readData('admins')
  const index = admins.findIndex(a => a.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ error: 'Admin not found' })
  }

  // Prevent deleting the last super_admin
  const admin = admins[index]
  if (admin.role === 'super_admin') {
    const superAdminCount = admins.filter(a => a.role === 'super_admin').length
    if (superAdminCount <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last super admin' })
    }
  }

  admins.splice(index, 1)
  writeData('admins', admins)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'delete_admin',
    entity: 'admin',
    entityId: Number(req.params.id),
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.status(204).send()
})

export default router
