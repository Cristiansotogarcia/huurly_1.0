-- Add indexes to improve user search performance
CREATE INDEX IF NOT EXISTS gebruiker_rollen_role_idx ON public.gebruiker_rollen (role);
CREATE INDEX IF NOT EXISTS auth_users_email_idx ON auth.users (email);
CREATE INDEX IF NOT EXISTS auth_users_phone_idx ON auth.users (phone);
