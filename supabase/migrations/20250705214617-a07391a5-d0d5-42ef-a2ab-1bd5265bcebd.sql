-- Create the initial admin user
-- First, we need to insert into auth.users manually (this is typically done through signup)
-- For production, this user should sign up normally and then be granted admin privileges

-- Check if admin user already exists, if not create the user record in gebruikers table
INSERT INTO public.gebruikers (id, email, naam, rol, profiel_compleet, telefoon)
SELECT 
  gen_random_uuid(),
  'Cristiansotogarcia@gmail.com',
  'Cristian Soto Garcia',
  'admin',
  true,
  null
WHERE NOT EXISTS (
  SELECT 1 FROM public.gebruikers WHERE email = 'Cristiansotogarcia@gmail.com'
);

-- Note: The actual auth.users entry will be created when the user signs up
-- This just prepares the system to recognize them as admin when they do sign up