export type FlutterwaveCheckoutOptions = {
  public_key: string
  tx_ref: string
  amount: number
  currency: string
  payment_options?: string
  customer: {
    email: string
    phone_number?: string
    name?: string
  }
  customizations?: {
    title?: string
    description?: string
    logo?: string
  }
  callback: (response: Record<string, any>) => void
  onclose?: () => void
}

declare global {
  interface Window {
    FlutterwaveCheckout?: (options: FlutterwaveCheckoutOptions) => void
  }
}

let flutterwaveScriptPromise: Promise<void> | null = null

export function loadFlutterwave(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Flutterwave is only available in the browser'))
  }

  if (window.FlutterwaveCheckout) {
    return Promise.resolve()
  }

  if (flutterwaveScriptPromise) {
    return flutterwaveScriptPromise
  }

  flutterwaveScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-flutterwave="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Flutterwave')))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.flutterwave.com/v3.js'
    script.async = true
    script.dataset.flutterwave = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Flutterwave'))
    document.body.appendChild(script)
  })

  return flutterwaveScriptPromise
}
