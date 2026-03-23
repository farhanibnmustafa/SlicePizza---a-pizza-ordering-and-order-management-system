import { supabaseAdmin } from './supabase';

export async function logAction(params: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: any;
}) {
    try {
        const { error } = await supabaseAdmin
            .from('audit_logs')
            .insert({
                user_id: params.userId,
                action: params.action,
                entity_type: params.entityType,
                entity_id: params.entityId,
                details: params.details,
            });

        if (error) {
            console.error('Failed to write audit log:', error);
        }
    } catch (err) {
        console.error('Audit log error:', err);
    }
}
