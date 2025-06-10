# 🔧 VERHUURDER SEARCH FIX - TENANT PROFILES QUERY ISSUE

## 🎯 **ISSUE IDENTIFIED**
The Verhuurder Dashboard search is failing with a 400 error when trying to load tenant profiles. The error URL shows:

```
/rest/v1/tenant_profiles?select=*%2Cprofiles%21inner%28id%2Cfirst_name%2Clast_name%2Cis_looking_for_place%29&profile_completed=eq.true&profiles.is_looking_for_place=eq.true&preferred_city=ilike.%25Amsterdam%25&max_budget=lte.2000&order=created_at.desc
```

## 🔍 **ROOT CAUSE ANALYSIS**

The UserService `getTenantProfiles` method is trying to filter on:
1. `profile_completed=eq.true` - This column might not exist
2. `profiles.is_looking_for_place=eq.true` - Filtering on joined table
3. Using column names that might not match the actual schema

## 🛠️ **COMPLETE FIX**

### **Step 1: Check tenant_profiles Schema**
First, let's verify what columns actually exist:

```sql
-- Check current tenant_profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tenant_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### **Step 2: Add Missing Columns (if needed)**
Based on the UserService query, we need these columns:

```sql
-- Add missing columns to tenant_profiles if they don't exist
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update existing records
UPDATE tenant_profiles 
SET 
    profile_completed = true,
    first_name = profiles.first_name,
    last_name = profiles.last_name
FROM profiles 
WHERE tenant_profiles.user_id = profiles.id
AND (tenant_profiles.first_name IS NULL OR tenant_profiles.last_name IS NULL);
```

### **Step 3: Fix RLS Policies for Cross-Table Queries**
The query uses `profiles!inner` join, so we need proper RLS policies:

```sql
-- Ensure Verhuurders can query tenant profiles with joined profiles
DROP POLICY IF EXISTS "Verhuurders can view tenant profiles with profiles" ON tenant_profiles;

CREATE POLICY "Verhuurders can view tenant profiles with profiles" ON tenant_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'Verhuurder'
        )
    );

-- Ensure the profiles table allows the join
DROP POLICY IF EXISTS "Allow tenant profile joins" ON profiles;

CREATE POLICY "Allow tenant profile joins" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Verhuurder', 'Beoordelaar', 'Beheerder')
        )
        OR auth.uid() = id
    );
```

### **Step 4: Test the Query Manually**
Test if the query works:

```sql
-- Test the exact query that's failing
SELECT 
    tp.*,
    p.id as profile_id,
    p.first_name as profile_first_name,
    p.last_name as profile_last_name,
    p.is_looking_for_place
FROM tenant_profiles tp
INNER JOIN profiles p ON tp.user_id = p.id
WHERE tp.profile_completed = true
AND p.is_looking_for_place = true
ORDER BY tp.created_at DESC;
```

### **Step 5: Alternative - Simplify the Query**
If the above doesn't work, we can modify the UserService to use a simpler query:

**Option A: Remove problematic filters**
```typescript
// In UserService.getTenantProfiles, change this:
.eq('profile_completed', true)
.eq('profiles.is_looking_for_place', true)

// To this (remove profile_completed filter):
.eq('profiles.is_looking_for_place', true)
```

**Option B: Use separate queries**
```typescript
// First get tenant profiles, then filter
let query = supabase
  .from('tenant_profiles')
  .select(`
    *,
    profiles(
      id,
      first_name,
      last_name,
      is_looking_for_place
    )
  `);
```

## 🎯 **RECOMMENDED APPROACH**

### **Try Step 2 First (Add Missing Columns):**

```sql
-- Complete fix for tenant_profiles table
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update existing records with data from profiles
UPDATE tenant_profiles 
SET 
    profile_completed = true,
    first_name = profiles.first_name,
    last_name = profiles.last_name
FROM profiles 
WHERE tenant_profiles.user_id = profiles.id;

-- Ensure RLS allows the query
DROP POLICY IF EXISTS "Verhuurders can view all tenant profiles" ON tenant_profiles;
CREATE POLICY "Verhuurders can view all tenant profiles" ON tenant_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Verhuurder', 'Beoordelaar', 'Beheerder')
        )
    );
```

## 🚀 **EXPECTED RESULTS**

After applying the fix:

✅ **Tenant search works** - No more 400 errors
✅ **Filters work** - City, budget, income filters functional
✅ **Cross-platform** - Verhuurders can see all tenant profiles
✅ **Real-time data** - Live tenant profile information

## 📋 **VERIFICATION STEPS**

1. **Run the SQL fix** in Supabase SQL Editor
2. **Test tenant search** in Verhuurder Dashboard
3. **Try different filters** - City, budget, income
4. **Check results** - Should show tenant profiles with names
5. **Test profile viewing** - Click "Profiel Bekijken" should work

**This should fix the tenant search functionality completely! 🚀**
