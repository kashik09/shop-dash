import { Router } from 'express'
import { readData, writeData, getNextId } from '../utils/db.js'
import { isEmail, isNonEmptyString } from '../utils/validation.js'

const router = Router()

router.get('/', (req, res) => {
  const consents = readData('consents') || []
  res.json(consents)
})

router.post('/', (req, res) => {
  const { consentId, status, email } = req.body || {}

  if (!isNonEmptyString(consentId) || !['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid consent payload' })
  }

  if (email && !isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  const consents = readData('consents') || []
  const existingIndex = consents.findIndex(
    (record) => record.consentId === consentId || (email && record.email === email)
  )

  const now = new Date().toISOString()
  const base = existingIndex === -1 ? null : consents[existingIndex]

  const record = {
    id: base?.id ?? getNextId(consents),
    consentId,
    email: email || base?.email || null,
    status,
    acceptedAt: status === 'accepted' ? now : base?.acceptedAt ?? null,
    declinedAt: status === 'declined' ? now : base?.declinedAt ?? null,
    createdAt: base?.createdAt ?? now,
    updatedAt: now,
  }

  if (existingIndex === -1) {
    consents.push(record)
  } else {
    consents[existingIndex] = record
  }

  writeData('consents', consents)
  res.json(record)
})

export default router
