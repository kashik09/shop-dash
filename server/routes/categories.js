import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'

const router = Router()

router.get('/', (req, res) => {
  res.json(readData('categories'))
})

router.post('/', (req, res) => {
  const categories = readData('categories')
  const newCategory = { id: getNextId(categories), ...req.body }
  categories.push(newCategory)
  writeData('categories', categories)
  res.status(201).json(newCategory)
})

router.delete('/:id', (req, res) => {
  const categories = readData('categories')
  const index = categories.findIndex(c => c.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Not found' })
  categories.splice(index, 1)
  writeData('categories', categories)
  res.status(204).send()
})

export default router
