-- Fix Huurder Dashboard Issues Migration
-- Date: 2025-06-10
-- Purpose: Fix search status toggle, notification delete, and profile update issues

-- 1. Add is_looking_for_place field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_looking_for_place BOOLEAN DEFAULT true;

COMMENT ON COLUMN profiles.is_looking_for_place IS 'Whether the user is actively looking for a place';

-- 2. Update profiles table RLS policies to allow users to update their own profiles
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Beheerder'
    )
  );

-- 3. Fix notifications table RLS policies
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Create proper notification policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Allow system to insert notifications
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- 4. Ensure user_statistics table exists and has proper structure
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_views INTEGER DEFAULT 0,
  applications_submitted INTEGER DEFAULT 0,
  invitations_received INTEGER DEFAULT 0,
  accepted_applications INTEGER DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS for user_statistics
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own statistics" ON user_statistics;
DROP POLICY IF EXISTS "Users can update own statistics" ON user_statistics;
DROP POLICY IF EXISTS "Users can insert own statistics" ON user_statistics;

CREATE POLICY "Users can view own statistics" ON user_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own statistics" ON user_statistics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own statistics" ON user_statistics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow system to manage statistics
CREATE POLICY "System can manage statistics" ON user_statistics
  FOR ALL USING (true);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_looking_for_place ON profiles(is_looking_for_place);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON notifications(user_id, created_at DESC);

-- 6. Create function to automatically create user statistics when profile is created
CREATE OR REPLACE FUNCTION create_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_statistics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user statistics
DROP TRIGGER IF EXISTS trigger_create_user_statistics ON profiles;
CREATE TRIGGER trigger_create_user_statistics
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_statistics();

-- 7. Update existing profiles to have default is_looking_for_place value
UPDATE profiles 
SET is_looking_for_place = true 
WHERE is_looking_for_place IS NULL;

-- 8. Create user statistics for existing users who don't have them
INSERT INTO user_statistics (user_id)
SELECT id FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_statistics)
ON CONFLICT (user_id) DO NOTHING;

-- 9. Create function to update user statistics
CREATE OR REPLACE FUNCTION update_user_statistics(
  p_user_id UUID,
  p_profile_views INTEGER DEFAULT NULL,
  p_applications_submitted INTEGER DEFAULT NULL,
  p_invitations_received INTEGER DEFAULT NULL,
  p_accepted_applications INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_statistics (
    user_id, 
    profile_views, 
    applications_submitted, 
    invitations_received, 
    accepted_applications,
    updated_at
  )
  VALUES (
    p_user_id,
    COALESCE(p_profile_views, 0),
    COALESCE(p_applications_submitted, 0),
    COALESCE(p_invitations_received, 0),
    COALESCE(p_accepted_applications, 0),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    profile_views = CASE WHEN p_profile_views IS NOT NULL THEN p_profile_views ELSE user_statistics.profile_views END,
    applications_submitted = CASE WHEN p_applications_submitted IS NOT NULL THEN p_applications_submitted ELSE user_statistics.applications_submitted END,
    invitations_received = CASE WHEN p_invitations_received IS NOT NULL THEN p_invitations_received ELSE user_statistics.invitations_received END,
    accepted_applications = CASE WHEN p_accepted_applications IS NOT NULL THEN p_accepted_applications ELSE user_statistics.accepted_applications END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_statistics TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE user_statistics IS 'Stores user activity statistics for analytics';
COMMENT ON FUNCTION update_user_statistics IS 'Updates user statistics with new values';
COMMENT ON FUNCTION create_user_statistics IS 'Automatically creates user statistics when profile is created';
