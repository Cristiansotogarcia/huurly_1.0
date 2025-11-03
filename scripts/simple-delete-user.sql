-- SIMPLE DELETE - Just delete from auth.users
-- User ID: c051b961-29e5-411a-952b-b3511b903ab7
-- Email: sotocrioyo@gmail.com

-- Step 1: Verify user exists
SELECT id, email, created_at, raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Step 2: Delete from auth.users 
-- This should CASCADE delete to related tables if foreign keys are set up correctly
DELETE FROM auth.users 
WHERE id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Step 3: Verify deletion
SELECT 'User deleted - should return 0 rows:' as status;
SELECT COUNT(*) as remaining_users 
FROM auth.users 
WHERE id = 'c051b961-29e5-411a-952b-b3511b903ab7';

-- Step 4: Verify email is now available
SELECT 'Email available - should return 0 rows:' as status;
SELECT email 
FROM auth.users 
WHERE email = 'sotocrioyo@gmail.com';
