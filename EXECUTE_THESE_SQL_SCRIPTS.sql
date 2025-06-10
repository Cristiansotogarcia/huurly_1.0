-- =====================================================
-- COMPREHENSIVE PROFILE ENHANCEMENT - SQL SCRIPTS
-- Execute these in Supabase Dashboard > SQL Editor
-- =====================================================

-- STEP 1: Add new columns to tenant_profiles table
-- Execute these one by one or all together

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

-- STEP 2: Create new tables

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

-- STEP 3: Add indexes for performance

-- Add indexes for new columns in tenant_profiles
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

-- STEP 4: Add updated_at triggers for new tables
CREATE TRIGGER update_children_details_updated_at 
  BEFORE UPDATE ON children_details 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_analytics_updated_at 
  BEFORE UPDATE ON profile_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 5: Enable RLS on new tables
ALTER TABLE children_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_view_notifications ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create RLS policies

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

-- STEP 7: Update existing records with default values
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

-- STEP 8: Create initial profile analytics records for existing users
INSERT INTO profile_analytics (user_id, profile_completion_score)
SELECT user_id, 0
FROM tenant_profiles
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES - Run these to confirm success
-- =====================================================

-- Verify new columns exist in tenant_profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tenant_profiles' 
AND column_name IN (
  'marital_status', 'has_children', 'has_partner', 
  'partner_monthly_income', 'total_household_income', 
  'family_composition', 'nationality', 'preferred_districts'
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

-- Test total_household_income calculation
SELECT 
  user_id,
  monthly_income,
  partner_monthly_income,
  total_household_income,
  family_composition
FROM tenant_profiles 
LIMIT 3;

-- =====================================================
-- EXECUTION COMPLETE
-- =====================================================
-- After running these scripts, the enhanced profile system will be ready!
-- The new EnhancedProfileCreationModal will work with all these fields.
