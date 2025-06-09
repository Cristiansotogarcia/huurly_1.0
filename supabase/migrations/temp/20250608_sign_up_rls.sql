-- Allow authenticated users to insert their own records
-- Add explicit INSERT policies so signup can create profiles and user roles

-- Profiles table: allow users to insert a profile with their own id
CREATE POLICY IF NOT EXISTS "Users can create own profile" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- User roles table: allow users to insert a role with their own user_id
CREATE POLICY IF NOT EXISTS "Users can create own role" ON public.user_roles
FOR INSERT WITH CHECK (user_id = auth.uid());
