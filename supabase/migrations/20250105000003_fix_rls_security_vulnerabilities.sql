-- Fix RLS Policy Security Vulnerabilities for Huurly Application

-- 1. Create secure role validation functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS public.gebruiker_rol LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE user_role public.gebruiker_rol;
BEGIN
  SELECT rol INTO user_role FROM public.gebruikers WHERE id = user_id;
  RETURN COALESCE(user_role, 'huurder');
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.gebruikers WHERE id = user_id AND rol = 'admin');
END;
$$;

CREATE OR REPLACE FUNCTION public.is_beoordelaar_or_admin(user_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.gebruikers WHERE id = user_id AND rol IN ('beoordelaar', 'admin'));
END;
$$;

-- 4. Fix documenten table policies with secure role checking
DROP POLICY IF EXISTS "documenten_select_policy" ON public.documenten;
CREATE POLICY "documenten_select_policy" ON public.documenten FOR SELECT USING (auth.uid() = huurder_id OR public.is_beoordelaar_or_admin(auth.uid()));

DROP POLICY IF EXISTS "documenten_insert_policy" ON public.documenten;
CREATE POLICY "documenten_insert_policy" ON public.documenten FOR INSERT WITH CHECK (auth.uid() = huurder_id);

DROP POLICY IF EXISTS "documenten_update_policy" ON public.documenten;
CREATE POLICY "documenten_update_policy" ON public.documenten FOR UPDATE USING (auth.uid() = huurder_id OR public.is_beoordelaar_or_admin(auth.uid())) WITH CHECK (auth.uid() = huurder_id OR public.is_beoordelaar_or_admin(auth.uid()));

DROP POLICY IF EXISTS "documenten_delete_policy" ON public.documenten;
CREATE POLICY "documenten_delete_policy" ON public.documenten FOR DELETE USING (auth.uid() = huurder_id OR public.is_admin(auth.uid()));

-- 5. Fix verificaties table policies
DROP POLICY IF EXISTS "verificaties_select_policy" ON public.verificaties;
CREATE POLICY "verificaties_select_policy" ON public.verificaties FOR SELECT USING (auth.uid() = huurder_id OR public.is_beoordelaar_or_admin(auth.uid()));

DROP POLICY IF EXISTS "verificaties_insert_policy" ON public.verificaties;
CREATE POLICY "verificaties_insert_policy" ON public.verificaties FOR INSERT WITH CHECK (public.is_beoordelaar_or_admin(auth.uid()));

DROP POLICY IF EXISTS "verificaties_update_policy" ON public.verificaties;
CREATE POLICY "verificaties_update_policy" ON public.verificaties FOR UPDATE USING (public.is_beoordelaar_or_admin(auth.uid())) WITH CHECK (public.is_beoordelaar_or_admin(auth.uid()));

DROP POLICY IF EXISTS "verificaties_delete_policy" ON public.verificaties;
CREATE POLICY "verificaties_delete_policy" ON public.verificaties FOR DELETE USING (public.is_admin(auth.uid()));

-- 6. Add comprehensive CRUD policies for notificaties
DROP POLICY IF EXISTS "notificaties_insert_policy" ON public.notificaties;
CREATE POLICY "notificaties_insert_policy" ON public.notificaties FOR INSERT WITH CHECK (auth.uid() = gebruiker_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "notificaties_update_policy" ON public.notificaties;
CREATE POLICY "notificaties_update_policy" ON public.notificaties FOR UPDATE USING (auth.uid() = gebruiker_id) WITH CHECK (auth.uid() = gebruiker_id);

DROP POLICY IF EXISTS "notificaties_delete_policy" ON public.notificaties;
CREATE POLICY "notificaties_delete_policy" ON public.notificaties FOR DELETE USING (auth.uid() = gebruiker_id OR public.is_admin(auth.uid()));

-- 7. Secure the gebruiker_rollen table properly
DROP POLICY IF EXISTS "gebruiker_rollen_admin_only" ON public.gebruiker_rollen;
CREATE POLICY "gebruiker_rollen_admin_only" ON public.gebruiker_rollen FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 8. Add audit logging policies
DROP POLICY IF EXISTS "audit_logs_admin_only" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs FOR SELECT USING (public.is_admin(auth.uid()));

-- 9. Secure views with proper definer rights
DROP FUNCTION IF EXISTS public.zoek_huurders(text, integer, integer, boolean, boolean);
DROP VIEW IF EXISTS public.actieve_huurders;
CREATE VIEW public.actieve_huurders WITH (security_invoker = true) AS
SELECT h.id, g.email, h.locatie_voorkeur, h.max_huur, h.huisdieren, h.roken, a.status AS abonnement_status
FROM public.huurders h
JOIN public.gebruikers g ON h.id = g.id
JOIN public.abonnementen a ON h.id = a.huurder_id
WHERE a.status = 'actief' AND g.profiel_compleet = true;

CREATE OR REPLACE FUNCTION public.zoek_huurders(in_city text, min_budget integer, max_budget integer, huisdieren boolean, roken boolean)
RETURNS SETOF public.actieve_huurders LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.actieve_huurders h
  WHERE (in_city IS NULL OR in_city = ANY(h.locatie_voorkeur))
    AND (min_budget IS NULL OR h.max_huur >= min_budget)
    AND (max_budget IS NULL OR h.max_huur <= max_budget)
    AND (huisdieren IS NULL OR h.huisdieren = huisdieren)
    AND (roken IS NULL OR h.roken = roken);
END;
$$;

REVOKE ALL ON public.actieve_huurders FROM anon, authenticated;
GRANT SELECT ON public.actieve_huurders TO authenticated;

-- 10. THIS SECTION IS REMOVED AS YOU CANNOT CREATE A POLICY ON A VIEW

-- 11. Fix documenten_wachtend view
DROP VIEW IF EXISTS public.documenten_wachtend;
CREATE VIEW public.documenten_wachtend WITH (security_invoker = true) AS
SELECT d.id, d.huurder_id, d.bestandsnaam, d.bestand_url, d.type, d.status, d.aangemaakt_op, g.naam AS huurder_naam, g.email AS huurder_email
FROM public.documenten d
JOIN public.huurders h ON d.huurder_id = h.id
JOIN public.gebruikers g ON h.id = g.id
WHERE d.status = 'wachtend';

REVOKE ALL ON public.documenten_wachtend FROM anon, authenticated;
GRANT SELECT ON public.documenten_wachtend TO authenticated;

-- THIS POLICY IS ALSO REMOVED
-- CREATE POLICY "documenten_wachtend_beoordelaars_only" ON public.documenten_wachtend ...

-- 12. Add constraint to prevent role escalation
ALTER TABLE public.gebruikers DROP CONSTRAINT IF EXISTS check_role_assignment;
ALTER TABLE public.gebruikers ADD CONSTRAINT check_role_assignment CHECK (rol IN ('huurder', 'verhuurder', 'beoordelaar', 'admin'));

-- 13. Create function to safely update user roles (admin only)
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role public.gebruiker_rol)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Unauthorized: Only admins can update user roles'; END IF;
  IF new_role != 'admin' AND EXISTS (SELECT 1 FROM public.gebruikers WHERE id = target_user_id AND rol = 'admin') THEN
    IF (SELECT COUNT(*) FROM public.gebruikers WHERE rol = 'admin') <= 1 THEN RAISE EXCEPTION 'Cannot remove the last admin user'; END IF;
  END IF;
  UPDATE public.gebruikers SET rol = new_role, bijgewerkt_op = now() WHERE id = target_user_id;
  RETURN FOUND;
END;
$$;

-- 14. Create secure message validation for berichten table
CREATE OR REPLACE FUNCTION public.validate_message_users() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.verzender_id = NEW.ontvanger_id THEN RAISE EXCEPTION 'Cannot send message to yourself'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.gebruikers WHERE id = NEW.verzender_id) THEN RAISE EXCEPTION 'Sender does not exist'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.gebruikers WHERE id = NEW.ontvanger_id) THEN RAISE EXCEPTION 'Receiver does not exist'; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_message_users_trigger ON public.berichten;
CREATE TRIGGER validate_message_users_trigger BEFORE INSERT OR UPDATE ON public.berichten FOR EACH ROW EXECUTE FUNCTION public.validate_message_users();

-- 15. Add comprehensive audit logging
CREATE OR REPLACE FUNCTION public.create_audit_entry() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (table_name, operation, record_id, user_id, old_values, created_at)
    VALUES (TG_TABLE_NAME, TG_OP, OLD.id, auth.uid(), to_jsonb(OLD), now());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (table_name, operation, record_id, user_id, old_values, new_values, created_at)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, auth.uid(), to_jsonb(OLD), to_jsonb(NEW), now());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (table_name, operation, record_id, user_id, new_values, created_at)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id, auth.uid(), to_jsonb(NEW), now());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_gebruikers_trigger ON public.gebruikers;
CREATE TRIGGER audit_gebruikers_trigger AFTER INSERT OR UPDATE OR DELETE ON public.gebruikers FOR EACH ROW EXECUTE FUNCTION public.create_audit_entry();

DROP TRIGGER IF EXISTS audit_documenten_trigger ON public.documenten;
CREATE TRIGGER audit_documenten_trigger AFTER INSERT OR UPDATE OR DELETE ON public.documenten FOR EACH ROW EXECUTE FUNCTION public.create_audit_entry();

DROP TRIGGER IF EXISTS audit_abonnementen_trigger ON public.abonnementen;
CREATE TRIGGER audit_abonnementen_trigger AFTER INSERT OR UPDATE OR DELETE ON public.abonnementen FOR EACH ROW EXECUTE FUNCTION public.create_audit_entry();

-- 16. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_beoordelaar_or_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_role(uuid, public.gebruiker_rol) TO authenticated;
