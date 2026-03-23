'use client';
import { useEffect, useState, useCallback } from 'react';
import { X, Package, MapPin, User } from 'lucide-react';
import Image from 'next/image';

interface Order {
    id: string;
    status: string;
    total: number;
    subtotal: number;
    deliveryFee: number;
    tax: number;
    items: {
        pizza: {
            name: string;
            imageUrl: string;
        };
        quantity: number;
        size: string;
        crust: string;
        extraToppings?: { name: string }[];
    }[];
    customerDetails: { name: string; email: string; address: string; phone: string };
    createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
    'Pending Payment': 'badge-pending',
    'Preparing': 'badge-preparing',
    'Out for Delivery': 'badge-delivery',
    'Delivered': 'badge-delivered',
    'Cancelled': 'badge-cancelled',
};

const ALL_STATUSES = ['Pending Payment', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [updating, setUpdating] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (search) params.set('search', search);
        const res = await fetch(`/api/admin/orders?${params.toString()}`);
        const data = await res.json();
        setOrders(data.orders || []);
        setLoading(false);
    }, [search, statusFilter]);

    useEffect(() => {
        const t = setTimeout(fetchOrders, 300);
        return () => clearTimeout(t);
    }, [fetchOrders]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        setUpdating(orderId);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setOrders(prev =>
                    prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
                );
                // Also update the selected order if it's the one we're viewing
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
                }
            }
        } finally {
            setUpdating(null);
        }
    };

    return (
        <>
            <div className="admin-page-header" suppressHydrationWarning>
                <h1>Orders Management</h1>
                <p>Track, update, and manage kitchen status for all customer orders.</p>
            </div>

            <div className="admin-card" suppressHydrationWarning>
                <div className="admin-card-header" suppressHydrationWarning>
                    <h2 className="admin-card-title">
                        All Orders <span style={{ color: '#64748b', fontWeight: 400 }}>({orders.length})</span>
                    </h2>
                    <div className="admin-controls" suppressHydrationWarning>
                        <input
                            className="admin-search"
                            placeholder="Search by ID, name, email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <select
                            className="admin-select"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            {ALL_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="admin-table-wrap" suppressHydrationWarning>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Update Kitchen</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={6}>
                                    <div className="admin-empty" suppressHydrationWarning>
                                        <div className="admin-empty-icon" suppressHydrationWarning>⏳</div>
                                        <p>Syncing with oven...</p>
                                    </div>
                                </td></tr>
                            )}
                            {!loading && orders.length === 0 && (
                                <tr><td colSpan={6}>
                                    <div className="admin-empty"><div className="admin-empty-icon">📭</div><p>No orders found.</p></div>
                                </td></tr>
                            )}
                            {!loading && orders.map(order => (
                                <tr key={order.id}>
                                    <td><span className="admin-order-id">#{order.id.slice(-8).toUpperCase()}</span></td>
                                    <td>
                                        <div className="admin-customer-name">{order.customerDetails?.name || 'Guest'}</div>
                                        <div className="admin-customer-email">{order.customerDetails?.email}</div>
                                    </td>
                                    <td style={{ fontWeight: 600, color: '#f1f5f9' }}>
                                        ${(order.total || 0).toFixed(2)}
                                    </td>
                                    <td>
                                        <span className={`admin-badge ${STATUS_COLORS[order.status] || 'badge-pending'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <select
                                            className="admin-status-select"
                                            value={order.status}
                                            disabled={updating === order.id}
                                            onChange={e => updateStatus(order.id, e.target.value)}
                                        >
                                            {ALL_STATUSES.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <button 
                                            className="admin-btn admin-btn-ghost"
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Order Details #{selectedOrder.id.slice(-8).toUpperCase()}</h2>
                            <button className="admin-btn admin-btn-ghost" onClick={() => setSelectedOrder(null)} style={{ padding: '8px' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="admin-modal-content">
                            <div className="admin-detail-section">
                                <h3><User size={16} /> Customer Information</h3>
                                <div className="admin-detail-grid">
                                    <div className="admin-detail-item">
                                        <label>Full Name</label>
                                        <div>{selectedOrder.customerDetails?.name}</div>
                                    </div>
                                    <div className="admin-detail-item">
                                        <label>Email Address</label>
                                        <div>{selectedOrder.customerDetails?.email}</div>
                                    </div>
                                    <div className="admin-detail-item">
                                        <label>Phone Number</label>
                                        <div>{selectedOrder.customerDetails?.phone}</div>
                                    </div>
                                    <div className="admin-detail-item">
                                        <label>Order Date</label>
                                        <div>{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-detail-section">
                                <h3><MapPin size={16} /> Delivery Address</h3>
                                <div className="admin-detail-item" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {selectedOrder.customerDetails?.address}
                                </div>
                            </div>

                            <div className="admin-detail-section">
                                <h3><Package size={16} /> Items to Prepare</h3>
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="admin-receipt-item">
                                        <div className="admin-receipt-img-wrapper" style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden' }}>
                                            <Image 
                                                src={item.pizza.imageUrl} 
                                                alt={item.pizza.name} 
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                unoptimized // images might be external URLs
                                            />
                                        </div>
                                        <div className="admin-receipt-body">
                                            <div className="admin-receipt-info">
                                                <span className="admin-receipt-name">{item.pizza.name}</span>
                                                <span className="admin-receipt-qty">x{item.quantity}</span>
                                            </div>
                                            <div className="admin-receipt-details">
                                                Size: {item.size} • {item.crust} Crust
                                                {item.extraToppings && item.extraToppings.length > 0 && (
                                                    <div>Extra: {item.extraToppings.map(t => t.name).join(', ')}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="admin-detail-section" style={{ marginBottom: 0 }}>
                                <h3>Order Summary</h3>
                                <div className="admin-summary-box">
                                    <div className="admin-summary-row">
                                        <span>Subtotal</span>
                                        <span>${(selectedOrder.subtotal || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="admin-summary-row">
                                        <span>Delivery Fee</span>
                                        <span>${(selectedOrder.deliveryFee || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="admin-summary-row">
                                        <span>Tax</span>
                                        <span>${(selectedOrder.tax || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="admin-summary-total">
                                        <span>Total Amount</span>
                                        <span>${(selectedOrder.total || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
