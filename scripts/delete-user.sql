-- Script to completely delete user: sotocrioyo@gmail.com
-- Run this in Supabase SQL Editor

-- First, get the user ID (run this to see what we're deleting)
SELECT id, email, raw_user_meta_data->>'role' as role, created_at
FROM auth.users
WHERE email = 'sotocrioyo@gmail.com';

-- Now delete all related data (uncomment after confirming the user ID above)

-- Delete from profile table
DELETE FROM public.profiles 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'sotocrioyo@gmail.com');

-- Delete from huurder_profiles (if exists)
DELETE FROM public.huurder_profiles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'sotocrioyo@gmail.com');

-- Delete from verhuurder_profiles (if exists)
DELETE FROM public.verhuurder_profiles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'sotocrioyo@gmail.com');

-- Delete applications
DELETE FROM public.applications 
WHERE huurder_id IN (SELECT id FROM auth.users WHERE email = 'sotocrioyo@gmail.com');

-- Delete favorites
DELETE FROM public.favorites 
WHERE huurder_id IN (SELECT id FROM auth.users WHERE email = 'sotocrioyo@gmail.com');

-- Delete documents
DELETE FROM public.documents 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'sotocrioyo@gmail.com');

-- Delete messages sent
DELETE FROM public.messages 
WHERE sender_id IN (SELECT id FROM auth.users WHERE email = 'sotocrioyo@gmail.com');

-- Delete messages received
DELETE FROM public.messages 
WHERE receiver_id IN (SELECT id FROM auth.users WHERE email = 'sotocrioyo@gmail.com');

-- Delete notifications
DELETE FROM public.notifications 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'sotocrioyo@gmail.com');

-- Delete from subscription table
DELETE FROM public.subscriptions 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'sotocrioyo@gmail.com');

-- Delete audit logs
DELETE FROM public.audit_logs 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'sotocrioyo@gmail.com');

-- Finally, delete from auth.users (THIS MUST BE LAST)
DELETE FROM auth.users 
WHERE email = 'sotocrioyo@gmail.com';

-- Verify deletion
SELECT id, email FROM auth.users WHERE email = 'sotocrioyo@gmail.com';
-- Should return 0 rows

-- Check profiles is also clean
SELECT * FROM public.profiles WHERE email = 'sotocrioyo@gmail.com';
-- Should return 0 rows
