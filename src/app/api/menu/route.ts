import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 60; // Cache menu aggressively, revalidate every 60 seconds

export async function GET() {
    try {
        const [pizzasRes, toppingsRes] = await Promise.all([
            supabaseAdmin.from('pizzas').select('*'),
            supabaseAdmin.from('toppings').select('*')
        ]);

        if (pizzasRes.error) throw pizzasRes.error;
        if (toppingsRes.error) throw toppingsRes.error;

        const pizzas = pizzasRes.data.map(p => ({
            ...p,
            basePrice: p.base_price,
            imageUrl: p.image_url,
            isVegetarian: p.is_vegetarian,
            isSpicy: p.is_spicy
        }));

        return NextResponse.json({
            pizzas: pizzas,
            toppings: toppingsRes.data
        });
    } catch (error) {
        console.error('Menu fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
    }
}
