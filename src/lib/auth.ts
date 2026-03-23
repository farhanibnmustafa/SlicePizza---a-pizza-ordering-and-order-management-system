import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'slicerush-super-secret-jwt-key-change-in-prod'
);

interface StoredUser {
    id: string;
    name: string;
    email: string;
    hashedPassword: string;
    role: 'customer' | 'admin' | 'staff';
    createdAt: string;
}

import { supabaseAdmin } from './supabase';

// ── Persistent User Store (Supabase) ──────────────────────────────────────────
export const userStore = {
    findByEmail: async (email: string) => {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();
        
        if (error) return null;
        return {
            id: data.id,
            name: data.name,
            email: data.email,
            hashedPassword: data.hashed_password,
            role: data.role || 'customer',
            createdAt: data.created_at
        } as StoredUser;
    },
    create: async (user: StoredUser) => {
        const { data, error } = await supabaseAdmin
            .from('users')
            .insert({
                id: user.id || crypto.randomUUID(),
                name: user.name,
                email: user.email.toLowerCase(),
                hashed_password: user.hashedPassword,
                role: user.role || 'customer',
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    exists: async (email: string) => {
        const { count, error } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('email', email.toLowerCase());
        
        return !error && (count || 0) > 0;
    },
};

// ── Password Hashing ───────────────────────────────────────────────────────────
export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

// ── JWT ────────────────────────────────────────────────────────────────────────
export interface JWTPayload {
    id: string;
    name: string;
    email: string;
    iat?: number;
    exp?: number;
}

export const createJWT = (payload: Omit<JWTPayload, 'iat' | 'exp'>) =>
    new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);

export const verifyJWT = async (token: string): Promise<JWTPayload | null> => {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
};

// ── Cookie name ────────────────────────────────────────────────────────────────
export const AUTH_COOKIE = 'auth-token';
