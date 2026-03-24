'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
    id: string;
    status: string;
    total: number;
    customerDetails: { name: string; email: string };
    createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
    'Pending Payment': 'badge-pending',
    'Preparing': 'badge-preparing',
    'Out for Delivery': 'badge-delivery',
    'Delivered': 'badge-delivered',
    'Cancelled': 'badge-cancelled',
};

export default function AdminDashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/orders')
            .then(r => r.json())
            .then(d => { setOrders(d.orders || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const stats = {
        total: orders.length,
        revenue: orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Pending Payment')
            .reduce((s, o) => s + (o.total || 0), 0),
        pending: orders.filter(o => o.status === 'Preparing' || o.status === 'Pending Payment').length,
        delivered: orders.filter(o => o.status === 'Delivered').length,
    };

    const recent = orders.slice(0, 5);

    return (
        <>
            <div className="admin-page-header" suppressHydrationWarning>
                <h1>Dashboard</h1>
                <p>Welcome back! Here&apos;s what&apos;s happening at SlicePizza.</p>
            </div>

            <div className="admin-stats-grid" suppressHydrationWarning>
                <div className="admin-stat-card" style={{ '--card-accent': '#f26622' } as React.CSSProperties} suppressHydrationWarning>
                    <div className="admin-stat-label" suppressHydrationWarning>Total Orders</div>
                    <div className="admin-stat-value" suppressHydrationWarning>{loading ? '—' : stats.total}</div>
                    <div className="admin-stat-sub" suppressHydrationWarning>All time</div>
                </div>
                <div className="admin-stat-card" style={{ '--card-accent': '#10b981' } as React.CSSProperties} suppressHydrationWarning>
                    <div className="admin-stat-label" suppressHydrationWarning>Revenue</div>
                    <div className="admin-stat-value" suppressHydrationWarning>{loading ? '—' : `$${stats.revenue.toFixed(0)}`}</div>
                    <div className="admin-stat-sub" suppressHydrationWarning>Fulfilled orders</div>
                </div>
                <div className="admin-stat-card" style={{ '--card-accent': '#fbbf24' } as React.CSSProperties} suppressHydrationWarning>
                    <div className="admin-stat-label" suppressHydrationWarning>Active Orders</div>
                    <div className="admin-stat-value" suppressHydrationWarning>{loading ? '—' : stats.pending}</div>
                    <div className="admin-stat-sub" suppressHydrationWarning>Preparing / Pending</div>
                </div>
                <div className="admin-stat-card" style={{ '--card-accent': '#60a5fa' } as React.CSSProperties} suppressHydrationWarning>
                    <div className="admin-stat-label" suppressHydrationWarning>Delivered</div>
                    <div className="admin-stat-value" suppressHydrationWarning>{loading ? '—' : stats.delivered}</div>
                    <div className="admin-stat-sub" suppressHydrationWarning>Successfully completed</div>
                </div>
            </div>

            <div className="admin-card" suppressHydrationWarning>
                <div className="admin-card-header" suppressHydrationWarning>
                    <h2 className="admin-card-title">Recent Orders</h2>
                    <Link href="/admin/orders" className="admin-btn admin-btn-ghost">View All →</Link>
                </div>
                {loading && (
                    <div className="admin-empty" suppressHydrationWarning>
                        <div className="admin-empty-icon" suppressHydrationWarning>⏳</div>
                        <p>Loading orders...</p>
                    </div>
                )}
                {!loading && recent.length === 0 && (
                    <div className="admin-empty" suppressHydrationWarning>
                        <div className="admin-empty-icon" suppressHydrationWarning>📭</div>
                        <p>No orders yet.</p>
                    </div>
                )}
                {!loading && recent.map(order => (
                    <div key={order.id} className="admin-recent-row">
                        <div>
                            <div className="admin-order-id">{order.id}</div>
                            <div className="admin-customer-email">{order.customerDetails?.name || 'Guest'}</div>
                        </div>
                        <span className={`admin-badge ${STATUS_COLORS[order.status] || 'badge-pending'}`}>
                            {order.status}
                        </span>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600, color: '#f1f5f9' }}>${(order.total || 0).toFixed(2)}</div>
                            <div className="admin-customer-email">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
