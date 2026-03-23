'use client';
import { useState, useEffect } from 'react';
import { Pizza, Topping } from '@/types';
import { PizzaCard } from './PizzaCard';
import { CustomizeModal } from './CustomizeModal';
import styles from './MenuSection.module.css';

export const MenuSection = () => {
    const [pizzas, setPizzas] = useState<Pizza[]>([]);
    const [toppings, setToppings] = useState<Topping[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const res = await fetch('/api/menu');
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                setPizzas(data.pizzas || []);
                setToppings(data.toppings || []);
            } catch (error) {
                console.error('Failed to fetch menu:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    if (loading) {
        return (
            <div className={styles.loading} suppressHydrationWarning>
                <div className={styles.spinner} suppressHydrationWarning></div>
                <p>Firing up the oven...</p>
            </div>
        );
    }

    return (
        <section id="menu" className={styles.menuSection}>
            <div className={styles.header}>
                <h2>Our Menu</h2>
                <p>Hand-crafted with passion and the finest ingredients.</p>
            </div>

            <div className={styles.grid}>
                {pizzas.map(pizza => (
                    <PizzaCard
                        key={pizza.id}
                        pizza={pizza}
                        onCustomize={setSelectedPizza}
                    />
                ))}
            </div>

            {selectedPizza && (
                <CustomizeModal
                    pizza={selectedPizza}
                    availableToppings={toppings}
                    onClose={() => setSelectedPizza(null)}
                />
            )}
        </section>
    );
};
