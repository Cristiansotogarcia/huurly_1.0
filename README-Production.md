# Production Deployment Guide

## Vercel Deployment

This project is configured for deployment on Vercel. All file storage is handled through Cloudflare R2.

### Environment Variables

Set the following environment variables in your Vercel dashboard:

```
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
VITE_STRIPE_PUBLISHABLE_KEY=your_publishable_key
VITE_STRIPE_HUURDER_PRICE_ID=your_price_id

# Cloudflare R2 Configuration
CLOUDFLARE_R2_ENDPOINT=your_r2_endpoint
CLOUDFLARE_R2_ACCESS_KEY=your_access_key
CLOUDFLARE_R2_SECRET_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET=your_bucket_name

# Client-side versions (Vercel will automatically expose VITE_ prefixed vars)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLOUDFLARE_R2_ENDPOINT=your_r2_endpoint
VITE_CLOUDFLARE_R2_ACCESS_KEY=your_access_key
VITE_CLOUDFLARE_R2_SECRET_KEY=your_secret_key
VITE_CLOUDFLARE_R2_BUCKET=your_bucket_name
```

## File Storage

All user-uploaded documents and images are stored in Cloudflare R2:

- **Profile Pictures**: Stored in `profile-pictures/` folder
- **Documents**: Stored in `documents/` folder with proper access controls
- **Public URLs**: Generated for profile pictures
- **Signed URLs**: Generated for secure document access

## Admin User Setup

### Step 1: Initial Signup
The admin user must first sign up through the normal registration flow:
- Email: `Cristiansotogarcia@gmail.com`
- Complete the standard signup process

### Step 2: Grant Admin Privileges
After signup, run the admin setup script to grant admin privileges:

```typescript
import { setupAdminUser } from './src/scripts/setup-admin-user';
setupAdminUser();
```

Or manually update the database:
```sql
UPDATE public.gebruikers 
SET rol = 'admin', profiel_compleet = true 
WHERE email = 'Cristiansotogarcia@gmail.com';
```

## Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **File Access Control**: Secure document access with signed URLs
- **Role-based Access**: Admin, verhuurder, huurder, beoordelaar roles
- **Authentication**: Supabase Auth with email/password

## Post-Deployment Checklist

1. ✅ Environment variables configured in Vercel
2. ✅ Cloudflare R2 bucket created and configured
3. ✅ Supabase database migrations applied
4. ✅ Admin user signed up and privileges granted
5. ✅ Stripe webhooks configured (if using payments)
6. ✅ DNS and domain settings configured
7. ✅ SSL certificate active

## Monitoring

- Check Vercel deployment logs for any runtime errors
- Monitor Supabase dashboard for database performance
- Review Cloudflare R2 usage and costs
- Set up error tracking (consider Sentry integration)

## Backup Strategy

- Supabase provides automatic database backups
- Cloudflare R2 files should be backed up separately
- Export critical configuration settings

## Support

For technical issues during deployment, check:
1. Vercel build logs
2. Supabase database logs
3. Browser console for client-side errors
4. Network tab for API call failures