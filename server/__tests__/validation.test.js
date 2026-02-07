// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createAgent, createTestDataDir, fetchCsrfToken } from './test-utils.js'

let app
let agent
let cleanup

const adminOrigin = 'http://admin.test'

beforeAll(async () => {
  const adminSeed = [
    {
      id: 1,
      name: 'Owner',
      email: 'admin@example.com',
      role: 'super_admin',
      createdAt: new Date().toISOString(),
    },
  ]

  const testData = createTestDataDir({ admins: adminSeed })
  cleanup = testData.cleanup

  process.env.NODE_ENV = 'test'
  process.env.DATA_DIR = testData.dir
  process.env.ADMIN_ORIGIN = adminOrigin
  process.env.CORS_ORIGIN = adminOrigin
  process.env.ADMIN_BOOTSTRAP_PASSWORD = 'bootstrap-secret'

  vi.resetModules()
  const { createApp } = await import('../app.js')
  app = createApp()
  agent = createAgent(app)
})

afterAll(() => {
  cleanup?.()
  delete process.env.DATA_DIR
  delete process.env.ADMIN_ORIGIN
  delete process.env.CORS_ORIGIN
  delete process.env.ADMIN_BOOTSTRAP_PASSWORD
})

describe('validation errors', () => {
  it('rejects invalid order payloads', async () => {
    await agent.post('/api/auth/signup').send({
      name: 'Customer',
      email: 'buyer@example.com',
      password: 'Password1!',
    })

    const token = await fetchCsrfToken(agent)
    const res = await agent
      .post('/api/orders')
      .set('x-csrf-token', token)
      .send({
        customerName: 'Buyer',
        customerEmail: 'buyer@example.com',
        location: 'Kampala',
        items: [],
        subtotal: 0,
        shippingFee: 0,
        total: 0,
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/items/i)
  })

  it('rejects invalid product payloads', async () => {
    await agent
      .post('/api/admin-auth/login')
      .set('Origin', adminOrigin)
      .send({ email: 'admin@example.com', password: 'bootstrap-secret' })

    const token = await fetchCsrfToken(agent)
    const res = await agent
      .post('/api/products')
      .set('Origin', adminOrigin)
      .set('x-csrf-token', token)
      .send({ name: 'Bad product', price: -5, inStock: true })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/price/i)
  })

  it('rejects invalid settings payloads', async () => {
    await agent
      .post('/api/admin-auth/login')
      .set('Origin', adminOrigin)
      .send({ email: 'admin@example.com', password: 'bootstrap-secret' })

    const token = await fetchCsrfToken(agent)
    const res = await agent
      .patch('/api/settings/store')
      .set('Origin', adminOrigin)
      .set('x-csrf-token', token)
      .send({ phone: 'not-a-number' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/phone/i)
  })
})
