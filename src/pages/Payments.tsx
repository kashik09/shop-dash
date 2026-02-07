import { useSettings } from '@/context/SettingsContext'

export function Payments() {
  const { storeName } = useSettings()

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Mobile Money Payments</h1>
      <p className="text-muted-foreground mb-8">
        {storeName} uses Flutterwave to support MTN Mobile Money and Airtel Money.
      </p>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ol className="list-decimal list-inside text-muted-foreground space-y-1">
          <li>Enter your name, phone, and email during checkout.</li>
          <li>Select MTN or Airtel mobile money.</li>
          <li>Authorize the payment on your phone.</li>
          <li>We confirm the status before completing your order.</li>
        </ol>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">Settlement timing (reference)</h2>
        <p className="text-muted-foreground">
          Flutterwave typically settles local payments the next business day (T+1) and
          international payments in about five business days (T+5). Weekends and public
          holidays do not count as business days.
        </p>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">Learn more</h2>
        <p className="text-muted-foreground">
          See Flutterwave&apos;s official mobile money documentation and supported networks list.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            className="text-primary hover:underline"
            href="https://flutterwave.com/ng/support/payment-methods/pay-with-mobile-money"
            target="_blank"
            rel="noreferrer"
          >
            Supported networks
          </a>
          <a
            className="text-primary hover:underline"
            href="https://app.flutterwave.com/"
            target="_blank"
            rel="noreferrer"
          >
            Flutterwave dashboard
          </a>
        </div>
      </section>
    </div>
  )
}
