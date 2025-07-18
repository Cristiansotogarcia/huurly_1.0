# System Patterns

## Architecture Overview
The Huurly platform follows a modern microservices-inspired architecture with clear separation of concerns:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │────│   API Layer      │────│   Services      │
│   (React/Vite)  │    │   (Supabase)     │    │   (Cloudflare)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                       ┌──────────────────┐
                       │   Storage        │
                       │   (R2/Supabase)  │
                       └──────────────────┘
```

## Component Architecture

### Domain-Driven Design
The codebase is organized by **domains** rather than technical layers:
- **User Domain**: Authentication, profiles, roles
- **Property Domain**: Listings, search, media
- **Application Domain**: Tenant applications, documents
- **Payment Domain**: Subscriptions, billing, invoices
- **Shared Domain**: Common utilities, types, components

### Component Hierarchy
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Atomic design components
│   ├── standard/        # Standardized form components
│   └── [domain]/        # Domain-specific components
├── pages/               # Route-based page components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and services
├── services/            # API service layer
├── store/               # State management
└── types/               # TypeScript type definitions
```

## Design Patterns

### 1. Container/Presentational Pattern
- **Container components**: Handle data fetching and state
- **Presentational components**: Pure UI components with props

### 2. Custom Hooks Pattern
Business logic extracted into reusable hooks:
- `useAuth()`: Authentication state and actions
- `useImageUpload()`: Image upload with optimization
- `usePropertySearch()`: Property search and filtering
- `useSubscription()`: Stripe subscription management

### 3. Service Layer Pattern
API calls abstracted into service modules:
- `PropertyService`: Property CRUD operations
- `UserService`: User management
- `PaymentService`: Stripe integration
- `StorageService`: File upload and management

### 4. Error Boundary Pattern
- Global error boundaries for graceful degradation
- Component-level error handling
- User-friendly error messages

### 5. Loading State Pattern
- Consistent skeleton loaders
- Progressive enhancement
- Optimistic updates where appropriate

## Data Flow Patterns

### State Management
- **Global state**: Zustand for auth, subscriptions, app-wide data
- **Server state**: React Query for API data with caching
- **Local state**: React useState for component-specific state
- **Form state**: React Hook Form for complex forms

### API Communication
```typescript
// Standard API response pattern
interface ApiResponse<T> {
  data: T;
  error: null | ApiError;
  meta?: PaginationMeta;
}

// Error handling pattern
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

## Security Patterns

### Authentication Flow
1. **JWT tokens**: Short-lived access tokens
2. **Refresh tokens**: Long-lived refresh tokens with rotation
3. **Role-based access**: Supabase RLS policies
4. **Session management**: Automatic token refresh

### File Upload Security
1. **Signed URLs**: Temporary upload URLs from Cloudflare
2. **File validation**: Type and size checks on client and server
3. **Virus scanning**: Optional integration with scanning services
4. **Access control**: Private files with signed access

## Performance Patterns

### Image Optimization
1. **Multi-size generation**: Automatic creation of multiple sizes
2. **Lazy loading**: Images load as they enter viewport
3. **CDN delivery**: Cloudflare R2 with global edge caching
4. **Format optimization**: WebP with JPEG fallback

### Code Splitting
1. **Route-based**: Automatic splitting by routes
2. **Component-based**: Lazy loading for heavy components
3. **Vendor splitting**: Separate chunks for dependencies

### Caching Strategy
1. **Browser caching**: Static assets with long cache headers
2. **API caching**: React Query with intelligent invalidation
3. **CDN caching**: Static content at edge locations
4. **Service worker**: Optional PWA features

## Testing Patterns

### Component Testing
- **React Testing Library**: Component behavior testing
- **Jest**: Unit tests for utilities and hooks
- **MSW**: API mocking for consistent tests

### E2E Testing
- **Playwright**: Full user journey testing
- **Test data**: Seeded test environment
- **Parallel execution**: Fast test runs

## Deployment Patterns

### CI/CD Pipeline
1. **GitHub Actions**: Automated testing and deployment
2. **Preview deployments**: Every PR gets a preview URL
3. **Staging environment**: Production-like testing environment
4. **Blue-green deployment**: Zero-downtime deployments

### Environment Management
- **Development**: Local development with Supabase CLI
- **Staging**: Production-like environment for testing
- **Production**: Live environment with monitoring
