import { verifyAdminToken, verifyUserToken } from '../utils/auth.js'

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
  const token = req.cookies?.admin_session
  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' })
  }

  try {
    req.admin = verifyAdminToken(token)
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
