import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/mail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
});

// Confirm Stripe payment and finalize order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { session_id } = body;

        if (!session_id) {
            return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
        }

        const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

        if (checkoutSession.payment_status !== 'paid') {
            return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
        }

        const orderId = checkoutSession.client_reference_id;
        if (!orderId) {
            return NextResponse.json({ error: 'No order reference found inside Stripe session' }, { status: 400 });
        }

        // UPDATE ORDER STATUS IN SUPABASE
        const { data: updatedOrder, error: updateError } = await supabaseAdmin
            .from('orders')
            .update({ status: 'Preparing' })
            .eq('id', orderId)
            .select()
            .single();
        
        if (updateError) throw updateError;

        // Dispatch Receipt Email using Nodemailer logic
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        await sendOrderConfirmationEmail({
            ...updatedOrder,
            customerDetails: updatedOrder.customer_details,
            deliveryFee: updatedOrder.delivery_fee,
            userId: updatedOrder.user_id,
            createdAt: updatedOrder.created_at,
            statusHistory: updatedOrder.status_history || [],
        } as import('@/types').Order, baseUrl);

        return NextResponse.json({ success: true, orderId: updatedOrder.id }, { status: 200 });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Confirm Order Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
