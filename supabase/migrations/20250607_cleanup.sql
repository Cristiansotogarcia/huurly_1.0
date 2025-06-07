-- Clean up database and prepare for production

-- Drop unused tables that don't have proper relationships
DROP TABLE IF EXISTS public.approval_requests CASCADE;

-- Ensure updated_at function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add missing updated_at triggers where needed
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenant_profiles_updated_at ON public.tenant_profiles;
CREATE TRIGGER update_tenant_profiles_updated_at
    BEFORE UPDATE ON public.tenant_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_documents_updated_at ON public.user_documents;
CREATE TRIGGER update_user_documents_updated_at
    BEFORE UPDATE ON public.user_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enhance payment_records table for Stripe
ALTER TABLE public.payment_records 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'eur',
ADD COLUMN IF NOT EXISTS subscription_tier TEXT,
ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ;

-- Enable RLS on payment_records if not already enabled
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Users can view own payments" ON public.payment_records;
DROP POLICY IF EXISTS "Service role can manage payments" ON public.payment_records;

CREATE POLICY "Users can view own payments" ON public.payment_records
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage payments" ON public.payment_records
FOR ALL USING (true);

-- Ensure user_roles has proper constraints
ALTER TABLE public.user_roles 
ADD CONSTRAINT IF NOT EXISTS unique_user_role UNIQUE (user_id);

-- Handle user_roles RLS policies
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

CREATE POLICY "Users can view own role" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage roles" ON public.user_roles
FOR ALL USING (true);

-- Handle profiles RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Service role can manage profiles" ON public.profiles
FOR ALL USING (true);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON public.payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_stripe_session ON public.payment_records(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_landlord_id ON public.properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_user_id ON public.tenant_profiles(user_id);

-- Create subscribers table for Stripe subscription management
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscribers;

CREATE POLICY "Users can view own subscription" ON public.subscribers
FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Service role can manage subscriptions" ON public.subscribers
FOR ALL USING (true);

-- Add trigger for subscribers updated_at
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON public.subscribers;
CREATE TRIGGER update_subscribers_updated_at
    BEFORE UPDATE ON public.subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

