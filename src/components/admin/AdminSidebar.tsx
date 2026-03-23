'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LayoutDashboard, ClipboardList, ExternalLink, X } from 'lucide-react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/admin/orders', label: 'Orders', icon: <ClipboardList size={20} /> },
];

export function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();

    return (
        <aside className={`admin-sidebar ${isOpen ? 'mobile-active' : ''}`} suppressHydrationWarning>
            <button className="admin-close-sidebar" onClick={onClose} aria-label="Close">
                <X size={24} />
            </button>
            <div className="admin-brand" suppressHydrationWarning>
                <h2>🍕 SlicePizza</h2>
                <span>Ordering & Management System</span>
            </div>
            <nav className="admin-nav" suppressHydrationWarning>
                {navItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
                
                <div className="admin-nav-section" style={{ marginTop: '32px' }} suppressHydrationWarning>System</div>
                <Link href="/" className="admin-nav-item">
                    <ExternalLink size={20} />
                    <span>View Live Site</span>
                </Link>
            </nav>
        </aside>
    );
}
