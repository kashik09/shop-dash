// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createAgent, createTestDataDir } from './test-utils.js'

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

  const testData = createTestDataDir({
    admins: adminSeed,
    products: [{ id: 1, name: 'Sample', price: 1200, inStock: true }],
  })
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

describe('admin data viewer', () => {
  it('requires admin authentication', async () => {
    const res = await agent.get('/api/admin-data?dataset=products').set('Origin', adminOrigin)
    expect(res.status).toBe(401)
  })

  it('returns data for valid datasets when logged in', async () => {
    await agent
      .post('/api/admin-auth/login')
      .set('Origin', adminOrigin)
      .send({ email: 'admin@example.com', password: 'bootstrap-secret' })

    const res = await agent.get('/api/admin-data?dataset=products').set('Origin', adminOrigin)
    expect(res.status).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].name).toBe('Sample')
  })

  it('rejects invalid dataset names', async () => {
    await agent
      .post('/api/admin-auth/login')
      .set('Origin', adminOrigin)
      .send({ email: 'admin@example.com', password: 'bootstrap-secret' })

    const res = await agent.get('/api/admin-data?dataset=unknown').set('Origin', adminOrigin)
    expect(res.status).toBe(400)
  })
})
