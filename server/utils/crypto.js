import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

const parseKey = (value) => {
  if (!value) return null
  const trimmed = value.trim()

  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, 'hex')
  }

  try {
    const buf = Buffer.from(trimmed, 'base64')
    if (buf.length === 32) return buf
  } catch {
    return null
  }

  return null
}

const rawKey = process.env.DATA_ENCRYPTION_KEY
const KEY = parseKey(rawKey)

if (!KEY && process.env.NODE_ENV === 'production') {
  throw new Error('DATA_ENCRYPTION_KEY must be set in production')
}

export const normalizeEmail = (email) => email.trim().toLowerCase()
export const normalizePhone = (phone) => phone.trim().replace(/[\s()-]/g, '')

export const hashValue = (value) => {
  if (!value) return null
  return crypto.createHash('sha256').update(value).digest('hex')
}

export const encryptField = (value) => {
  if (!value || !KEY) return value

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return `enc:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
}

export const decryptField = (value) => {
  if (!value || !KEY) return value
  if (typeof value !== 'string' || !value.startsWith('enc:')) return value

  const [, ivB64, tagB64, encryptedB64] = value.split(':')
  if (!ivB64 || !tagB64 || !encryptedB64) return value

  try {
    const iv = Buffer.from(ivB64, 'base64')
    const tag = Buffer.from(tagB64, 'base64')
    const encrypted = Buffer.from(encryptedB64, 'base64')
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
    decipher.setAuthTag(tag)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString('utf8')
  } catch {
    return value
  }
}
