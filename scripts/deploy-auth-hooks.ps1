# Deploy Auth Hooks PowerShell Script
# This script deploys the Supabase auth hooks for the Huurly project

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying Huurly Auth Hooks..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "supabase\config.toml")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if Supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
} catch {
    Write-Host "❌ Error: Supabase CLI is not installed" -ForegroundColor Red
    Write-Host "Please install it from: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Supabase
try {
    $null = supabase projects list 2>$null
} catch {
    Write-Host "❌ Error: Not logged in to Supabase" -ForegroundColor Red
    Write-Host "Please run: supabase login" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Deploying send-email function..." -ForegroundColor Blue
try {
    supabase functions deploy send-email --no-verify-jwt
    Write-Host "✅ Send-email function deployed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to deploy send-email function" -ForegroundColor Red
    exit 1
}

Write-Host "🗄️  Applying database migrations..." -ForegroundColor Blue
try {
    supabase db push
    Write-Host "✅ Database migrations applied successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to apply database migrations" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Checking environment variables..." -ForegroundColor Blue

# Check required environment variables
$requiredVars = @(
    "SEND_EMAIL_HOOK_SECRET",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "FRONTEND_URL"
)

$missingVars = @()

foreach ($var in $requiredVars) {
    if (-not [Environment]::GetEnvironmentVariable($var)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "⚠️  Warning: Missing environment variables:" -ForegroundColor Yellow
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Yellow
    }
    Write-Host "Please set these variables in your Supabase project settings." -ForegroundColor Yellow
} else {
    Write-Host "✅ All required environment variables are set" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Auth hooks deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to your Supabase Dashboard > Authentication > Hooks" -ForegroundColor White
Write-Host "2. Configure the Send Email hook:" -ForegroundColor White
Write-Host "   - Type: HTTP Hook" -ForegroundColor Gray
Write-Host "   - URL: https://your-project.supabase.co/functions/v1/send-email" -ForegroundColor Gray
Write-Host "   - Secret: Use the value of SEND_EMAIL_HOOK_SECRET" -ForegroundColor Gray
Write-Host "3. Configure the Custom Access Token hook:" -ForegroundColor White
Write-Host "   - Type: Postgres Function" -ForegroundColor Gray
Write-Host "   - Function: public.custom_access_token_hook" -ForegroundColor Gray
Write-Host "4. Test the email flows (signup, password reset, email change)" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed setup instructions, see: docs/auth-hooks-setup.md" -ForegroundColor Cyan
Write-Host "🐛 For troubleshooting, check function logs: supabase functions logs send-email" -ForegroundColor Cyan