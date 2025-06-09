# 🔧 MANUAL STORAGE FIX REQUIRED

## 🚨 **ISSUE IDENTIFIED**

The error you're seeing:
```
POST https://lxtkotgfsnahwncgcfnl.supabase.co/storage/v1/object/documents/... 400 (Bad Request)
Storage upload error: {statusCode: '403', error: 'Unauthorized', message: 'new row violates row-level security policy'}
```

This is a **storage RLS policy issue** - the storage bucket doesn't have the correct permissions for users to upload files.

---

## 🔧 **MANUAL FIX REQUIRED**

Since the automated scripts can't set storage policies, you need to run this SQL manually in your Supabase dashboard:

### **Step 1: Go to Supabase Dashboard**
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query

### **Step 2: Run This SQL**

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Reviewers can view all documents" ON storage.objects;

-- Allow users to upload documents to their own folder
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow users to view their own documents
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow users to delete their own documents
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Allow reviewers to view all documents
CREATE POLICY "Reviewers can view all documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('Beoordelaar', 'Beheerder')
    )
  );
```

### **Step 3: Verify Storage Bucket**
1. Go to **Storage** in your Supabase dashboard
2. Make sure the **"documents"** bucket exists
3. If it doesn't exist, create it with these settings:
   - **Name**: `documents`
   - **Public**: `false` (unchecked)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/jpg, application/pdf`

---

## 🎯 **WHAT THIS FIXES**

These policies will allow:

1. **✅ Users can upload documents** to their own folder (`documents/{document_type}/{user_id}/`)
2. **✅ Users can view their own documents** 
3. **✅ Users can delete their own documents**
4. **✅ Reviewers can view all documents** for approval process

---

## 🧪 **TEST AFTER APPLYING**

After running the SQL:

1. **Login as Huurder** (cristiansotogarcia@gmail.com)
2. **Click "Documenten uploaden"**
3. **Upload a file** for any document type
4. **Expected Result**: File uploads successfully without 403 error

---

## 🚨 **CRITICAL NOTES**

- **This MUST be done manually** - automated scripts cannot set storage policies
- **Run the SQL exactly as shown** - don't modify the policy names or conditions
- **The bucket must exist** before the policies will work
- **Test immediately** after applying to verify it works

---

## 📞 **IF STILL NOT WORKING**

If you still get 403 errors after applying these policies:

1. **Check the bucket exists** and is named exactly "documents"
2. **Verify RLS is enabled** on storage.objects table
3. **Check the user is authenticated** (logged in properly)
4. **Verify the file path structure** matches the policy expectations

---

## 🎉 **EXPECTED RESULT**

After applying these storage policies:

- ✅ **No more 403 Unauthorized errors**
- ✅ **Files upload successfully to storage**
- ✅ **Database records are created**
- ✅ **Document upload flow completes**
- ✅ **Profile creation also works**

**This will completely fix both the document upload and profile creation issues! 🚀**
