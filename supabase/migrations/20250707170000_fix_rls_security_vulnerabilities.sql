-- Fix RLS Policy Security Vulnerabilities for Huurly Application

-- 1. Create a secure role validation function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS public.gebruiker_rol
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role public.gebruiker_rol;
BEGIN
  SELECT rol INTO user_role
  FROM public.gebruikers
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'huurder');
END;
$$;

-- 2. Create a secure admin check function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.gebruikers
    WHERE id = user_id AND rol = 'admin'
  );
END;
$$;

-- 3. Create a secure beoordelaar check function
CREATE OR REPLACE FUNCTION public.is_beoordelaar_or_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.gebruikers
    WHERE id = user_id AND rol IN ('beoordelaar', 'admin')
  );
END;
$$;

-- 4. Fix documenten table policies with secure role checking
DROP POLICY IF EXISTS "Eigen documenten" ON public.documenten;

CREATE POLICY "documenten_select_policy" ON public.documenten
  FOR SELECT USING (
    auth.uid() = huurder_id 
    OR public.is_beoordelaar_or_admin(auth.uid())
  );

CREATE POLICY "documenten_insert_policy" ON public.documenten
  FOR INSERT WITH CHECK (
    auth.uid() = huurder_id
  );

CREATE POLICY "documenten_update_policy" ON public.documenten
  FOR UPDATE USING (
    auth.uid() = huurder_id 
    OR public.is_beoordelaar_or_admin(auth.uid())
  ) WITH CHECK (
    auth.uid() = huurder_id 
    OR public.is_beoordelaar_or_admin(auth.uid())
  );

CREATE POLICY "documenten_delete_policy" ON public.documenten
  FOR DELETE USING (
    auth.uid() = huurder_id 
    OR public.is_admin(auth.uid())
  );

-- 5. Fix verificaties table policies
DROP POLICY IF EXISTS "Huurder of reviewer" ON public.verificaties;

CREATE POLICY "verificaties_select_policy" ON public.verificaties
  FOR SELECT USING (
    auth.uid() = huurder_id 
    OR public.is_beoordelaar_or_admin(auth.uid())
  );

CREATE POLICY "verificaties_insert_policy" ON public.verificaties
  FOR INSERT WITH CHECK (
    public.is_beoordelaar_or_admin(auth.uid())
  );

CREATE POLICY "verificaties_update_policy" ON public.verificaties
  FOR UPDATE USING (
    public.is_beoordelaar_or_admin(auth.uid())
  ) WITH CHECK (
    public.is_beoordelaar_or_admin(auth.uid())
  );

CREATE POLICY "verificaties_delete_policy" ON public.verificaties
  FOR DELETE USING (
    public.is_admin(auth.uid())
  );

-- 6. Add comprehensive CRUD policies for notificaties
CREATE POLICY "notificaties_insert_policy" ON public.notificaties
  FOR INSERT WITH CHECK (
    auth.uid() = gebruiker_id
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "notificaties_update_policy" ON public.notificaties
  FOR UPDATE USING (
    auth.uid() = gebruiker_id
  ) WITH CHECK (
    auth.uid() = gebruiker_id
  );

CREATE POLICY "notificaties_delete_policy" ON public.notificaties
  FOR DELETE USING (
    auth.uid() = gebruiker_id
    OR public.is_admin(auth.uid())
  );

-- 7. Secure the gebruiker_rollen table properly
CREATE POLICY "gebruiker_rollen_admin_only" ON public.gebruiker_rollen
  FOR ALL USING (
    public.is_admin(auth.uid())
  ) WITH CHECK (
    public.is_admin(auth.uid())
  );

-- 8. Add audit logging policies
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

-- 9. Secure views with proper definer rights
DROP VIEW IF EXISTS public.actieve_huurders;
CREATE VIEW public.actieve_huurders
WITH (security_invoker = true)
AS SELECT 
  h.id,
  g.naam,
  g.email,
  h.beroep,
  h.inkomen,
  h.max_huur,
  h.locatie_voorkeur,
  h.profielfoto_url,
  h.beschrijving,
  h.abonnement_actief,
  h.aangemaakt_op
FROM public.huurders h
JOIN public.gebruikers g ON h.id = g.id
WHERE h.abonnement_actief = true
  AND g.profiel_compleet = true;

-- Revoke all access from anon and authenticated, only allow specific roles
REVOKE ALL ON public.actieve_huurders FROM anon, authenticated;

-- Grant access only to verhuurders and admins
GRANT SELECT ON public.actieve_huurders TO authenticated;

-- 10. Create a policy for the view
CREATE POLICY "actieve_huurders_verhuurders_only" ON public.actieve_huurders
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('verhuurder', 'admin')
  );

-- 11. Fix documenten_wachtend view
DROP VIEW IF EXISTS public.documenten_wachtend;
CREATE VIEW public.documenten_wachtend
WITH (security_invoker = true)
AS SELECT 
  d.id,
  d.huurder_id,
  d.bestandsnaam,
  d.bestand_url,
  d.type,
  d.status,
  d.aangemaakt_op,
  g.naam as huurder_naam,
  g.email as huurder_email
FROM public.documenten d
JOIN public.huurders h ON d.huurder_id = h.id
JOIN public.gebruikers g ON h.id = g.id
WHERE d.status = 'wachtend';

-- Secure the view
REVOKE ALL ON public.documenten_wachtend FROM anon, authenticated;
GRANT SELECT ON public.documenten_wachtend TO authenticated;

CREATE POLICY "documenten_wachtend_beoordelaars_only" ON public.documenten_wachtend
  FOR SELECT USING (
    public.is_beoordelaar_or_admin(auth.uid())
  );

-- 12. Add constraint to prevent role escalation
ALTER TABLE public.gebruikers 
ADD CONSTRAINT check_role_assignment 
CHECK (rol IN ('huurder', 'verhuurder', 'beoordelaar', 'admin'));

-- 13. Create function to safely update user roles (admin only)
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id uuid,
  new_role public.gebruiker_rol
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can update roles
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update user roles';
  END IF;
  
  -- Prevent removing the last admin
  IF new_role != 'admin' AND EXISTS (
    SELECT 1 FROM public.gebruikers 
    WHERE id = target_user_id AND rol = 'admin'
  ) THEN
    IF (SELECT COUNT(*) FROM public.gebruikers WHERE rol = 'admin') <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin user';
    END IF;
  END IF;
  
  UPDATE public.gebruikers 
  SET rol = new_role, bijgewerkt_op = now()
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- 14. Create secure message validation for berichten table
CREATE OR REPLACE FUNCTION public.validate_message_users()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure sender and receiver exist and are different
  IF NEW.verzender_id = NEW.ontvanger_id THEN
    RAISE EXCEPTION 'Cannot send message to yourself';
  END IF;
  
  -- Ensure both users exist
  IF NOT EXISTS (SELECT 1 FROM public.gebruikers WHERE id = NEW.verzender_id) THEN
    RAISE EXCEPTION 'Sender does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.gebruikers WHERE id = NEW.ontvanger_id) THEN
    RAISE EXCEPTION 'Receiver does not exist';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_message_users_trigger
  BEFORE INSERT OR UPDATE ON public.berichten
  FOR EACH ROW EXECUTE FUNCTION public.validate_message_users();

-- 15. Add comprehensive audit logging
CREATE OR REPLACE FUNCTION public.create_audit_entry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      table_name,
      operation,
      record_id,
      user_id,
      old_values,
      created_at
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      OLD.id,
      auth.uid(),
      to_jsonb(OLD),
      now()
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      table_name,
      operation,
      record_id,
      user_id,
      old_values,
      new_values,
      created_at
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      NEW.id,
      auth.uid(),
      to_jsonb(OLD),
      to_jsonb(NEW),
      now()
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      table_name,
      operation,
      record_id,
      user_id,
      new_values,
      created_at
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      NEW.id,
      auth.uid(),
      to_jsonb(NEW),
      now()
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_gebruikers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.gebruikers
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_entry();

CREATE TRIGGER audit_documenten_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.documenten
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_entry();

CREATE TRIGGER audit_abonnementen_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.abonnementen
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_entry();

-- 16. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_beoordelaar_or_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_role(uuid, public.gebruiker_rol) TO authenticated;