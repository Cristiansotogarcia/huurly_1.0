ALTER TABLE public.abonnementen
  ADD CONSTRAINT abonnementen_stripe_subscription_id_key UNIQUE (stripe_subscription_id);
