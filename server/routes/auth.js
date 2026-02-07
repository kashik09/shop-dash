import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'
import { logAudit } from '../utils/audit.js'
import {
  decryptField,
  encryptField,
  hashValue,
  normalizeEmail,
  normalizePhone,
} from '../utils/crypto.js'
import { comparePassword, getCookieOptions, hashPassword, signUserToken } from '../utils/auth.js'
import { requireUser } from '../middleware/auth.js'
import { isNonEmptyString, isEmail, isPhone, validateEmailOrPhone } from '../utils/validation.js'

const router = Router()

const toSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email ? decryptField(user.email) : null,
  phone: user.phone ? decryptField(user.phone) : null,
  role: user.role,
  preferences: user.preferences || {},
  createdAt: user.createdAt,
})

const defaultPreferences = {
  theme: 'dark',
  notifications: {
    orderUpdates: true,
    shippingUpdates: true,
    marketing: false,
  },
  shipping: {
    name: '',
    phone: '',
    location: '',
    address: '',
  },
  marketingOptIn: false,
}

router.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body || {}

  if (!isNonEmptyString(name) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: 'Name and password are required' })
  }

  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone is required' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  if (email && !isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  if (phone && !isPhone(phone)) {
    return res.status(400).json({ error: 'Invalid phone number' })
  }

  const users = readData('users') || []
  const normalizedEmail = email ? normalizeEmail(email) : null
  const normalizedPhone = phone ? normalizePhone(phone) : null
  const emailHash = normalizedEmail ? hashValue(normalizedEmail) : null
  const phoneHash = normalizedPhone ? hashValue(normalizedPhone) : null

  if (emailHash && users.some((u) => u.emailHash === emailHash)) {
    return res.status(400).json({ error: 'Email already registered' })
  }

  if (phoneHash && users.some((u) => u.phoneHash === phoneHash)) {
    return res.status(400).json({ error: 'Phone already registered' })
  }

  const passwordHash = await hashPassword(password)

  const newUser = {
    id: getNextId(users),
    name,
    email: email ? encryptField(normalizedEmail) : null,
    phone: phone ? encryptField(normalizedPhone) : null,
    emailHash,
    phoneHash,
    passwordHash,
    role: 'customer',
    preferences: defaultPreferences,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  writeData('users', users)

  const token = signUserToken({
    id: newUser.id,
    email: normalizedEmail,
    phone: normalizedPhone,
  })

  res.cookie('session', token, getCookieOptions())

  logAudit({
    actorType: 'user',
    actorId: newUser.id,
    action: 'signup',
    entity: 'user',
    entityId: newUser.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.status(201).json(toSafeUser(newUser))
})

router.post('/login', async (req, res) => {
  const { email, phone, password, identifier } = req.body || {}

  const rawIdentifier = identifier || email || phone
  if (!isNonEmptyString(rawIdentifier) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: 'Email or phone and password are required' })
  }

  const validation = validateEmailOrPhone(rawIdentifier)
  if (!validation.ok) {
    return res.status(400).json({ error: validation.error })
  }

  const users = readData('users') || []
  const isEmailIdentifier = rawIdentifier.includes('@')
  const normalizedIdentifier = isEmailIdentifier
    ? normalizeEmail(rawIdentifier)
    : normalizePhone(rawIdentifier)
  const hash = hashValue(normalizedIdentifier)

  let user = users.find((u) => (isEmailIdentifier ? u.emailHash === hash : u.phoneHash === hash))

  if (!user) {
    user = users.find((u) => {
      if (isEmailIdentifier && u.email) {
        return decryptField(u.email) === normalizedIdentifier
      }
      if (!isEmailIdentifier && u.phone) {
        return decryptField(u.phone) === normalizedIdentifier
      }
      return false
    })
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  let mutated = false
  if (!user.emailHash && user.email) {
    user.emailHash = hashValue(decryptField(user.email))
    mutated = true
  }
  if (!user.phoneHash && user.phone) {
    user.phoneHash = hashValue(decryptField(user.phone))
    mutated = true
  }

  if (mutated) {
    writeData('users', users)
  }

  const valid = await comparePassword(password, user.passwordHash || '')
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = signUserToken({
    id: user.id,
    email: user.email ? decryptField(user.email) : null,
    phone: user.phone ? decryptField(user.phone) : null,
  })

  res.cookie('session', token, getCookieOptions())

  logAudit({
    actorType: 'user',
    actorId: user.id,
    action: 'login',
    entity: 'user',
    entityId: user.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json(toSafeUser(user))
})

router.get('/me', requireUser, (req, res) => {
  const users = readData('users') || []
  const user = users.find((u) => u.id === Number(req.user.sub))

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json(toSafeUser(user))
})

router.post('/logout', (req, res) => {
  res.clearCookie('session', { path: '/' })
  res.status(204).send()
})

export { defaultPreferences }
export default router
