# Cloudflare R2 Setup & Troubleshooting Guide

## Current Status
✅ Environment variables are correctly configured
❌ CORS/Authentication issue preventing uploads

## Step 1: Create New Cloudflare API Token

1. **Go to Cloudflare Dashboard** → My Profile → API Tokens
2. **Create Custom Token** with these permissions:
   - **Account**: Read (for account ID)
   - **Cloudflare R2**: Edit (for bucket operations)
   - **Zone**: Read (if using custom domains)

3. **Token Configuration**:
   ```
   Token Name: Huurly R2 Upload Token
   Permissions:
   - Account: Cloudflare R2:Edit
   - Account: Account:Read
   Resources:
   - Include: Account: [Your Account ID]
   - Include: R2 Bucket: documents
   ```

4. **Copy the new token** (starts with something like `5c65d8c11ba2e5ee7face692ed22ad1c`)

## Step 2: Update Environment Variables

Replace your current `.env` file with:

```bash
# Cloudflare R2 - NEW API TOKEN APPROACH
VITE_CLOUDFLARE_R2_ENDPOINT=https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com
VITE_CLOUDFLARE_R2_ACCESS_KEY=a6339b9b54b193196a48f04cd3b08676
VITE_CLOUDFLARE_R2_SECRET_KEY=b5c114462876e91e7ede109a069209661fc3005edfbb148890e1dfcb2be86bb8
VITE_CLOUDFLARE_R2_BUCKET=documents
VITE_CLOUDFLARE_ACCOUNT_ID=5c65d8c11ba2e5ee7face692ed22ad1c
```

## Step 3: Verify CORS Configuration

### Check CORS Settings in Cloudflare:
1. **R2 Dashboard** → Buckets → documents → Settings → CORS
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

## Step 4: Alternative Solutions

### Option A: Use Cloudflare Workers (Recommended)
Create a Cloudflare Worker to handle uploads with proper CORS:

1. **Create Worker** in Cloudflare Dashboard
2. **Use this code**:

```javascript
// Cloudflare Worker script
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, HEAD',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      }
    })
  }

  // Handle actual requests
  const response = await fetch(request)
  
  // Add CORS headers
  response = new Response(response.body, response)
  response.headers.set('Access-Control-Allow-Origin', '*')
  
  return response
}
```

### Option B: Use Supabase Storage Instead
If Cloudflare R2 continues to have issues, consider using Supabase Storage:

1. **Enable Supabase Storage** in your Supabase project
2. **Update storage service** to use Supabase instead

## Step 5: Test Configuration

### Test 1: Basic Connectivity
```bash
# Test with curl
curl -X PUT \
  -H "Content-Type: text/plain" \
  -H "x-amz-content-sha256: UNSIGNED-PAYLOAD" \
  -d "test" \
  "https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com/documents/test.txt"
```

### Test 2: Browser Test
Run the test script in browser console:
```javascript
// Copy and paste in browser console at localhost:8080
fetch('https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com/documents/test.txt', {
  method: 'PUT',
  headers: {
    'Content-Type': 'text/plain',
  },
  body: 'test',
  mode: 'cors'
}).then(r => console.log('Success:', r.status)).catch(e => console.error('Error:', e))
```

## Step 6: Debug Common Issues

### Issue 1: 403 Forbidden
- **Cause**: Incorrect credentials or permissions
- **Solution**: Verify API token has R2:Edit permission

### Issue 2: CORS Preflight Failed
- **Cause**: CORS not configured for PUT/POST methods
- **Solution**: Add PUT/POST to AllowedMethods in CORS

### Issue 3: Signature Mismatch
- **Cause**: Incorrect endpoint format
- **Solution**: Ensure endpoint ends with `.r2.cloudflarestorage.com`

## Quick Fix Commands

### Check current configuration:
```bash
node check-config.mjs
```

### Test CORS:
```bash
node test-cors-fix.js
```

## Next Steps
1. **Create new API token** with proper permissions
2. **Update CORS settings** in Cloudflare R2
3. **Test upload** with the provided test scripts
4. **Verify** uploads appear in Cloudflare R2 dashboard
