import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'

const router = Router()

// GET all admins
router.get('/', (req, res) => {
  const admins = readData('admins')
  // Don't expose sensitive data
  const safeAdmins = admins.map(({ password, ...admin }) => admin)
  res.json(safeAdmins)
})

// GET single admin
router.get('/:id', (req, res) => {
  const admins = readData('admins')
  const admin = admins.find(a => a.id === parseInt(req.params.id))

  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' })
  }

  const { password, ...safeAdmin } = admin
  res.json(safeAdmin)
})

// GET admin by email
router.get('/email/:email', (req, res) => {
  const admins = readData('admins')
  const admin = admins.find(a => a.email === req.params.email)

  if (!admin) {
    return res.status(404).json({ error: 'Admin not found' })
  }

  const { password, ...safeAdmin } = admin
  res.json(safeAdmin)
})

// POST new admin
router.post('/', (req, res) => {
  const admins = readData('admins')

  // Check if email already exists
  if (admins.find(a => a.email === req.body.email)) {
    return res.status(400).json({ error: 'Email already registered' })
  }

  const newAdmin = {
    id: getNextId(admins),
    ...req.body,
    role: req.body.role || 'admin',
    permissions: req.body.permissions || ['products', 'orders'],
    createdAt: new Date().toISOString()
  }

  admins.push(newAdmin)
  writeData('admins', admins)

  const { password, ...safeAdmin } = newAdmin
  res.status(201).json(safeAdmin)
})

// PUT update admin
router.put('/:id', (req, res) => {
  const admins = readData('admins')
  const index = admins.findIndex(a => a.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ error: 'Admin not found' })
  }

  admins[index] = { ...admins[index], ...req.body }
  writeData('admins', admins)

  const { password, ...safeAdmin } = admins[index]
  res.json(safeAdmin)
})

// PATCH partial update
router.patch('/:id', (req, res) => {
  const admins = readData('admins')
  const index = admins.findIndex(a => a.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ error: 'Admin not found' })
  }

  admins[index] = { ...admins[index], ...req.body }
  writeData('admins', admins)

  const { password, ...safeAdmin } = admins[index]
  res.json(safeAdmin)
})

// DELETE admin
router.delete('/:id', (req, res) => {
  const admins = readData('admins')
  const index = admins.findIndex(a => a.id === parseInt(req.params.id))

  if (index === -1) {
    return res.status(404).json({ error: 'Admin not found' })
  }

  // Prevent deleting the last super_admin
  const admin = admins[index]
  if (admin.role === 'super_admin') {
    const superAdminCount = admins.filter(a => a.role === 'super_admin').length
    if (superAdminCount <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last super admin' })
    }
  }

  admins.splice(index, 1)
  writeData('admins', admins)

  res.status(204).send()
})

export default router
