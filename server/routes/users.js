import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'
import { decryptField, encryptField, hashValue, normalizeEmail, normalizePhone } from '../utils/crypto.js'
import { hashPassword } from '../utils/auth.js'
import { logAudit } from '../utils/audit.js'
import { isEmail, isPhone, isNonEmptyString } from '../utils/validation.js'

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

// GET all users
router.get('/', (req, res) => {
  const users = readData('users')
  // Don't expose sensitive data
  const safeUsers = users.map(toSafeUser)
  res.json(safeUsers)
})

// GET single user
router.get('/:id', (req, res) => {
  const users = readData('users')
  const user = users.find(u => u.id === parseInt(req.params.id))

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json(toSafeUser(user))
})

// GET user by email
router.get('/email/:email', (req, res) => {
  const users = readData('users')
  if (!isEmail(req.params.email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }
  const normalized = normalizeEmail(req.params.email)
  const emailHash = hashValue(normalized)
  const user = users.find(u => u.emailHash === emailHash) || users.find((u) => {
    if (!u.email) return false
    return decryptField(u.email) === normalized
  })

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json(toSafeUser(user))
})

// POST new user
router.post('/', async (req, res) => {
  const users = readData('users')

  // Check if email already exists
  const normalizedEmail = req.body.email ? normalizeEmail(req.body.email) : null
  const normalizedPhone = req.body.phone ? normalizePhone(req.body.phone) : null

  if (!isNonEmptyString(req.body?.name)) {
    return res.status(400).json({ error: 'Name is required' })
  }

  if (!normalizedEmail && !normalizedPhone) {
    return res.status(400).json({ error: 'Email or phone is required' })
  }

  if (normalizedEmail && !isEmail(req.body.email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  if (normalizedPhone && !isPhone(req.body.phone)) {
    return res.status(400).json({ error: 'Invalid phone number' })
  }

  const emailHash = normalizedEmail ? hashValue(normalizedEmail) : null
  const phoneHash = normalizedPhone ? hashValue(normalizedPhone) : null

  if (emailHash && users.find(u => u.emailHash === emailHash)) {
    return res.status(400).json({ error: 'Email already registered' })
  }
  if (phoneHash && users.find(u => u.phoneHash === phoneHash)) {
    return res.status(400).json({ error: 'Phone already registered' })
  }

  const newUser = {
    id: getNextId(users),
    ...req.body,
    email: normalizedEmail ? encryptField(normalizedEmail) : null,
    phone: normalizedPhone ? encryptField(normalizedPhone) : null,
    emailHash,
    phoneHash,
    role: 'customer',
    createdAt: new Date().toISOString()
  }

  if (req.body.password) {
    if (String(req.body.password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' })
    }
    newUser.passwordHash = await hashPassword(req.body.password)
  }

  users.push(newUser)
  writeData('users', users)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'create_user',
    entity: 'user',
    entityId: newUser.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.status(201).json(toSafeUser(newUser))
})

// PUT update user
router.put('/:id', (req, res) => {
  const users = readData('users')
  const index = users.findIndex(u => u.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' })
  }

  const updates = { ...req.body }
  if (updates.name && !isNonEmptyString(updates.name)) {
    return res.status(400).json({ error: 'Invalid name' })
  }
  if (updates.email) {
    if (!isEmail(updates.email)) {
      return res.status(400).json({ error: 'Invalid email address' })
    }
    const normalized = normalizeEmail(updates.email)
    const emailHash = hashValue(normalized)
    const duplicate = users.find((u) => u.emailHash === emailHash && u.id !== users[index].id)
    if (duplicate) {
      return res.status(400).json({ error: 'Email already registered' })
    }
    updates.email = encryptField(normalized)
    updates.emailHash = emailHash
  }
  if (updates.phone) {
    if (!isPhone(updates.phone)) {
      return res.status(400).json({ error: 'Invalid phone number' })
    }
    const normalized = normalizePhone(updates.phone)
    const phoneHash = hashValue(normalized)
    const duplicate = users.find((u) => u.phoneHash === phoneHash && u.id !== users[index].id)
    if (duplicate) {
      return res.status(400).json({ error: 'Phone already registered' })
    }
    updates.phone = encryptField(normalized)
    updates.phoneHash = phoneHash
  }

  users[index] = { ...users[index], ...updates }
  writeData('users', users)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'update_user',
    entity: 'user',
    entityId: users[index].id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json(toSafeUser(users[index]))
})

// PATCH partial update
router.patch('/:id', (req, res) => {
  const users = readData('users')
  const index = users.findIndex(u => u.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' })
  }

  const updates = { ...req.body }
  if (updates.name && !isNonEmptyString(updates.name)) {
    return res.status(400).json({ error: 'Invalid name' })
  }
  if (updates.email) {
    if (!isEmail(updates.email)) {
      return res.status(400).json({ error: 'Invalid email address' })
    }
    const normalized = normalizeEmail(updates.email)
    const emailHash = hashValue(normalized)
    const duplicate = users.find((u) => u.emailHash === emailHash && u.id !== users[index].id)
    if (duplicate) {
      return res.status(400).json({ error: 'Email already registered' })
    }
    updates.email = encryptField(normalized)
    updates.emailHash = emailHash
  }
  if (updates.phone) {
    if (!isPhone(updates.phone)) {
      return res.status(400).json({ error: 'Invalid phone number' })
    }
    const normalized = normalizePhone(updates.phone)
    const phoneHash = hashValue(normalized)
    const duplicate = users.find((u) => u.phoneHash === phoneHash && u.id !== users[index].id)
    if (duplicate) {
      return res.status(400).json({ error: 'Phone already registered' })
    }
    updates.phone = encryptField(normalized)
    updates.phoneHash = phoneHash
  }

  users[index] = { ...users[index], ...updates }
  writeData('users', users)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'update_user',
    entity: 'user',
    entityId: users[index].id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json(toSafeUser(users[index]))
})

// DELETE user
router.delete('/:id', (req, res) => {
  const users = readData('users')
  const index = users.findIndex(u => u.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' })
  }

  users.splice(index, 1)
  writeData('users', users)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'delete_user',
    entity: 'user',
    entityId: Number(req.params.id),
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.status(204).send()
})

export default router
