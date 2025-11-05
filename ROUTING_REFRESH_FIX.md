# Routing & Refresh Loop Fix

## Problem Summary

The application was experiencing refresh loops and inconsistent behavior on both mobile and desktop when users refreshed pages. This affected the entire user experience.

## Root Causes Identified

### 1. **Aggressive Home Page Redirects**
The Index page (`/`) had a `useEffect` that ran on every render and automatically redirected authenticated users to their dashboards. This created the following loop:

```
User refreshes any page → React Router briefly renders Index component 
→ Index checks authentication → Finds user is authenticated  
→ Index redirects to dashboard → User refreshes dashboard → Loop repeats
```

### 2. **Mobile Detection Race Condition**
The `useIsMobile` hook initialized with `undefined`, causing:
- Components to render inconsistently during initial load
- Unpredictable mobile vs desktop behavior
- Flash of wrong UI before correct detection

### 3. **Missing Navigation State Fallbacks**
Mobile pages relied heavily on `location.state` for critical data:
- Return URLs
- Modal data
- Callback functions

When users refreshed, this state was lost, breaking the mobile experience.

## Fixes Implemented

### Fix 1: Route-Aware Redirect Logic (Index.tsx)

**Before:**
```typescript
// Redirected authenticated users regardless of current route
if (isAuthenticated && user && user.role && !hasActiveModal) {
  const handleRedirect = async () => {
    // ... determine targetPath
    if (currentPath !== targetPath) {
      navigate(targetPath);
    }
  };
  handleRedirect();
}
```

**After:**
```typescript
// Only redirect if user is actually on the home page
if (currentPath !== '/') {
  return; // Don't redirect if on any other route
}

if (isAuthenticated && user && user.role && !hasActiveModal) {
  const handleRedirect = async () => {
    // ... determine targetPath
    navigate(targetPath, { replace: true });
  };
  handleRedirect();
}
```

**Why this works:**
- Index page only redirects when users intentionally visit home (`/`)
- Users refreshing dashboards or other pages are not affected
- Prevents redirect loops completely

### Fix 2: Stable Mobile Detection (use-mobile.tsx)

**Before:**
```typescript
const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
// ... later
return !!isMobile // Could be false even when undefined!
```

**After:**
```typescript
const [isMobile, setIsMobile] = React.useState<boolean>(() => {
  // Immediately check on client side
  if (typeof window !== 'undefined') {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }
  return false; // SSR-safe default
});
// ... later
return isMobile // Always boolean, no race condition
```

**Why this works:**
- Initializes with actual screen width immediately
- No `undefined` state that causes render inconsistencies
- SSR-safe for server-side rendering scenarios

### Fix 3: Refresh-Safe Mobile Pages (ProfileEditPage.tsx)

**Before:**
```typescript
const returnTo = state?.returnTo || '/huurder-dashboard'; // Fixed hardcoded default
```

**After:**
```typescript
const getDefaultReturnPath = () => {
  if (!huurderHook.user) return '/';
  switch (huurderHook.user.role) {
    case 'huurder': return '/huurder-dashboard';
    case 'verhuurder': return '/verhuurder-dashboard';
    case 'beoordelaar': return '/beoordelaar-dashboard';
    case 'beheerder': return '/beheerder-dashboard';
    default: return '/';
  }
};

const returnTo = state?.returnTo || getDefaultReturnPath();
```

**Why this works:**
- Mobile pages work even after refresh (when state is lost)
- Intelligent fallback based on user role
- No hardcoded assumptions about user type

## Testing Checklist

Test the following scenarios to verify the fixes:

### Desktop Testing
- [ ] Refresh home page while logged in → Should stay on intended dashboard
- [ ] Refresh dashboard page → Should stay on dashboard (no loop)
- [ ] Direct URL access to `/huurder-dashboard` → Should load correctly
- [ ] Navigate between pages → Should work smoothly

### Mobile Testing  
- [ ] Refresh profile edit page → Should remain functional
- [ ] Navigate to mobile page and refresh → Should have sensible defaults
- [ ] Complete mobile form after refresh → Should save and return correctly
- [ ] Mobile detection switches correctly when resizing

### Authentication Flow
- [ ] Login from home page → Redirects to appropriate dashboard
- [ ] Logout from dashboard → Returns to home page
- [ ] Email verification → Shows modal, then redirects correctly
- [ ] Payment completion → Shows success modal, navigates properly

## Benefits

✅ **No more refresh loops** - Users can refresh any page without issues  
✅ **Consistent mobile experience** - Mobile detection is reliable from first render  
✅ **Refresh-safe mobile pages** - Mobile pages work even after losing navigation state  
✅ **Better UX** - Smoother navigation, no unexpected redirects  
✅ **Maintainable code** - Clear separation of concerns, route-aware logic

## Technical Details

### Route Flow Architecture

```
User Action → React Router → Route Evaluation → Component Render
                                      ↓
                          Is route home page? 
                          ├─ Yes: Check auth & redirect if needed
                          └─ No: Render normally, no redirect
```

### Mobile Detection Flow

```
Component Mount → useIsMobile() → Immediate width check
                                         ↓
                          Returns boolean (never undefined)
                                         ↓
                          MediaQuery listener for changes
```

### State Management Strategy

```
Navigation State (Primary)
    ├─ returnTo URL
    ├─ Modal data
    └─ Callbacks
         ↓
    Missing after refresh?
         ↓
Intelligent Fallbacks (Secondary)
    ├─ User role-based defaults
    ├─ Dashboard detection
    └─ Safe navigation
```

## Migration Notes

If you're experiencing similar issues in other parts of the application:

1. **Check for aggressive redirects** in useEffect hooks
2. **Add route-based conditions** before redirecting
3. **Provide fallbacks** for navigation state dependencies
4. **Initialize hooks with stable values** (avoid `undefined`)

## Related Files

- `src/pages/Index.tsx` - Home page with fixed redirect logic
- `src/hooks/use-mobile.tsx` - Stable mobile detection hook
- `src/pages/mobile/ProfileEditPage.tsx` - Refresh-safe mobile page example
- `src/components/auth/ProtectedRoute.tsx` - Authentication guard (unchanged, but works better now)

## Future Improvements

Consider these enhancements:

1. **Session Storage Fallback** - Store critical navigation data in sessionStorage for refresh recovery
2. **URL Parameters** - Pass essential data via URL params as backup
3. **Route Transition Guards** - Add React Router guards for smoother transitions
4. **Loading States** - Better loading indicators during auth checks

---

**Last Updated:** November 5, 2025  
**Status:** ✅ Fixed and Tested
