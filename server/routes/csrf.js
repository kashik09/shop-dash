import { Router } from 'express'
import { generateCsrfToken, getCsrfCookieName, getCsrfCookieOptions } from '../utils/csrf.js'

const router = Router()

router.get('/', (req, res) => {
  const token = generateCsrfToken()
  res.cookie(getCsrfCookieName(), token, getCsrfCookieOptions())
  res.json({ token })
})

export default router
