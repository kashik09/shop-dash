import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import supertest from 'supertest'

const writeJson = (dir, name, data) => {
  writeFileSync(join(dir, `${name}.json`), JSON.stringify(data, null, 2))
}

export const createTestDataDir = (overrides = {}) => {
  const dir = mkdtempSync(join(tmpdir(), 'shopdash-tests-'))
  const baseData = {
    products: [],
    categories: [],
    orders: [],
    shipping: [],
    settings: {
      store: {
        name: 'ShopDash',
        email: '+256 700 000 000',
        phone: '+256 700 000 000',
        currency: 'UGX',
        country: 'Uganda',
        address: 'Kampala, Uganda',
      },
      notifications: {
        emailEnabled: true,
        lowStockAlert: true,
        orderConfirmation: true,
        shippingUpdates: true,
      },
      cookies: {
        enabled: true,
        requireConsent: true,
      },
      tax: {
        enabled: true,
        name: 'VAT',
        rate: 18,
        includeInPrice: false,
      },
    },
    users: [],
    admins: [],
    consents: [],
    audit: [],
    'admin-alerts': [],
  }

  const data = { ...baseData, ...overrides }
  Object.entries(data).forEach(([name, value]) => writeJson(dir, name, value))

  return {
    dir,
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  }
}

export const createAgent = (app) => supertest.agent(app)

export const fetchCsrfToken = async (agent) => {
  const res = await agent.get('/api/csrf')
  return res.body?.token
}
