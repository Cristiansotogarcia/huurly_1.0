-- FORCE DELETE USER: c051b961-29e5-411a-952b-b3511b903ab7
-- This script aggressively removes all data and handles foreign key constraints

-- Step 1: Check what data exists for this user
SELECT 'auth.users' as table_name, COUNT(*) as count 
FROM auth.users WHERE id = 'c051b961-29e5-411a-952b-b3511b903ab7'
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles WHERE id = 'c051b961-29e5-411a-952b-b3511b903ab7'
UNION ALL
SELECT 'huurder_profiles', COUNT(*) FROM public.huurder_profiles WHERE user_id = 'c051b961-29e5-411a-952b-b3511b903ab7'
UNION ALL
SELECT 'verhuurder_profiles', COUNT(*) FROM public.verhuurder_profiles WHERE user_id = 'c051b961-29e5-411a-952b-b3511b903ab7'
UNION ALL
SELECT 'applications', COUNT(*) FROM public.applications WHERE huurder_id = 'c051b961-29e5-411a-952b-b3511b903ab7'
UNION ALL
SELECT 'favorites', COUNT(*) FROM public.favorites WHERE huurder_id = 'c051b961-29e5-411a-952b-b3511b903ab7'
UNION ALL
SELECT 'documents', COUNT(*) FROM public.documents WHERE user_id = 'c051b961-29e5-411a-952b-b3511b903ab7'
UNION ALL
SELECT 'messages (sender)', COUNT(*) FROM public.messages WHERE sender_id = 'c051b961-29e5-411a-952b-b3511b903ab7'
UNION ALL
SELECT 'messages (receiver)', COUNT(*) FROM public.messages WHERE receiver_id = 'c051b961-29e5-411a-952b-b3511b903ab7'
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications WHERE user_id = 'c051b961-29e5-411a-952b-b3511b903ab7'
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM public.subscriptions WHERE user_id = 'c051b961-29e5-411a-952b-b3511b903ab7'
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM public.audit_logs WHERE user_id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Step 2: FORCE DELETE - Delete in correct order to handle foreign keys

-- Delete audit logs (no FK dependencies)
DELETE FROM public.audit_logs WHERE user_id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Delete notifications (no FK dependencies)
DELETE FROM public.notifications WHERE user_id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Delete subscriptions (no FK dependencies)  
DELETE FROM public.subscriptions WHERE user_id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Delete messages (both sent and received)
DELETE FROM public.messages WHERE sender_id = 'c051b961-29e5-411a-952b-b3511b903ab7';
DELETE FROM public.messages WHERE receiver_id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Delete documents
DELETE FROM public.documents WHERE user_id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Delete favorites
DELETE FROM public.favorites WHERE huurder_id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Delete applications
DELETE FROM public.applications WHERE huurder_id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Delete verhuurder_profiles
DELETE FROM public.verhuurder_profiles WHERE user_id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Delete huurder_profiles  
DELETE FROM public.huurder_profiles WHERE user_id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Delete profiles
DELETE FROM public.profiles WHERE id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Finally, delete from auth.users
DELETE FROM auth.users WHERE id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Step 3: Verify complete deletion
SELECT 'VERIFICATION - Should all be 0:' as status;
SELECT 'auth.users' as table_name, COUNT(*) as remaining 
FROM auth.users WHERE id = 'c051b961-29e5-411a-952b-b3511b903ab7'
UNION ALL
SELECT 'profiles', COUNT(*) FROM public.profiles WHERE id = 'c051b961-29e5-411a-952b-b3511b903ab7'
UNION ALL
SELECT 'huurder_profiles', COUNT(*) FROM public.huurder_profiles WHERE user_id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Step 4: Verify email is available
SELECT 'Email availability check:' as status;
SELECT email FROM auth.users WHERE email = 'sotocrioyo@gmail.com';
-- Should return 0 rows if successful
