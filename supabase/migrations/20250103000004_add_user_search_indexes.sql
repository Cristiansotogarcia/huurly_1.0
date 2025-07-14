-- Add indexes to improve user search performance
CREATE INDEX IF NOT EXISTS gebruiker_rollen_role_idx ON public.gebruiker_rollen (role);
-- Note: Indexes on auth.users are managed by Supabase and cannot be created via migrations
