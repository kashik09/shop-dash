import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import App from '../App'

const makeJsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const mockFetch = vi.fn((input) => {
  const url = typeof input === 'string' ? input : input.url

  if (url.includes('/settings')) {
    return Promise.resolve(
      makeJsonResponse({
        store: {
          name: 'ShopDash',
          email: '+256 700 000 000',
          phone: '+256 700 000 000',
          currency: 'UGX',
          country: 'Uganda',
          address: 'Kampala, Uganda',
        },
        tax: {
          enabled: true,
          name: 'VAT',
          rate: 18,
          includeInPrice: false,
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
      })
    )
  }

  if (url.includes('/auth/me')) {
    return Promise.resolve(makeJsonResponse({ error: 'Not authenticated' }, 401))
  }

  if (url.includes('/csrf')) {
    return Promise.resolve(makeJsonResponse({ token: 'test-token' }))
  }

  return Promise.resolve(makeJsonResponse({}))
})

describe('ShopDash app', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    mockFetch.mockClear()
  })

  it('renders the home hero', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByRole('heading', { name: /welcome to shopdash/i })).toBeInTheDocument()
  })

  it('shows sign in when logged out', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('renders the payments info page', () => {
    window.history.pushState({}, '', '/payments')
    render(<App />)
    expect(screen.getByRole('heading', { name: /mobile money payments/i })).toBeInTheDocument()
  })

  it('shows password guidance and visibility toggles on signup', () => {
    window.history.pushState({}, '', '/signup')
    render(<App />)
    const passwordInput = screen.getByLabelText(/^password$/i)
    fireEvent.focus(passwordInput)
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument()
    expect(screen.getAllByLabelText(/show password/i).length).toBeGreaterThan(0)
  })

  it('disables phone when email is provided on signup', () => {
    window.history.pushState({}, '', '/signup')
    render(<App />)
    const emailInput = screen.getByLabelText(/email/i)
    const phoneInput = screen.getByLabelText(/phone number/i)
    fireEvent.change(emailInput, { target: { value: 'you@example.com' } })
    expect(phoneInput).toBeDisabled()
  })
})
