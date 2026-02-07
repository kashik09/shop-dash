import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const USER_SECRET = process.env.JWT_SECRET
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET

if (!USER_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production')
}

if (!ADMIN_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('ADMIN_JWT_SECRET must be set in production')
}

export const hashPassword = async (password) => bcrypt.hash(password, 10)

export const comparePassword = async (password, hash) => bcrypt.compare(password, hash)

export const signUserToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: 'user',
      email: user.email || null,
      phone: user.phone || null,
    },
    USER_SECRET || 'dev_user_secret',
    { expiresIn: '7d' }
  )

export const signAdminToken = (admin) =>
  jwt.sign(
    {
      sub: admin.id,
      role: admin.role || 'admin',
      email: admin.email || null,
    },
    ADMIN_SECRET || 'dev_admin_secret',
    { expiresIn: '7d' }
  )

export const verifyUserToken = (token) =>
  jwt.verify(token, USER_SECRET || 'dev_user_secret')

export const verifyAdminToken = (token) =>
  jwt.verify(token, ADMIN_SECRET || 'dev_admin_secret')

export const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
})
