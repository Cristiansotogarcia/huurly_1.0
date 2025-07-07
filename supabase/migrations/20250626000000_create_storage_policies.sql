-- Create helper function to get first path segment
CREATE OR REPLACE FUNCTION public.filename_prefix(name text)
RETURNS text
LANGUAGE sql IMMUTABLE STRICT
AS $$
  SELECT split_part(name, '/', 1);
$$;

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for inserting into documents bucket
CREATE POLICY "Allow users to upload own documents" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND public.filename_prefix(name) = auth.uid()
);

-- Policy for deleting from documents bucket
CREATE POLICY "Allow users to delete own documents" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents' AND public.filename_prefix(name) = auth.uid()
);

-- Policy for selecting documents
CREATE POLICY "Allow users or reviewers/admin to read documents" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents' AND (
    public.filename_prefix(name) = auth.uid() OR EXISTS (
      SELECT 1 FROM public.gebruiker_rollen gr
      WHERE gr.user_id = auth.uid() AND gr.role IN ('reviewer', 'admin')
    )
  )
);

-- Policy for inserting into profile-pictures bucket
CREATE POLICY "Allow users to upload own profile pictures" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' AND public.filename_prefix(name) = auth.uid()
);

-- Policy for deleting from profile-pictures bucket
CREATE POLICY "Allow users to delete own profile pictures" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'profile-pictures' AND public.filename_prefix(name) = auth.uid()
);
