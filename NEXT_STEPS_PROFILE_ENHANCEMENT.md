# Next Steps for Profile Enhancement - Implementation Plan

## 📋 Remaining Steps Overview (4 Steps Total)

### **Step 1: Create Profile Pictures Storage Bucket** (Manual - You need to do this)
**Status**: ⏳ Waiting for manual completion

**Instructions for you:**
1. Go to your Supabase Dashboard
2. Navigate to **Storage** section
3. Click **"New Bucket"**
4. Create bucket with these settings:
   - **Bucket name**: `profile-pictures`
   - **Public bucket**: ✅ Yes (checked)
   - **File size limit**: `5MB`
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp`

5. After creating the bucket, go to **Storage > Policies**
6. Add these RLS policies for the `profile-pictures` bucket:

```sql
-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to view profile pictures
CREATE POLICY "Anyone can view profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Please confirm when you've completed this step.**

---

### **Step 2: Implement Profile Picture Upload Functionality** (I'll do this)
**Status**: 🔄 Ready to implement after Step 1

**What I'll implement:**
- Actual file upload functionality in the modal
- Image preview and validation
- Integration with Supabase storage
- Error handling for upload failures
- File size and type validation

---

### **Step 3: Add Profile Data Loading for Editing** (I'll do this)
**Status**: 🔄 Ready to implement

**What I'll implement:**
- Load existing profile data when modal opens for editing
- Pre-populate all form fields with current data
- Handle cases where profile doesn't exist yet
- Ensure smooth transition between create and edit modes

---

### **Step 4: Update UserService for Enhanced Fields** (I'll do this)
**Status**: 🔄 Ready to implement

**What I'll implement:**
- Update UserService to handle all new enhanced fields
- Ensure proper data mapping for new fields (sex, smoking_details, etc.)
- Add validation for enhanced profile data
- Update database queries to include new fields

---

## 🎯 Current Status Summary

✅ **Completed:**
- Enhanced Profile Modal UI with all 7 steps
- Database schema updates (sex, smoking_details fields)
- Dutch cities and neighborhoods data (125+ neighborhoods, 21 cities)
- Enhanced smoking section with detailed options
- Gender/sex selection field
- Button text correction
- Comprehensive city/neighborhood selection
- RLS policies for cities data

⏳ **Next Action Required:**
- **You need to create the storage bucket manually** (Step 1)
- Then I'll continue with Steps 2-4 automatically

## 📊 Progress Tracking

- **Step 1**: ⏳ Manual bucket creation (Your action needed)
- **Step 2**: 🔄 Profile picture upload (Ready after Step 1)
- **Step 3**: 🔄 Profile data loading (Ready)
- **Step 4**: 🔄 UserService updates (Ready)

**Total Estimated Time**: 2-3 hours after bucket creation

---

## 🚀 Ready to Continue

Once you confirm the storage bucket is created, I'll immediately proceed with implementing Steps 2-4 to complete the enhanced profile system.

**Please let me know when you've completed Step 1 (storage bucket creation).**
