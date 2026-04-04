import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET a single order by ID (public — for order tracking page)
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('id, status, status_history, customer_details, created_at')
            .eq('id', id)
            .single();

        if (error || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({
            order: {
                id: order.id,
                status: order.status,
                statusHistory: order.status_history || [],
                customerDetails: order.customer_details
                    ? { lat: order.customer_details.lat, lng: order.customer_details.lng }
                    : null,
                createdAt: order.created_at,
            }
        });
    } catch (error) {
        console.error('Fetch order error:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}
