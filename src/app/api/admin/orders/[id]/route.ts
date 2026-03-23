import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase';

type OrderStatus = 'Pending Payment' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

const VALID_STATUSES: OrderStatus[] = [
    'Pending Payment', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'
];

function isAdmin(user?: { email?: string | null; name?: string | null }): boolean {
    if (!user) return false;
    const sessionEmail = user.email?.toLowerCase() || '';
    const sessionName = user.name?.toLowerCase().replace(/\s+/g, '') || '';
    const adminConfig = (process.env.ADMIN_EMAILS || '').toLowerCase();

    return !!((sessionEmail && adminConfig.includes(sessionEmail)) || 
             (sessionName && adminConfig.includes(sessionName)));
}

// PATCH — update a single order's status
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();

    if (!isAdmin(session?.user)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body as { status: OrderStatus };

    if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Fetch existing order to get history
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('status_history')
        .eq('id', id)
        .single();
    
    if (fetchError) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const history = existingOrder.status_history || [];
    const newHistory = [...history, { status, date: new Date().toISOString() }];

    const { data, error } = await supabaseAdmin
        .from('orders')
        .update({ 
            status,
            status_history: newHistory
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data });
}
