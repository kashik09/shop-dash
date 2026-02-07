const isNonEmptyString = (value, minLength = 1) =>
  typeof value === 'string' && value.trim().length >= minLength

const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '')

const isEmail = (value) => {
  if (!isNonEmptyString(value)) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

const isPhone = (value) => {
  if (!isNonEmptyString(value)) return false
  const cleaned = value.trim().replace(/[\s()-]/g, '')
  return /^\+?\d{7,15}$/.test(cleaned)
}

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return null
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return null
  return numeric
}

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value
  return null
}

const parseInteger = (value) => {
  const numeric = parseNumber(value)
  if (numeric === null) return null
  if (!Number.isInteger(numeric)) return null
  return numeric
}

const validateEmailOrPhone = (value) => {
  if (!isNonEmptyString(value)) {
    return { ok: false, error: 'Email or phone is required' }
  }
  if (value.includes('@')) {
    return isEmail(value)
      ? { ok: true, email: value.trim() }
      : { ok: false, error: 'Invalid email address' }
  }
  return isPhone(value)
    ? { ok: true, phone: value.trim() }
    : { ok: false, error: 'Invalid phone number' }
}

const validateContactValue = (value) => {
  if (!isNonEmptyString(value)) return { ok: true, value: '' }
  if (value.includes('@')) {
    return isEmail(value)
      ? { ok: true, value: value.trim() }
      : { ok: false, error: 'Invalid email address' }
  }
  return isPhone(value)
    ? { ok: true, value: value.trim() }
    : { ok: false, error: 'Invalid phone number' }
}

export {
  isNonEmptyString,
  toTrimmedString,
  isEmail,
  isPhone,
  parseNumber,
  parseBoolean,
  parseInteger,
  validateEmailOrPhone,
  validateContactValue,
}
