import crypto from 'crypto'

const CSRF_COOKIE_NAME = 'csrf_token'

export const generateCsrfToken = () => crypto.randomBytes(32).toString('hex')

export const getCsrfCookieName = () => CSRF_COOKIE_NAME

export const getCsrfCookieOptions = () => ({
  httpOnly: false,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 2 * 60 * 60 * 1000,
})
