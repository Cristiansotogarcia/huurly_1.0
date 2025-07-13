#!/bin/bash

# Deploy Auth Hooks Script
# This script deploys the Supabase auth hooks for the Huurly project

set -e

echo "🚀 Deploying Huurly Auth Hooks..."

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "Please install it from: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Error: Not logged in to Supabase"
    echo "Please run: supabase login"
    exit 1
fi

echo "📦 Deploying send-email function..."
supabase functions deploy send-email --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ Send-email function deployed successfully"
else
    echo "❌ Failed to deploy send-email function"
    exit 1
fi

echo "🗄️  Applying database migrations..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Database migrations applied successfully"
else
    echo "❌ Failed to apply database migrations"
    exit 1
fi

echo "🔧 Checking environment variables..."

# Check required environment variables
required_vars=(
    "SEND_EMAIL_HOOK_SECRET"
    "RESEND_API_KEY"
    "RESEND_FROM_EMAIL"
    "FRONTEND_URL"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "⚠️  Warning: Missing environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo "Please set these variables in your Supabase project settings."
else
    echo "✅ All required environment variables are set"
fi

echo ""
echo "🎉 Auth hooks deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Supabase Dashboard > Authentication > Hooks"
echo "2. Configure the Send Email hook:"
echo "   - Type: HTTP Hook"
echo "   - URL: https://your-project.supabase.co/functions/v1/send-email"
echo "   - Secret: Use the value of SEND_EMAIL_HOOK_SECRET"
echo "3. Configure the Custom Access Token hook:"
echo "   - Type: Postgres Function"
echo "   - Function: public.custom_access_token_hook"
echo "4. Test the email flows (signup, password reset, email change)"
echo ""
echo "📖 For detailed setup instructions, see: docs/auth-hooks-setup.md"
echo "🐛 For troubleshooting, check function logs: supabase functions logs send-email"