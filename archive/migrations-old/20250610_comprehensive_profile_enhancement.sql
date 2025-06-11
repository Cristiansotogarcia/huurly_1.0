-- Comprehensive Profile Enhancement Migration
-- Adds family composition, partner income, profile tracking, and cross-platform communication

-- Add new columns to tenant_profiles table for comprehensive profile data
ALTER TABLE tenant_profiles 
-- Marital & Family Status
ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('single', 'married', 'partnership', 'divorced', 'widowed')),
ADD COLUMN IF NOT EXISTS has_children BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS number_of_children INTEGER DEFAULT 0,

-- Partner Information
ADD COLUMN IF NOT EXISTS has_partner BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS partner_name TEXT,
ADD COLUMN IF NOT EXISTS partner_profession TEXT,
ADD COLUMN IF NOT EXISTS partner_monthly_income DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS partner_employment_status TEXT,

-- Additional Personal Details
ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Nederlandse',
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,

-- Location Preferences Enhancement
ADD COLUMN IF NOT EXISTS preferred_districts TEXT[], -- Array of preferred districts
ADD COLUMN IF NOT EXISTS max_commute_time INTEGER, -- in minutes
ADD COLUMN IF NOT EXISTS transportation_preference TEXT,

-- Housing Preferences Enhancement
ADD COLUMN IF NOT EXISTS furnished_preference TEXT CHECK (furnished_preference IN ('furnished', 'unfurnished', 'no_preference')),
ADD COLUMN IF NOT EXISTS desired_amenities TEXT[], -- Array of desired amenities

-- Family Composition (auto-calculated)
ADD COLUMN IF NOT EXISTS family_composition TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN has_partner = FALSE AND has_children = FALSE THEN 'single'
    WHEN has_partner = TRUE AND has_children = FALSE THEN 'couple'
    WHEN has_partner = FALSE AND has_children = TRUE THEN 'single_parent'
    WHEN has_partner = TRUE AND has_children = TRUE THEN 'family_with_children'
    ELSE 'single'
  END
) STORED,

-- Total Household Income (calculated field)
ADD COLUMN IF NOT EXISTS total_household_income DECIMAL(10,2) GENERATED ALWAYS AS (
  COALESCE(monthly_income, 0) + COALESCE(partner_monthly_income, 0)
) STORED;

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
  session_id TEXT, -- To track unique viewing sessions
  ip_address INET,
  user_agent TEXT,
  
  -- Prevent duplicate views within same session
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_marital_status ON tenant_profiles(marital_status);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_has_children ON tenant_profiles(has_children);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_has_partner ON tenant_profiles(has_partner);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_family_composition ON tenant_profiles(family_composition);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_total_household_income ON tenant_profiles(total_household_income);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_nationality ON tenant_profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_preferred_districts ON tenant_profiles USING GIN(preferred_districts);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_desired_amenities ON tenant_profiles USING GIN(desired_amenities);

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

-- Add updated_at triggers for new tables
CREATE TRIGGER update_children_details_updated_at 
  BEFORE UPDATE ON children_details 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_analytics_updated_at 
  BEFORE UPDATE ON profile_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update profile analytics when profile is viewed
CREATE OR REPLACE FUNCTION update_profile_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or create profile analytics record
  INSERT INTO profile_analytics (user_id, total_views, unique_viewers, last_viewed_at)
  VALUES (NEW.viewed_profile_id, 1, 1, NEW.viewed_at)
  ON CONFLICT (user_id) DO UPDATE SET
    total_views = profile_analytics.total_views + 1,
    unique_viewers = (
      SELECT COUNT(DISTINCT viewer_id) 
      FROM profile_views 
      WHERE viewed_profile_id = NEW.viewed_profile_id
    ),
    last_viewed_at = NEW.viewed_at,
    updated_at = NOW();
  
  -- Create notification for profile owner
  INSERT INTO profile_view_notifications (user_id, viewer_id, message)
  SELECT 
    NEW.viewed_profile_id,
    NEW.viewer_id,
    CASE NEW.viewer_type
      WHEN 'verhuurder' THEN 'Een verhuurder heeft je profiel bekeken'
      WHEN 'beoordelaar' THEN 'Een beoordelaar heeft je profiel bekeken'
      WHEN 'beheerder' THEN 'Een beheerder heeft je profiel bekeken'
      ELSE 'Iemand heeft je profiel bekeken'
    END
  WHERE NOT EXISTS (
    -- Don't create duplicate notifications within 1 hour
    SELECT 1 FROM profile_view_notifications 
    WHERE user_id = NEW.viewed_profile_id 
    AND viewer_id = NEW.viewer_id 
    AND created_at > NOW() - INTERVAL '1 hour'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics when profile is viewed
CREATE TRIGGER trigger_update_profile_analytics
  AFTER INSERT ON profile_views
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_analytics();

-- Function to calculate profile completion score
CREATE OR REPLACE FUNCTION calculate_profile_completion_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  profile_record RECORD;
BEGIN
  SELECT * INTO profile_record FROM tenant_profiles WHERE user_id = user_uuid;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Basic information (30 points)
  IF profile_record.first_name IS NOT NULL AND profile_record.last_name IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.phone IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.date_of_birth IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.profession IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.monthly_income IS NOT NULL AND profile_record.monthly_income > 0 THEN score := score + 5; END IF;
  IF profile_record.nationality IS NOT NULL THEN score := score + 5; END IF;
  
  -- Profile picture (10 points)
  IF profile_record.profile_picture_url IS NOT NULL THEN score := score + 10; END IF;
  
  -- Housing preferences (25 points)
  IF profile_record.preferred_city IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.min_budget IS NOT NULL AND profile_record.max_budget IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.preferred_bedrooms IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.preferred_property_type IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.preferred_districts IS NOT NULL AND array_length(profile_record.preferred_districts, 1) > 0 THEN score := score + 5; END IF;
  
  -- Personal details (20 points)
  IF profile_record.bio IS NOT NULL AND length(profile_record.bio) > 50 THEN score := score + 10; END IF;
  IF profile_record.motivation IS NOT NULL AND length(profile_record.motivation) > 30 THEN score := score + 10; END IF;
  
  -- Family information (10 points)
  IF profile_record.marital_status IS NOT NULL THEN score := score + 5; END IF;
  IF profile_record.has_children IS NOT NULL THEN score := score + 5; END IF;
  
  -- Employment details (5 points)
  IF profile_record.employer IS NOT NULL THEN score := score + 3; END IF;
  IF profile_record.work_contract_type IS NOT NULL THEN score := score + 2; END IF;
  
  RETURN LEAST(score, 100); -- Cap at 100%
END;
$$ LANGUAGE plpgsql;

-- Function to update profile completion score
CREATE OR REPLACE FUNCTION update_profile_completion_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_percentage := calculate_profile_completion_score(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update profile completion score
CREATE TRIGGER trigger_update_profile_completion_score
  BEFORE INSERT OR UPDATE ON tenant_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion_score();

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

-- Update existing records to have default values for new fields
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

-- Create initial profile analytics records for existing users
INSERT INTO profile_analytics (user_id, profile_completion_score)
SELECT user_id, calculate_profile_completion_score(user_id)
FROM tenant_profiles
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE children_details IS 'Detailed information about tenant children';
COMMENT ON TABLE profile_views IS 'Tracks when and who views tenant profiles';
COMMENT ON TABLE profile_analytics IS 'Analytics and metrics for tenant profiles';
COMMENT ON TABLE profile_view_notifications IS 'Notifications for profile views';

COMMENT ON COLUMN tenant_profiles.total_household_income IS 'Automatically calculated sum of tenant and partner income';
COMMENT ON COLUMN tenant_profiles.family_composition IS 'Automatically determined family type based on partner and children status';
COMMENT ON COLUMN tenant_profiles.preferred_districts IS 'Array of preferred districts within the chosen city';
COMMENT ON COLUMN tenant_profiles.desired_amenities IS 'Array of desired property amenities';
