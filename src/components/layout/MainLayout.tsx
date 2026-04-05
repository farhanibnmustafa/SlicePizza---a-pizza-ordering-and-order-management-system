'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { CartSidebar } from '@/components/features/CartSidebar';
import { AuthModal } from '@/components/features/AuthModal';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <>
            <Header
                onCartClick={() => setIsCartOpen(true)}
                onAuthClick={() => setIsAuthOpen(true)}
            />
            <main className="container animate-fade-in" style={{ padding: '40px 1.5rem', minHeight: 'calc(100vh - 80px)' }} suppressHydrationWarning>
                {children}
            </main>
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            {isAuthOpen && (
                <AuthModal onClose={() => setIsAuthOpen(false)} />
            )}
        </>
    );
};
