-- Add INSERT policy for abonnementen table to allow users to create their own payment records
CREATE POLICY "Users can insert their own payment records" ON public.abonnementen
FOR INSERT
WITH CHECK (huurder_id = auth.uid());

-- Add UPDATE policy for abonnementen table to allow updates to payment records (for webhook updates)
CREATE POLICY "Allow payment record updates" ON public.abonnementen
FOR UPDATE
USING (true)
WITH CHECK (true);