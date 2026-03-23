-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Email or ID of the admin/staff
    action TEXT NOT NULL, -- e.g., 'UPDATE_STATUS', 'DELETE_PIZZA'
    entity_type TEXT NOT NULL, -- e.g., 'ORDER', 'PIZZA'
    entity_id TEXT NOT NULL, -- The ID of the affected entity
    details JSONB, -- Previous and new values, or other metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add index for faster querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs (user_id);
