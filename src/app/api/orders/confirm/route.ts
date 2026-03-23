import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/mail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover' as any,
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
        const mappedOrder = {
            ...updatedOrder,
            customerDetails: updatedOrder.customer_details,
        };
        await sendOrderConfirmationEmail(mappedOrder as any, baseUrl);

        return NextResponse.json({ success: true, orderId: updatedOrder.id }, { status: 200 });

    } catch (error: any) {
        console.error('Confirm Order Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to confirm Stripe checkout session' }, { status: 500 });
    }
}
