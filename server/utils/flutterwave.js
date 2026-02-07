const DEFAULT_BASE_URL = 'https://api.flutterwave.com/v3'

const getBaseUrl = () => process.env.FLW_BASE_URL || DEFAULT_BASE_URL

const requireSecretKey = () => {
  const secret = process.env.FLW_SECRET_KEY
  if (!secret) {
    throw new Error('FLW_SECRET_KEY is missing')
  }
  return secret
}

export const isFlutterwaveEnabled = () => Boolean(process.env.FLW_SECRET_KEY)

export const flutterwaveRequest = async (path, payload) => {
  const secret = requireSecretKey()
  const url = `${getBaseUrl()}${path}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message = data?.message || data?.error || 'Flutterwave request failed'
    const error = new Error(message)
    error.details = data
    throw error
  }

  return data
}

export const createUgandaMobileMoneyCharge = async (payload) =>
  flutterwaveRequest('/charges?type=mobile_money_uganda', payload)
