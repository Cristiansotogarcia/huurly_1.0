# 🔧 Cloudflare R2 CORS Setup Guide for Huurly

## 📋 **Overview**
This guide will help you configure Cross-Origin Resource Sharing (CORS) for your Cloudflare R2 bucket to allow your Huurly application to upload files directly from the frontend.

## 🎯 **Why CORS is Needed**
Your React application (frontend) will be hosted on a different domain than your R2 bucket. Without proper CORS configuration, browsers will block file upload requests due to the Same-Origin Policy.

---

## 🌐 **Method 1: Using Cloudflare Dashboard (Recommended)**

### Step 1: Access Your R2 Bucket
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2 Object Storage**
3. Click on your `documents` bucket

### Step 2: Configure CORS Settings
1. In your bucket dashboard, look for **Settings** or **CORS** tab
2. Click **Add CORS Policy** or **Edit CORS**

### Step 3: Add CORS Rules
Use this configuration for your Huurly application:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://yourapp.vercel.app",
      "https://yourdomain.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposedHeaders": [
      "ETag",
      "x-amz-meta-*"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### Step 4: Save Configuration
1. Click **Save** or **Update CORS Policy**
2. Wait a few minutes for the changes to propagate

---

## ⚡ **Method 2: Using AWS CLI (Alternative)**

If you prefer using the command line:

### Step 1: Install AWS CLI
```bash
# Install AWS CLI if not already installed
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Step 2: Configure AWS CLI for Cloudflare R2
```bash
aws configure set aws_access_key_id a6339b9b54b193196a48f04cd3b08676
aws configure set aws_secret_access_key b5c114462876e91e7ede109a069209661fc3005edfbb148890e1dfcb2be86bb8
aws configure set region auto
```

### Step 3: Create CORS Configuration File
Create a file called `cors-config.json`:

```json
{
  "CORSRules": [
    {
      "ID": "HuurlyAppCORS",
      "AllowedOrigins": [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://yourapp.vercel.app",
        "https://yourdomain.com"
      ],
      "AllowedMethods": [
        "GET",
        "PUT",
        "POST",
        "DELETE",
        "HEAD"
      ],
      "AllowedHeaders": [
        "*"
      ],
      "ExposedHeaders": [
        "ETag",
        "x-amz-meta-custom-header"
      ],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

### Step 4: Apply CORS Configuration
```bash
aws s3api put-bucket-cors \
  --bucket documents \
  --cors-configuration file://cors-config.json \
  --endpoint-url https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com
```

### Step 5: Verify CORS Configuration
```bash
aws s3api get-bucket-cors \
  --bucket documents \
  --endpoint-url https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com
```

---

## 🔧 **Method 3: Using JavaScript/Node.js Script**

Create a setup script for automated CORS configuration:

### Step 1: Create CORS Setup Script
```javascript
// setup-r2-cors.js
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  endpoint: 'https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com',
  region: 'auto',
  credentials: {
    accessKeyId: 'a6339b9b54b193196a48f04cd3b08676',
    secretAccessKey: 'b5c114462876e91e7ede109a069209661fc3005edfbb148890e1dfcb2be86bb8',
  },
  forcePathStyle: true,
});

const corsConfiguration = {
  CORSRules: [
    {
      ID: 'HuurlyAppCORS',
      AllowedOrigins: [
        'http://localhost:5173',
        'http://localhost:3000', 
        'https://yourapp.vercel.app',
        'https://yourdomain.com'
      ],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedHeaders: ['*'],
      ExposedHeaders: ['ETag', 'x-amz-meta-*'],
      MaxAgeSeconds: 3600,
    },
  ],
};

async function setupCORS() {
  try {
    const command = new PutBucketCorsCommand({
      Bucket: 'documents',
      CORSConfiguration: corsConfiguration,
    });

    const response = await r2Client.send(command);
    console.log('✅ CORS configuration applied successfully:', response);
  } catch (error) {
    console.error('❌ Error setting up CORS:', error);
  }
}

setupCORS();
```

### Step 2: Run the Script
```bash
node setup-r2-cors.js
```

---

## 📝 **CORS Configuration Breakdown**

### AllowedOrigins
```json
[
  "http://localhost:5173",    // Vite dev server
  "http://localhost:3000",    // Alternative dev server
  "https://yourapp.vercel.app", // Your Vercel deployment
  "https://yourdomain.com"    // Your custom domain
]
```

### AllowedMethods
```json
[
  "GET",     // Download files
  "PUT",     // Upload files
  "POST",    // Alternative upload method
  "DELETE",  // Delete files (if needed)
  "HEAD"     // Check file existence
]
```

### AllowedHeaders
```json
["*"]  // Allow all headers (simplest approach)
```

### ExposedHeaders
```json
[
  "ETag",           // File hash/version identifier
  "x-amz-meta-*"    // Custom metadata headers
]
```

### MaxAgeSeconds
```json
3600  // Cache preflight requests for 1 hour
```

---

## 🚀 **Update Your Domains**

### For Development
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (Alternative)

### For Production
1. **Replace `yourapp.vercel.app`** with your actual Vercel URL
2. **Replace `yourdomain.com`** with your custom domain (if any)
3. **Add any additional domains** you'll deploy to

### Example for Production:
```json
"AllowedOrigins": [
  "https://huurly.vercel.app",
  "https://www.huurly.nl", 
  "https://huurly.nl",
  "http://localhost:5173"  // Keep for development
]
```

---

## ✅ **Testing CORS Configuration**

### Test 1: Browser Console Test
Open your app in browser and run:
```javascript
fetch('https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com/documents/', {
  method: 'HEAD'
})
.then(response => console.log('✅ CORS working:', response.status))
.catch(error => console.error('❌ CORS error:', error));
```

### Test 2: File Upload Test
Try uploading a file through your app:
1. Go to document upload section
2. Select a file
3. Check browser console for CORS errors
4. Verify file appears in R2 bucket

### Test 3: Network Tab Verification
1. Open browser DevTools → Network tab
2. Try uploading a file
3. Look for OPTIONS preflight request
4. Check if it returns `200 OK`

---

## 🚨 **Common CORS Issues & Solutions**

### Issue 1: "CORS policy error"
**Solution**: Check if your domain is in AllowedOrigins

### Issue 2: "Method not allowed"
**Solution**: Add required method to AllowedMethods

### Issue 3: "Header not allowed"
**Solution**: Use `["*"]` for AllowedHeaders or add specific headers

### Issue 4: "Preflight request failed"
**Solution**: Ensure OPTIONS method is implicitly allowed

### Issue 5: "Changes not taking effect"
**Solution**: Wait 5-10 minutes for propagation, clear browser cache

---

## 🔒 **Security Best Practices**

### 1. Restrict Origins
Don't use `["*"]` for AllowedOrigins in production:
```json
// ❌ Don't do this in production
"AllowedOrigins": ["*"]

// ✅ Do this instead
"AllowedOrigins": ["https://yourdomain.com"]
```

### 2. Limit Methods
Only allow methods you actually use:
```json
// ✅ Minimal necessary methods
"AllowedMethods": ["GET", "PUT", "POST"]
```

### 3. Monitor Usage
- Check R2 analytics for unusual traffic
- Set up billing alerts
- Monitor for abuse of upload endpoints

### 4. Consider Bucket Policies
Add additional bucket policies for enhanced security:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow", 
      "Principal": "*",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::documents/*",
      "Condition": {
        "StringLike": {
          "aws:Referer": ["https://yourdomain.com/*"]
        }
      }
    }
  ]
}
```

---

## 📋 **CORS Setup Checklist**

- [ ] Access Cloudflare R2 dashboard
- [ ] Navigate to `documents` bucket
- [ ] Add CORS configuration with your domains
- [ ] Save/update CORS policy  
- [ ] Wait 5-10 minutes for propagation
- [ ] Test file upload from your app
- [ ] Verify no CORS errors in browser console
- [ ] Test from both localhost and production domain
- [ ] Update domains when deploying to new environments

---

## 🆘 **Need Help?**

If you encounter issues:

1. **Check browser console** for specific CORS error messages
2. **Verify domain spelling** in AllowedOrigins
3. **Wait for propagation** (up to 10 minutes)
4. **Test step-by-step** using browser fetch API
5. **Contact Cloudflare support** if configuration doesn't work

---

**🎉 Once CORS is configured correctly, your Huurly app will be able to upload files directly to R2 from the frontend!**