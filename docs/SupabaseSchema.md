-- PolicyBridge Production Supabase Schema
-- Created: September 8, 2025
-- This schema includes all necessary tables, relationships, indexes, and RLS policies

-- ==============================================
-- ENUMS AND TYPES
-- ==============================================

-- Policy status enum
CREATE TYPE policy_status AS ENUM (
'active',
'pending',
'expired',
'cancelled',
'suspended',
'renewal_due'
);

-- Claim status enum
CREATE TYPE claim_status AS ENUM (
'pending',
'investigating',
'approved',
'rejected',
'settled',
'closed',
'urgent'
);

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
'pending',
'processing',
'completed',
'failed',
'refunded',
'overdue'
);

-- Payment method enum
CREATE TYPE payment_method AS ENUM (
'credit_card',
'bank_transfer',
'debit_card',
'cash',
'check',
'mobile_payment',
'auto_debit'
);

-- Notification type enum
CREATE TYPE notification_type AS ENUM (
'payment_due',
'policy_renewal',
'claim_update',
'system_alert',
'marketing',
'general',
'urgent_claim',
'payment_overdue'
);

-- Policy type enum
CREATE TYPE policy_type AS ENUM (
'life',
'health',
'auto',
'home',
'business',
'travel',
'disability',
'marine',
'property'
);

-- Priority enum
CREATE TYPE priority_level AS ENUM (
'low',
'medium',
'high',
'urgent',
'critical'
);

-- ==============================================
-- UTILITY FUNCTIONS
-- ==============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $handle_updated_at$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$handle_updated_at$;

-- Generate policy number function
CREATE OR REPLACE FUNCTION generate_policy_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $generate_policy_number$
DECLARE
year_suffix TEXT := TO_CHAR(NOW(), 'YY');
sequence_num TEXT;
policy_num TEXT;
BEGIN
SELECT LPAD((COUNT(\*) + 1)::TEXT, 6, '0')
INTO sequence_num
FROM policies
WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

policy_num := 'PB' || year_suffix || sequence_num;
RETURN policy_num;
END;
$generate_policy_number$;

-- Generate claim number function
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $generate_claim_number$
DECLARE
year_suffix TEXT := TO_CHAR(NOW(), 'YY');
sequence_num TEXT;
claim_num TEXT;
BEGIN
SELECT LPAD((COUNT(\*) + 1)::TEXT, 6, '0')
INTO sequence_num
FROM claims
WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

claim_num := 'CL' || year_suffix || sequence_num;
RETURN claim_num;
END;
$generate_claim_number$;

-- ==============================================
-- CLIENTS TABLE
-- ==============================================

CREATE TABLE public.clients (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

-- Personal Information
first_name TEXT NOT NULL,
last_name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
phone TEXT,
date_of_birth DATE,
gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),

-- Address Information
address_line1 TEXT,
address_line2 TEXT,
city TEXT,
state TEXT,
postal_code TEXT,
country TEXT DEFAULT 'US',

-- Professional Information
occupation TEXT,
employer TEXT,
annual_income DECIMAL(12,2),

-- Emergency Contact
emergency_contact_name TEXT,
emergency_contact_phone TEXT,
emergency_contact_relationship TEXT,

-- Additional Information
notes TEXT,
tags TEXT[],

-- Status and metadata
is_active BOOLEAN DEFAULT true,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),

-- Constraints
CONSTRAINT clients*email_format CHECK (email ~\* '^[A-Za-z0-9.*%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
CONSTRAINT clients_phone_format CHECK (phone IS NULL OR LENGTH(phone) >= 10),
CONSTRAINT clients_income_positive CHECK (annual_income IS NULL OR annual_income >= 0)
);

-- ==============================================
-- POLICIES TABLE
-- ==============================================

CREATE TABLE public.policies (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

-- Policy Information
policy_number TEXT UNIQUE NOT NULL,
policy_type policy_type NOT NULL,
policy_name TEXT NOT NULL,
description TEXT,

-- Coverage Details
coverage_amount DECIMAL(15,2) NOT NULL,
premium_amount DECIMAL(10,2) NOT NULL,
deductible DECIMAL(10,2) DEFAULT 0,

-- Dates
effective_date DATE NOT NULL,
expiration_date DATE NOT NULL,
renewal_date DATE,

-- Status and Priority
status policy_status DEFAULT 'pending',
priority priority_level DEFAULT 'medium',

-- Terms and Conditions
terms_conditions TEXT,
policy_document_url TEXT,

-- Additional Information
beneficiaries JSONB,
riders JSONB,
notes TEXT,
tags TEXT[],

-- Metadata
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),

-- Constraints
CONSTRAINT policies_coverage_positive CHECK (coverage_amount > 0),
CONSTRAINT policies_premium_positive CHECK (premium_amount > 0),
CONSTRAINT policies_deductible_non_negative CHECK (deductible >= 0),
CONSTRAINT policies_dates_valid CHECK (effective_date <= expiration_date)
);

-- ==============================================
-- CLAIMS TABLE
-- ==============================================

CREATE TABLE public.claims (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,

-- Claim Information
claim_number TEXT UNIQUE NOT NULL,
claim_type TEXT NOT NULL,
incident_date DATE NOT NULL,
reported_date DATE DEFAULT CURRENT_DATE,

-- Claim Details
description TEXT NOT NULL,
incident_location TEXT,
claim_amount DECIMAL(15,2),
approved_amount DECIMAL(15,2),
settled_amount DECIMAL(15,2),

-- Status and Priority
status claim_status DEFAULT 'pending',
priority priority_level DEFAULT 'medium',

-- Assignments
assigned_adjuster TEXT,
assigned_investigator TEXT,

-- Dates
investigation_start_date DATE,
investigation_end_date DATE,
settlement_date DATE,

-- Documentation
documents JSONB,
evidence JSONB,
witness_information JSONB,

-- Additional Information
notes TEXT,
internal_notes TEXT,
tags TEXT[],

-- Metadata
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),

-- Constraints
CONSTRAINT claims_amounts_non_negative CHECK (
(claim_amount IS NULL OR claim_amount >= 0) AND
(approved_amount IS NULL OR approved_amount >= 0) AND
(settled_amount IS NULL OR settled_amount >= 0)
),
CONSTRAINT claims_incident_date_valid CHECK (incident_date <= CURRENT_DATE),
CONSTRAINT claims_reported_date_valid CHECK (reported_date >= incident_date)
);

-- ==============================================
-- PAYMENTS TABLE
-- ==============================================

CREATE TABLE public.payments (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,

-- Payment Information
payment_reference TEXT UNIQUE NOT NULL,
payment_type TEXT NOT NULL CHECK (payment_type IN ('premium', 'claim_settlement', 'refund', 'adjustment')),
amount DECIMAL(12,2) NOT NULL,
currency TEXT DEFAULT 'USD',

-- Payment Method
payment_method payment_method NOT NULL,
payment_details JSONB,

-- Status and Dates
status payment_status DEFAULT 'pending',
due_date DATE,
payment_date DATE,
processed_date TIMESTAMPTZ,

-- Transaction Information
transaction_id TEXT,
external_reference TEXT,
gateway_response JSONB,

-- Additional Information
description TEXT,
notes TEXT,
tags TEXT[],

-- Metadata
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),

-- Constraints
CONSTRAINT payments_amount_positive CHECK (amount > 0),
CONSTRAINT payments_policy_or_claim CHECK (
(policy_id IS NOT NULL AND claim_id IS NULL) OR
(policy_id IS NULL AND claim_id IS NOT NULL) OR
(policy_id IS NOT NULL AND claim_id IS NOT NULL)
)
);

-- ==============================================
-- NOTIFICATIONS TABLE
-- ==============================================

CREATE TABLE public.notifications (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

-- Notification Information
type notification_type NOT NULL,
title TEXT NOT NULL,
message TEXT NOT NULL,
priority priority_level DEFAULT 'medium',

-- Related Entities
client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
policy_id UUID REFERENCES policies(id) ON DELETE SET NULL,
claim_id UUID REFERENCES claims(id) ON DELETE SET NULL,
payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,

-- Status
is_read BOOLEAN DEFAULT false,
is_archived BOOLEAN DEFAULT false,

-- Scheduling
scheduled_for TIMESTAMPTZ,
expires_at TIMESTAMPTZ,

-- Additional Data
action_url TEXT,
action_label TEXT,
metadata JSONB,

-- Metadata
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- ACTIVITIES TABLE
-- ==============================================

CREATE TABLE public.activities (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

-- Activity Information
action TEXT NOT NULL,
entity_type TEXT NOT NULL,
entity_id UUID NOT NULL,

-- Activity Details
description TEXT NOT NULL,
changes JSONB,

-- Context
ip_address INET,
user_agent TEXT,
session_id TEXT,

-- Metadata
created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- SYSTEM SETTINGS TABLE
-- ==============================================

CREATE TABLE public.system_settings (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

-- Settings
setting_key TEXT NOT NULL,
setting_value JSONB NOT NULL,
setting_type TEXT NOT NULL CHECK (setting_type IN ('user', 'system', 'notification')),

-- Metadata
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),

UNIQUE(user_id, setting_key)
);

-- ==============================================
-- INDEXES
-- ==============================================

-- Clients indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_full_name ON clients(first_name, last_name);
CREATE INDEX idx_clients_is_active ON clients(is_active);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- Policies indexes
CREATE INDEX idx_policies_user_id ON policies(user_id);
CREATE INDEX idx_policies_client_id ON policies(client_id);
CREATE INDEX idx_policies_policy_number ON policies(policy_number);
CREATE INDEX idx_policies_policy_type ON policies(policy_type);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_policies_effective_date ON policies(effective_date);
CREATE INDEX idx_policies_expiration_date ON policies(expiration_date);
CREATE INDEX idx_policies_renewal_date ON policies(renewal_date);
CREATE INDEX idx_policies_priority ON policies(priority);

-- Claims indexes
CREATE INDEX idx_claims_user_id ON claims(user_id);
CREATE INDEX idx_claims_client_id ON claims(client_id);
CREATE INDEX idx_claims_policy_id ON claims(policy_id);
CREATE INDEX idx_claims_claim_number ON claims(claim_number);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_priority ON claims(priority);
CREATE INDEX idx_claims_incident_date ON claims(incident_date);
CREATE INDEX idx_claims_reported_date ON claims(reported_date);
CREATE INDEX idx_claims_claim_type ON claims(claim_type);

-- Payments indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_policy_id ON payments(policy_id);
CREATE INDEX idx_payments_claim_id ON payments(claim_id);
CREATE INDEX idx_payments_payment_reference ON payments(payment_reference);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_is_archived ON notifications(is_archived);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Activities indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_entity_type_id ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_action ON activities(action);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- System Settings indexes
CREATE INDEX idx_system_settings_user_id ON system_settings(user_id);
CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_type ON system_settings(setting_type);

-- ==============================================
-- UPDATE TRIGGERS
-- ==============================================

-- Clients updated_at trigger
CREATE TRIGGER trigger_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Policies updated_at trigger
CREATE TRIGGER trigger_policies_updated_at
BEFORE UPDATE ON policies
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Claims updated_at trigger
CREATE TRIGGER trigger_claims_updated_at
BEFORE UPDATE ON claims
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Payments updated_at trigger
CREATE TRIGGER trigger_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Notifications updated_at trigger
CREATE TRIGGER trigger_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- System Settings updated_at trigger
CREATE TRIGGER trigger_system_settings_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- ==============================================
-- AUTO-GENERATION TRIGGERS
-- ==============================================

-- Policy number generation trigger
CREATE OR REPLACE FUNCTION set_policy_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $set_policy_number$
BEGIN
IF NEW.policy_number IS NULL OR NEW.policy_number = '' THEN
NEW.policy_number := generate_policy_number();
END IF;
RETURN NEW;
END;
$set_policy_number$;

CREATE TRIGGER trigger_set_policy_number
BEFORE INSERT ON policies
FOR EACH ROW
EXECUTE FUNCTION set_policy_number();

-- Claim number generation trigger
CREATE OR REPLACE FUNCTION set_claim_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $set_claim_number$
BEGIN
IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
NEW.claim_number := generate_claim_number();
END IF;
RETURN NEW;
END;
$set_claim_number$;

CREATE TRIGGER trigger_set_claim_number
BEFORE INSERT ON claims
FOR EACH ROW
EXECUTE FUNCTION set_claim_number();

-- ==============================================
-- ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own clients" ON clients
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own policies" ON policies
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own claims" ON claims
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own payments" ON payments
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notifications" ON notifications
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own activities" ON activities
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings" ON system_settings
FOR ALL USING (auth.uid() = user_id);

-- ==============================================
-- UTILITY FUNCTIONS
-- ==============================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
p_user_id UUID,
p_type notification_type,
p_title TEXT,
p_message TEXT,
p_priority priority_level DEFAULT 'medium',
p_client_id UUID DEFAULT NULL,
p_policy_id UUID DEFAULT NULL,
p_claim_id UUID DEFAULT NULL,
p_payment_id UUID DEFAULT NULL,
p_action_url TEXT DEFAULT NULL,
p_action_label TEXT DEFAULT NULL,
p_scheduled_for TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $create_notification$
DECLARE
notification_id UUID;
BEGIN
INSERT INTO notifications (
user_id, type, title, message, priority,
client_id, policy_id, claim_id, payment_id,
action_url, action_label, scheduled_for
) VALUES (
p_user_id, p_type, p_title, p_message, p_priority,
p_client_id, p_policy_id, p_claim_id, p_payment_id,
p_action_url, p_action_label, p_scheduled_for
) RETURNING id INTO notification_id;

RETURN notification_id;
END;
$create_notification$;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
p_user_id UUID,
p_action TEXT,
p_entity_type TEXT,
p_entity_id UUID,
p_description TEXT,
p_changes JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $log_activity$
DECLARE
activity_id UUID;
BEGIN
INSERT INTO activities (
user_id, action, entity_type, entity_id, description, changes
) VALUES (
p_user_id, p_action, p_entity_type, p_entity_id, p_description, p_changes
) RETURNING id INTO activity_id;

RETURN activity_id;
END;
$log_activity$;

-- ==============================================
-- VIEWS
-- ==============================================

-- Dashboard stats view (FIXED - removed ambiguous user_id reference)
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
c.user_id,
COUNT(DISTINCT c.id) as total_clients,
COUNT(DISTINCT p.id) as total_policies,
COUNT(DISTINCT cl.id) as total_claims,
COUNT(DISTINCT CASE WHEN cl.status = 'urgent' THEN cl.id END) as urgent_claims,
COUNT(DISTINCT CASE WHEN p.status = 'renewal_due' THEN p.id END) as renewals_due,
COUNT(DISTINCT CASE WHEN pay.status = 'overdue' THEN pay.id END) as overdue_payments,
COALESCE(SUM(CASE WHEN pay.status = 'completed' AND pay.payment_date >= CURRENT_DATE - INTERVAL '30 days' THEN pay.amount ELSE 0 END), 0) as monthly_revenue
FROM clients c
LEFT JOIN policies p ON c.id = p.client_id AND c.user_id = p.user_id
LEFT JOIN claims cl ON c.id = cl.client_id AND c.user_id = cl.user_id  
LEFT JOIN payments pay ON c.id = pay.client_id AND c.user_id = pay.user_id
WHERE c.is_active = true
GROUP BY c.user_id;

-- Recent activities view
CREATE OR REPLACE VIEW recent_activities AS
SELECT
a.\*,
CASE
WHEN a.entity_type = 'client' THEN c.first_name || ' ' || c.last_name
WHEN a.entity_type = 'policy' THEN p.policy_name
WHEN a.entity_type = 'claim' THEN cl.claim_number
WHEN a.entity_type = 'payment' THEN pay.payment_reference
ELSE 'Unknown'
END as entity_name
FROM activities a
LEFT JOIN clients c ON a.entity_type = 'client' AND a.entity_id = c.id
LEFT JOIN policies p ON a.entity_type = 'policy' AND a.entity_id = p.id
LEFT JOIN claims cl ON a.entity_type = 'claim' AND a.entity_id = cl.id
LEFT JOIN payments pay ON a.entity_type = 'payment' AND a.entity_id = pay.id
ORDER BY a.created_at DESC;

-- ==============================================
-- BUSINESS LOGIC TRIGGERS
-- ==============================================

-- Policy renewal notification trigger
CREATE OR REPLACE FUNCTION notify_policy_renewal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $notify_policy_renewal$
BEGIN
-- Create notification 30 days before renewal
IF NEW.renewal_date IS NOT NULL AND NEW.renewal_date <= CURRENT_DATE + INTERVAL '30 days' AND NEW.status = 'active' THEN
PERFORM create_notification(
NEW.user_id,
'policy_renewal',
'Policy Renewal Due',
'Policy ' || NEW.policy_number || ' for ' || (
SELECT first_name || ' ' || last_name
FROM clients
WHERE id = NEW.client_id
) || ' is due for renewal on ' || NEW.renewal_date::text,
'high',
NEW.client_id,
NEW.id,
NULL,
NULL,
'/dashboard/policy-management/' || NEW.id::text,
'View Policy'
);
END IF;

RETURN NEW;
END;
$notify_policy_renewal$;

CREATE TRIGGER trigger_policy_renewal_notification
AFTER INSERT OR UPDATE ON policies
FOR EACH ROW
EXECUTE FUNCTION notify_policy_renewal();

-- ==============================================
-- COMMENTS
-- ==============================================

COMMENT ON TABLE clients IS 'Stores client/customer information';
COMMENT ON TABLE policies IS 'Stores insurance policy information';
COMMENT ON TABLE claims IS 'Stores insurance claim information';  
COMMENT ON TABLE payments IS 'Stores payment transactions';
COMMENT ON TABLE notifications IS 'Stores user notifications';
COMMENT ON TABLE activities IS 'Audit log for all system activities';
COMMENT ON TABLE system_settings IS 'Application and user settings';

COMMENT ON COLUMN policies.beneficiaries IS 'JSON array of beneficiary objects with name, relationship, percentage, etc.';
COMMENT ON COLUMN claims.documents IS 'JSON array of document objects with URL, type, upload_date, etc.';
COMMENT ON COLUMN payments.payment_details IS 'JSON object with payment method specific details (masked)';

-- ==============================================
-- PERMISSIONS
-- ==============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
