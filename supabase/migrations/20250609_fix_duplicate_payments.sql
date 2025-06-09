-- Migration to fix duplicate payment records issue
-- This prevents multiple pending payments per user and adds cleanup logic

-- Add unique constraint to prevent multiple pending payments per user
-- Note: This uses a partial unique index which only applies when status = 'pending'
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS unique_pending_payment_per_user 
ON payment_records (user_id) 
WHERE status = 'pending';

-- Add session group field to track related payment attempts
ALTER TABLE payment_records 
ADD COLUMN IF NOT EXISTS payment_session_group UUID DEFAULT gen_random_uuid();

-- Add indexes for better query performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_records_user_status 
ON payment_records(user_id, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_records_latest 
ON payment_records(user_id, created_at DESC);

-- Add a function to cleanup orphaned pending payments
CREATE OR REPLACE FUNCTION cleanup_orphaned_pending_payments()
RETURNS TRIGGER AS $$
BEGIN
  -- When a payment is completed, cancel other pending payments for the same user
  IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
    UPDATE payment_records 
    SET status = 'cancelled', updated_at = NOW()
    WHERE user_id = NEW.user_id 
      AND status = 'pending' 
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically cleanup pending payments
DROP TRIGGER IF EXISTS trigger_cleanup_pending_payments ON payment_records;
CREATE TRIGGER trigger_cleanup_pending_payments
  AFTER UPDATE ON payment_records
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_orphaned_pending_payments();

-- Add a function to get latest payment status for a user
CREATE OR REPLACE FUNCTION get_user_payment_status(user_uuid UUID)
RETURNS TABLE (
  has_completed_payment BOOLEAN,
  latest_payment_status TEXT,
  subscription_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(
      SELECT 1 FROM payment_records 
      WHERE user_id = user_uuid AND status = 'completed'
    ) as has_completed_payment,
    (
      SELECT status FROM payment_records 
      WHERE user_id = user_uuid 
      ORDER BY created_at DESC 
      LIMIT 1
    ) as latest_payment_status,
    (
      SELECT ur.subscription_status FROM user_roles ur 
      WHERE ur.user_id = user_uuid
    ) as subscription_status;
END;
$$ LANGUAGE plpgsql;

-- Add comment explaining the constraint
COMMENT ON INDEX unique_pending_payment_per_user IS 
'Prevents multiple pending payment records per user to avoid payment modal issues';

-- Add comment explaining the cleanup function
COMMENT ON FUNCTION cleanup_orphaned_pending_payments() IS 
'Automatically cancels other pending payments when one payment is completed';

-- Add comment explaining the status function
COMMENT ON FUNCTION get_user_payment_status(UUID) IS 
'Returns comprehensive payment status for a user including subscription status';
