import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'
import { requireAdminForWrite } from '../middleware/auth.js'
import { requireCsrfForWrite } from '../middleware/csrf.js'
import { logAudit } from '../utils/audit.js'
import { isNonEmptyString, toTrimmedString } from '../utils/validation.js'

const router = Router()
router.use(requireAdminForWrite)
router.use(requireCsrfForWrite)

router.get('/', (req, res) => {
  res.json(readData('categories'))
})

router.post('/', (req, res) => {
  const categories = readData('categories')

  if (!isNonEmptyString(req.body?.name) || !isNonEmptyString(req.body?.label)) {
    return res.status(400).json({ error: 'Category name and label are required' })
  }

  const newCategory = {
    id: getNextId(categories),
    name: toTrimmedString(req.body.name),
    label: toTrimmedString(req.body.label),
  }
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
