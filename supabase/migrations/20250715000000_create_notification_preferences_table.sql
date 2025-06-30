-- Create table for user notification preferences
CREATE TABLE IF NOT EXISTS public.notificatie_voorkeuren (
    gebruiker_id uuid PRIMARY KEY REFERENCES public.gebruikers(id) ON DELETE CASCADE,
    email_opt_out boolean DEFAULT false,
    aangemaakt_op timestamptz DEFAULT now(),
    bijgewerkt_op timestamptz DEFAULT now()
);

ALTER TABLE public.notificatie_voorkeuren ENABLE ROW LEVEL SECURITY;

-- Allow users to view and update their own preferences
CREATE POLICY "Allow individual read" ON public.notificatie_voorkeuren
  FOR SELECT USING (auth.uid() = gebruiker_id);
CREATE POLICY "Allow individual update" ON public.notificatie_voorkeuren
  FOR UPDATE USING (auth.uid() = gebruiker_id);
CREATE POLICY "Allow insert self" ON public.notificatie_voorkeuren
  FOR INSERT WITH CHECK (auth.uid() = gebruiker_id);
