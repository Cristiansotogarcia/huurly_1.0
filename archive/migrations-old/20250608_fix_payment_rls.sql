-- Fix RLS policies for payment_records table
-- Allow users to insert their own payment records

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own payment records" ON public.payment_records;
DROP POLICY IF EXISTS "Users can view their own payment records" ON public.payment_records;
DROP POLICY IF EXISTS "Users can update their own payment records" ON public.payment_records;

-- Create proper RLS policies for payment_records
CREATE POLICY "Users can insert their own payment records" ON public.payment_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment records" ON public.payment_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment records" ON public.payment_records
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to manage all payment records (for webhooks)
CREATE POLICY "Service role can manage all payment records" ON public.payment_records
    FOR ALL USING (auth.role() = 'service_role');

-- Ensure RLS is enabled
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Also fix any potential issues with user_roles table
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own subscription status" ON public.user_roles;

CREATE POLICY "Users can view their own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription status" ON public.user_roles
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to manage user roles (for webhooks)
CREATE POLICY "Service role can manage all user roles" ON public.user_roles
    FOR ALL USING (auth.role() = 'service_role');

-- Ensure RLS is enabled on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Fix subscribers table RLS as well
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;

CREATE POLICY "Users can view their own subscription" ON public.subscribers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON public.subscribers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscribers
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage all subscriptions" ON public.subscribers
    FOR ALL USING (auth.role() = 'service_role');

-- Ensure RLS is enabled on subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
