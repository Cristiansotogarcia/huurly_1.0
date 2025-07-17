#!/bin/bash

# Deploy the signed URL generation function to Supabase
echo "🚀 Deploying signed URL generation function..."

# Deploy the function
supabase functions deploy generate-upload-url --no-verify-jwt

echo "✅ Signed URL function deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Ensure your .env file has the required Cloudflare R2 variables"
echo "2. Test the upload functionality"
echo "3. The function will be available at: https://sqhultitvpivlnlgogen.supabase.co/functions/v1/generate-upload-url"
echo ""
echo "🔧 Required environment variables in Supabase:"
echo "- CLOUDFLARE_ACCOUNT_ID"
echo "- CLOUDFLARE_R2_ACCESS_KEY"
echo "- CLOUDFLARE_R2_SECRET_KEY"
echo "- CLOUDFLARE_R2_BUCKET"
echo "- CLOUDFLARE_R2_ENDPOINT"
