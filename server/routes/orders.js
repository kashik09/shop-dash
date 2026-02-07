import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'
import { sendOrderConfirmation, sendShippingUpdate } from '../utils/resend.js'

const router = Router()

// GET all orders
router.get('/', (req, res) => {
  const orders = readData('orders')
  const { status, userId } = req.query
  
  let filtered = orders

  if (status) {
    filtered = filtered.filter(o => o.status === status)
  }
  if (userId) {
    filtered = filtered.filter(o => o.userId === userId)
  }

  res.json(filtered)
})

// GET single order
router.get('/:id', (req, res) => {
  const orders = readData('orders')
  const order = orders.find(o => o.id === parseInt(req.params.id))
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' })
  }
  
  res.json(order)
})

// POST new order
router.post('/', async (req, res) => {
  const orders = readData('orders')
  const settings = readData('settings')
  
  const newOrder = {
    id: getNextId(orders),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  
  orders.push(newOrder)
  writeData('orders', orders)

  // Send confirmation email if enabled
  if (settings.notifications.orderConfirmation && req.body.customerEmail) {
    const emailResult = await sendOrderConfirmation(newOrder, req.body.customerEmail)
    newOrder.emailSent = emailResult.success
  }
  
  res.status(201).json(newOrder)
})

// PATCH update order status
router.patch('/:id', async (req, res) => {
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
    orders[index].customerEmail
  ) {
    await sendShippingUpdate(orders[index], orders[index].customerEmail, req.body.status)
  }
  
  res.json(orders[index])
})

// DELETE order
router.delete('/:id', (req, res) => {
  const orders = readData('orders')
  const index = orders.findIndex(o => o.id === parseInt(req.params.id))
  
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' })
  }
  
  orders.splice(index, 1)
  writeData('orders', orders)
  
  res.status(204).send()
})

export default router
