'use client';
import Image from 'next/image';
import { Pizza } from '@/types';
import { Button } from '@/components/ui/Button';
import styles from './PizzaCard.module.css';

interface PizzaCardProps {
    pizza: Pizza;
    onCustomize: (pizza: Pizza) => void;
}

export const PizzaCard = ({ pizza, onCustomize }: PizzaCardProps) => {
    return (
        <div className={`${styles.card} glass-panel`}>
            <div className={styles.imageWrapper}>
                <Image
                    src={pizza.imageUrl}
                    alt={pizza.name}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className={styles.badges}>
                    {pizza.isVegetarian && <span className={`${styles.badge} ${styles.veg}`}>Veg</span>}
                    {pizza.isSpicy && <span className={`${styles.badge} ${styles.spicy}`}>Spicy</span>}
                </div>
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{pizza.name}</h3>
                <p className={styles.description}>{pizza.description}</p>
                <div className={styles.footer}>
                    <span className={styles.price}>from ${pizza.basePrice.toFixed(2)}</span>
                    <Button onClick={() => onCustomize(pizza)} size="sm">
                        Customize
                    </Button>
                </div>
            </div>
        </div>
    );
};
