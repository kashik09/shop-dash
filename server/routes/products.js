import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'
import { requireAdminForWrite } from '../middleware/auth.js'
import { logAudit } from '../utils/audit.js'

const router = Router()
router.use(requireAdminForWrite)

// GET all products
router.get('/', (req, res) => {
  const products = readData('products')
  
  // Filter by category if provided
  const { category, inStock } = req.query
  let filtered = products

  if (category) {
    filtered = filtered.filter(p => p.category === category)
  }
  if (inStock !== undefined) {
    filtered = filtered.filter(p => p.inStock === (inStock === 'true'))
  }

  res.json(filtered)
})

// GET single product
router.get('/:id', (req, res) => {
  const products = readData('products')
  const product = products.find(p => p.id === parseInt(req.params.id))
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  
  res.json(product)
})

// POST new product
router.post('/', (req, res) => {
  const products = readData('products')
  
  const newProduct = {
    id: getNextId(products),
    ...req.body,
    createdAt: new Date().toISOString()
  }
  
  products.push(newProduct)
  writeData('products', products)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'create_product',
    entity: 'product',
    entityId: newProduct.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })
  
  res.status(201).json(newProduct)
})

// PUT update product
router.put('/:id', (req, res) => {
  const products = readData('products')
  const index = products.findIndex(p => p.id === parseInt(req.params.id))
  
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' })
  }
  
  products[index] = { ...products[index], ...req.body }
  writeData('products', products)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'update_product',
    entity: 'product',
    entityId: products[index].id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })
  
  res.json(products[index])
})

// PATCH partial update
router.patch('/:id', (req, res) => {
  const products = readData('products')
  const index = products.findIndex(p => p.id === parseInt(req.params.id))
  
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' })
  }
  
  products[index] = { ...products[index], ...req.body }
  writeData('products', products)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'update_product',
    entity: 'product',
    entityId: products[index].id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })
  
  res.json(products[index])
})

// DELETE product
router.delete('/:id', (req, res) => {
  const products = readData('products')
  const index = products.findIndex(p => p.id === parseInt(req.params.id))
  
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' })
  }
  
  const deleted = products.splice(index, 1)[0]
  writeData('products', products)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'delete_product',
    entity: 'product',
    entityId: deleted?.id ?? null,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })
  
  res.status(204).send()
})

export default router
