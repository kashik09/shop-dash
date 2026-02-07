// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createAgent, createTestDataDir } from './test-utils.js'

let app
let agent
let cleanup

const adminOrigin = 'http://admin.test'
const bootstrapPassword = 'bootstrap-secret'

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
  process.env.ADMIN_BOOTSTRAP_PASSWORD = bootstrapPassword
  process.env.ADMIN_MAX_FAILED_ATTEMPTS = '2'
  process.env.ADMIN_LOCK_MINUTES = '10'

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
  delete process.env.ADMIN_MAX_FAILED_ATTEMPTS
  delete process.env.ADMIN_LOCK_MINUTES
})

describe('auth', () => {
  it('signs up a user with email', async () => {
    const res = await agent.post('/api/auth/signup').send({
      name: 'Test User',
      email: 'user@example.com',
      password: 'Password1!',
    })

    expect(res.status).toBe(201)
    expect(res.body.email).toBe('user@example.com')
  })

  it('logs in a user with email', async () => {
    const res = await agent.post('/api/auth/login').send({
      identifier: 'user@example.com',
      password: 'Password1!',
    })

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('user@example.com')
  })

  it('locks admin account after repeated failures', async () => {
    const first = await agent
      .post('/api/admin-auth/login')
      .set('Origin', adminOrigin)
      .send({ email: 'admin@example.com', password: 'wrong' })

    const second = await agent
      .post('/api/admin-auth/login')
      .set('Origin', adminOrigin)
      .send({ email: 'admin@example.com', password: 'wrong-again' })

    const third = await agent
      .post('/api/admin-auth/login')
      .set('Origin', adminOrigin)
      .send({ email: 'admin@example.com', password: 'wrong-again' })

    expect(first.status).toBe(401)
    expect(second.status).toBe(401)
    expect(third.status).toBe(429)
    expect(third.body.error).toMatch(/locked/i)
  })
})
