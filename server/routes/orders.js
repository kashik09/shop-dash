import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'
import { sendOrderConfirmation, sendShippingUpdate } from '../utils/resend.js'
import { encryptField, decryptField } from '../utils/crypto.js'
import { logAudit } from '../utils/audit.js'
import { requireAdmin, requireUser } from '../middleware/auth.js'
import { isEmail, isNonEmptyString, isPhone, parseInteger, parseNumber } from '../utils/validation.js'

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

const validateOrderPayload = (payload) => {
  if (!isNonEmptyString(payload?.customerName)) {
    return { ok: false, error: 'Customer name is required' }
  }

  if (!payload?.customerEmail && !payload?.customerPhone) {
    return { ok: false, error: 'Customer email or phone is required' }
  }

  if (payload.customerEmail && !isEmail(payload.customerEmail)) {
    return { ok: false, error: 'Invalid customer email' }
  }

  if (payload.customerPhone && !isPhone(payload.customerPhone)) {
    return { ok: false, error: 'Invalid customer phone' }
  }

  if (!isNonEmptyString(payload?.location)) {
    return { ok: false, error: 'Delivery location is required' }
  }

  if (!Array.isArray(payload?.items) || payload.items.length === 0) {
    return { ok: false, error: 'Order items are required' }
  }

  for (const item of payload.items) {
    const itemId = parseInteger(item?.id)
    if (itemId === null) {
      return { ok: false, error: 'Invalid item id' }
    }
    if (!isNonEmptyString(item?.name)) {
      return { ok: false, error: 'Invalid item name' }
    }
    const price = parseNumber(item?.price)
    if (price === null || price < 0) {
      return { ok: false, error: 'Invalid item price' }
    }
    const quantity = parseInteger(item?.quantity)
    if (quantity === null || quantity < 1) {
      return { ok: false, error: 'Invalid item quantity' }
    }
  }

  const subtotal = parseNumber(payload?.subtotal)
  const shippingFee = parseNumber(payload?.shippingFee)
  const total = parseNumber(payload?.total)

  if (subtotal === null || subtotal < 0) {
    return { ok: false, error: 'Invalid subtotal' }
  }

  if (shippingFee === null || shippingFee < 0) {
    return { ok: false, error: 'Invalid shipping fee' }
  }

  if (total === null || total < 0) {
    return { ok: false, error: 'Invalid total amount' }
  }

  return { ok: true }
}

const allowedStatuses = new Set(['pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'])

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

  const validation = validateOrderPayload(req.body || {})
  if (!validation.ok) {
    return res.status(400).json({ error: validation.error })
  }
  
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
  
  if (req.body?.status && !allowedStatuses.has(req.body.status)) {
    return res.status(400).json({ error: 'Invalid order status' })
  }

  if (req.body?.subtotal !== undefined) {
    const subtotal = parseNumber(req.body.subtotal)
    if (subtotal === null || subtotal < 0) {
      return res.status(400).json({ error: 'Invalid subtotal' })
    }
    req.body.subtotal = subtotal
  }

  if (req.body?.shippingFee !== undefined) {
    const shippingFee = parseNumber(req.body.shippingFee)
    if (shippingFee === null || shippingFee < 0) {
      return res.status(400).json({ error: 'Invalid shipping fee' })
    }
    req.body.shippingFee = shippingFee
  }

  if (req.body?.total !== undefined) {
    const total = parseNumber(req.body.total)
    if (total === null || total < 0) {
      return res.status(400).json({ error: 'Invalid total amount' })
    }
    req.body.total = total
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
