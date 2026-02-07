import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'
import { requireAdminForWrite } from '../middleware/auth.js'
import { logAudit } from '../utils/audit.js'

const router = Router()
router.use(requireAdminForWrite)

router.get('/', (req, res) => {
  res.json(readData('categories'))
})

router.post('/', (req, res) => {
  const categories = readData('categories')
  const newCategory = { id: getNextId(categories), ...req.body }
  categories.push(newCategory)
  writeData('categories', categories)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'create_category',
    entity: 'category',
    entityId: newCategory.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.status(201).json(newCategory)
})

router.delete('/:id', (req, res) => {
  const categories = readData('categories')
  const index = categories.findIndex(c => c.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Not found' })
  const deleted = categories.splice(index, 1)[0]
  writeData('categories', categories)

  logAudit({
    actorType: 'admin',
    actorId: req.admin?.sub ?? null,
    action: 'delete_category',
    entity: 'category',
    entityId: deleted?.id ?? null,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.status(204).send()
})

export default router
