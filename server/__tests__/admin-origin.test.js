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

  const testData = createTestDataDir({ admins: adminSeed, users: [] })
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

describe('admin origin guard', () => {
  it('blocks admin routes without an allowed origin', async () => {
    const res = await agent.get('/api/users')
    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/origin/i)
  })

  it('allows allowed origin but still requires admin auth', async () => {
    const res = await agent.get('/api/users').set('Origin', adminOrigin)
    expect(res.status).toBe(401)
  })
})
