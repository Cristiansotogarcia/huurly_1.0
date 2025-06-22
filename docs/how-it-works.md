# How It Works

This document breaks down the technical workings of the Huurly application, file by file.

## 1. Application Entry Point: `src/main.tsx`

- **Purpose**: This is the very first file that runs. It's like the front door to the entire application.
- **How it works**: It uses `createRoot` from the `react-dom/client` library to find a spot in the main `index.html` file (a `div` with the id `root`) and tells React to start rendering the main `App` component inside it. It also imports the main stylesheet `index.css` to make sure the whole app has its basic styling from the start.

## 2. Main Application Component: `src/App.tsx`

- **Purpose**: This component is the main hub of the application. It sets up the overall structure, including routing, data management, and UI providers.
- **Key Technologies**:
  - **Routing**: Uses `react-router-dom` to manage different pages (URLs) of the application. It defines routes for the home page (`/`), the tenant dashboard (`/huurder-dashboard`), and a payment success page (`/payment-success`).
  - **Data Fetching**: Uses `@tanstack/react-query` to fetch and manage data from the backend. This helps with things like caching data, so the app doesn't have to re-fetch it all the time, making it faster.
  - **UI Components**: It wraps the application in providers for UI elements like `Toaster` (for pop-up notifications) and `TooltipProvider` (for hover-over tooltips).
  - **Code Splitting**: It uses `React.lazy` and `Suspense` to load pages only when they are needed. This makes the initial load of the application faster.

## 3. Authentication & Authorization: `src/components/auth/ProtectedRoute.tsx`

- **Purpose**: This component acts as a gatekeeper for certain pages. It checks if a user is logged in and has the correct role (e.g., 'huurder') before allowing them to see the page.
- **How it works**:
  - It uses the `useAuth` hook to get the current user's information.
  - If the user is not logged in, it redirects them to the home page (`/`).
  - If a specific role is required and the user doesn't have it, it also redirects them to the home page.
  - The `HuurderRoute` is a specific version of this component that is pre-configured to only allow users with the 'huurder' role.

## 4. Authentication Logic: `src/hooks/useAuth.ts`

- **Purpose**: This is a custom hook that contains all the logic for user authentication. It's the brain behind logging in, signing up, and managing the user's session.
- **Key Features**:
  - **State Management**: It uses a Zustand store (`useAuthStore`) to keep track of the user's information (like their name and role) and whether they are logged in. This information is available to any component that needs it.
  - **Authentication Functions**: It provides functions for `signUp`, `signIn`, `signOut`, `resetPassword`, and `updatePassword`. These functions call the `authService` to communicate with the backend.
  - **Session Management**: It uses a `useEffect` hook to check if a user is already logged in when the app starts. It also listens for changes in the authentication state (like when a user logs in or out) and automatically redirects them to the correct dashboard based on their role.

## 5. Backend Communication: `src/lib/auth/authService.ts`

- **Purpose**: This service is the final link in the authentication chain, communicating directly with the Supabase backend to perform all authentication-related tasks.
- **How it works**:
  - It uses the `supabase` client to call Supabase's built-in authentication functions (`signUp`, `signInWithPassword`, `signOut`, etc.).
  - During sign-up, it not only creates the user in Supabase's `auth` schema but also creates corresponding entries in the `profiles` and `user_roles` tables in the public schema.
  - It uses helper modules like `userMapper` to transform the user data from Supabase into the format the application expects.
  - It provides an `onAuthStateChange` listener that the `useAuth` hook uses to react to authentication events in real-time.

## 6. Landing Page: `src/pages/Index.tsx`

- **Purpose**: This is the main landing page for the application, what users see when they first visit the site.
- **How it works**:
  - It's a presentational component, composed of smaller components like `Header`, `Hero`, `Features`, and `CTA` to build the page.
  - It uses the `useAuth` hook to check if a user is already authenticated. If they are, it redirects them to their appropriate dashboard, preventing logged-in users from seeing the landing page again.
  - It manages the visibility of the `MultiStepSignupModal` component, allowing users to sign up directly from the landing page.

## 7. Tenant Dashboard: `src/pages/HuurderDashboard.tsx`

- **Purpose**: This is the main dashboard for users with the 'huurder' (tenant) role. It's their central hub for managing their profile, documents, and search for a rental property.
- **How it works**:
  - It relies heavily on two custom hooks: `useHuurderDashboard` to fetch and manage all the data displayed on the dashboard, and `useHuurderActions` to handle user interactions like updating their status or completing their profile.
  - It displays different states based on the user's status: a loading state, an access denied state (if the user is not a 'huurder'), and the main dashboard content.
  - It manages the visibility of several modals (`ProfileModal`, `DocumentModal`, `PaymentModal`) for different user actions.
  - It checks the user's payment status and blurs the screen, showing a payment modal if the subscription is not active, effectively gating the content.

## 8. Tenant Dashboard Data Hook: `src/hooks/useHuurderDashboard.ts`

- **Purpose**: This hook is responsible for fetching and managing all the data needed for the tenant dashboard.
- **How it works**:
  - It gets the current user's information from the `useAuthStore`.
  - It uses the `dashboardDataService` to fetch the user's profile, documents, and dashboard statistics from the backend.
  - It manages the loading state for the dashboard and its different sections (e.g., `isLoadingStats`).
  - It provides functions to refresh data, like `refreshDocuments`, and to calculate derived data, like `getSubscriptionEndDate`.

## 9. Tenant Dashboard Actions Hook: `src/hooks/useHuurderActions.ts`

- **Purpose**: This hook provides all the functions that a tenant can use to interact with the dashboard.
- **How it works**:
  - It provides functions to handle user actions like completing their profile (`handleProfileComplete`), uploading documents (`handleDocumentUploadComplete`), and logging out (`handleLogout`).
  - It uses the `userService` and `dashboardDataService` to communicate with the backend to update the user's profile and visibility status.
  - It uses the `useToast` hook to provide feedback to the user after an action is performed (e.g., showing a success or error message).
  - It also contains placeholder functions for features that are not yet implemented, like `handleStartSearch` and `handleSettings`.

## 10. Dashboard Data Service: `src/services/DashboardDataService.ts`

- **Purpose**: This service is responsible for all communication with the Supabase backend related to the tenant dashboard.
- **How it works**:
  - It provides static methods to fetch and update data from various tables in the database, such as `tenant_profiles`, `user_documents`, and `profiles`.
  - It uses the `supabase` client to perform database operations.
  - It includes logging using the `logger` to record the outcome of each operation, which is useful for debugging.
  - For the `getTenantDashboardStats` function, it currently returns mock data, as the analytics tables are not yet implemented.