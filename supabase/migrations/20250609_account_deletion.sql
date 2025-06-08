-- Mark accounts for deletion
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marked_for_deletion_at TIMESTAMPTZ;

-- Allow users to update their own profile to set deletion timestamp
CREATE POLICY IF NOT EXISTS "Users can mark for deletion" ON public.profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
