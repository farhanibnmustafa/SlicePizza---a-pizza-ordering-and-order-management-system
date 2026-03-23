'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Package, MapPin, CreditCard, Clock, CheckCircle2 } from 'lucide-react';
import { Order } from '@/types';
import styles from './page.module.css';

export default function OrderDetailsPage() {
    const { id } = useParams();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        const fetchOrder = () => {
            if (status === 'authenticated' && id) {
                fetch('/api/orders')
                    .then(res => res.json())
                    .then(data => {
                        const found = data.orders?.find((o: Order) => o.id === id);
                        if (found) {
                            setOrder(found);
                        }
                    })
                    .catch(err => console.error(err))
                    .finally(() => setLoading(false));
            }
        };

        fetchOrder();
        const interval = setInterval(fetchOrder, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [status, id]);

    if (status === 'loading' || loading) {
        return (
            <div className={`container ${styles.page}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--glass-border)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (!order) {
        return (
            <div className={`container ${styles.page}`}>
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <h2>Order not found</h2>
                    <p>We couldn't find the order you're looking for.</p>
                    <Link href="/orders" className={styles.backBtn} style={{ margin: '24px auto' }}>
                        <ChevronLeft size={20} /> Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className={`container ${styles.page}`}>
            <Link href="/orders" className={styles.backBtn}>
                <ChevronLeft size={20} /> Back to Orders
            </Link>

            <div className={styles.layout}>
                <section className={styles.mainContent}>
                    <div className={styles.card}>
                        <div className={styles.orderMeta}>
                            <div>
                                <h1 className={styles.title}>{order.id}</h1>
                                <p style={{ color: 'var(--text-muted)' }}>
                                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase().replace(/\s+/g, '')]}`}>
                                {order.status}
                            </span>
                        </div>

                        <h3 className={styles.sectionTitle}><Package size={20} /> Order Items</h3>
                        <div className={styles.itemList}>
                            {order.items.map((item, idx) => (
                                <div key={idx} className={styles.item}>
                                    <div className={styles.itemInfo}>
                                        <h4>{item.quantity}x {item.pizza.name} ({item.size})</h4>
                                        <p>{item.crust} Crust</p>
                                        {item.extraToppings?.length > 0 && (
                                            <p>+ {item.extraToppings.map(t => t.name).join(', ')}</p>
                                        )}
                                    </div>
                                    <span className={styles.itemPrice}>${item.itemTotal.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.receipt}>
                            <div className={styles.receiptLine}>
                                <span>Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className={styles.receiptLine}>
                                <span>Tax</span>
                                <span>${order.tax.toFixed(2)}</span>
                            </div>
                            <div className={styles.receiptLine}>
                                <span>Delivery Fee</span>
                                <span>${order.deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className={styles.totalLine}>
                                <span>Total</span>
                                <span>${order.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className={styles.customerInfo}>
                            <div className={styles.infoBlock}>
                                <h5><MapPin size={14} style={{ marginRight: '4px' }} /> Delivery Address</h5>
                                <p>{order.customerDetails.address}</p>
                            </div>
                            <div className={styles.infoBlock}>
                                <h5><CreditCard size={14} style={{ marginRight: '4px' }} /> Contact Details</h5>
                                <p>{order.customerDetails.name}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{order.customerDetails.phone}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <aside className={styles.sidebar}>
                    <div className={styles.card}>
                        <h3 className={styles.sectionTitle}><Clock size={20} /> Status History</h3>
                        <div className={styles.timeline}>
                            {order.statusHistory && order.statusHistory.length > 0 ? (
                                order.statusHistory.map((entry, idx) => (
                                    <div key={idx} className={`${styles.timelineItem} ${idx === order.statusHistory!.length - 1 ? styles.active : ''}`}>
                                        <div className={styles.timelineContent}>
                                            <h4>{entry.status}</h4>
                                            <p>{new Date(entry.date).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                            })}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={`${styles.timelineItem} ${styles.active}`}>
                                    <div className={styles.timelineContent}>
                                        <h4>{order.status}</h4>
                                        <p>Order status updated.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {order.status === 'Delivered' && (
                            <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CheckCircle2 size={24} style={{ color: '#4caf50' }} />
                                <div>
                                    <h5 style={{ color: '#4caf50', marginBottom: '2px' }}>Order Complete</h5>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Enjoy your meal!</p>
                                </div>
                            </div>
                        )}
                        
                        {['Preparing', 'Out for Delivery'].includes(order.status) && (
                            <Link 
                                href={`/checkout/success/${order.id}`} 
                                className={styles.backBtn} 
                                style={{ marginTop: '24px', background: 'var(--primary)', color: '#fff', padding: '12px', borderRadius: '12px', justifyContent: 'center', width: '100%', marginBottom: 0 }}
                            >
                                Track Live Map
                            </Link>
                        )}
                    </div>
                </aside>
            </div>
        </main>
    );
}
