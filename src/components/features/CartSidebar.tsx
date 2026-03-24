'use client';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './CartSidebar.module.css';

export const CartSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const router = useRouter();
    const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
    const subtotal = getSubtotal();

    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={onClose} />}
            <div className={`${styles.sidebar} ${isOpen ? styles.open : ''} glass-panel`} suppressHydrationWarning>
                <div className={styles.header} suppressHydrationWarning>
                    <h2>Your Cart ({items.length})</h2>
                    <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
                </div>

                <div className={styles.content} suppressHydrationWarning>
                    {items.length === 0 ? (
                        <div className={styles.empty} suppressHydrationWarning>
                            <ShoppingBag size={48} className={styles.emptyIcon} />
                            <p>Your cart is empty.</p>
                            <Button onClick={() => { router.push('/'); onClose(); }} variant="primary" suppressHydrationWarning>Add some pizzas!</Button>
                        </div>
                    ) : (
                        <div className={styles.itemList}>
                            {items.map(item => (
                                <div key={item.id} className={styles.cartItem}>
                                    <div className={styles.itemInfo}>
                                        <h4>{item.pizza.name} ({item.size})</h4>
                                        <p className={styles.details}>
                                            {item.crust} crust
                                            {item.extraToppings.length > 0 && ` • +${item.extraToppings.length} extras`}
                                        </p>
                                        <p className={styles.price}>${(item.itemTotal * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <div className={styles.actions}>
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus size={16} /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={16} /></button>
                                        <button onClick={() => removeItem(item.id)} className={styles.removeBtn}><X size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.summary}>
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <Button fullWidth onClick={() => { router.push('/checkout'); onClose(); }}>
                            Proceed to Checkout
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};
