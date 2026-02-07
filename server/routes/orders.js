import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'
import { sendOrderConfirmation, sendShippingUpdate } from '../utils/resend.js'
import { encryptField, decryptField } from '../utils/crypto.js'
import { logAudit } from '../utils/audit.js'
import { requireAdmin, requireUser } from '../middleware/auth.js'

const router = Router()

const encryptOrder = (order) => ({
  ...order,
  customerName: order.customerName ? encryptField(order.customerName) : null,
  customerEmail: order.customerEmail ? encryptField(order.customerEmail) : null,
  customerPhone: order.customerPhone ? encryptField(order.customerPhone) : null,
  location: order.location ? encryptField(order.location) : null,
})

const decryptOrder = (order) => ({
  ...order,
  customerName: order.customerName ? decryptField(order.customerName) : null,
  customerEmail: order.customerEmail ? decryptField(order.customerEmail) : null,
  customerPhone: order.customerPhone ? decryptField(order.customerPhone) : null,
  location: order.location ? decryptField(order.location) : null,
})

// GET all orders
router.get('/', requireAdmin, (req, res) => {
  const orders = readData('orders')
  const { status, userId } = req.query
  
  let filtered = orders

  if (status) {
    filtered = filtered.filter(o => o.status === status)
  }
  if (userId) {
    const requestedId = Number(userId)
    filtered = filtered.filter(o => o.userId === requestedId)
  }

  res.json(filtered.map(decryptOrder))
})

// GET single order
router.get('/:id', requireAdmin, (req, res) => {
  const orders = readData('orders')
  const order = orders.find(o => o.id === parseInt(req.params.id))
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }
  
  res.json(decryptOrder(order))
})

// POST new order
router.post('/', requireUser, async (req, res) => {
  const orders = readData('orders')
  const settings = readData('settings')
  
  const newOrder = {
    id: getNextId(orders),
    ...req.body,
    userId: Number(req.user.sub),
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  
  const storedOrder = encryptOrder(newOrder)
  orders.push(storedOrder)
  writeData('orders', orders)

  // Send confirmation email if enabled
  if (settings.notifications.orderConfirmation && req.body.customerEmail) {
    const emailResult = await sendOrderConfirmation(newOrder, req.body.customerEmail)
    newOrder.emailSent = emailResult.success
  }
  
  logAudit({
    actorType: 'user',
    actorId: newOrder.userId,
    action: 'create_order',
    entity: 'order',
    entityId: newOrder.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.status(201).json(newOrder)
})

// PATCH update order status
router.patch('/:id', requireAdmin, async (req, res) => {
  const orders = readData('orders')
  const settings = readData('settings')
  const index = orders.findIndex(o => o.id === parseInt(req.params.id))
  
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' })
  }
  
  const oldStatus = orders[index].status
  orders[index] = { ...orders[index], ...req.body }
  writeData('orders', orders)

  // Send shipping update email if status changed
  const shippingStatuses = ['shipped', 'out_for_delivery', 'delivered']
  if (
    settings.notifications.shippingUpdates &&
    req.body.status &&
    req.body.status !== oldStatus &&
    shippingStatuses.includes(req.body.status) &&
    decryptField(orders[index].customerEmail)
  ) {
    const decryptedOrder = decryptOrder(orders[index])
    await sendShippingUpdate(decryptedOrder, decryptedOrder.customerEmail, req.body.status)
  }

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'update_order',
    entity: 'order',
    entityId: orders[index].id,
    metadata: { status: req.body.status || oldStatus },
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })
  
  res.json(decryptOrder(orders[index]))
})

// DELETE order
router.delete('/:id', requireAdmin, (req, res) => {
  const orders = readData('orders')
  const index = orders.findIndex(o => o.id === parseInt(req.params.id))
  
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' })
  }
  
  orders.splice(index, 1)
  writeData('orders', orders)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'delete_order',
    entity: 'order',
    entityId: Number(req.params.id),
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })
  
  res.status(204).send()
})

export default router
