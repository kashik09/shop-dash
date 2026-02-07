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
  delete process.env.ADMIN_BOOTSTRAP_PASSWORD
})

describe('csrf enforcement', () => {
  it('rejects write requests without a csrf token', async () => {
    await agent
      .post('/api/admin-auth/login')
      .set('Origin', adminOrigin)
      .send({ email: 'admin@example.com', password: 'bootstrap-secret' })

    const res = await agent
      .post('/api/products')
      .set('Origin', adminOrigin)
      .send({ name: 'Test product', price: 1000, inStock: true })

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/csrf/i)
  })

  it('accepts write requests with a valid csrf token', async () => {
    await agent
      .post('/api/admin-auth/login')
      .set('Origin', adminOrigin)
      .send({ email: 'admin@example.com', password: 'bootstrap-secret' })

    const token = await fetchCsrfToken(agent)
    const res = await agent
      .post('/api/products')
      .set('Origin', adminOrigin)
      .set('x-csrf-token', token)
      .send({ name: 'Another product', price: 2500, inStock: true })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Another product')
  })
})
