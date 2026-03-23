import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '100vh',
            background: '#0a0c10', color: '#e2e8f0',
            fontFamily: 'Outfit, sans-serif', textAlign: 'center', padding: '20px'
        }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🚫</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '8px' }}>
                Access Denied
            </h1>
            <p style={{ color: '#64748b', marginBottom: '32px', maxWidth: '360px' }}>
                Your account does not have admin privileges. Please contact the system administrator.
            </p>
            <Link href="/" style={{
                background: '#f26622', color: '#fff', padding: '10px 24px',
                borderRadius: '8px', fontWeight: 600, textDecoration: 'none',
                fontSize: '0.9rem'
            }}>
                ← Back to SlicePizza
            </Link>
        </div>
    );
}
