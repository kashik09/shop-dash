import { Router } from 'express'
import { readData, writeData } from '../utils/db.js'

const router = Router()

router.get('/', (req, res) => {
  res.json(readData('settings'))
})

router.put('/', (req, res) => {
  const settings = readData('settings')
  const updated = { ...settings, ...req.body }
  writeData('settings', updated)
  res.json(updated)
})

router.patch('/notifications', (req, res) => {
  const settings = readData('settings')
  settings.notifications = { ...settings.notifications, ...req.body }
  writeData('settings', settings)
  res.json(settings.notifications)
})

router.patch('/store', (req, res) => {
  const settings = readData('settings')
  settings.store = { ...settings.store, ...req.body }
  writeData('settings', settings)
  res.json(settings.store)
})

export default router
