# 🚀 COMPREHENSIVE PROFILE ENHANCEMENT - MANUAL INSTRUCTIONS

## ⚠️ **IMPORTANT NOTE**
The automatic migration failed because Supabase doesn't allow DDL operations through the JavaScript client. The schema changes need to be applied manually through the Supabase Dashboard SQL Editor.

## 📋 **MANUAL SCHEMA CHANGES REQUIRED**

### **Step 1: Add New Columns to tenant_profiles Table**

Go to **Supabase Dashboard > SQL Editor** and execute these statements one by one:

```sql
-- Marital & Family Status
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('single', 'married', 'partnership', 'divorced', 'widowed'));
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS has_children BOOLEAN DEFAULT FALSE;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS number_of_children INTEGER DEFAULT 0;

-- Partner Information
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS has_partner BOOLEAN DEFAULT FALSE;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS partner_name TEXT;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS partner_profession TEXT;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS partner_monthly_income DECIMAL(10,2) DEFAULT 0;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS partner_employment_status TEXT;

-- Additional Personal Details
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Nederlandse';
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Location Preferences Enhancement
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS preferred_districts TEXT[];
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS max_commute_time INTEGER;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS transportation_preference TEXT;

-- Housing Preferences Enhancement
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS furnished_preference TEXT CHECK (furnished_preference IN ('furnished', 'unfurnished', 'no_preference'));
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS desired_amenities TEXT[];

-- Total Household Income (calculated field)
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS total_household_income DECIMAL(10,2) GENERATED ALWAYS AS (
  COALESCE(monthly_income, 0) + COALESCE(partner_monthly_income, 0)
) STORED;

-- Family Composition (auto-calculated)
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS family_composition TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN has_partner = FALSE AND has_children = FALSE THEN 'single'
    WHEN has_partner = TRUE AND has_children = FALSE THEN 'couple'
    WHEN has_partner = FALSE AND has_children = TRUE THEN 'single_parent'
    WHEN has_partner = TRUE AND has_children = TRUE THEN 'family_with_children'
    ELSE 'single'
  END
) STORED;
```

### **Step 2: Create New Tables**

```sql
-- Create children_details table
CREATE TABLE IF NOT EXISTS children_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  child_age INTEGER NOT NULL CHECK (child_age >= 0 AND child_age <= 25),
  child_gender TEXT CHECK (child_gender IN ('male', 'female', 'other')),
  special_needs BOOLEAN DEFAULT FALSE,
  special_needs_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profile_views table for cross-platform communication
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_type TEXT NOT NULL CHECK (viewer_type IN ('verhuurder', 'beoordelaar', 'beheerder')),
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  UNIQUE(viewer_id, viewed_profile_id, session_id)
);

-- Create profile_analytics table for enhanced tracking
CREATE TABLE IF NOT EXISTS profile_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  profile_completion_score INTEGER DEFAULT 0,
  weekly_views INTEGER DEFAULT 0,
  monthly_views INTEGER DEFAULT 0,
  peak_viewing_day TEXT,
  peak_viewing_hour INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profile_view_notifications table for real-time notifications
CREATE TABLE IF NOT EXISTS profile_view_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT DEFAULT 'profile_viewed',
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Step 3: Add Indexes for Performance**

```sql
-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_marital_status ON tenant_profiles(marital_status);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_has_children ON tenant_profiles(has_children);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_has_partner ON tenant_profiles(has_partner);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_family_composition ON tenant_profiles(family_composition);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_total_household_income ON tenant_profiles(total_household_income);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_nationality ON tenant_profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_preferred_districts ON tenant_profiles USING GIN(preferred_districts);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_desired_amenities ON tenant_profiles USING GIN(desired_amenities);

-- Add indexes for new tables
CREATE INDEX IF NOT EXISTS idx_children_details_user_id ON children_details(user_id);
CREATE INDEX IF NOT EXISTS idx_children_details_child_age ON children_details(child_age);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_profile_id ON profile_views(viewed_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_type ON profile_views(viewer_type);

CREATE INDEX IF NOT EXISTS idx_profile_analytics_user_id ON profile_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_total_views ON profile_analytics(total_views);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_last_viewed_at ON profile_analytics(last_viewed_at);

CREATE INDEX IF NOT EXISTS idx_profile_view_notifications_user_id ON profile_view_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_view_notifications_read_at ON profile_view_notifications(read_at);
```

### **Step 4: Update Existing Records**

```sql
-- Update existing records with default values
UPDATE tenant_profiles 
SET 
  marital_status = 'single',
  has_children = FALSE,
  number_of_children = 0,
  has_partner = FALSE,
  partner_monthly_income = 0,
  nationality = 'Nederlandse',
  furnished_preference = 'no_preference'
WHERE marital_status IS NULL;
```

### **Step 5: Enable RLS and Create Policies**

```sql
-- Enable RLS on new tables
ALTER TABLE children_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_view_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for children_details
CREATE POLICY "Users can manage their own children details" ON children_details
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Verhuurders can view children details" ON children_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('Verhuurder', 'Beoordelaar', 'Beheerder')
    )
  );

-- RLS policies for profile_views
CREATE POLICY "Users can view their own profile views" ON profile_views
  FOR SELECT USING (auth.uid() = viewer_id OR auth.uid() = viewed_profile_id);

CREATE POLICY "Authenticated users can create profile views" ON profile_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- RLS policies for profile_analytics
CREATE POLICY "Users can view their own analytics" ON profile_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage analytics" ON profile_analytics
  FOR ALL WITH CHECK (true);

-- RLS policies for profile_view_notifications
CREATE POLICY "Users can view their own notifications" ON profile_view_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON profile_view_notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

## 🎯 **WHAT THIS ENHANCEMENT PROVIDES**

### **New Database Features:**
1. **Family Composition Tracking** - Marital status, children, partner information
2. **Partner Income Integration** - Combined household income calculations
3. **Enhanced Personal Details** - Nationality, profile pictures
4. **Advanced Location Preferences** - Districts, commute time, transportation
5. **Comprehensive Housing Preferences** - Amenities, furnished preferences
6. **Profile View Tracking** - Who viewed your profile and when
7. **Real-time Analytics** - Profile completion scores, view statistics
8. **Cross-platform Notifications** - Real-time alerts when profile is viewed

### **Enhanced Search Capabilities:**
- **Total Household Income Filtering** - More accurate income-based matching
- **Family-type Filtering** - Single, couple, family, single parent
- **Children-friendly Matching** - Properties suitable for families
- **Advanced Demographics** - Age, nationality, family composition

### **Profile Completion Scoring:**
- **Automatic Calculation** - Based on completeness of all fields
- **Real-time Updates** - Score updates as profile is enhanced
- **Weighted Scoring** - Important fields have higher weights

## 🚀 **NEXT STEPS AFTER MANUAL SCHEMA APPLICATION**

Once you've applied the manual schema changes:

1. **Test the Schema** - Verify all new columns and tables exist
2. **Create Enhanced ProfileCreationModal** - 7-step comprehensive form
3. **Update UserService** - Add family-aware methods
4. **Implement Profile View Tracking** - Cross-platform communication
5. **Update Search Filters** - Use total_household_income instead of monthly_income
6. **Add Real-time Notifications** - Profile view alerts

## ⚠️ **IMPORTANT VERIFICATION**

After applying the manual changes, run this verification query:

```sql
-- Verify new columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tenant_profiles' 
AND column_name IN (
  'marital_status', 'has_children', 'has_partner', 
  'partner_monthly_income', 'total_household_income', 
  'family_composition', 'nationality'
)
ORDER BY column_name;

-- Verify new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN (
  'children_details', 'profile_views', 
  'profile_analytics', 'profile_view_notifications'
)
AND table_schema = 'public';
```

This comprehensive enhancement will transform the basic profile system into a sophisticated, family-aware tenant profiling platform with real-time cross-platform communication.
