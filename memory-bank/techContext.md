# Technical Context

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Strict type checking for better development experience
- **Vite**: Fast build tool with hot module replacement
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **React Router**: Client-side routing for SPA experience
- **React Query**: Data fetching and caching
- **Zustand**: Lightweight state management

### Backend & Database
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Authentication**: Supabase Auth with role-based access control
- **Storage**: Supabase Storage for documents, Cloudflare R2 for images
- **Edge Functions**: Cloudflare Workers for image optimization and signed URLs

### Cloud Services
- **Cloudflare R2**: Image storage with CDN delivery
- **Cloudflare Workers**: Edge computing for image processing
- **Vercel**: Frontend deployment with edge functions
- **Stripe**: Payment processing and subscription management

### Development Tools
- **TypeScript**: Type safety across the stack
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Git**: Version control with GitHub
- **Bun**: Package manager and runtime

## Development Setup

### Prerequisites
- Node.js 18+ or Bun runtime
- Supabase CLI
- Cloudflare account with R2 bucket
- Stripe account for payments
- Vercel account for deployment

### Environment Variables
```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_ENDPOINT=

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
VITE_APP_URL=
```

### Key Dependencies
- **@supabase/supabase-js**: Supabase client
- **stripe**: Stripe payment SDK
- **react-hook-form**: Form handling
- **react-dropzone**: File upload
- **date-fns**: Date manipulation
- **lucide-react**: Icon library
- **clsx & tailwind-merge**: CSS class utilities

## Technical Constraints
- **Image size limits**: 10MB per image, optimized to <500KB
- **File types**: JPG, PNG, WebP for images; PDF for documents
- **Browser support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile support**: iOS 14+, Android 10+
- **Performance budget**: <3s initial load, <100KB critical CSS/JS

## Security Considerations
- **CSP headers**: Strict Content Security Policy
- **HTTPS only**: All traffic encrypted
- **Input validation**: Client and server-side validation
- **Rate limiting**: API endpoints protected
- **File validation**: Type and size checks for uploads
- **Authentication**: JWT tokens with refresh rotation

## Development Patterns
- **Component composition**: Reusable, composable React components
- **Custom hooks**: Business logic extracted into hooks
- **Service layer**: API calls abstracted into services
- **Type safety**: Full TypeScript coverage
- **Error boundaries**: Graceful error handling
- **Loading states**: Consistent UX during async operations
