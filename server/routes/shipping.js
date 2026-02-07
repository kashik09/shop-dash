import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'

const router = Router()

router.get('/', (req, res) => {
  res.json(readData('shipping'))
})

router.post('/', (req, res) => {
  const shipping = readData('shipping')
  const newRate = { id: getNextId(shipping), ...req.body }
  shipping.push(newRate)
  writeData('shipping', shipping)
  res.status(201).json(newRate)
})

router.put('/:id', (req, res) => {
  const shipping = readData('shipping')
  const index = shipping.findIndex(s => s.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Not found' })
  shipping[index] = { ...shipping[index], ...req.body }
  writeData('shipping', shipping)
  res.json(shipping[index])
})

router.delete('/:id', (req, res) => {
  const shipping = readData('shipping')
  const index = shipping.findIndex(s => s.id === parseInt(req.params.id))
  if (index === -1) return res.status(404).json({ error: 'Not found' })
  shipping.splice(index, 1)
  writeData('shipping', shipping)
  res.status(204).send()
})

export default router
