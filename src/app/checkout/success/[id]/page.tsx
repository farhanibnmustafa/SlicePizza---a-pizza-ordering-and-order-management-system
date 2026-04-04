'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Package, Clock, HomeIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import dynamic from 'next/dynamic';
import { Order } from '@/types';
import styles from './page.module.css';

const MapView = dynamic(() => import('@/components/features/Map/MapView'), {
    ssr: false,
    loading: () => <div style={{ height: '300px', background: '#111', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '20px' }}>Loading Tracker...</div>
});

export default function OrderSuccessPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;
    const [mounted, setMounted] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        // Delay mount state to avoid synchronous state update in effect body
        setTimeout(() => setMounted(true), 0);
        
        const fetchOrder = () => {
            fetch(`/api/orders/${orderId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.order) setOrder(data.order);
                })
                .catch(err => console.error('Failed to fetch order for tracking:', err));
        };

        fetchOrder();
        const interval = setInterval(fetchOrder, 5000);
        return () => clearInterval(interval);
    }, [orderId]);

    if (!mounted) return null;

    const getStatusStep = (status: string) => {
        if (status === 'Cancelled') return 0;
        if (status === 'Delivered') return 4;
        if (status === 'Out for Delivery') return 3;
        if (status === 'Preparing') return 2;
        return 1; // Default for 'Pending Payment', 'Processing', or unknown
    };

    const currentStep = order ? getStatusStep(order.status) : 1;

    return (
        <div className={styles.container}>
            <div className={`${styles.card} glass-panel`}>
                <div className={styles.iconWrapper}>
                    <CheckCircle size={64} className={styles.successIcon} />
                </div>
                <h1 className={styles.title}>
                    {order?.status === 'Delivered' ? 'Order Delivered!' : 'Order Confirmed!'}
                </h1>
                <p className={styles.subtitle}>
                    {order?.status === 'Cancelled' 
                        ? <span style={{ color: 'var(--danger)' }}>This order has been cancelled. Please contact support if you have questions.</span>
                        : order?.status === 'Delivered' 
                            ? "Your pizza has arrived! We hope you enjoy every slice."
                            : <span>Thank you for choosing SlicePizza. Your order <strong>#{orderId}</strong> has been received and is currently: <strong>{order?.status || 'Processing'}</strong></span>
                    }
                </p>

                {order?.customerDetails?.lat && order?.customerDetails?.lng && (
                    <div className={styles.trackerWrapper}>
                        <MapView 
                            mode="tracker" 
                            userLocation={[order.customerDetails.lat, order.customerDetails.lng]} 
                        />
                    </div>
                )}

                <div className={styles.timeline}>
                    <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}><CheckCircle size={20} /></div>
                        <div className={styles.stepContent}>
                            <h4>Order Received</h4>
                            <p>We&apos;ve received your order.</p>
                        </div>
                    </div>
                    <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}><Package size={20} /></div>
                        <div className={styles.stepContent}>
                            <h4>Preparing</h4>
                            <p>Your pizza is in the oven.</p>
                        </div>
                    </div>
                    <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}><Clock size={20} /></div>
                        <div className={styles.stepContent}>
                            <h4>Out for Delivery</h4>
                            <p>A driver is on the way.</p>
                        </div>
                    </div>
                    <div className={`${styles.step} ${currentStep >= 4 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}><HomeIcon size={20} /></div>
                        <div className={styles.stepContent}>
                            <h4>Delivered</h4>
                            <p>Enjoy your meal!</p>
                        </div>
                    </div>
                </div>

                <div className={styles.infoBox}>
                    <Info size={20} className={styles.infoIcon} />
                    <p>You will receive an email confirmation shortly with tracking details. Delivery usually takes 30-45 minutes.</p>
                </div>

                <div className={styles.actions}>
                    <Button onClick={() => router.push('/')} size="lg">Back to Menu</Button>
                </div>
            </div>
        </div>
    );
}
