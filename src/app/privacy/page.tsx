import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | SlicePizza',
  description: 'Privacy policy for SlicePizza — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <main style={{
      minHeight: '100vh',
      padding: '60px 20px',
      background: 'var(--background)',
    }}>
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        background: 'var(--card-bg, #1a1a2e)',
        borderRadius: '20px',
        padding: '48px',
        border: '1px solid var(--glass-border)',
      }}>
        <h1 style={{ marginBottom: '8px', fontSize: '2rem' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Last updated: April 2026</p>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>1. Information We Collect</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
            When you use SlicePizza, we collect information you provide directly, such as your name,
            email address, delivery address, and phone number when placing an order. If you log in
            via Google or Facebook, we receive your name and email address from those providers.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>2. How We Use Your Information</h2>
          <ul style={{ color: 'var(--text-muted)', lineHeight: 2, paddingLeft: '20px' }}>
            <li>To process and fulfill your pizza orders</li>
            <li>To send order confirmations and updates</li>
            <li>To authenticate your account securely</li>
            <li>To improve our services</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>3. Data Sharing</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
            We do not sell or share your personal data with third parties except as necessary to
            process payments (Stripe) and authenticate users (Google, Facebook). These services
            have their own privacy policies.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>4. Data Retention</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
            We retain your data for as long as your account is active or as needed to provide
            services. You may request deletion of your data at any time.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>5. Your Rights</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
            You have the right to access, correct, or delete your personal data. To exercise
            these rights, visit our{' '}
            <a href="/data-deletion" style={{ color: 'var(--primary, #e85d04)' }}>
              Data Deletion page
            </a>{' '}
            or contact us directly.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>6. Cookies</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
            We use session cookies to keep you logged in. No third-party tracking cookies are used.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>7. Contact</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
            For any privacy-related questions, email us at:{' '}
            <a
              href="mailto:farhanibnmustafa@gmail.com"
              style={{ color: 'var(--primary, #e85d04)' }}
            >
              farhanibnmustafa@gmail.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
