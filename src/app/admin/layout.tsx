'use client';
import { useState } from 'react';
import './admin.css';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="admin-shell" suppressHydrationWarning>
            {/* Mobile Header */}
            <header className="admin-mobile-header" suppressHydrationWarning>
                <button 
                    className="admin-menu-toggle"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open Menu"
                >
                    <Menu size={24} />
                </button>
                <div className="admin-mobile-brand" suppressHydrationWarning>🍕 SlicePizza Admin</div>
            </header>

            {/* Sidebar with mobile overlay handling */}
            <div 
                className={`admin-sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
                onClick={() => setIsSidebarOpen(false)} 
                suppressHydrationWarning
            />
            
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}
