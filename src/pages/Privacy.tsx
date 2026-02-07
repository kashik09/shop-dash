import { useSettings } from '@/context/SettingsContext'

export function Privacy() {
  const { storeName, settings } = useSettings()
  const storeEmail = settings?.store?.email || 'contact@shopdash.com'

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString('en-UG', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to {storeName}. We are committed to protecting your personal information and your right to privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit
            our website and use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Name and contact information (email, phone number, address)</li>
            <li>Account credentials (when you sign in with Google)</li>
            <li>Payment information (processed securely through our payment partners)</li>
            <li>Order history and preferences</li>
            <li>Communications with our customer service team</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Information Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not sell, trade, or rent your personal information to third parties.
            We may share your information with trusted service providers who assist us in operating our website,
            conducting our business, or serving you (such as payment processors and shipping partners),
            so long as they agree to keep this information confidential.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement appropriate security measures to protect your personal information.
            However, no method of transmission over the Internet or electronic storage is 100% secure,
            and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-2">
            Under the Data Protection and Privacy Act of Uganda, you have the right to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate personal data</li>
            <li>Request deletion of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use cookies and similar tracking technologies to enhance your browsing experience.
            You can choose to disable cookies through your browser settings, but this may affect
            some features of our website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this Privacy Policy or our privacy practices, please contact us at{' '}
            <a href={`mailto:${storeEmail}`} className="text-primary hover:underline">
              {storeEmail}
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
