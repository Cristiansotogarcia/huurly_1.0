# Modal and Component Relationships

This document provides a high level overview of the various modal components in the Huurly codebase and how they interact with services and pages across the application.

## Core Modal Infrastructure

- **`BaseModal.tsx`** – generic modal wrapper built on top of the shadcn/ui dialog components. It exposes `BaseModal` and `BaseModalActions` helpers plus utility hooks `useModalState` and `useModalForm` for handling open state and form data.
- Modals leverage shared UI elements from `src/components/ui` and often call domain services from `src/services`.

Most modal files live in `src/components/modals/` and are imported by pages or dashboard sections as needed.

## Major Modals

| Modal | Purpose | Key Services / Hooks |
|-------|---------|----------------------|
| `CreateUserModal` | Admin tool for creating new user accounts and roles. | `UserService` for user creation. |
| `DocumentUploadModal` | Allows tenants to upload identification and income documents. | `DocumentService` handles Cloudflare R2 uploads and Supabase records. |
| `DocumentReviewModal` | Enables reviewers to approve or reject uploaded documents. | `DocumentService.reviewDocument` updates document status. |
| `EnhancedProfileUpdateModal` | Multi‑step wizard for completing the tenant profile. | Uses `useValidatedMultiStepForm`, `profileSchema` and `UserService` integration. |
| `PaymentModal` & `SubscriptionModal` | Start the Stripe checkout flow and manage subscriptions. | `PaymentService` → `StripeCheckoutService` for sessions. |
| `PaymentSuccessModal` | Confirms a successful payment before forwarding to the dashboard. | Display only – triggered after `PaymentModal` flow. |
| `EmailConfirmationModal` and `EmailVerificationSuccessModal` | Shown after signup to guide users through email verification. | `useAuth` hook for sign‑up / confirm actions. |
| `IssueReportModal` & `IssueManagementModal` | Let users report issues and allow admins to review them. | Currently placeholder logic; would call a future issue service. |
| `PropertyModal` & `PropertySearchModal` | Used by landlords/tenants to create or search property listings. | `PropertyService` for CRUD/search. |
| `SettingsModal`, `UserManagementModal`, `ViewingInvitationModal` | Various administration tasks such as user management or viewing invites. | `UserService`, `NotificationService`, etc. |

### Enhanced Profile Steps

The profile update modal renders step components stored in `src/components/modals/EnhancedProfileSteps/`. Each step contains form fields bound by `react-hook-form` and validated via schemas in `profileSchema.ts` and `stepValidationSchemas.ts`. On completion the modal returns a `ProfileFormData` object to the dashboard, which forwards it to `UserService` for persistence.

## Dashboard Integration

`src/components/HuurderDashboard/DashboardModals.tsx` orchestrates key modals for tenants:

```tsx
<EnhancedProfileUpdateModal ... />
<DocumentUploadModal ... />
<PaymentModal persistent />
```

Pages such as `src/pages/HuurderDashboard.tsx` control when these modals open based on user state from `useAuthStore` and API responses.

## Service Layer

Most modals rely on domain services found under `src/services/` to perform API calls. These services wrap Supabase operations and contain additional logic such as permissions, validation and Cloudflare R2 uploads.

Examples:

- `DocumentService.uploadDocument` uploads a file, writes a record, and returns the stored document information.
- `PaymentService.createCheckoutSession` starts a Stripe session and redirects to the returned URL.
- `UserService.updateTenantProfile` (see `UserService.ts`) persists profile details submitted from the profile update modal.

By routing all network logic through these services, modals remain focused on UI concerns while the backend interaction stays consistent.

## Relationships Overview

1. **User flows**: signup via `MultiStepSignupModal` → email confirmation modals → optional `PaymentModal` if a subscription is required.
2. **Tenant onboarding**: `EnhancedProfileUpdateModal` gathers profile info, followed by `DocumentUploadModal` for verification documents. Reviewers use `DocumentReviewModal` to approve these uploads.
3. **Dashboard utilities**: modals such as `SettingsModal`, `IssueReportModal`, and `UserManagementModal` provide management features within admin or user dashboards.
4. **Property management**: landlords open `PropertyModal` to create or edit listings. Tenants search via `PropertySearchModal` and can view invites with `ViewingInvitationModal`.

These modals communicate with Redux/Zustand stores (`useAuthStore`), domain services and page components to keep data in sync across the frontend and Supabase backend.

---

For more details on the overall architecture see `memory-bank/systemPatterns.md` which outlines the domain driven folder structure and service layer pattern.
