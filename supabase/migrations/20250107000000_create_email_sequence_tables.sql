-- Email sequence system tables for tracking email preferences, sent emails, and user lifecycle events
-- Created: 2025-01-07

-- ====================================================================================
-- TABLE: email_preferences
-- Purpose: Track user email subscription preferences and unsubscribe status
-- ====================================================================================
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  unsubscribed_from_reminders boolean DEFAULT false,
  unsubscribed_from_marketing boolean DEFAULT false,
  unsubscribed_at timestamptz,
  unsubscribe_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own preferences
CREATE POLICY "Users can view own email preferences"
  ON public.email_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own preferences
CREATE POLICY "Users can update own email preferences"
  ON public.email_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: System can insert preferences
CREATE POLICY "System can insert email preferences"
  ON public.email_preferences
  FOR INSERT
  WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id 
  ON public.email_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_email_preferences_unsubscribed 
  ON public.email_preferences(unsubscribed_from_reminders) 
  WHERE unsubscribed_from_reminders = true;

-- ====================================================================================
-- TABLE: email_sequence_log
-- Purpose: Track all emails sent as part of the automated sequences
-- ====================================================================================
CREATE TABLE IF NOT EXISTS public.email_sequence_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sequence_type text NOT NULL, -- 'unverified', 'unpaid', 'incomplete_profile'
  email_number integer NOT NULL, -- 1, 2, 3, 4 (which email in the sequence)
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  clicked_at timestamptz,
  status text DEFAULT 'sent', -- 'sent', 'delivered', 'bounced', 'failed'
  resend_message_id text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_sequence_type CHECK (sequence_type IN ('unverified', 'unpaid', 'incomplete_profile')),
  CONSTRAINT valid_status CHECK (status IN ('sent', 'delivered', 'bounced', 'failed')),
  CONSTRAINT valid_email_number CHECK (email_number BETWEEN 1 AND 10)
);

-- Enable RLS
ALTER TABLE public.email_sequence_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own email log
CREATE POLICY "Users can view own email log"
  ON public.email_sequence_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: System can insert logs
CREATE POLICY "System can insert email logs"
  ON public.email_sequence_log
  FOR INSERT
  WITH CHECK (true);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_email_sequence_user_id 
  ON public.email_sequence_log(user_id);

CREATE INDEX IF NOT EXISTS idx_email_sequence_type 
  ON public.email_sequence_log(sequence_type);

CREATE INDEX IF NOT EXISTS idx_email_sequence_sent_at 
  ON public.email_sequence_log(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_sequence_user_type 
  ON public.email_sequence_log(user_id, sequence_type, email_number);

-- ====================================================================================
-- TABLE: user_lifecycle_events
-- Purpose: Track major user lifecycle milestones (signup, verification, payment, profile completion)
-- ====================================================================================
CREATE TABLE IF NOT EXISTS public.user_lifecycle_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL, -- 'signup', 'email_verified', 'payment_completed', 'profile_completed'
  event_data jsonb,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_event_type CHECK (event_type IN ('signup', 'email_verified', 'payment_completed', 'profile_completed', 'account_deleted'))
);

-- Enable RLS
ALTER TABLE public.user_lifecycle_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own events
CREATE POLICY "Users can view own lifecycle events"
  ON public.user_lifecycle_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: System can insert events
CREATE POLICY "System can insert lifecycle events"
  ON public.user_lifecycle_events
  FOR INSERT
  WITH CHECK (true);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_lifecycle_user_id 
  ON public.user_lifecycle_events(user_id);

CREATE INDEX IF NOT EXISTS idx_lifecycle_event_type 
  ON public.user_lifecycle_events(event_type);

CREATE INDEX IF NOT EXISTS idx_lifecycle_created_at 
  ON public.user_lifecycle_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lifecycle_user_event 
  ON public.user_lifecycle_events(user_id, event_type);

-- ====================================================================================
-- FUNCTION: Get last email sent for a user in a specific sequence
-- ====================================================================================
CREATE OR REPLACE FUNCTION get_last_sequence_email(p_user_id uuid, p_sequence_type text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_email_num integer;
BEGIN
  SELECT COALESCE(MAX(email_number), 0)
  INTO last_email_num
  FROM public.email_sequence_log
  WHERE user_id = p_user_id
    AND sequence_type = p_sequence_type
    AND status = 'sent';
    
  RETURN last_email_num;
END;
$$;

-- ====================================================================================
-- FUNCTION: Check if user should receive email
-- Returns true if user is not unsubscribed and hasn't received this email yet
-- ====================================================================================
CREATE OR REPLACE FUNCTION should_send_email(
  p_user_id uuid, 
  p_sequence_type text, 
  p_email_number integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_unsubscribed boolean;
  already_sent boolean;
BEGIN
  -- Check if user is unsubscribed
  SELECT COALESCE(unsubscribed_from_reminders, false)
  INTO is_unsubscribed
  FROM public.email_preferences
  WHERE user_id = p_user_id;
  
  -- If user is unsubscribed, don't send
  IF is_unsubscribed = true THEN
    RETURN false;
  END IF;
  
  -- Check if this specific email was already sent
  SELECT EXISTS(
    SELECT 1
    FROM public.email_sequence_log
    WHERE user_id = p_user_id
      AND sequence_type = p_sequence_type
      AND email_number = p_email_number
      AND status = 'sent'
  ) INTO already_sent;
  
  -- Don't send if already sent
  IF already_sent = true THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- ====================================================================================
-- FUNCTION: Update timestamp when preferences are modified
-- ====================================================================================
CREATE OR REPLACE FUNCTION update_email_preferences_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_preferences_timestamp();

-- ====================================================================================
-- GRANT PERMISSIONS
-- ====================================================================================
GRANT SELECT, INSERT, UPDATE ON public.email_preferences TO authenticated;
GRANT SELECT, INSERT ON public.email_sequence_log TO authenticated;
GRANT SELECT, INSERT ON public.user_lifecycle_events TO authenticated;

GRANT EXECUTE ON FUNCTION get_last_sequence_email(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION should_send_email(uuid, text, integer) TO authenticated;

-- ====================================================================================
-- COMMENTS FOR DOCUMENTATION
-- ====================================================================================
COMMENT ON TABLE public.email_preferences IS 'Stores user email subscription preferences and unsubscribe status';
COMMENT ON TABLE public.email_sequence_log IS 'Tracks all automated emails sent to users (unverified, unpaid, incomplete profile sequences)';
COMMENT ON TABLE public.user_lifecycle_events IS 'Records major user lifecycle milestones for triggering email sequences';

COMMENT ON FUNCTION get_last_sequence_email(uuid, text) IS 'Returns the number of the last email sent in a sequence for a user';
COMMENT ON FUNCTION should_send_email(uuid, text, integer) IS 'Checks if a user should receive a specific email (not unsubscribed + not already sent)';

-- ====================================================================================
-- FUNCTION: Get unpaid but verified users for email sequence
-- ====================================================================================
CREATE OR REPLACE FUNCTION get_unpaid_verified_users()
RETURNS TABLE (
  id uuid,
  email text,
  email_confirmed_at timestamptz,
  created_at timestamptz,
  raw_user_meta_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.raw_user_meta_data
  FROM auth.users u
  LEFT JOIN public.abonnementen a ON u.id = a.huurder_id AND a.status = 'actief'
  WHERE u.email_confirmed_at IS NOT NULL
    AND a.id IS NULL -- No active subscription
  ORDER BY u.email_confirmed_at DESC;
END;
$$;

-- ====================================================================================
-- FUNCTION: Get paid users with incomplete profiles for email sequence
-- ====================================================================================
CREATE OR REPLACE FUNCTION get_paid_incomplete_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  raw_user_meta_data jsonb,
  profiel_compleet boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data,
    COALESCE(g.profiel_compleet, false) as profiel_compleet
  FROM auth.users u
  INNER JOIN public.abonnementen a ON u.id = a.huurder_id AND a.status = 'actief'
  INNER JOIN public.gebruikers g ON u.id = g.id
  WHERE COALESCE(g.profiel_compleet, false) = false
  ORDER BY u.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_unpaid_verified_users() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_paid_incomplete_users() TO authenticated, service_role;

-- Add comments
COMMENT ON FUNCTION get_unpaid_verified_users() IS 'Returns users who have verified email but no active subscription';
COMMENT ON FUNCTION get_paid_incomplete_users() IS 'Returns users with active subscription but incomplete profile';
