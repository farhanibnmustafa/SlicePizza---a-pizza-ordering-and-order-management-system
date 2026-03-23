import { MenuSection } from '@/components/features/MenuSection';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className={styles.page} suppressHydrationWarning>
      {/* Hero Section */}
      <section className={styles.hero} suppressHydrationWarning>
        <div className={styles.heroContent} suppressHydrationWarning>
          <h1 className={styles.title}>
            Premium Artisan Pizzas, <br />
            <span className={styles.highlight}>Delivered Fast.</span>
          </h1>
          <p className={styles.subtitle}>
            Experience the perfect blend of traditional recipes and modern convenience.
            Fresh, hot, and serverless.
          </p>
          <div className={styles.actions} suppressHydrationWarning>
            <a href="#menu" style={{ textDecoration: 'none' }}>
              <Button size="lg">Order Now</Button>
            </a>
          </div>
        </div>
      </section>

      <MenuSection />
    </div>
  );
}
