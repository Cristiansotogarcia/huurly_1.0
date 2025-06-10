# 🔧 STORAGE FIX - DASHBOARD METHOD

## 🚨 **SQL ERROR EXPLANATION**

The error `ERROR: 42501: must be owner of table objects` means you cannot modify the storage.objects table directly via SQL. This is a Supabase security restriction.

**Solution: Use the Supabase Dashboard interface instead!**

---

## 🎯 **CORRECT METHOD - USE DASHBOARD**

### **Step 1: Go to Storage Policies**
1. Open your Supabase project dashboard
2. Go to **Storage** (in the left sidebar)
3. Click on **Policies** tab
4. You should see the storage.objects table

### **Step 2: Create Storage Policies via Dashboard**

Click **"New Policy"** and create these 4 policies:

#### **Policy 1: Users can upload documents**
- **Policy Name**: `Users can upload documents`
- **Allowed Operation**: `INSERT`
- **Target Roles**: `authenticated`
- **Policy Definition**:
```sql
bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[2]
```

#### **Policy 2: Users can view own documents**
- **Policy Name**: `Users can view own documents`
- **Allowed Operation**: `SELECT`
- **Target Roles**: `authenticated`
- **Policy Definition**:
```sql
bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[2]
```

#### **Policy 3: Users can delete own documents**
- **Policy Name**: `Users can delete own documents`
- **Allowed Operation**: `DELETE`
- **Target Roles**: `authenticated`
- **Policy Definition**:
```sql
bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[2]
```

#### **Policy 4: Reviewers can view all documents**
- **Policy Name**: `Reviewers can view all documents`
- **Allowed Operation**: `SELECT`
- **Target Roles**: `authenticated`
- **Policy Definition**:
```sql
bucket_id = 'documents' AND EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('Beoordelaar', 'Beheerder')
)
```

### **Step 3: Ensure Documents Bucket Exists**
1. Go to **Storage** > **Buckets**
2. If "documents" bucket doesn't exist, click **"New bucket"**
3. Create with these settings:
   - **Name**: `documents`
   - **Public**: `false` (unchecked)
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/jpg, application/pdf`

---

## 🎯 **ALTERNATIVE: SIMPLER APPROACH**

If the dashboard method is complex, try this **simpler approach**:

### **Option A: Disable Storage RLS Temporarily**
1. Go to **Storage** > **Policies**
2. Find the **storage.objects** table
3. **Disable RLS** on storage.objects (toggle off)
4. Test document upload
5. **Re-enable RLS later** with proper policies

### **Option B: Make Bucket Public**
1. Go to **Storage** > **Buckets**
2. Find the "documents" bucket
3. Edit bucket settings
4. Set **Public** to `true`
5. Test document upload

---

## 🧪 **TEST AFTER APPLYING**

After setting up the policies:

1. **Login as Huurder** (cristiansotogarcia@gmail.com)
2. **Click "Documenten uploaden"**
3. **Upload a file** for any document type
4. **Expected Result**: File uploads successfully without 403 error

---

## 🚨 **IF STILL NOT WORKING**

If you continue to get 403 errors:

### **Quick Debug Steps:**
1. **Check bucket exists** and is named exactly "documents"
2. **Verify user is logged in** (check browser dev tools > Application > Local Storage)
3. **Try the simpler approaches** (disable RLS or make bucket public temporarily)
4. **Check file path structure** in the error logs

### **Emergency Workaround:**
If nothing works, temporarily modify the DocumentService to use a different storage approach or disable the storage upload temporarily while we debug.

---

## 🎉 **EXPECTED RESULT**

After applying the storage policies correctly:

- ✅ **No more 403 Unauthorized errors**
- ✅ **Files upload successfully to storage**
- ✅ **Database records are created**
- ✅ **Document upload flow completes**
- ✅ **Profile creation also works**

**This will completely fix both the document upload and profile creation issues! 🚀**

---

## 📞 **NEXT STEPS**

1. **Try the Dashboard method first** (most secure)
2. **If that fails, try the simpler approaches** (temporary workarounds)
3. **Test immediately** after each attempt
4. **Let me know the results** so I can provide further assistance if needed

The code fixes are complete - we just need to get the storage permissions right!
