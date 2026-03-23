'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/lib/store';

function ConfirmOrderContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { clearCart } = useCartStore();
    const [status, setStatus] = useState('Verifying Secure Payment...');

    useEffect(() => {
        if (!sessionId) {
            if (status !== 'Invalid payment session.') {
                setTimeout(() => setStatus('Invalid payment session.'), 0);
            }
            const timer = setTimeout(() => router.push('/'), 3000);
            return () => clearTimeout(timer);
        }

        const confirmPayment = async () => {
            try {
                const res = await fetch('/api/orders/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId })
                });

                const data = await res.json();
                
                if (res.ok) {
                    clearCart();
                    if (status !== 'Payment confirmed! Preparing your receipt...') {
                        setStatus('Payment confirmed! Preparing your receipt...');
                    }
                    // Redirect to standard success progress tracking page
                    setTimeout(() => {
                        router.push(`/checkout/success/${data.orderId}`);
                    }, 1000);
                } else {
                    const errorMsg = `Payment failed: ${data.error}`;
                    if (status !== errorMsg) {
                        setStatus(errorMsg);
                    }
                    setTimeout(() => router.push('/checkout'), 3000);
                }
            } catch (error) {
                console.error(error);
                if (status !== 'Failed to verify payment with server.') {
                    setStatus('Failed to verify payment with server.');
                }
            }
        };

        confirmPayment();
    }, [sessionId, router, clearCart, status]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }} suppressHydrationWarning>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '4px solid var(--glass-border)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite', marginBottom: '20px' }} suppressHydrationWarning />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{status}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Please do not close this window.</p>
        </div>
    );
}

export default function ConfirmOrderPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }} suppressHydrationWarning>Loading...</div>}>
            <ConfirmOrderContent />
        </Suspense>
    );
}
