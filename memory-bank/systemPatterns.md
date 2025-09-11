# System Patterns

## System Architecture
Huurly follows a modern React application architecture with:
- **Frontend**: Single-page application built with React
- **Backend**: Serverless architecture using Supabase
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with JWT tokens
- **File Storage**: Supabase Storage with Cloudflare R2 CDN
- **Real-time**: Supabase real-time subscriptions

## Key Technical Decisions
1. **Supabase as Backend**: Chosen for integrated auth, database, and storage
2. **TypeScript**: Ensures type safety and better developer experience
3. **Tailwind CSS**: Utility-first CSS for rapid UI development
4. **Zustand for State**: Lightweight state management for global app state
5. **React Hook Form**: Efficient form handling with validation

## Design Patterns in Use

### Component Patterns
- **Compound Components**: Modal components with BaseModal + specific content
- **Render Props**: For flexible component composition
- **Custom Hooks**: Business logic extraction (useAuth, useHuurder, etc.)
- **Higher-Order Components**: Authentication wrapping (withAuth)

### State Management Patterns
- **Global State**: User auth state, app settings
- **Local State**: Component-specific state with useState/useReducer
- **Server State**: React Query/SWR pattern (not yet implemented)
- **Form State**: React Hook Form for complex forms

### Data Flow Patterns
- **Service Layer**: Business logic in service classes
- **Repository Pattern**: Data access abstraction
- **Observer Pattern**: Real-time subscriptions
- **Command Pattern**: Action dispatching

## Component Relationships

### Dashboard Components
```
HuurderDashboard
├── DashboardHeader
├── DashboardStats
├── PropertySearch
├── ApplicationList
├── MessageCenter
└── SettingsButton (NEW)
```

### Modal System
```
BaseModal
├── ProfileModal
├── ResetPasswordModal
├── CreateUserModal
├── EnhancedProfileUpdateModal
└── SettingsModal (NEW)
```

### Service Layer
```
UserService
├── Authentication
├── Profile Management
├── Password Reset
├── Email Updates
└── Account Deletion
```

## Critical Implementation Paths

### Authentication Flow
1. User login → Supabase auth → JWT token storage
2. Route protection → withAuth HOC → Dashboard rendering
3. Password reset → Email link → Reset form → Password update

### Settings Page Flow (NEW)
1. Dashboard button click → Navigate to settings
2. Settings page load → Fetch user data
3. Password reset → Open modal → Email verification → Password update
4. Email update → Form validation → Supabase update → Confirmation
5. Account deletion → Confirmation modal → Data cleanup → Account removal

### Data Validation Flow
1. Form input → Zod schema validation → React Hook Form
2. API request → Supabase validation → Database constraints
3. Error handling → User feedback → Form correction

## Security Patterns
- **Row Level Security**: Database-level access control
- **JWT Tokens**: Stateless authentication
- **Input Sanitization**: Client and server-side validation
- **CSRF Protection**: Supabase built-in protection
- **Rate Limiting**: Supabase service-level protection

## Performance Patterns
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: Cloudflare R2 with automatic optimization
- **Caching**: Browser caching for static assets
- **Debouncing**: Search input optimization
- **Virtual Scrolling**: Large list optimization (future)
