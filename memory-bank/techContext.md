# Technical Context

## Technologies Used
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom components
- **Backend**: Supabase (PostgreSQL database, authentication, real-time subscriptions, storage)
- **State Management**: Zustand for global state
- **Form Handling**: React Hook Form with validation
- **Routing**: React Router v6
- **UI Components**: Custom component library with shadcn/ui inspiration
- **Icons**: Lucide React
- **HTTP Client**: Axios (via Supabase client)
- **Testing**: Jest + React Testing Library (planned)
- **Deployment**: Vercel

## Development Setup
- **Package Manager**: npm/bun (bun.lockb present)
- **Environment**: Node.js environment
- **Linting**: ESLint with custom config
- **Type Checking**: TypeScript with strict mode
- **Code Formatting**: Prettier (inferred from setup)

## Technical Constraints
- **Browser Support**: Modern browsers (ES2020+ features)
- **Mobile First**: Responsive design required
- **Performance**: Optimize for Core Web Vitals
- **Security**: Supabase RLS policies, secure auth flows
- **Scalability**: Serverless architecture with Supabase

## Dependencies (Key Ones)
- `@supabase/supabase-js`: Supabase client
- `react-hook-form`: Form handling
- `@hookform/resolvers`: Form validation
- `zod`: Schema validation
- `zustand`: State management
- `react-router-dom`: Routing
- `lucide-react`: Icons
- `tailwindcss`: Styling
- `@radix-ui/*`: UI primitives

## Tool Usage Patterns
- **Authentication**: Supabase Auth with custom hooks
- **Database Queries**: Supabase client with TypeScript types
- **File Uploads**: Supabase Storage with Cloudflare R2 integration
- **Real-time**: Supabase subscriptions for live updates
- **Error Handling**: Custom error boundaries and toast notifications
- **Loading States**: Custom hooks for async operations

## Current Architecture Patterns
- **Component Structure**: Feature-based organization in `/src/components`
- **Pages**: Route-based components in `/src/pages`
- **Services**: Business logic in `/src/services`
- **Hooks**: Custom hooks in `/src/hooks`
- **Utils**: Utility functions in `/src/utils`
- **Types**: TypeScript definitions in `/src/types`

## Integration Points
- **Supabase Database**: User profiles, properties, applications, messages
- **Supabase Auth**: User authentication and authorization
- **Supabase Storage**: File uploads (profile pictures, documents)
- **Email Service**: Supabase auth email templates
- **Payment Processing**: Stripe integration (planned/in progress)
