'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Pizza, Size, Crust, Topping } from '@/types';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { X, Check } from 'lucide-react';
import styles from './CustomizeModal.module.css';

interface CustomizeModalProps {
    pizza: Pizza;
    availableToppings: Topping[];
    onClose: () => void;
}

const SIZES: { label: Size; multiplier: number }[] = [
    { label: '6 inch', multiplier: 0.8 },
    { label: '8 inch', multiplier: 1 },
    { label: '12 inch', multiplier: 1.25 },
];

const CRUSTS: Crust[] = ['Thin', 'Regular', 'Thick', 'Cheese-Stuffed'];

export const CustomizeModal = ({ pizza, availableToppings, onClose }: CustomizeModalProps) => {
    const [size, setSize] = useState<Size>('8 inch');
    const [crust, setCrust] = useState<Crust>('Regular');
    const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
    const addItem = useCartStore(state => state.addItem);

    const toggleTopping = (topping: Topping) => {
        setSelectedToppings(prev =>
            prev.find(t => t.id === topping.id)
                ? prev.filter(t => t.id !== topping.id)
                : [...prev, topping]
        );
    };

    const sizeMultiplier = SIZES.find(s => s.label === size)?.multiplier || 1;
    const basePrice = pizza.basePrice * sizeMultiplier;
    const crustPrice = crust === 'Cheese-Stuffed' ? 2.50 : 0;
    const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
    const total = basePrice + crustPrice + toppingsPrice;

    // ── Smart Image Selector ──────────────────────────────────────────
    // Priority: toppings (most specific) → crust → size → pizza's named image
    const getPizzaImage = (): string => {
        // 3+ toppings → loaded
        if (selectedToppings.length >= 3) return '/pizza_loaded_1773311773924.png';

        const hasBacon    = selectedToppings.some(t => t.name.toLowerCase().includes('bacon'));
        const hasJalape   = selectedToppings.some(t => t.name.toLowerCase().includes('jalape'));
        const hasOlives   = selectedToppings.some(t => t.name.toLowerCase().includes('olive'));
        const hasMushroom = selectedToppings.some(t => t.name.toLowerCase().includes('mushroom'));
        const hasCheese   = selectedToppings.some(t => t.name.toLowerCase().includes('cheese'));
        const hasOnions   = selectedToppings.some(t => t.name.toLowerCase().includes('onion'));

        if (hasBacon)    return '/pizza_bacon_1773321606022.png';
        if (hasJalape)   return '/pizza_jalapenos_1773321586699.png';
        if (hasOlives)   return '/pizza_olives_1773321568106.png';
        if (hasMushroom) return '/pizza_mushrooms_1773311757661.png';
        if (hasCheese)   return '/pizza_extra_cheese_1773311743061.png';
        if (hasOnions)   return '/pizza_onions_topping_1773520762468.png';

        // Crust overrides
        if (crust === 'Cheese-Stuffed') return '/pizza_stuffed_crust_1773311728012.png';
        if (crust === 'Thick')          return '/pizza_thick_crust_1773311712336.png';
        if (crust === 'Thin')           return '/pizza_thin_crust_1773311692036.png';

        // Default: show the named pizza's own image (size is shown via visual scale, not a different image)
        return pizza.imageUrl;
    };

    // Label that shows the user what they're looking at
    const getVisualizerLabel = (): string => {
        if (selectedToppings.length >= 3)    return '🔥 Fully Loaded!';
        if (selectedToppings.length > 0) {
            const names = selectedToppings.map(t => t.name).join(', ');
            return `+ ${names}`;
        }
        if (crust !== 'Regular') return `${crust} Crust`;
        if (size === '6 inch')  return '🍕 6 Inch (Personal)';
        if (size === '12 inch') return '🍕 12 Inch (Party Size)';
        return pizza.name;
    };

    // Scale wrapper: make 6" pizza visually tiny, 8" normal, 12" large
    const getSizeScale = () => {
        if (size === '6 inch')  return 0.52;   // clearly small
        if (size === '12 inch') return 1.22;   // fills the space
        return 1.0;
    };

    const handleAddToCart = () => {

        addItem({
            pizza,
            size,
            crust,
            extraToppings: selectedToppings,
            quantity: 1,
            itemTotal: total
        });
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal} glass-panel`}>
                <div className={styles.header}>
                    <h2>Customize Order</h2>
                    <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
                </div>

                <div className={styles.content}>
                    {/* Visualizer Section */}
                    <div className={styles.visualizerSection}>
                        <div
                            className={styles.sizeScaleWrapper}
                            style={{
                                transform: `scale(${getSizeScale()})`,
                                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                        >
                            <div className={styles.pizzaVisualizer}>
                                <div key={getPizzaImage()} className={styles.imageWrapper}>
                                    <Image
                                        src={getPizzaImage()}
                                        alt={`Pizza visualization: ${size} ${crust}`}
                                        fill
                                        className={styles.image}
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                        <div key={getVisualizerLabel()} className={styles.visualizerLabel}>
                            {getVisualizerLabel()}
                        </div>
                    </div>

                    <div className={styles.optionsSection}>
                        <div className={styles.pizzaDetails}>
                            <h3>{pizza.name}</h3>
                            <p>{pizza.description}</p>
                        </div>

                        <div className={styles.section}>
                            <h4>Size</h4>
                            <div className={styles.optionsGrid}>
                                {SIZES.map(s => (
                                    <button
                                        key={s.label}
                                        className={`${styles.optionBtn} ${size === s.label ? styles.selected : ''}`}
                                        onClick={() => setSize(s.label)}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h4>Crust</h4>
                            <div className={styles.optionsGrid}>
                                {CRUSTS.map(c => (
                                    <button
                                        key={c}
                                        className={`${styles.optionBtn} ${crust === c ? styles.selected : ''}`}
                                        onClick={() => setCrust(c)}
                                    >
                                        {c} {c === 'Cheese-Stuffed' && '(+$2.50)'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h4>Extra Toppings</h4>
                            <div className={styles.toppingsGrid}>
                                {availableToppings.map(topping => {
                                    const isSelected = selectedToppings.some(t => t.id === topping.id);
                                    return (
                                        <button
                                            key={topping.id}
                                            className={`${styles.toppingBtn} ${isSelected ? styles.selected : ''}`}
                                            onClick={() => toggleTopping(topping)}
                                        >
                                            <span className={styles.checkbox}>
                                                {isSelected && <Check size={14} />}
                                            </span>
                                            <span className={styles.toppingName}>{topping.name}</span>
                                            <span className={styles.toppingPrice}>+${topping.price.toFixed(2)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.totalInfo}>
                        <span>Total Item Price</span>
                        <span className={styles.price}>${total.toFixed(2)}</span>
                    </div>
                    <Button fullWidth onClick={handleAddToCart}>
                        Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
};
