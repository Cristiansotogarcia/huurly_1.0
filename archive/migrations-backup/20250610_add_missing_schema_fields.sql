-- Phase 2: Add missing schema fields for production readiness
-- This migration adds fields that were identified as missing during Phase 1 audit

-- Add is_looking_for_place field to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_looking_for_place BOOLEAN DEFAULT true;

-- Add profile analytics fields
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create user_statistics table for real analytics
CREATE TABLE IF NOT EXISTS user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_views INTEGER DEFAULT 0,
  applications_sent INTEGER DEFAULT 0,
  invitations_received INTEGER DEFAULT 0,
  invitations_sent INTEGER DEFAULT 0,
  properties_viewed INTEGER DEFAULT 0,
  documents_uploaded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create viewing_invitations table for real invitation tracking
CREATE TABLE IF NOT EXISTS viewing_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_applications table for real application tracking
CREATE TABLE IF NOT EXISTS property_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected', 'withdrawn')),
  application_message TEXT,
  landlord_response TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, tenant_id)
);

-- Create activity_logs table for real activity tracking
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  related_id UUID,
  related_type VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio_reviews table for document review tracking
CREATE TABLE IF NOT EXISTS portfolio_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'requires_changes')),
  review_notes TEXT,
  reviewed_documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_viewing_invitations_tenant_id ON viewing_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_viewing_invitations_landlord_id ON viewing_invitations(landlord_id);
CREATE INDEX IF NOT EXISTS idx_viewing_invitations_property_id ON viewing_invitations(property_id);
CREATE INDEX IF NOT EXISTS idx_viewing_invitations_status ON viewing_invitations(status);
CREATE INDEX IF NOT EXISTS idx_property_applications_tenant_id ON property_applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_applications_landlord_id ON property_applications(landlord_id);
CREATE INDEX IF NOT EXISTS idx_property_applications_property_id ON property_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_property_applications_status ON property_applications(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_reviews_user_id ON portfolio_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_reviews_reviewer_id ON portfolio_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_reviews_status ON portfolio_reviews(status);

-- Add RLS policies for new tables
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_statistics
CREATE POLICY "Users can view their own statistics" ON user_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" ON user_statistics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert statistics" ON user_statistics
  FOR INSERT WITH CHECK (true);

-- RLS policies for viewing_invitations
CREATE POLICY "Users can view their own invitations" ON viewing_invitations
  FOR SELECT USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

CREATE POLICY "Landlords can create invitations" ON viewing_invitations
  FOR INSERT WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Users can update their own invitations" ON viewing_invitations
  FOR UPDATE USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

-- RLS policies for property_applications
CREATE POLICY "Users can view their own applications" ON property_applications
  FOR SELECT USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

CREATE POLICY "Tenants can create applications" ON property_applications
  FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Users can update their own applications" ON property_applications
  FOR UPDATE USING (auth.uid() = tenant_id OR auth.uid() = landlord_id);

-- RLS policies for activity_logs
CREATE POLICY "Users can view their own activity" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- RLS policies for portfolio_reviews
CREATE POLICY "Users can view their own reviews" ON portfolio_reviews
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can create reviews" ON portfolio_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can update reviews" ON portfolio_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Create trigger to automatically create user_statistics when user profile is created
CREATE OR REPLACE FUNCTION create_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_statistics (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_statistics
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_statistics();

-- Update existing user profiles to have statistics
INSERT INTO user_statistics (user_id)
SELECT user_id FROM user_profiles
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE user_statistics IS 'Tracks user engagement statistics for dashboard display';
COMMENT ON TABLE viewing_invitations IS 'Tracks viewing invitations between landlords and tenants';
COMMENT ON TABLE property_applications IS 'Tracks property applications from tenants to landlords';
COMMENT ON TABLE activity_logs IS 'Tracks user activity for dashboard recent activity feeds';
COMMENT ON TABLE portfolio_reviews IS 'Tracks document portfolio reviews by assessors';
