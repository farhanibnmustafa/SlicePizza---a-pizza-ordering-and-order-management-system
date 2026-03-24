import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';

// Explicitly require the secret key
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing. Please set it in .env.local');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2024-12-18.acacia' as any,
});

import { supabaseAdmin } from '@/lib/supabase';

// GET user orders
export async function GET() {
    try {
        const session = await auth();
        const userId = session?.user?.id || session?.user?.email;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: userOrders, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map snake_case to camelCase
        const mappedOrders = userOrders.map(o => ({
            ...o,
            customerDetails: o.customer_details,
            deliveryFee: o.delivery_fee,
            userId: o.user_id,
            statusHistory: o.status_history || [],
            createdAt: o.created_at,
        }));

        return NextResponse.json({ orders: mappedOrders }, { status: 200 });
    } catch (error) {
        console.error('Fetch orders error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

import { orderSchema } from '@/lib/validations';

// POST new order
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const json = await request.json();
        
        // VALIDATE BODY WITH ZOD
        const validation = orderSchema.safeParse(json);
        if (!validation.success) {
            return NextResponse.json({ 
                error: 'Invalid order data', 
                details: validation.error.flatten().fieldErrors 
            }, { status: 400 });
        }

        const body = validation.data;

        const orderId = `ORD-${Math.floor(Math.random() * 100000)}`;
        const userId = session?.user?.id || session?.user?.email || body.customerDetails.email;

        // INSERT ORDER INTO SUPABASE
        const { error: dbError } = await supabaseAdmin
            .from('orders')
            .insert({
                id: orderId,
                user_id: userId,
                items: body.items,
                subtotal: body.subtotal,
                tax: body.tax,
                delivery_fee: body.deliveryFee,
                total: body.total,
                status: 'Pending Payment',
                status_history: [{ status: 'Pending Payment', date: new Date().toISOString() }],
                customer_details: body.customerDetails,
                created_at: new Date().toISOString()
            });

        if (dbError) throw dbError;

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        // CREATE STRIPE CHECKOUT SESSION
        const lineItems = body.items.map((item) => {
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${item.pizza.name} (${item.size}, ${item.crust} crust)`,
                        description: `Extra toppings: ${item.extraToppings?.map((t) => t.name).join(', ') || 'None'}`,
                        images: [baseUrl + item.pizza.imageUrl],
                    },
                    unit_amount: Math.round(item.itemTotal * 100),
                },
                quantity: item.quantity,
            };
        });

        if (body.deliveryFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { 
                        name: 'Delivery Fee',
                        description: 'Flat rate delivery fee',
                        images: [] 
                    },
                    unit_amount: Math.round(body.deliveryFee * 100),
                },
                quantity: 1,
            });
        }
        
        if (body.tax > 0) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { 
                        name: 'Estimated Tax',
                        description: 'Local taxes and fees',
                        images: [] 
                    },
                    unit_amount: Math.round(body.tax * 100),
                },
                quantity: 1,
            });
        }

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${baseUrl}/confirm-payment?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/checkout`,
            customer_email: body.customerDetails.email,
            client_reference_id: orderId,
        });

        return NextResponse.json({
            success: true,
            orderId: orderId,
            stripeUrl: checkoutSession.url,
            message: 'Proceed to Stripe Checkout'
        }, { status: 201 });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process order';
        console.error('Order creation error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
