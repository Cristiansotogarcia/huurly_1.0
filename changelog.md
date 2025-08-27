# Changelog

## 2024-07-30

### Fixed
- Resolved issue where "Profiel Opslaan" button was not saving data due to `isSubmitting` state not being properly handled. 
  - Modified `ProfileFormNavigation.tsx` to accept an `onSaveClick` prop and updated the "Profiel Opslaan" button's `onClick` handler to call this prop.
  - Updated `EnhancedProfileUpdateModal.tsx` to pass an `onSaveClick` prop to `ProfileFormNavigation`, which sets `isManuallySubmitting(true)`.
- Improved error handling in `useHuurder.ts` for `handleProfileComplete` function. 
  - Added more specific logging for success and failure cases of `userService.updateTenantProfile`.
  - Ensured correct access to error messages from `DatabaseResponse` objects.
  - Added checks for missing required fields in `handleProfileComplete` for `preferred_city`, `preferred_property_type`, `min_budget`, and `max_budget`.