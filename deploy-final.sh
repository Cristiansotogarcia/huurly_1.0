#!/bin/bash

# Final deployment script for Cloudflare R2 with beelden bucket
echo "🚀 Final Cloudflare R2 Deployment Script"
echo "========================================"

# 1. Deploy the edge function
echo "📦 Deploying cloudflare-r2-upload function..."
supabase functions deploy cloudflare-r2-upload --no-verify-jwt

# 2. Verify environment variables
echo "🔍 Verifying environment variables..."
supabase secrets list | grep -E "CLOUDFLARE|R2"

# 3. Set the correct environment variables for beelden bucket
echo "🔧 Setting environment variables..."
supabase secrets set CLOUDFLARE_ACCOUNT_ID=5c65d8c11ba2e5ee7face692ed22ad1c
supabase secrets set CLOUDFLARE_R2_ACCESS_KEY_ID=a6339b9b54b193196a48f04cd3b08676
supabase secrets set CLOUDFLARE_R2_SECRET_KEY=8d842c45d071db5dc0bb8c797ab4380565f61c1812531462079979a31909a8b9
supabase secrets set CLOUDFLARE_R2_BUCKET=beelden
supabase secrets set CLOUDFLARE_R2_ENDPOINT=https://5c65d8c11ba2e5ee7face692ed22ad1c.r2.cloudflarestorage.com/beelden

# 4. Test the deployment
echo "🧪 Testing deployment..."
curl -X POST https://sqhultitvpivlnlgogen.supabase.co/functions/v1/cloudflare-r2-upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxaHVsdGl0dnBpdmxubGdvZ2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDgxNTIsImV4cCI6MjA2NTY4NDE1Mn0.ZPfzoKgcMrzcKA5klMaef9jZSb258IlwKUBz244oJ3E" \
  -H "Content-Type: multipart/form-data" \
  -F "userId=test-user" \
  -F "folder=Profile" \
  -F "file=@test.jpg" || echo "⚠️  Test failed - check if test.jpg exists"

echo "✅ Deployment complete!"
echo ""
echo "📋 Two-Bucket Setup Summary:"
echo "- Beelden bucket: beelden → https://beelden.huurly.nl/"
echo "- Documents bucket: documents → https://documents.huurly.nl/"
echo "- Images will use: https://beelden.huurly.nl/{folder}/{userId}/{filename}"
echo ""
echo "🎯 Next steps:"
echo "1. Test profile picture upload"
echo "2. Test cover photo upload"
echo "3. Verify URLs use beelden.huurly.nl domain"
