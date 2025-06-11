-- Fix missing updated_at column in user_roles table
-- This addresses the error: record "new" has no field "updated_at"

-- Add updated_at column to user_roles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_roles' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.user_roles 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        -- Update existing records to have the updated_at value
        UPDATE public.user_roles 
        SET updated_at = created_at 
        WHERE updated_at IS NULL;
        
        RAISE NOTICE 'Added updated_at column to user_roles table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in user_roles table';
    END IF;
END $$;

-- Create or replace the trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;

-- Create the trigger for user_roles table
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the fix by checking table structure
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_roles' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE 'SUCCESS: updated_at column exists in user_roles table';
    ELSE
        RAISE NOTICE 'ERROR: updated_at column still missing from user_roles table';
    END IF;
END $$;

-- Grant necessary permissions
GRANT UPDATE ON public.user_roles TO authenticated;
GRANT UPDATE ON public.user_roles TO service_role;

-- Add comment for documentation
COMMENT ON COLUMN public.user_roles.updated_at IS 'Timestamp of last update to this record';
