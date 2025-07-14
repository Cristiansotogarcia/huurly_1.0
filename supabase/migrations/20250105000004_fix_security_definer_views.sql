-- Fix SECURITY DEFINER views by setting them to SECURITY INVOKER
ALTER VIEW public.actieve_huurders SET (security_invoker = true);
ALTER VIEW public.documenten_wachtend SET (security_invoker = true);

-- Grant necessary permissions
GRANT SELECT ON public.actieve_huurders TO authenticated, anon;
GRANT SELECT ON public.documenten_wachtend TO authenticated, anon;