const parseOrigins = (value) =>
  value
    ? value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : []

const adminOrigins = parseOrigins(process.env.ADMIN_ORIGIN)

export const isAdminOriginAllowed = (req) => {
  if (adminOrigins.length === 0) return true
  if (req.method === 'OPTIONS') return true
  const origin = req.get('origin')
  if (!origin) return false
  return adminOrigins.includes(origin)
}

export const requireAdminOrigin = (req, res, next) => {
  if (!isAdminOriginAllowed(req)) {
    return res.status(403).json({ error: 'Admin origin not allowed' })
  }

  return next()
}

export const requireAdminOriginForWrite = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next()
  }
  return requireAdminOrigin(req, res, next)
}
