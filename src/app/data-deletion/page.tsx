import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Deletion | SlicePizza',
  description: 'Instructions for requesting deletion of your SlicePizza data.',
};

export default function DataDeletionPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'var(--background)',
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        background: 'var(--card-bg, #1a1a2e)',
        borderRadius: '20px',
        padding: '48px',
        border: '1px solid var(--glass-border)',
      }}>
        <h1 style={{ marginBottom: '8px', fontSize: '2rem' }}>Data Deletion Request</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Last updated: April 2026
        </p>

        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>What data we store</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            When you log in with Facebook, SlicePizza receives your name and email address.
            We store this alongside any orders you place on our platform.
          </p>
        </section>

        <section style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>How to delete your data</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
            To request deletion of all personal data associated with your account, send an email to:
          </p>
          <a
            href="mailto:farhanibnmustafa@gmail.com?subject=Data Deletion Request - SlicePizza"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'var(--primary, #e85d04)',
              color: '#fff',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            farhanibnmustafa@gmail.com
          </a>
          <p style={{ color: 'var(--text-muted)', marginTop: '16px', lineHeight: 1.7 }}>
            Include your registered email address in the subject line. We will process your
            request and confirm deletion within <strong>30 days</strong>.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>What gets deleted</h2>
          <ul style={{ color: 'var(--text-muted)', lineHeight: 2, paddingLeft: '20px' }}>
            <li>Your name and email address</li>
            <li>Your order history</li>
            <li>Any saved account preferences</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
