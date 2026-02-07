import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'
import { requireAdminForWrite } from '../middleware/auth.js'
import { logAudit } from '../utils/audit.js'
import { isNonEmptyString, parseNumber, toTrimmedString } from '../utils/validation.js'

const router = Router()
router.use(requireAdminForWrite)

router.get('/', (req, res) => {
  res.json(readData('shipping'))
})

router.post('/', (req, res) => {
  const shipping = readData('shipping')
  if (!isNonEmptyString(req.body?.location)) {
    return res.status(400).json({ error: 'Location is required' })
  }
  const fee = parseNumber(req.body?.fee)
  if (fee === null || fee < 0) {
    return res.status(400).json({ error: 'Invalid shipping fee' })
  }
  const newRate = {
    id: getNextId(shipping),
    location: toTrimmedString(req.body.location),
    fee,
  }
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
  if (req.body?.location !== undefined && !isNonEmptyString(req.body.location)) {
    return res.status(400).json({ error: 'Invalid location' })
  }
  if (req.body?.fee !== undefined) {
    const fee = parseNumber(req.body.fee)
    if (fee === null || fee < 0) {
      return res.status(400).json({ error: 'Invalid shipping fee' })
    }
    req.body.fee = fee
  }
  if (req.body?.location) {
    req.body.location = toTrimmedString(req.body.location)
  }
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
