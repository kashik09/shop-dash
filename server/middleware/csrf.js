import { generateCsrfToken, getCsrfCookieName, getCsrfCookieOptions } from '../utils/csrf.js'

export const ensureCsrfCookie = (req, res, next) => {
  const cookieName = getCsrfCookieName()
  if (!req.cookies?.[cookieName]) {
    const token = generateCsrfToken()
    res.cookie(cookieName, token, getCsrfCookieOptions())
    req.csrfToken = token
  }
  return next()
}

export const requireCsrfForWrite = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next()
  }

  const cookieName = getCsrfCookieName()
  const cookieToken = req.cookies?.[cookieName]
  const headerToken = req.get('x-csrf-token')

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' })
  }

  return next()
}
