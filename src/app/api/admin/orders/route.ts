import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase';

function isAdmin(user?: { email?: string | null; name?: string | null }): boolean {
    if (!user) return false;
    const sessionEmail = user.email?.toLowerCase() || '';
    const sessionName = user.name?.toLowerCase().replace(/\s+/g, '') || '';
    const adminConfig = (process.env.ADMIN_EMAILS || '').toLowerCase();

    return !!((sessionEmail && adminConfig.includes(sessionEmail)) || 
             (sessionName && adminConfig.includes(sessionName)));
}

// GET all orders (admin only)
export async function GET(req: NextRequest) {
    const session = await auth();

    if (!isAdmin(session?.user)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    // Map snake_case to camelCase and apply search filter
    let mapped = orders.map(o => ({
        ...o,
        customerDetails: o.customer_details,
        deliveryFee: o.delivery_fee,
        userId: o.user_id,
        createdAt: o.created_at,
    }));

    if (search) {
        const q = search.toLowerCase();
        mapped = mapped.filter(o =>
            o.id.toLowerCase().includes(q) ||
            o.customerDetails?.name?.toLowerCase().includes(q) ||
            o.customerDetails?.email?.toLowerCase().includes(q)
        );
    }

    return NextResponse.json({ orders: mapped });
}
import { logAction } from '@/lib/audit';

// PATCH update order status (admin only)
export async function PATCH(req: NextRequest) {
    const session = await auth();

    if (!isAdmin(session?.user)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { orderId, status, note } = await req.json();

        if (!orderId || !status) {
            return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
        }

        // Fetch current status for audit log comparison
        const { data: currentOrder } = await supabaseAdmin
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single();

        const { data: updatedOrder, error } = await supabaseAdmin
            .from('orders')
            .update({ 
                status: status,
                // Append to status_history if it exists, or create it
                // Note: For simplicity, we just update the status field here 
            })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        // LOG ACTION IN AUDIT LOGS
        await logAction({
            userId: session?.user?.email || 'unknown',
            action: 'UPDATE_ORDER_STATUS',
            entityType: 'ORDER',
            entityId: orderId,
            details: {
                from: currentOrder?.status,
                to: status,
                note: note
            }
        });

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update order status';
        console.error('Update order status error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
