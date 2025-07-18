# Huurly Project Brief

## Project Overview
Huurly is a comprehensive rental platform designed to connect landlords (verhuurders) with tenants (huurders) in the Dutch rental market. The platform facilitates property listings, tenant applications, and rental management processes.

## Core Requirements
- **Multi-role system**: Support for landlords, tenants, property managers, and administrators
- **Property management**: Full CRUD operations for property listings with rich media support
- **Application system**: Streamlined application process for tenants with document upload
- **Payment integration**: Stripe integration for subscription management and payments
- **Image optimization**: Cloudflare R2 integration for efficient image storage and delivery
- **Real-time notifications**: Email and in-app notifications for key events
- **Admin dashboard**: Comprehensive admin panel for user and content management

## Target Audience
- **Landlords/Verhuurders**: Property owners looking to rent out properties
- **Tenants/Huurders**: Individuals searching for rental properties
- **Property Managers**: Professional property management companies
- **Administrators**: Platform administrators managing the system

## Key Features
- Property search and filtering
- Profile management with photo uploads
- Document verification system
- Subscription-based pricing model
- Multi-language support (Dutch primary)
- Mobile-responsive design
- Advanced image optimization and CDN delivery

## Technical Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time subscriptions)
- **Storage**: Cloudflare R2 for images, Supabase Storage for documents
- **Payments**: Stripe for subscription management
- **Deployment**: Vercel for frontend, Cloudflare Workers for edge functions
- **Development**: TypeScript, ESLint, modern tooling

## Success Metrics
- User registration and engagement rates
- Property listing completion rates
- Application conversion rates
- Payment processing reliability
- Image upload and optimization performance
- Overall platform stability and user satisfaction
