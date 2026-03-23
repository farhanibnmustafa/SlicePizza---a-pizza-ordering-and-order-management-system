'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Pizza, LogIn, LogOut, User } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useSession, signOut } from 'next-auth/react';
import styles from './Header.module.css';

export const Header = ({
    onCartClick,
    onAuthClick,
}: {
    onCartClick: () => void;
    onAuthClick: () => void;
}) => {
    const items = useCartStore((state) => state.items);
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const { data: session } = useSession();

    return (
        <header className={`${styles.header} glass-panel`} suppressHydrationWarning>
            <div className={`container ${styles.headerContainer}`} suppressHydrationWarning>
                <Link href="/" className={styles.logo}>
                    <Pizza className={styles.logoIcon} size={32} />
                    <span className={styles.logoText}>Slice<span className={styles.highlight}>Pizza</span></span>
                </Link>

                <div className={styles.rightSection} suppressHydrationWarning>
                    {/* Auth */}
                    {session?.user ? (
                        <div className={styles.userMenu}>
                            <div className={styles.avatar}>
                                {session.user.image ? (
                                    <Image 
                                        src={session.user.image} 
                                        alt={session.user.name || 'User'} 
                                        width={28} 
                                        height={28} 
                                        className={styles.avatarImg} 
                                        unoptimized
                                    />
                                ) : (
                                    <User size={16} />
                                )}
                            </div>
                            <span className={styles.userName}>{session.user.name?.split(' ')[0] || 'User'}</span>
                            <div className={styles.userActions}>
                                <Link href="/orders" className={styles.ordersLink}>
                                    My Orders
                                </Link>
                                <button
                                    className={styles.logoutBtn}
                                    onClick={() => signOut()}
                                    title="Sign out"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button className={styles.signInBtn} onClick={onAuthClick}>
                            <LogIn size={16} />
                            <span>Sign In</span>
                        </button>
                    )}

                    {/* Cart */}
                    <button className={styles.cartButton} onClick={onCartClick}>
                        <ShoppingCart size={24} />
                        {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
                    </button>
                </div>
            </div>
        </header>
    );
};
