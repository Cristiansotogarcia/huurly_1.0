# 🔧 TENANT PROFILES SCHEMA FIX - COMPLETE SOLUTION

## 🎯 **NEW ISSUE IDENTIFIED**
After fixing the `profiles` table, the error has moved to the `tenant_profiles` table. The ProfileCreationModal now fails with:

**Error:** `POST https://lxtkotgfsnahwncgcfnl.supabase.co/rest/v1/tenant_profiles 400 (Bad Request)`

## 🔍 **ROOT CAUSE ANALYSIS**

From the screenshots and error logs:
1. ✅ **profiles table** - Now has data and `is_looking_for_place` column
2. ❌ **tenant_profiles table** - Empty and likely missing required columns
3. ❌ **Schema mismatch** - UserService expects certain columns that don't exist

## 🛠️ **COMPLETE SCHEMA FIX**

### **Step 1: Check Current tenant_profiles Schema**
First, let's see what columns exist:

```sql
-- Check current tenant_profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tenant_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### **Step 2: Create/Fix tenant_profiles Table**
Run this comprehensive SQL to ensure all required columns exist:

```sql
-- Create tenant_profiles table if it doesn't exist or add missing columns
CREATE TABLE IF NOT EXISTS tenant_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    profession TEXT,
    monthly_income INTEGER,
    bio TEXT,
    preferred_city TEXT,
    min_budget INTEGER,
    max_budget INTEGER,
    preferred_bedrooms INTEGER,
    preferred_property_type TEXT,
    motivation TEXT,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS monthly_income INTEGER,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS preferred_city TEXT,
ADD COLUMN IF NOT EXISTS min_budget INTEGER,
ADD COLUMN IF NOT EXISTS max_budget INTEGER,
ADD COLUMN IF NOT EXISTS preferred_bedrooms INTEGER,
ADD COLUMN IF NOT EXISTS preferred_property_type TEXT,
ADD COLUMN IF NOT EXISTS motivation TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure user_id column exists and has proper constraint
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tenant_profiles_user_id_fkey'
    ) THEN
        ALTER TABLE tenant_profiles 
        ADD CONSTRAINT tenant_profiles_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add unique constraint on user_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tenant_profiles_user_id_key'
    ) THEN
        ALTER TABLE tenant_profiles 
        ADD CONSTRAINT tenant_profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tenant_profiles_updated_at ON tenant_profiles;
CREATE TRIGGER update_tenant_profiles_updated_at
    BEFORE UPDATE ON tenant_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### **Step 3: Fix RLS Policies**
Ensure proper Row Level Security policies:

```sql
-- Enable RLS on tenant_profiles
ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own tenant profile" ON tenant_profiles;
DROP POLICY IF EXISTS "Users can insert own tenant profile" ON tenant_profiles;
DROP POLICY IF EXISTS "Users can update own tenant profile" ON tenant_profiles;
DROP POLICY IF EXISTS "Verhuurders can view tenant profiles" ON tenant_profiles;
DROP POLICY IF EXISTS "Beoordelaars can view tenant profiles" ON tenant_profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own tenant profile" ON tenant_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tenant profile" ON tenant_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tenant profile" ON tenant_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Verhuurders can view tenant profiles" ON tenant_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'Verhuurder'
        )
    );

CREATE POLICY "Beoordelaars can view tenant profiles" ON tenant_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Beoordelaar', 'Beheerder')
        )
    );
```

### **Step 4: Verify the Fix**
Check that everything is working:

```sql
-- Verify table structure
\d tenant_profiles

-- Check if you can insert a test record
INSERT INTO tenant_profiles (
    user_id, 
    phone, 
    profession, 
    monthly_income, 
    bio, 
    preferred_city, 
    min_budget, 
    max_budget, 
    preferred_bedrooms, 
    preferred_property_type, 
    motivation,
    profile_completed
) VALUES (
    '929577f0-2124-4157-98e5-81656d0b8e83',
    '+31612345678',
    'Test Profession',
    5000,
    'Test bio',
    'Amsterdam',
    1500,
    2500,
    2,
    'Appartement',
    'Test motivation',
    true
) ON CONFLICT (user_id) DO UPDATE SET
    phone = EXCLUDED.phone,
    profession = EXCLUDED.profession,
    monthly_income = EXCLUDED.monthly_income,
    bio = EXCLUDED.bio,
    preferred_city = EXCLUDED.preferred_city,
    min_budget = EXCLUDED.min_budget,
    max_budget = EXCLUDED.max_budget,
    preferred_bedrooms = EXCLUDED.preferred_bedrooms,
    preferred_property_type = EXCLUDED.preferred_property_type,
    motivation = EXCLUDED.motivation,
    profile_completed = EXCLUDED.profile_completed;

-- Verify the insert worked
SELECT * FROM tenant_profiles WHERE user_id = '929577f0-2124-4157-98e5-81656d0b8e83';
```

## 🎯 **EXPECTED RESULTS**

After running this complete fix:

✅ **tenant_profiles table** - Has all required columns with proper types
✅ **RLS policies** - Allow users to create/update their own profiles
✅ **Foreign keys** - Proper relationship with profiles table
✅ **Profile creation** - Modal will work without 400 errors
✅ **Cross-platform** - Verhuurders can see tenant profiles

## 📋 **VERIFICATION STEPS**

1. **Run the complete SQL** in Supabase SQL Editor
2. **Test profile creation** in Huurder Dashboard
3. **Check tenant_profiles table** - Should have new record
4. **Test cross-platform** - Profile should appear in Verhuurder Dashboard
5. **Verify complete workflow** - Viewing invitations should work

## 🚀 **WHY THIS FIXES THE ISSUE**

The problem was a **schema mismatch**:
- UserService expects specific column names in tenant_profiles
- The table was either missing or had different column names
- RLS policies were blocking inserts
- Foreign key constraints were missing

This comprehensive fix ensures the database schema matches exactly what the code expects!
