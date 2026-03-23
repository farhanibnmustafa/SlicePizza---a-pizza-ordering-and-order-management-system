'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, MapPin, Clock } from 'lucide-react';
import { Order } from '@/types';
import styles from './page.module.css';

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        const fetchOrders = () => {
            if (status === 'authenticated') {
                fetch('/api/orders')
                    .then(res => res.json())
                    .then(data => {
                        if (data.orders) {
                            setOrders(data.orders);
                        }
                    })
                    .catch(err => console.error(err))
                    .finally(() => setLoading(false));
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [status]);

    const activeOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status));
    const pastOrders = orders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));
    const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

    if (status === 'loading' || loading) {
        return (
            <div className={`container ${styles.page}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--glass-border)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!session?.user) return null;

    return (
        <main className={`container ${styles.page}`}>
            <div className={styles.header}>
                <h1>My Orders</h1>
                <p>Track your active cravings or look back at your pizza history.</p>
            </div>

            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'active' ? styles.active : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active ({activeOrders.length})
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'past' ? styles.active : ''}`}
                    onClick={() => setActiveTab('past')}
                >
                    Past ({pastOrders.length})
                </button>
            </div>

            {displayOrders.length === 0 ? (
                <div className={styles.emptyState}>
                    <Package size={48} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
                    <h2>No {activeTab} orders</h2>
                    <p>
                        {activeTab === 'active' 
                            ? "You don't have any active orders right now. Time to grab some pizza?"
                            : "Your order history is empty. Start your journey with SlicePizza today!"}
                    </p>
                    <Link href="/#menu" className={styles.browseBtn}>Browse Menu</Link>
                </div>
            ) : (
                <div className={styles.ordersList}>
                    {displayOrders.map(order => (
                        <div key={order.id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <div className={styles.orderId}>
                                    <h3>{order.id}</h3>
                                    <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase().replace(/\s+/g, '')]}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className={styles.date}>
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            
                            <div className={styles.orderDetails}>
                                <div className={styles.itemsList}>
                                    {order.items.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className={styles.item}>
                                            <span>{item.quantity}x {item.pizza.name} ({item.size})</span>
                                            <span>${item.itemTotal.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    {order.items.length > 2 && (
                                        <div className={styles.item}>
                                            <span>...and {order.items.length - 2} more item(s)</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className={styles.summary}>
                                    <div className={styles.total}>${order.total.toFixed(2)}</div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <Link href={`/orders/${order.id}`} className={styles.outlineBtn}>
                                            Details
                                        </Link>
                                        {['Preparing', 'Out for Delivery'].includes(order.status) && (
                                            <Link href={`/checkout/success/${order.id}`} className={styles.trackBtn}>
                                                Track
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
