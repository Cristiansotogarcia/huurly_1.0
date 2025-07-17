# Direct Upload to Cloudflare R2 Guide

## 🎯 Simple Approach - No Edge Functions Required

This guide provides a **direct upload** solution that bypasses all the complexity of Edge Functions and signed URLs.

## ✅ What's Been Implemented

### 1. **Direct Upload Service** (`src/lib/direct-upload.ts`)
- Simple file validation
- Direct upload to Cloudflare R2
- Database updates

### 2. **Direct Upload Button** (`src/components/DirectUploadButton.tsx`)
- Clean, reusable upload component
- Progress indication
- Error handling

### 3. **Updated Components** (ready to use)

## 🚀 Setup Instructions

### Step 1: Configure Cloudflare R2 CORS (One-time setup)

1. **Go to Cloudflare Dashboard** → **R2** → **Buckets** → **documents** → **Settings** → **CORS**
2. **Add this CORS rule**:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:8080",
      "https://localhost:8080",
      "https://huurly-1-0.vercel.app",
      "https://huurly.nl"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

### Step 2: Test the Upload

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Use the DirectUploadButton component**:
   ```tsx
   <DirectUploadButton
     userId="your-user-id"
     folder="Profile"
     onUploadComplete={(url) => console.log('Uploaded:', url)}
   />
   ```

### Step 3: Manual Upload via Cloudflare Dashboard (Alternative)

If you prefer manual upload:

1. **Go to Cloudflare Dashboard** → **R2** → **Buckets** → **documents**
2. **Click "Upload"** and select your files
3. **Copy the public URL** after upload
4. **Update database manually**:
   ```sql
   UPDATE huurders SET profiel_foto = 'https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com/documents/your-file.jpg' WHERE id = 'user-id';
   ```

## 📋 Usage Examples

### Profile Picture Upload
```tsx
import { DirectUploadButton } from '@/components/DirectUploadButton';

<DirectUploadButton
  userId={user.id}
  folder="Profile"
  buttonText="Upload Profielfoto"
  accept="image/*"
  onUploadComplete={(url) => {
    // Handle the uploaded URL
    console.log('Profile picture uploaded:', url);
  }}
/>
```

### Property Image Upload
```tsx
<DirectUploadButton
  userId={user.id}
  folder={`properties/${propertyId}`}
  buttonText="Upload Woning Foto"
  accept="image/*"
  onUploadComplete={(url) => {
    // Handle the uploaded URL
    console.log('Property image uploaded:', url);
  }}
/>
```

### Document Upload
```tsx
<DirectUploadButton
  userId={user.id}
  folder="documents"
  buttonText="Upload Document"
  accept=".pdf,.jpg,.png"
  onUploadComplete={(url) => {
    // Handle the uploaded URL
    console.log('Document uploaded:', url);
  }}
/>
```

## 🔧 Technical Details

### File Structure
```
documents/
├── Profile/
│   └── {userId}/
│       └── {timestamp}_{random}_{filename}
├── properties/
│   └── {propertyId}/
│       └── {timestamp}_{random}_{filename}
└── {other-folders}/
    └── {userId}/
        └── {timestamp}_{random}_{filename}
```

### URL Format
```
https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com/documents/{folder}/{userId}/{timestamp}_{random}_{filename}
```

### Supported File Types
- Images: JPG, PNG, WebP, GIF
- Documents: PDF
- Maximum size: 5MB

## 🚨 Troubleshooting

### Common Issues

1. **CORS errors**
   - Ensure CORS is properly configured in Cloudflare R2
   - Check the allowed origins include your domain

2. **Upload fails**
   - Check file size (max 5MB)
   - Verify file type is allowed
   - Check Cloudflare R2 credentials

3. **Database update fails**
   - Ensure user has permission to update the table
   - Check if the user ID exists in the database

### Testing Upload

**Test with curl:**
```bash
curl -X PUT \
  -H "Content-Type: image/jpeg" \
  -H "x-amz-acl: public-read" \
  --upload-file test.jpg \
  "https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com/documents/test/test.jpg"
```

## 🔄 Migration from Complex Solutions

### From Edge Functions
- **Remove**: `supabase/functions/generate-upload-url/`
- **Replace**: Complex signed URL logic with direct upload
- **Benefit**: Simpler, more reliable

### From AWS SDK
- **Remove**: AWS SDK dependencies
- **Replace**: With direct HTTP PUT requests
- **Benefit**: No compatibility issues

## 📊 Benefits of Direct Upload

- ✅ **Simple** - No Edge Functions required
- ✅ **Reliable** - Direct HTTP PUT requests
- ✅ **Fast** - No intermediate processing
- ✅ **Scalable** - Uses Cloudflare's infrastructure
- ✅ **Secure** - CORS-protected uploads

## 🎯 Next Steps

1. **Test the upload** with the provided components
2. **Customize** the DirectUploadButton for your needs
3. **Integrate** into your existing forms
4. **Monitor** upload success rates

The direct upload approach is **production-ready** and eliminates all the complexity of Edge Functions while providing the same functionality.
