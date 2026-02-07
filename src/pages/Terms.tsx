import { useSettings } from '@/context/SettingsContext'

export function Terms() {
  const { storeName, settings } = useSettings()
  const storePhone = settings?.store?.phone || '+256 700 000 000'
  const storePhoneLink = storePhone.replace(/\s+/g, '')

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using {storeName}, you accept and agree to be bound by these Terms of Use.
            If you do not agree to these terms, please do not use our website or services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Use of Website</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            You agree to use this website only for lawful purposes and in a way that does not:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Violate any applicable laws or regulations in Uganda</li>
            <li>Infringe on the rights of others</li>
            <li>Interfere with or disrupt the website's functionality</li>
            <li>Attempt to gain unauthorized access to any part of the website</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Account Registration</h2>
          <p className="text-muted-foreground leading-relaxed">
            To make purchases, you may need to create an account with your email or phone number.
            You are responsible for maintaining the confidentiality of your account and for all activities
            that occur under your account. You agree to notify us the same day (within 24 hours) if you
            suspect any unauthorized use by calling or messaging{' '}
            <a href={`tel:${storePhoneLink}`} className="text-primary hover:underline">
              {storePhone}
            </a>
            . Reports made after 7 days may limit our ability to investigate or assist.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Products and Pricing</h2>
          <p className="text-muted-foreground leading-relaxed">
            All prices are displayed in Ugandan Shillings (UGX) and include applicable taxes unless otherwise stated.
            We reserve the right to modify prices at any time. Product availability is subject to change without notice.
            We make every effort to display accurate product information but do not warrant that descriptions
            are error-free.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Orders and Payment</h2>
          <p className="text-muted-foreground leading-relaxed">
            By placing an order, you are making an offer to purchase products. We reserve the right to accept
            or decline any order. Payment terms will be shown at checkout. We currently accept MTN Mobile Money
            and Airtel Money. Cash on delivery is available in select areas. We may add additional payment
            methods in the future.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Shipping and Delivery</h2>
          <p className="text-muted-foreground leading-relaxed">
            We deliver to locations within Uganda. Delivery times are estimates and may vary based on location
            and product availability. Shipping fees are calculated at checkout based on delivery location.
            Risk of loss transfers to you upon delivery.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Returns and Refunds</h2>
          <p className="text-muted-foreground leading-relaxed">
            All sales are final. We do not offer refunds or returns under any circumstances.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            All content on this website, including text, graphics, logos, and images, is the property of{' '}
            {storeName} or its content suppliers and is protected by intellectual property laws.
            You may not reproduce, distribute, or create derivative works without our written permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            To the fullest extent permitted by law, {storeName} shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use of this website or
            purchase of products.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms of Use shall be governed by and construed in accordance with the laws of the
            Republic of Uganda. Any disputes arising from these terms shall be subject to the exclusive
            jurisdiction of the courts of Uganda.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these Terms of Use at any time. Changes will be effective
            immediately upon posting. Your continued use of the website constitutes acceptance of
            the modified terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">12. Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about these Terms of Use, please contact us at{' '}
            <a href={`tel:${storePhoneLink}`} className="text-primary hover:underline">
              {storePhone}
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
