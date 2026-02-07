import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'
import { requireAdminForWrite } from '../middleware/auth.js'
import { logAudit } from '../utils/audit.js'

const router = Router()
router.use(requireAdminForWrite)

router.get('/', (req, res) => {
  res.json(readData('shipping'))
})

router.post('/', (req, res) => {
  const shipping = readData('shipping')
  const newRate = { id: getNextId(shipping), ...req.body }
  shipping.push(newRate)
  writeData('shipping', shipping)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'create_shipping_rate',
    entity: 'shipping_rate',
    entityId: newRate.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.status(201).json(newRate)
})

router.put('/:id', (req, res) => {
  const shipping = readData('shipping')
  const index = shipping.findIndex(s => s.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Not found' })
  shipping[index] = { ...shipping[index], ...req.body }
  writeData('shipping', shipping)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'update_shipping_rate',
    entity: 'shipping_rate',
    entityId: shipping[index].id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json(shipping[index])
})

router.delete('/:id', (req, res) => {
  const shipping = readData('shipping')
  const index = shipping.findIndex(s => s.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Not found' })
  const deleted = shipping.splice(index, 1)[0]
  writeData('shipping', shipping)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'delete_shipping_rate',
    entity: 'shipping_rate',
    entityId: deleted?.id ?? null,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.status(204).send()
})

export default router
