import { create } from 'zustand';
import { CartItem } from '@/types';

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    addItem: (item) => set((state) => {
        const newItem = { ...item, id: crypto.randomUUID() };
        return { items: [...state.items, newItem] };
    }),
    removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id)
    })),
    updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        )
    })),
    clearCart: () => set({ items: [] }),
    getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.itemTotal * item.quantity), 0);
    }
}));

// ── Auth Store ─────────────────────────────────────────────────────────────────
interface AuthUser {
    id: string;
    name: string;
    email: string;
}

interface AuthState {
    user: AuthUser | null;
    isLoading: boolean;
    setUser: (user: AuthUser | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user, isLoading: false }),
    setLoading: (isLoading) => set({ isLoading }),
    logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({ user: null });
    },
}));
