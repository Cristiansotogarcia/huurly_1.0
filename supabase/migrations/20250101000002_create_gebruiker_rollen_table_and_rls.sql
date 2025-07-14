-- Create the table
CREATE TABLE IF NOT EXISTS public.gebruiker_rollen (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    subscription_status TEXT,
    PRIMARY KEY (user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.gebruiker_rollen ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it already exists, then recreate it.
-- This makes the migration script re-runnable.
DROP POLICY IF EXISTS "Allow logged-in users to read their own roles" ON public.gebruiker_rollen;

CREATE POLICY "Allow logged-in users to read their own roles"
ON public.gebruiker_rollen
FOR SELECT
USING (auth.uid() = user_id);
