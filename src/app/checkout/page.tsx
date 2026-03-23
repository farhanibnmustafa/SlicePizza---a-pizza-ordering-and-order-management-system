'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

const MapView = dynamic(() => import('@/components/features/Map/MapView'), {
    ssr: false,
    loading: () => <div className={styles.mapPlaceholder}>Loading Map...</div>
});

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getSubtotal } = useCartStore();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        lat: 40.7128, // Default to a central city location
        lng: -74.0060
    });

    // Pre-fill name + email when auth state is available
    useEffect(() => {
        if (session && session.user) {
            const userName = session.user.name || '';
            const userEmail = session.user.email || '';
            setFormData(prev => ({
                ...prev,
                name: prev.name || userName,
                email: prev.email || userEmail,
            }));
        }
    }, [session]);

    // Auth guard — redirect to home if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/');
        }
    }, [status, router]);

    const subtotal = getSubtotal();
    const tax = subtotal * 0.08;
    const deliveryFee = 5.00;
    const total = subtotal + tax + deliveryFee;

    if (items.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <h2>Your cart is empty</h2>
                <Button onClick={() => router.push('/')}>Return to Menu</Button>
            </div>
        );
    }

    const handleLocationSelect = (lat: number, lng: number, address: string) => {
        setFormData(prev => ({
            ...prev,
            lat,
            lng,
            address: address || prev.address
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    subtotal,
                    tax,
                    deliveryFee,
                    total,
                    customerDetails: formData
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Redirect securely to Stripe Hosted Checkout
            if (data.stripeUrl) {
                window.location.href = data.stripeUrl;
            } else {
                throw new Error("Failed to generate payment link");
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Failed to initiate secure checkout. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.checkoutPage}>
            <h1 className={styles.title}>Checkout</h1>

            <div className={styles.container}>
                <div className={styles.formSection}>
                    <div className={`${styles.card} glass-panel`}>
                        <h2>Delivery Details</h2>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Full Name</label>
                                <input className={styles.input} required type="text" name="name" value={formData.name} onChange={handleChange} />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Email</label>
                                    <input className={styles.input} required type="email" name="email" value={formData.email} onChange={handleChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Phone Number</label>
                                    <input className={styles.input} required type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Delivery Address</label>
                                <div className={styles.mapWrapper}>
                                    <MapView mode="picker" onLocationSelect={handleLocationSelect} />
                                    <span className={styles.mapHint}>Click on the map or use the locate button to set your precise delivery spot</span>
                                </div>
                                <textarea className={styles.textarea} required name="address" rows={3} value={formData.address} onChange={handleChange} placeholder="Or type your address here..." />
                            </div>

                            <div className={styles.paymentSection}>
                                <h2>Payment Method</h2>
                                <p className={styles.mockPayment}>Secure Payment via Stripe Checkout</p>
                            </div>

                            <Button type="submit" fullWidth size="lg" disabled={loading}>
                                {loading ? 'Processing...' : `Place Order • $${total.toFixed(2)}`}
                            </Button>
                        </form>
                    </div>
                </div>

                <div className={styles.summarySection}>
                    <div className={`${styles.card} glass-panel`}>
                        <h2>Order Summary</h2>
                        <div className={styles.itemsList}>
                            {items.map(item => (
                                <div key={item.id} className={styles.summaryItem}>
                                    <div className={styles.itemMeta}>
                                        <span className={styles.itemQty}>{item.quantity}x</span>
                                        <div>
                                            <span className={styles.itemName}>{item.pizza.name}</span>
                                            <span className={styles.itemDetails}>{item.size}, {item.crust} crust</span>
                                        </div>
                                    </div>
                                    <span className={styles.itemPrice}>${(item.itemTotal * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.totals}>
                            <div className={styles.totalsRow}>
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.totalsRow}>
                                <span>Tax (8%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className={styles.totalsRow}>
                                <span>Delivery Fee</span>
                                <span>${deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className={`${styles.totalsRow} ${styles.finalTotal}`}>
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
