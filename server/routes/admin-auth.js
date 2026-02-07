import { Router } from 'express'
import { readData, writeData } from '../utils/db.js'
import { logAudit } from '../utils/audit.js'
import { comparePassword, getAdminCookieOptions, hashPassword, signAdminToken, verifyAdminToken } from '../utils/auth.js'
import { isEmail, isNonEmptyString } from '../utils/validation.js'
import { logAdminAlert } from '../utils/admin-alerts.js'

const router = Router()
const MAX_FAILED_ATTEMPTS = parseInt(process.env.ADMIN_MAX_FAILED_ATTEMPTS || '5', 10)
const LOCK_MINUTES = parseInt(process.env.ADMIN_LOCK_MINUTES || '15', 10)

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

  const now = new Date()
  if (admin.lockedUntil && new Date(admin.lockedUntil) > now) {
    return res.status(429).json({ error: 'Account locked. Try again later.' })
  }

  if (!admin.passwordHash) {
    const bootstrap = process.env.ADMIN_BOOTSTRAP_PASSWORD
    if (!bootstrap || bootstrap !== password) {
      admin.failedAttempts = (admin.failedAttempts || 0) + 1
      admin.lastFailedAt = now.toISOString()
      if (admin.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        admin.lockedUntil = new Date(now.getTime() + LOCK_MINUTES * 60 * 1000).toISOString()
        logAdminAlert({
          adminId: admin.id,
          type: 'account_locked',
          message: `Admin account locked after ${admin.failedAttempts} failed attempts.`,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          email: admin.email,
        })
      }
      writeData('admins', admins)
      logAudit({
        actorType: 'admin',
        actorId: admin.id,
        action: 'login_failed',
        entity: 'admin',
        entityId: admin.id,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      })
      return res.status(401).json({ error: 'Admin account is not configured' })
    }

    admin.passwordHash = await hashPassword(password)
    writeData('admins', admins)
  } else {
    const valid = await comparePassword(password, admin.passwordHash)
    if (!valid) {
      admin.failedAttempts = (admin.failedAttempts || 0) + 1
      admin.lastFailedAt = now.toISOString()
      if (admin.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        admin.lockedUntil = new Date(now.getTime() + LOCK_MINUTES * 60 * 1000).toISOString()
        logAdminAlert({
          adminId: admin.id,
          type: 'account_locked',
          message: `Admin account locked after ${admin.failedAttempts} failed attempts.`,
          ip: req.ip,
          userAgent: req.get('user-agent'),
          email: admin.email,
        })
      }
      writeData('admins', admins)
      logAudit({
        actorType: 'admin',
        actorId: admin.id,
        action: 'login_failed',
        entity: 'admin',
        entityId: admin.id,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      })
      return res.status(401).json({ error: 'Invalid credentials' })
    }
  }

  const token = signAdminToken(admin)
  res.cookie('admin_session', token, getAdminCookieOptions())

  const previousIp = admin.lastLoginIp
  admin.failedAttempts = 0
  admin.lockedUntil = null
  admin.lastLoginAt = now.toISOString()
  admin.lastLoginIp = req.ip
  admin.lastActiveAt = now.toISOString()
  writeData('admins', admins)

  if (previousIp && previousIp !== req.ip) {
    logAdminAlert({
      adminId: admin.id,
      type: 'login_new_ip',
      message: `Admin login from a new IP address: ${req.ip}`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      email: admin.email,
      metadata: { previousIp },
    })
  }

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
