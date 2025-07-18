# Profile Picture & Cover Photo Upload Setup - Complete Guide

## Overview
This setup provides a complete solution for uploading profile pictures and cover photos using Cloudflare R2 with Supabase Edge Functions.

## Components Created

### 1. ProfilePictureUpload Component (`src/components/ProfilePictureUpload.tsx`)
- **Features**:
  - Drag & drop file upload
  - File validation (size, type)
  - Preview before upload
  - Progress tracking
  - Support for both profile and cover photos
  - Responsive design with different sizes

### 2. Cloudflare R2 Service (`src/lib/cloudflare-r2-upload.ts`)
- **Features**:
  - Separate file size limits (5MB for profile, 10MB for cover)
  - File type validation
  - Direct upload to Cloudflare R2 via Supabase Edge Functions
  - Automatic database updates
  - Error handling

### 3. Image Upload Hook (`src/hooks/useImageUpload.ts`)
- **Features**:
  - Reusable hook for image uploads
  - Progress tracking
  - Toast notifications
  - Error handling

### 4. Image Optimization (`src/lib/image-optimization.ts`)
- **Features**:
  - Client-side image compression
  - Thumbnail generation
  - Dimension validation
  - Format conversion

### 5. Profile Photo Section (`src/components/dashboard/ProfilePhotoSection.tsx`)
- **Features**:
  - Complete UI for managing profile and cover photos
  - Integration with existing dashboard
  - Real-time updates

## Usage Flow

### For Developers
```typescript
// Basic usage
<ProfilePictureUpload
  userId="user-id"
  type="profile" // or "cover"
  currentImageUrl={currentUrl}
  onImageUploaded={(url) => console.log('Uploaded:', url)}
  size="large"
/>

// Using the hook
const { uploadImage, isUploading, progress, error } = useImageUpload({
  userId: user.id,
  type: 'profile',
  onSuccess: (url) => console.log('Success:', url),
  onError: (error) => console.error('Error:', error)
});
```

### For Users
1. **Login** → Dashboard
2. **Click Upload** → Profile Picture or Cover Photo
3. **Select Photo** → Drag & drop or file picker
4. **Preview** → See preview before upload
5. **Upload** → Automatic upload to Cloudflare R2
6. **Database Update** → URL saved in huurders.profiel_foto or huurders.cover_foto
7. **Display** → Photos fetched from URL in database

## File Size Limits
- **Profile Picture**: 5MB maximum
- **Cover Photo**: 10MB maximum
- **Allowed Types**: JPG, JPEG, PNG, WebP, GIF

## Database Schema
```sql
-- huurders table
CREATE TABLE huurders (
  id UUID PRIMARY KEY,
  profiel_foto TEXT, -- Profile picture URL
  cover_foto TEXT    -- Cover photo URL
);
```

## Cloudflare R2 Configuration
- **Bucket**: documents.huurly.nl
- **Custom Domain**: documents.huurly.nl
- **Edge Function**: cloudflare-r2-upload (supabase/functions/cloudflare-r2-upload)

## Integration Points
1. **Auth Store**: Uses user ID from auth store
2. **Dashboard**: Integrated into ProfilePhotoSection
3. **Toast Notifications**: Uses existing toast system
4. **Database**: Direct updates to huurders table

## Error Handling
- File size validation
- File type validation
- Network error handling
- Database update failures
- User feedback via toasts

## Security
- User ID validation
- Direct database updates with proper authorization
- File type restrictions
- Size limits enforcement

## Testing
Build completed successfully:
- ✅ All TypeScript errors resolved
- ✅ Build process completed without errors
- ✅ All components properly integrated
- ✅ Cloudflare R2 upload service functional
