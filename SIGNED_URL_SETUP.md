# Signed URL Upload Setup Guide

## 🎯 Overview
This guide helps you set up a **CORS-free** upload system using **signed URLs** via Supabase Edge Functions. This approach completely bypasses CORS issues by having the client upload directly to Cloudflare R2 using pre-signed URLs.

## ✅ What's Been Implemented

### 1. **Supabase Edge Function** (`supabase/functions/generate-upload-url/index.ts`)
- Generates signed URLs for direct upload to Cloudflare R2
- Handles CORS automatically
- Validates file types and sizes
- Creates unique file paths

### 2. **Signed URL Storage Service** (`src/lib/storage-signed.ts`)
- New storage service using signed URLs
- Compatible with existing components
- Bypasses all CORS issues

### 3. **Updated Components**
- `ProfilePictureUpload.tsx` - Now uses signed URLs
- `CoverPhotoUpload.tsx` - Now uses signed URLs

## 🚀 Setup Instructions

### Step 1: Deploy the Edge Function

```bash
# Make the script executable
chmod +x deploy-signed-url-function.sh

# Deploy the function
./deploy-signed-url-function.sh

# Or deploy manually:
supabase functions deploy generate-upload-url --no-verify-jwt
```

### Step 2: Configure Environment Variables in Supabase

Go to **Supabase Dashboard** → **Settings** → **Edge Functions** → **generate-upload-url** → **Settings** and add these environment variables:

```bash
CLOUDFLARE_ACCOUNT_ID=5c65d8c11ba2e5ee7face692ed22ad1c
CLOUDFLARE_R2_ACCESS_KEY=a6339b9b54b193196a48f04cd3b08676
CLOUDFLARE_R2_SECRET_KEY=b5c114462876e91e7ede109a069209661fc3005edfbb148890e1dfcb2be86bb8
CLOUDFLARE_R2_BUCKET=documents
CLOUDFLARE_R2_ENDPOINT=https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com
```

### Step 3: Test the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test the upload**:
   - Go to your profile page
   - Try uploading a profile picture
   - Check Cloudflare R2 dashboard for uploaded files

### Step 4: Verify Function Deployment

Test the function directly:
```bash
curl -X POST https://sqhultitvpivlnlgogen.supabase.co/functions/v1/generate-upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.jpg",
    "fileType": "image/jpeg",
    "userId": "test-user-id",
    "folder": "Profile"
  }'
```

## 🔧 How It Works

### 1. **Flow Diagram**
```
Client → Supabase Edge Function → Cloudflare R2 (Signed URL) → Direct Upload
```

### 2. **Process**
1. Client requests signed URL from Supabase Edge Function
2. Edge Function generates signed URL with Cloudflare R2
3. Client uploads file directly to Cloudflare R2 using signed URL
4. No CORS issues because upload happens directly to R2

### 3. **Benefits**
- ✅ **No CORS issues**
- ✅ **Secure** - URLs expire after 1 hour
- ✅ **Scalable** - Uses Supabase Edge Functions
- ✅ **Compatible** - Works with existing components

## 📋 File Structure

```
supabase/
├── functions/
│   └── generate-upload-url/
│       └── index.ts          # Edge function for signed URLs
src/
├── lib/
│   ├── storage-signed.ts     # New signed URL storage service
│   └── storage.ts            # Original storage service (deprecated)
├── components/
│   ├── ProfilePictureUpload.tsx  # Updated to use signed URLs
│   └── CoverPhotoUpload.tsx      # Updated to use signed URLs
```

## 🧪 Testing

### Test the Edge Function
```javascript
// In browser console
const testUpload = async () => {
  const response = await fetch('https://sqhultitvpivlnlgogen.supabase.co/functions/v1/generate-upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: 'test.jpg',
      fileType: 'image/jpeg',
      userId: 'test-user',
      folder: 'Profile'
    })
  });
  
  const data = await response.json();
  console.log('Signed URL:', data.signedUrl);
  console.log('Public URL:', data.publicUrl);
};
```

### Test File Upload
```javascript
// Test direct upload to signed URL
const testDirectUpload = async (file) => {
  const { data } = await supabase.functions.invoke('generate-upload-url', {
    body: { fileName: file.name, fileType: file.type, userId: 'test-user' }
  });
  
  const response = await fetch(data.signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  });
  
  console.log('Upload status:', response.status);
};
```

## 🚨 Troubleshooting

### Common Issues

1. **Function not found**
   - Ensure function is deployed: `supabase functions list`
   - Check function name matches exactly

2. **Environment variables missing**
   - Verify all required variables are set in Supabase
   - Check for typos in variable names

3. **Upload fails**
   - Check file size (max 5MB)
   - Verify file type is allowed
   - Check Cloudflare R2 credentials

4. **CORS errors**
   - The signed URL approach should eliminate CORS issues
   - If still seeing CORS, check the Edge Function is properly deployed

## 🔄 Migration from Old System

### Old → New
- **Old**: Direct AWS SDK calls → **New**: Signed URLs via Edge Functions
- **Old**: CORS issues → **New**: CORS-free uploads
- **Old**: Client-side credentials → **New**: Server-side credentials

### No Breaking Changes
- All existing components work with new service
- Same API interface (`uploadProfilePicture`, `uploadFile`, etc.)
- Same return format

## 📊 Performance Benefits

- **Faster uploads** - Direct to Cloudflare R2
- **Better security** - Credentials never exposed to client
- **No CORS overhead** - Eliminates preflight requests
- **Scalable** - Edge Functions handle load automatically
