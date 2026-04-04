'use client';
import { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Pizza, Eye, EyeOff } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import styles from './AuthModal.module.css';

interface AuthModalProps {
    onClose: () => void;
    defaultTab?: 'login' | 'register';
}

export const AuthModal = ({ onClose, defaultTab = 'login' }: AuthModalProps) => {
    const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    useSession();
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const reset = () => { setName(''); setEmail(''); setPassword(''); setError(''); };

    const switchTab = (t: 'login' | 'register') => { setTab(t); reset(); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const body = tab === 'login'
            ? { email, password }
            : { name, email, password };

        try {
            if (tab === 'login') {
                const res = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                });

                if (res?.error) {
                    setError('Invalid email or password.');
                } else {
                    onClose();
                }
            } else {
                // Registration
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Something went wrong.');
                } else {
                    // Auto login after registration
                    await signIn('credentials', { email, password, redirect: false });
                    onClose();
                }
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={styles.overlay}
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            suppressHydrationWarning
        >
            <div className={`${styles.modal} glass-panel`} suppressHydrationWarning>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.brandMark}>
                        <Pizza size={22} className={styles.brandIcon} />
                        <span>Slice<strong>Pizza</strong></span>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${tab === 'login' ? styles.activeTab : ''}`}
                        onClick={() => switchTab('login')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`${styles.tab} ${tab === 'register' ? styles.activeTab : ''}`}
                        onClick={() => switchTab('register')}
                    >
                        Create Account
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h2 className={styles.title}>
                        {tab === 'login' ? 'Welcome back! 👋' : 'Join SlicePizza 🍕'}
                    </h2>
                    <p className={styles.subtitle}>
                        {tab === 'login'
                            ? 'Sign in to track your orders and manage your account.'
                            : 'Create your account to start ordering delicious pizza.'}
                    </p>

                    {tab === 'register' && (
                        <div className={styles.field}>
                            <label htmlFor="auth-name">Full Name</label>
                            <div className={styles.inputWrapper}>
                                <User size={16} className={styles.inputIcon} />
                                <input
                                    id="auth-name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoFocus
                                    className={styles.input}
                                />
                            </div>
                        </div>
                    )}

                    <div className={styles.field}>
                        <label htmlFor="auth-email">Email Address</label>
                        <div className={styles.inputWrapper}>
                            <Mail size={16} className={styles.inputIcon} />
                            <input
                                id="auth-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus={tab === 'login'}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="auth-password">Password</label>
                        <div className={styles.inputWrapper}>
                            <Lock size={16} className={styles.inputIcon} />
                            <input
                                id="auth-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder={tab === 'register' ? 'Min. 8 characters' : '••••••••'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={tab === 'register' ? 8 : 1}
                                className={styles.input}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(s => !s)}
                                className={styles.eyeBtn}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorBox} role="alert">
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className={styles.submitBtn}>
                        {loading
                            ? <span className={styles.spinner} />
                            : tab === 'login' ? 'Sign In' : 'Create Account'}
                    </button>




                    <p className={styles.switchPrompt}>
                        {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button type="button" onClick={() => switchTab(tab === 'login' ? 'register' : 'login')} className={styles.switchLink}>
                            {tab === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};
