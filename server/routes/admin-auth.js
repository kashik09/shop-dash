import { Router } from 'express'
import { readData, writeData } from '../utils/db.js'
import { logAudit } from '../utils/audit.js'
import { comparePassword, getCookieOptions, hashPassword, signAdminToken, verifyAdminToken } from '../utils/auth.js'
import { isEmail, isNonEmptyString } from '../utils/validation.js'

const router = Router()

const toSafeAdmin = (admin) => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  permissions: admin.permissions || [],
  createdAt: admin.createdAt,
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  if (!isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  const admins = readData('admins') || []
  const admin = admins.find((a) => a.email?.toLowerCase() === email.toLowerCase())

  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  if (!admin.passwordHash) {
    const bootstrap = process.env.ADMIN_BOOTSTRAP_PASSWORD
    if (!bootstrap || bootstrap !== password) {
      return res.status(401).json({ error: 'Admin account is not configured' })
    }

    admin.passwordHash = await hashPassword(password)
    writeData('admins', admins)
  } else {
    const valid = await comparePassword(password, admin.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
  }

  const token = signAdminToken(admin)
  res.cookie('admin_session', token, getCookieOptions())

  logAudit({
    actorType: 'admin',
    actorId: admin.id,
    action: 'login',
    entity: 'admin',
    entityId: admin.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json(toSafeAdmin(admin))
})

router.get('/me', (req, res) => {
  const token = req.cookies?.admin_session
  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' })
  }

  try {
    const payload = verifyAdminToken(token)
    const admins = readData('admins') || []
    const admin = admins.find((a) => a.id === Number(payload.sub))
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' })
    }
    return res.json(toSafeAdmin(admin))
  } catch {
    return res.status(401).json({ error: 'Invalid admin session' })
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('admin_session', { path: '/' })
  res.status(204).send()
})

export default router
