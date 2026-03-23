import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/mail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;

    try {
        if (!sig || !endpointSecret) {
            throw new Error('Missing stripe-signature or endpointSecret');
        }
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const orderId = session.client_reference_id;
        if (orderId) {
            try {
                // Update order status to 'Preparing' via Webhook (Server-to-Server)
                const { data: updatedOrder, error: updateError } = await supabaseAdmin
                    .from('orders')
                    .update({ status: 'Preparing' })
                    .eq('id', orderId)
                    .select()
                    .single();

                if (updateError) throw updateError;

                // Send confirmation email
                const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
                const mappedOrder = {
                    ...updatedOrder,
                    customerDetails: updatedOrder.customer_details,
                };
                await sendOrderConfirmationEmail(mappedOrder as any, baseUrl);
                
                console.log(`Order ${orderId} successfully processed via Webhook.`);
            } catch (err) {
                console.error(`Error processing order ${orderId} via Webhook:`, err);
            }
        }
    }

    return NextResponse.json({ received: true });
}
