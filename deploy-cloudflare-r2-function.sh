#!/bin/bash

# Deploy Cloudflare R2 upload function to Supabase
echo "🚀 Deploying Cloudflare R2 upload function..."

# Deploy the function
supabase functions deploy cloudflare-r2-upload --no-verify-jwt

echo "✅ Cloudflare R2 upload function deployed successfully!"
echo ""
echo "🔧 Make sure your environment variables are set in Supabase:"
echo "   - CLOUDFLARE_ACCOUNT_ID"
echo "   - CLOUDFLARE_R2_ACCESS_KEY_ID"
echo "   - CLOUDFLARE_R2_SECRET_KEY"
echo "   - CLOUDFLARE_R2_BUCKET"
echo "   - CLOUDFLARE_R2_ENDPOINT"
echo ""
echo "📋 To set environment variables in Supabase:"
echo "   supabase secrets set CLOUDFLARE_ACCOUNT_ID=your-account-id"
echo "   supabase secrets set CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key"
echo "   supabase secrets set CLOUDFLARE_R2_SECRET_KEY=your-secret-key"
echo "   supabase secrets set CLOUDFLARE_R2_BUCKET=documents"
echo "   supabase secrets set CLOUDFLARE_R2_ENDPOINT=https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com"
