## Huurly.nl - SaaS MVP Requirements Summary

### 1. Application Type
- Two-sided marketplace platform connecting landlords (Verhuurders) with tenants (Huurders).
- Focus on creating a trustworthy ecosystem with verification features.
- Key differentiator: Reverse-search model (landlords search for tenants).

### 2. User Roles
- **Huurders (Renters)**: Paying users (€65/year subscription).
  - Self-register through frontend.
  - Complete comprehensive profile with personal details, housing preferences, lifestyle, income verification, references, and profile picture.
  - Need to stand out, avoid endless searching, and protect privacy.
- **Verhuurders (Landlords)**: Non-paying users.
  - Accounts created by admin only.
  - Own 1-3 properties.
  - Need efficient tenant matching, pre-verified tenant info, and minimized screening time.
- **Beoordelaars (Reviewers)**:
  - Responsible for reviewing and approving/rejecting tenant documents.
  - Need efficient document management interface, clear verification guidelines, and notification system.
- **Admin (Single Admin Account)**: Cristian Soto Garcia (cristiansotogarcia@gmail.com).
  - Creates and manages landlord accounts.
  - Comprehensive analytics dashboard, system settings, user permissions, and oversees verification.

### 3. Essential MVP Features
- Tenant profile creation with verification system (frontend registration).
- Mandatory complete profile for tenants including profile picture.
- Single subscription option (€65/year) for tenants only.
- Document review dashboard for Beoordelaars.
- Landlord search interface with advanced filtering.
- Admin dashboard for landlord account creation and analytics.
- Notification system (in-app and email via Resend).
- Stripe subscription processing (€65/year for tenants).
- GDPR-compliant data handling.
- Mobile-responsive design (65% of users access via mobile).
- Fully Dutch language system and database.

### 4. Information Architecture
- **Public Pages**: Home, About, Pricing, Blog, Contact, How it works, For landlords, For tenants, Privacy Policy, Terms of Service, Contact.
- **Tenant Area**: Profile creation, Document upload, Notification center, Settings, Subscription management.
- **Landlord Area**: Search interface, Saved profiles, Notification center.
- **Reviewer Area**: Document review dashboard, Verification queue, History.
- **Admin Area**: User management, Landlord creation, Analytics dashboard, System settings.

### 5. Technical Architecture
- **Frontend**: React with TypeScript.
  - Dutch language throughout (date formats, number formats, field names, error messages, UI).
  - Styling: Tailwind CSS with shadcn/ui components.
  - Primary color: #0066CC (trustworthy blue), Secondary color: #10B981 (growth green).
  - Rounded corners and subtle shadows.
  - State Management: React hooks and context (authentication, notifications, search filters).
  - Forms: react-hook-form with zod validation (Dutch-specific validation).
  - Icons: lucide-react (housing-related icons).
  - Data visualization: Recharts (charts/graphs for landlords and admin).
- **Backend**: Supabase for authentication, real-time database, and file storage.
  - EU data centers for GDPR compliance.
  - Proper data retention policies.
  - All database tables, columns, and relationships named in Dutch.
  - Initial admin account setup (securely).
- **Email Notifications**: Resend.
- **Payment Processing**: Stripe integration.

### 6. Core Features to Implement (Detailed)
- **Authentication System**: Email/password signup/login (Supabase Auth), frontend registration for tenants, admin-created accounts for landlords, protected routes, user profile, password reset, session management, 2FA, role-based access control, initial admin account.
- **Database Structure**: `gebruikers` table (extending auth.users), `huurders`, `verhuurders`, `beoordelaars`, `documenten`, `verificaties`, `notificaties`, `abonnementen` tables (all in Dutch).
  - Proper relationships, Row Level Security (RLS), indexes, timestamps (`aangemaakt_op`, `bijgewerkt_op`).
- **User Interface**: Landing page with statistics, responsive navigation, dashboard/main app area with sidebar, toast notifications, loading states, empty states, error boundaries, Dutch-language interface.
- **Core Functionality**: Tenant Profile Creation, Document Review System (Beoordelaar Dashboard), Landlord Search Interface, Admin Dashboard, Notification System, Subscription Management, GDPR Compliance Features.
- **User Experience**: Mobile-first responsive design, smooth animations, keyboard navigation, accessibility compliance, dark mode toggle, intuitive information hierarchy, step-by-step onboarding, contextual help tooltips, all content in Dutch.

### 7. Design Specifications
- Modern, clean aesthetic with whitespace.
- Colors: Primary #0066CC, Secondary #10B981, Accent #F59E0B, #EC4899.
- Subtle shadows and rounded corners (`rounded-lg`).
- Inter font.
- Consistent spacing (Tailwind).
- Hover states, focus visible states.
- House/home iconography, Huurly logo.
- Design language: trust, professionalism, efficiency.

### 8. Development Guidelines
- Set up Supabase authentication and base layout first.
- Build features incrementally.
- Small, reusable components (max 150 lines).
- Descriptive variable/function names in Dutch.
- Helpful comments for complex logic.
- Proper error handling with user-friendly Dutch messages.
- Test each feature.
- Form validation.
- Environment variables for sensitive data.
- Dutch-specific formatting for dates, numbers, addresses.
- GDPR best practices.
- Integrate Stripe and Resend.
- Secure admin credentials.

### 9. Quality Requirements
- Zero console errors.
- Optimized and lazy-loaded images.
- Proper SEO meta tags.
- Lighthouse score > 90.
- No hardcoded values (use constants).
- Consistent naming conventions (Dutch).
- Proper TypeScript types (avoid `any`).
- GDPR compliance.
- Accessibility compliance (WCAG 2.1 AA).
- Support for Dutch browsers/devices.
- All user-facing text in Dutch.

### 10. Deployment Ready
- Error logging.
- CORS policies.
- Rate limiting.
- Google Analytics.
- Privacy policy and terms pages.
- Caching strategies.
- Documented environment variables.
- EU-based hosting.
- SSL/TLS encryption.
- Automated backups.
- Stripe webhook endpoints.
- Resend API integration.
- Secure admin access.

### 11. Build Approach
1. Set up project and dependencies.
2. Authentication flow with role-based access control.
3. Database schema (Dutch).
4. Core UI components (Dutch).
5. Tenant profile creation.
6. Document review dashboard.
7. Landlord search interface.
8. Admin dashboard.
9. Notification system.
10. Stripe subscription management.
11. Polish (animations, transitions).
12. Performance optimization.
13. GDPR compliance.
14. Testing on multiple devices/browsers.

**Unique Value Proposition**: "Laat De Woning Jou Vinden" (Let The Home Find You).

