import { getAdminCookieOptions, getAdminSessionConfig, signAdminToken, verifyAdminToken, verifyUserToken } from '../utils/auth.js'
import { isAdminOriginAllowed } from './admin-origin.js'
import { readData, writeData } from '../utils/db.js'

export const requireUser = (req, res, next) => {
  const token = req.cookies?.session
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    req.user = verifyUserToken(token)
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid session' })
  }
}

export const maybeUser = (req, _res, next) => {
  const token = req.cookies?.session
  if (!token) return next()

  try {
    req.user = verifyUserToken(token)
  } catch {
    req.user = null
  }

  return next()
}

export const requireAdmin = (req, res, next) => {
  if (!isAdminOriginAllowed(req)) {
    return res.status(403).json({ error: 'Admin origin not allowed' })
  }

  const token = req.cookies?.admin_session
  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' })
  }

  try {
    const payload = verifyAdminToken(token)
    const admins = readData('admins') || []
    const admin = admins.find((record) => record.id === Number(payload.sub))

    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' })
    }

    if (admin.lockedUntil && new Date(admin.lockedUntil) > new Date()) {
      res.clearCookie('admin_session', { path: '/' })
      return res.status(403).json({ error: 'Admin account locked' })
    }

    const { idleMinutes, rotateMinutes } = getAdminSessionConfig()
    const now = new Date()

    if (admin.lastActiveAt) {
      const lastActive = new Date(admin.lastActiveAt)
      const idleMs = idleMinutes * 60 * 1000
      if (idleMs > 0 && now.getTime() - lastActive.getTime() > idleMs) {
        res.clearCookie('admin_session', { path: '/' })
        return res.status(401).json({ error: 'Admin session expired' })
      }
    }

    admin.lastActiveAt = now.toISOString()
    writeData('admins', admins)

    if (payload.exp) {
      const expiresInMs = payload.exp * 1000 - now.getTime()
      if (expiresInMs < rotateMinutes * 60 * 1000) {
        const refreshed = signAdminToken(admin)
        res.cookie('admin_session', refreshed, getAdminCookieOptions())
      }
    }

    req.admin = {
      ...payload,
      id: admin.id,
      email: admin.email,
      role: admin.role,
    }
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid admin session' })
  }
}

export const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ error: 'Admin authentication required' })
  }

  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' })
  }

  return next()
}

export const requireAdminForWrite = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next()
  }

  return requireAdmin(req, res, next)
}
