
-- Check if profile_picture_url column exists and add it if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' 
        AND column_name = 'profile_picture_url'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN profile_picture_url TEXT;
    END IF;
END $$;

-- Create a function to generate profile picture URLs
CREATE OR REPLACE FUNCTION get_profile_picture_url(user_id uuid, filename text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
    SELECT format('https://lxtkotgfsnahwncgcfnl.supabase.co/storage/v1/object/public/profile-pictures/%s/%s',
        user_id::text,
        filename
    );
$$;

-- Create a trigger function to automatically update profile_picture_url
CREATE OR REPLACE FUNCTION update_tenant_profile_picture_url()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When a profile picture is uploaded, update the tenant_profiles table
  IF NEW.bucket_id = 'profile-pictures' AND TG_OP = 'INSERT' THEN
    UPDATE tenant_profiles 
    SET profile_picture_url = format('https://lxtkotgfsnahwncgcfnl.supabase.co/storage/v1/object/public/profile-pictures/%s',
      NEW.name
    )
    WHERE user_id = (storage.foldername(NEW.name))[1]::uuid;
  END IF;
  
  -- When a profile picture is deleted, clear the URL
  IF OLD.bucket_id = 'profile-pictures' AND TG_OP = 'DELETE' THEN
    UPDATE tenant_profiles 
    SET profile_picture_url = NULL
    WHERE user_id = (storage.foldername(OLD.name))[1]::uuid;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_update_profile_picture_url ON storage.objects;
CREATE TRIGGER trigger_update_profile_picture_url
  AFTER INSERT OR DELETE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_profile_picture_url();
