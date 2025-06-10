-- Remove 'Manager' value from user_role enum
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_role'
      AND 'Manager' = ANY(enum_range(NULL::user_role))
  ) THEN
    ALTER TYPE public.user_role RENAME TO user_role_old;
    CREATE TYPE public.user_role AS ENUM ('Huurder', 'Verhuurder', 'Beheerder', 'Beoordelaar');
    ALTER TABLE public.user_roles
      ALTER COLUMN role TYPE public.user_role USING role::text::public.user_role;
    DROP TYPE public.user_role_old;
  END IF;
END$$;
