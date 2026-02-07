import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'

const router = Router()

// GET all users
router.get('/', (req, res) => {
  const users = readData('users')
  // Don't expose sensitive data
  const safeUsers = users.map(({ password, ...user }) => user)
  res.json(safeUsers)
})

// GET single user
router.get('/:id', (req, res) => {
  const users = readData('users')
  const user = users.find(u => u.id === parseInt(req.params.id))

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const { password, ...safeUser } = user
  res.json(safeUser)
})

// GET user by email
router.get('/email/:email', (req, res) => {
  const users = readData('users')
  const user = users.find(u => u.email === req.params.email)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const { password, ...safeUser } = user
  res.json(safeUser)
})

// POST new user
router.post('/', (req, res) => {
  const users = readData('users')

  // Check if email already exists
  if (users.find(u => u.email === req.body.email)) {
    return res.status(400).json({ error: 'Email already registered' })
  }

  const newUser = {
    id: getNextId(users),
    ...req.body,
    role: 'customer',
    createdAt: new Date().toISOString()
  }

  users.push(newUser)
  writeData('users', users)

  const { password, ...safeUser } = newUser
  res.status(201).json(safeUser)
})

// PUT update user
router.put('/:id', (req, res) => {
  const users = readData('users')
  const index = users.findIndex(u => u.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' })
  }

  users[index] = { ...users[index], ...req.body }
  writeData('users', users)

  const { password, ...safeUser } = users[index]
  res.json(safeUser)
})

// PATCH partial update
router.patch('/:id', (req, res) => {
  const users = readData('users')
  const index = users.findIndex(u => u.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' })
  }

  users[index] = { ...users[index], ...req.body }
  writeData('users', users)

  const { password, ...safeUser } = users[index]
  res.json(safeUser)
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

  res.status(204).send()
})

export default router
