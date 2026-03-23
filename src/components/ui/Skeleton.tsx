import styles from './Skeleton.module.css';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string;
    className?: string;
}

export const Skeleton = ({ width, height, borderRadius, className }: SkeletonProps) => {
    return (
        <div 
            className={`${styles.skeleton} ${className || ''}`}
            style={{ width, height, borderRadius }}
        />
    );
};

export const PizzaCardSkeleton = () => (
    <div className={styles.pizzaCardSkeleton}>
        <Skeleton height="200px" borderRadius="12px" />
        <div style={{ padding: '15px' }}>
            <Skeleton width="60%" height="24px" className={styles.mb8} />
            <Skeleton width="90%" height="40px" className={styles.mb15} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton width="30%" height="28px" />
                <Skeleton width="80px" height="36px" borderRadius="20px" />
            </div>
        </div>
    </div>
);
