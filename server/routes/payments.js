import { Router } from 'express'
import { requireUser } from '../middleware/auth.js'
import { requireCsrfForWrite } from '../middleware/csrf.js'
import { readData } from '../utils/db.js'
import { logAudit } from '../utils/audit.js'
import { createUgandaMobileMoneyCharge, isFlutterwaveEnabled } from '../utils/flutterwave.js'
import { isNonEmptyString, isPhone, parseNumber, toTrimmedString } from '../utils/validation.js'

const router = Router()
router.use(requireCsrfForWrite)

const allowedNetworks = new Set(['MTN', 'AIRTEL'])

const buildFallbackEmail = (userId) => `user-${userId}@shopdash.local`

router.get('/flutterwave/status', (_req, res) => {
  res.json({ enabled: isFlutterwaveEnabled() })
})

router.post('/flutterwave/uganda', requireUser, async (req, res) => {
  if (!isFlutterwaveEnabled()) {
    return res.status(503).json({ error: 'Payments are not configured yet' })
  }

  const amount = parseNumber(req.body?.amount)
  if (amount === null || amount <= 0) {
    return res.status(400).json({ error: 'Invalid payment amount' })
  }

  const phoneRaw = toTrimmedString(req.body?.phone)
  if (!isPhone(phoneRaw)) {
    return res.status(400).json({ error: 'Invalid phone number' })
  }
  const phoneNumber = phoneRaw.replace(/[\s()-]/g, '')

  const networkRaw = toTrimmedString(req.body?.network).toUpperCase()
  if (!allowedNetworks.has(networkRaw)) {
    return res.status(400).json({ error: 'Invalid mobile money network' })
  }

  const customerName = toTrimmedString(req.body?.customerName)
  if (!isNonEmptyString(customerName)) {
    return res.status(400).json({ error: 'Customer name is required' })
  }

  const users = readData('users') || []
  const userId = Number(req.user?.sub)
  const user = users.find((entry) => entry.id === userId)

  const email =
    toTrimmedString(req.body?.email) ||
    toTrimmedString(user?.email) ||
    toTrimmedString(req.user?.email) ||
    buildFallbackEmail(userId)

  const txRef = `shopdash_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`

  try {
    const response = await createUgandaMobileMoneyCharge({
      tx_ref: txRef,
      amount,
      currency: 'UGX',
      email,
      phone_number: phoneNumber,
      network: networkRaw,
      fullname: customerName,
      meta: {
        userId,
        ...req.body?.meta,
      },
    })

    logAudit({
      actorType: 'user',
      actorId: userId,
      action: 'initiate_payment',
      entity: 'flutterwave_charge',
      entityId: txRef,
      metadata: {
        amount,
        network: networkRaw,
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })

    return res.status(201).json(response)
  } catch (error) {
    console.error('Flutterwave error:', error)
    return res.status(502).json({ error: error.message || 'Payment gateway error' })
  }
})

export default router
