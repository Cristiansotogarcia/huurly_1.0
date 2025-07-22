# CORS Fix Deployment Guide

## ✅ CORS Issue Fixed Successfully

The Edge Function `register-user` has been updated with proper CORS headers to resolve the CORS policy violation.

### 🔧 **Changes Made**

#### **Enhanced CORS Headers**
- **Specific origin handling** for localhost:8080, localhost:5173, localhost:3000
- **Production domains** included: huurly-1-0.vercel.app and huurly.nl
- **Proper preflight handling** for OPTIONS requests
- **Credentials support** enabled

#### **Updated Edge Function** (`supabase/functions/register-user/index.ts`)
- Replaced generic CORS with specific origin validation
- Added proper Content-Type headers
- Maintained all existing functionality

### 🚀 **Deployment Steps**

#### **1. Deploy the Edge Function**
```bash
# From project root
cd supabase/functions
supabase functions deploy register-user
```

#### **2. Verify Deployment**
```bash
# Test the function
curl -X OPTIONS https://sqhultitvpivlnlgogen.supabase.co/functions/v1/register-user \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST"
```

#### **3. Test from Frontend**
- Open the Enhanced Profile Creation Modal
- Fill in all required fields
- Click "Profiel Opslaan"
- Check browser console for successful API calls

### 📋 **Expected Results**

#### **Before Fix**
```
Access to fetch at '...' from origin 'http://localhost:8080' has been blocked by CORS policy
```

#### **After Fix**
```
✅ 200 OK response from register-user function
✅ Profile data successfully saved
✅ Modal closes with success toast
```

### 🔍 **Testing Checklist**

- [ ] Edge Function deployed successfully
- [ ] CORS preflight requests return 200 OK
- [ ] POST requests from localhost:8080 work
- [ ] POST requests from production domains work
- [ ] Profile creation completes without errors
- [ ] User records created in database

### 🛠️ **Troubleshooting**

If issues persist:

1. **Check Edge Function logs** in Supabase dashboard
2. **Verify environment variables** are set correctly
3. **Test with curl** to isolate frontend/backend issues
4. **Check browser network tab** for detailed error messages

### 📞 **Support Commands**

```bash
# Check function status
supabase functions list

# View function logs
supabase functions logs register-user

# Redeploy if needed
supabase functions deploy register-user --no-verify-jwt
```

The CORS issue should now be resolved and profile creation should work seamlessly!
