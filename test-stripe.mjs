import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testStripe() {
    console.log('Testing Stripe with Key:', process.env.STRIPE_SECRET_KEY ? 'Present (sk_test...)' : 'MISSING');
    if (!process.env.STRIPE_SECRET_KEY) return;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-02-15.acacia',
    });

    try {
        const session = await stripe.checkout.sessions.list({ limit: 1 });
        console.log('Successfully connected to Stripe Sandbox (Test Mode)!');
        console.log('Latest session ID:', session.data[0]?.id || 'None (no sessions yet)');
    } catch (err) {
        console.error('Stripe Connection Error:', err instanceof Error ? err.message : 'Unknown');
    }
}

testStripe();
