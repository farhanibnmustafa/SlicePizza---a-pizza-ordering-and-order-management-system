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
    const { data: session } = useSession();
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

        const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
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

                    <div className={styles.divider}>
                        <span>Or continue with</span>
                    </div>

                    <div className={styles.socialButtons}>
                        <button 
                            type="button" 
                            className={styles.socialBtn}
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google
                        </button>
                        <button 
                            type="button" 
                            className={styles.socialBtn}
                            onClick={() => signIn('facebook', { callbackUrl: '/' })}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.998 12c0-6.628-5.372-12-11.999-12C5.372 0 0 5.372 0 12c0 5.988 4.388 10.954 10.124 11.852v-8.384H7.078v-3.469h3.046V9.356c0-3.008 1.792-4.669 4.532-4.669 1.313 0 2.686.234 2.686.234v2.953H15.83c-1.49 0-1.955.925-1.955 1.874V12h3.328l-.532 3.469h-2.796v8.384c5.736-.898 10.124-5.864 10.124-11.853z" fill="#1877F2"/>
                            </svg>
                            Facebook
                        </button>
                    </div>

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
