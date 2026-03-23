import { NextRequest, NextResponse } from 'next/server';
import { userStore, hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        // ── Validation ──────────────────────────────────────────────────────
        if (!name?.trim() || !email?.trim() || !password) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
        }
        if (await userStore.exists(email)) {
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        }

        // ── Create user ─────────────────────────────────────────────────────
        const newUser = await userStore.create({
            id: crypto.randomUUID(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            hashedPassword: await hashPassword(password),
            role: 'customer',
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json(
            { id: newUser.id, name: newUser.name, email: newUser.email },
            { status: 201 }
        );
    } catch {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
