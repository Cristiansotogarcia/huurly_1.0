-- Create profile-pictures storage bucket and set up RLS policies
-- This script sets up the storage bucket for profile pictures with proper security

-- Create the profile-pictures bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own profile pictures
CREATE POLICY "Users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Anyone can view profile pictures (public bucket)
CREATE POLICY "Anyone can view profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

-- Create a function to generate profile picture URLs
CREATE OR REPLACE FUNCTION get_profile_picture_url(user_id uuid, filename text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN format('https://%s/storage/v1/object/public/profile-pictures/%s/%s',
    current_setting('app.supabase_url', true),
    user_id::text,
    filename
  );
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_profile_picture_url(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_profile_picture_url(uuid, text) TO anon;

-- Add a trigger to automatically update profile_picture_url in tenant_profiles
CREATE OR REPLACE FUNCTION update_tenant_profile_picture_url()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When a profile picture is uploaded, update the tenant_profiles table
  IF NEW.bucket_id = 'profile-pictures' AND TG_OP = 'INSERT' THEN
    UPDATE tenant_profiles 
    SET profile_picture_url = format('https://%s/storage/v1/object/public/profile-pictures/%s',
      current_setting('app.supabase_url', true),
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

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_profile_picture_url ON storage.objects;
CREATE TRIGGER trigger_update_profile_picture_url
  AFTER INSERT OR DELETE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_profile_picture_url();

-- Add comments for documentation
COMMENT ON FUNCTION get_profile_picture_url(uuid, text) IS 'Generate a public URL for a user profile picture';
COMMENT ON FUNCTION update_tenant_profile_picture_url() IS 'Automatically update tenant_profiles.profile_picture_url when profile pictures are uploaded/deleted';
