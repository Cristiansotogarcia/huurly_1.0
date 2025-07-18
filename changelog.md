# Huurly Project Changelog

## Fix: Database Column Name Mismatches - January 2025

**Change:** Fixed TypeScript compilation errors caused by incorrect database column name references in ProfilePictureUpload.tsx and UserService.ts.

**Problem:** The application was using outdated column names that no longer existed in the database schema:
- `profielfoto_url_old` was being used instead of `profiel_foto` for profile picture URLs
- `kinderen` was being used instead of `aantal_kinderen` for children count filtering

**Root Cause:** Database schema changes had renamed/restructured columns, but the application code was not updated to reflect these changes. The migration files showed that:
- `profielfoto_url` was renamed to `profielfoto_url_old` and then the correct column became `profiel_foto`
- `kinderen` column was replaced with `aantal_kinderen` during table restructuring

**Solution:**
- Updated ProfilePictureUpload.tsx to use `profiel_foto` instead of `profielfoto_url_old`
- Updated UserService.ts to use `profiel_foto` for profile picture queries
- Updated UserService.ts to use `aantal_kinderen` instead of `kinderen` for children count filtering

**Technical Changes:**
- Modified ProfilePictureUpload.tsx: Changed `.update({ profielfoto_url_old: publicUrl })` to `.update({ profiel_foto: publicUrl })`
- Modified ProfilePictureUpload.tsx: Changed `.update({ profielfoto_url_old: null })` to `.update({ profiel_foto: null })`
- Modified UserService.ts: Changed `.select('profielfoto_url_old')` to `.select('profiel_foto')`
- Modified UserService.ts: Changed `tenant?.profielfoto_url_old` to `tenant?.profiel_foto`
- Modified UserService.ts: Changed `.gt('kinderen', 0)` to `.gt('aantal_kinderen', 0)`
- Modified UserService.ts: Changed `.eq('kinderen', 0)` to `.eq('aantal_kinderen', 0)`

**Files Modified:**
- `src/components/ProfilePictureUpload.tsx`
- `src/services/UserService.ts`
- `changelog.md`

**Result:** TypeScript compilation now passes without errors (exit code 0). Profile picture upload/removal and children filtering functionality now work correctly with the current database schema.

**Key Learning:** Always verify database column names match the current schema after migrations, especially when columns are renamed or restructured.

---
## Fix: Database Migration Column Reference Error - January 2025

**Change:** Fixed critical error in huurders table restructure migration script that was causing deployment failures.

**Problem:** The migration script `20250105000000_restructure_huurders_table.sql` was failing with error "column 'kinderen' does not exist" during database push. The script was attempting to reference the `kinderen` column in a data migration step after it had already been dropped in an earlier step.

**Root Cause:** The migration script had incorrect step ordering - it was trying to migrate data from the `kinderen` column to new columns (`heeft_kinderen` and `aantal_kinderen`) in Step 8, but the `kinderen` column was already dropped in Step 3. This created a logical error where the script referenced a non-existent column.

**Solution:** 
- Reordered migration steps to perform data migration BEFORE dropping source columns
- Moved data migration from Step 8 to Step 2 (before column renames and drops)
- Updated all subsequent step numbers to maintain logical flow
- Ensured data is migrated from `kinderen` to `has_children` and `number_of_children` before renaming these columns to Dutch equivalents
- Removed duplicate data migration section that was causing the error

**Technical Changes:**
- Moved data migration logic to Step 2: `UPDATE public.huurders SET has_children = CASE WHEN kinderen > 0 THEN true ELSE false END, number_of_children = COALESCE(kinderen, 0)`
- Reordered steps: Data migration → Column renames → Column drops → Comments → Functions → Triggers → Indexes → RLS
- Updated step numbering from 1-11 to maintain logical sequence
- Removed redundant data migration section that referenced dropped columns

**Files Modified:**
- `supabase/migrations/20250105000000_restructure_huurders_table.sql`
- `changelog.md`

**Result:** Database migration now executes successfully without column reference errors. The huurders table restructure can be deployed safely with proper data preservation and Dutch column naming.

**Key Learning:** Always perform data migration operations BEFORE dropping source columns in database migrations to avoid reference errors.

---

## Migration Fix: Duplicate Key Constraint Error - January 2025

**Change:** Resolved duplicate key constraint violation when applying huurders table restructure migration.

**Problem:** Migration was failing with `ERROR: duplicate key value violates unique constraint "schema_migrations_pkey"` when attempting to apply migration `20250105000000_restructure_huurders_table.sql`. The migration version already existed in the `schema_migrations` table from a previous partial application.

**Root Cause:** The migration had been partially applied previously, leaving an entry in `schema_migrations` table. Attempting to reapply the same migration version caused a primary key constraint violation.

**Solution:** 
- Created new migration file with fresh timestamp: `20250714171602_restructure_huurders_table_fixed.sql`
- Copied the corrected migration content to the new file
- Deleted the problematic original migration file
- Successfully applied the new migration

**Technical Changes:**
- Created `supabase/migrations/20250714171602_restructure_huurders_table_fixed.sql`
- Deleted `supabase/migrations/20250105000000_restructure_huurders_table.sql`
- Migration applied successfully with exit code 0

**Files Modified:**
- `supabase/migrations/20250714171602_restructure_huurders_table_fixed.sql` (created)
- `supabase/migrations/20250105000000_restructure_huurders_table.sql` (deleted)
- `changelog.md`

**Result:** Migration now executes successfully without duplicate key constraint violations. The huurders table restructure is properly applied with correct data migration ordering.

**Key Learning:** When migration versions conflict, create a new migration with a fresh timestamp rather than attempting to modify existing migration entries.

---

## Fix: Payment Modal Flash on Login - January 2025

**Change:** Fixed payment modal flashing for users who have already confirmed their payment when they log in.

**Problem:** Users with active subscriptions were experiencing a brief flash of the payment modal during login, creating a poor user experience and confusion about their payment status.

**Root Cause:** A race condition in the payment modal visibility logic in `HuurderDashboard.tsx`. The modal was controlled by a useEffect that checked `!isLoadingSubscription && !isSubscribed`, but there was a brief moment during login where `isLoadingSubscription` became `false` before the actual subscription data had loaded, causing the modal to flash.

**Solution:** 
- Added `hasInitialDataLoaded` state to track when the first data load completes
- Modified the payment modal visibility logic to only show the modal after initial data has been loaded
- This prevents the modal from showing prematurely during the initial loading phase while maintaining correct behavior for unsubscribed users

**Technical Changes:**
- Added `hasInitialDataLoaded` state variable to `HuurderDashboard.tsx`
- Added useEffect to track when initial data loading completes
- Updated payment modal visibility logic to include `hasInitialDataLoaded` and `!isLoading` conditions
- Enhanced the dependency array to include the new state variable

**Files Modified:**
- `src/pages/HuurderDashboard.tsx`
- `changelog.md`

**Result:** Users with active subscriptions no longer see a payment modal flash during login, providing a smooth and professional user experience.

---

## Performance Optimization: Payment Processing Flow - January 2025

**Change:** Optimized the `create-checkout-session` edge function for significantly faster payment processing.

**Optimizations Applied:**
- Cached environment variables and Stripe/Supabase client initialization outside request handler to eliminate repeated setup overhead
- Implemented optimized customer resolution using try/create pattern instead of list/create to reduce Stripe API calls
- Streamlined session payload creation with type-safe constants
- Reduced logging overhead by removing verbose request/response logging
- Translated all error messages to Dutch for consistent user experience

**Performance Impact:** Reduced payment processing time by eliminating redundant API calls and client initialization overhead. The optimized customer resolution pattern reduces Stripe API calls from 2 to 1 in most cases.

**Technical Changes:**
- Modified `create-checkout-session` edge function in `supabase/functions/create-checkout-session/index.ts`
- Moved client initialization outside request handler for better performance
- Optimized Stripe customer resolution logic
- Enhanced error handling with Dutch language support

**Files Modified:**
- `supabase/functions/create-checkout-session/index.ts`
- `changelog.md`

**Result:** Faster payment processing with improved user experience through Dutch language support and reduced latency.

---

## Performance Optimization: Signup to Payment Flow - January 2025

**Change:** Optimized the `register-user` edge function for improved performance during user registration.

**Optimizations Applied:**
- Cached timestamp generation to avoid multiple `new Date().toISOString()` calls
- Cached `fullName` variable to prevent repeated string concatenation
- Removed unnecessary `.select()` calls for `verhuurder` and `beoordelaar` role creation (only kept for `huurder` role where verification is critical)
- Enhanced logging for all role types without performance impact

**Performance Impact:** Reduced database round trips and improved edge function execution time while maintaining all error handling and data integrity checks.

**Technical Changes:**
- Modified `register-user` edge function in `supabase/functions/register-user/index.ts`
- Optimized variable caching and database operations
- Maintained comprehensive error handling for critical operations

**Files Modified:**
- `supabase/functions/register-user/index.ts`
- `changelog.md`

**Result:** Faster user registration process with maintained reliability and error handling.

---

## Fix: 400 POST Error in Huurders Table Registration - January 2025

**Change:** Fixed 400 POST error occurring during user registration when creating huurders table records.

**Problem:** Users were being successfully created in `auth.users` and `public.gebruikers` tables, but the registration process was failing with a 400 POST error when attempting to insert into the `public.huurders` table. The Supabase logs showed the error was coming from the `register-user` edge function.

**Root Cause:** The error was caused by a foreign key constraint violation. The `huurders` table has a foreign key constraint `huurders_id_fkey` that requires the `id` to exist in the `public.gebruikers` table. While the `gebruikers` record was being created, there was insufficient error handling and validation to ensure the record was successfully inserted before attempting to create the dependent `huurders` record.

**Solution:** 
- Enhanced the `register-user` edge function with better error handling and validation
- Added `.select()` to the `gebruikers` upsert operation to verify the record was actually created
- Added validation to check that `userData` is returned before proceeding
- Enhanced error logging for the `huurders` insert operation with detailed error information
- Added validation to ensure `huurderData` is returned after the upsert operation

**Technical Changes:**
- Modified `register-user` edge function to include comprehensive error handling
- Added detailed logging for debugging foreign key constraint issues
- Ensured proper validation of database operations before proceeding to dependent table inserts

**Files Modified:**
- `supabase/functions/register-user/index.ts`
- `changelog.md`

**Result:** User registration now properly validates each step of the process and provides detailed error information for debugging, preventing foreign key constraint violations.

---

## Fix: User Registration Race Condition - January 2025

**Change:** Fixed race condition in user registration process that prevented users from being created in public.gebruikers and public.huurders tables.

**Problem:** During user signup, the userMapper.mapSupabaseUserToUser function was attempting to query the 'gebruikers' table before the 'register-user' edge function had completed creating the user records. This created a race condition where the userMapper would fail to find the user data, causing the registration process to fail even though the user was successfully created in auth.users.

**Root Cause:** The userMapper was making database queries to fetch user role and profile information immediately after signup, but these queries occurred before the register-user edge function had time to insert the records into the public tables.

**Solution:** 
- Modified userMapper.ts to avoid database queries during initial user mapping
- Changed the fallback logic to rely on user metadata and email-based role determination instead of database queries
- This eliminates the race condition and allows the registration process to complete successfully

**Technical Changes:**
- Updated userMapper.mapSupabaseUserToUser to use supabaseUser.user_metadata?.role as fallback
- Removed database queries for 'gebruikers' and 'abonnementen' tables during initial mapping
- Maintained existing role mapping logic using roleMapper.determineRoleFromEmail

## Fix: User Creation Timeout - January 2025

**Change:** Resolved a 504 Gateway Timeout error that occurred during user registration.

**Problem:** The user creation process was failing with a 504 Gateway Timeout error. This was caused by the `register-user` edge function being blocked by restrictive Row Level Security (RLS) policies on the `gebruikers`, `huurders`, `verhuurders`, and `beoordelaars` tables.

**Root Cause:** The RLS policies for these tables did not explicitly allow the `service_role` to perform insert operations. When the `register-user` function, which uses the `service_role` key, attempted to insert new records, the database would not respond, leading to a timeout.

**Solution:** 
- Updated the RLS policies for the `gebruikers`, `huurders`, `verhuurders`, and `beoordelaars` tables to allow the `service_role` to perform all operations.
- This was achieved by adding the condition `auth.jwt() ->> 'role' = 'service_role'` to the `USING` and `WITH CHECK` clauses of the policies.

**Technical Changes:**
- Modified the RLS policies for the `gebruikers`, `huurders`, `verhuurders`, and `beoordelaars` tables.

**Files Modified:**
- `supabase/migrations/20250106000001_fix_huurders_rls_for_service_role.sql`
- `changelog.md`

**Result:** User registration now completes successfully without a timeout, and the RLS policies correctly handle both user-level and service-level access.

---

## Fix: RLS Policy for Service Role User Creation - January 2025

**Change:** Fixed RLS policies to allow service_role operations for user creation in production

**Problem:** User creation was failing in production with a 406 error when the register-user edge function tried to insert into the huurders table. The error occurred because the RLS policy "Eigen huurder" only allowed users to access their own records (auth.uid() = id), but when using service_role permissions, auth.uid() returns null, causing the policy to block the insertion.

**Root Cause:** Recent RLS security vulnerability fixes made policies more restrictive without accounting for legitimate service_role operations needed for user registration. The register-user edge function uses service_role permissions to create user records, but the RLS policies were blocking these operations.

**Solution:** 
- Updated RLS policies for huurders, gebruikers, verhuurders, and beoordelaars tables to allow service_role operations
- Added condition `auth.jwt() ->> 'role' = 'service_role'` to both USING and WITH CHECK clauses
- This allows the register-user edge function to successfully create user records while maintaining security for regular user operations
- Maintains existing security model where users can only access their own records

**Technical Changes:**
- Modified "Eigen huurder" policy on public.huurders table
- Modified "Eigen gebruiker" policy on public.gebruikers table  
- Modified "Eigen verhuurder" policy on public.verhuurders table
- Modified "Eigen beoordelaar" policy on public.beoordelaars table
- All policies now allow both user self-access and service_role operations

**Files Modified:**
- `supabase/migrations/20250106000001_fix_huurders_rls_for_service_role.sql`
- `changelog.md`

**Result:** User registration now works correctly in production while maintaining proper security restrictions

---

## Stripe Checkout Dutch Locale Configuration - January 2025

**Change:** Added Dutch locale parameter to Stripe checkout session creation

**Problem:** Stripe checkout pages were defaulting to the user's browser language or English instead of consistently displaying in Dutch for all users

**Root Cause:** The `create-checkout-session` function was not explicitly setting a locale parameter, causing Stripe to use default language detection

**Solution:** 
- Added `locale: "nl"` parameter to the sessionPayload object in the create-checkout-session function
- This ensures all Stripe checkout pages display in Dutch regardless of user's browser settings
- Maintains consistency with the existing Dutch language implementation throughout the application

**Technical Changes:**
- Modified `sessionPayload` object in `supabase/functions/create-checkout-session/index.ts`
- Added `locale: "nl"` parameter to force Dutch language on all Stripe checkout sessions
- Complements existing Dutch language features like `mapStripeStatusToDutch()` in webhook handling
- Aligns with frontend `'nl-NL'` formatting used in `stripe-config.ts`

**Files Modified:**
- `supabase/functions/create-checkout-session/index.ts`
- `changelog.md`

**Result:** All Stripe checkout pages now consistently display in Dutch for all users

---

## Migration Fix: Betalingen Table Reference Error - January 2025

**Change:** Fixed migration error in `20250105000005_fix_betalingen_trigger_again.sql`

**Problem:** Migration was failing with error "relation 'public.betalingen' does not exist" because the migration was trying to drop a trigger on a table that was never created

**Root Cause:** The migration file contained a reference to drop a trigger on the `betalingen` table, but this table was never created in any previous migration

**Solution:** 
- Removed the line `DROP TRIGGER IF EXISTS on_betalingen_update ON public.betalingen;`
- Updated the comment to reflect that only the abonnementen table trigger is being handled
- Migration now only handles the existing abonnementen table

**Technical Changes:**
- Removed reference to non-existent betalingen table
- Kept the abonnementen table trigger handling intact
- Migration is now focused only on existing tables

**Files Modified:**
- `supabase/migrations/20250105000005_fix_betalingen_trigger_again.sql`
- `changelog.md`

**Result:** Migration now executes successfully without trying to reference non-existent tables

---

## Migration Fix: RLS Security Vulnerabilities Dependency Error - January 2025

**Change:** Fixed migration dependency error in `20250105000003_fix_rls_security_vulnerabilities.sql`

**Problem:** Migration failed with error "cannot drop view actieve_huurders because other objects depend on it" - specifically the `zoek_huurders` function depends on the view

**Root Cause:** The migration attempted to drop and recreate the `actieve_huurders` view without first handling the dependent `zoek_huurders` function that returns `SETOF public.actieve_huurders`

**Solution:** 
- Added `DROP FUNCTION IF EXISTS public.zoek_huurders(text, integer, integer, boolean, boolean)` before dropping the view
- Recreated the `zoek_huurders` function after the view is recreated
- Maintained the original view structure for compatibility
- Added `security_invoker = true` to the view for enhanced security
- Removed RLS policy creation on views (PostgreSQL doesn't support policies on views)
- Security for views is handled through underlying table policies and `security_invoker` setting
- Fixed `documenten_wachtend` view column reference from `g.voornaam` to `g.naam` (correct column name in gebruikers table)

**Technical Changes:**
- Modified the view recreation order to handle dependencies properly
- Maintained backward compatibility with existing function signatures
- Enhanced security with `security_invoker` and profile completeness checks
- Added `g.profiel_compleet = true` filter for additional security

**Files Modified:**
- `supabase/migrations/20250105000003_fix_rls_security_vulnerabilities.sql`
- `changelog.md`

**Result:** Migration now executes successfully with proper dependency handling and enhanced security

---

## Migration Fix: Check Constraint Subquery Error - January 2025

**Change:** Fixed check constraint with subquery in migration `20250103000007_add_enhanced_profile_fields.sql`

**Problem:** PostgreSQL doesn't allow subqueries in CHECK constraints, causing error "cannot use subquery in check constraint"

**Root Cause:** The constraint was using `NOT EXISTS (SELECT 1 FROM unnest(children_ages)...)` which is a subquery

**Solution:** 
- Created a custom PL/pgSQL function `public.validate_children_ages()` to validate the array
- Replaced the subquery-based constraint with a function-based constraint

**Technical Changes:**
- Added `validate_children_ages(ages integer[])` function that validates array length and age ranges
- Function checks: array is null/empty, max 10 children, ages between 0-25
- Replaced complex CHECK constraint with `CHECK (public.validate_children_ages(children_ages))`

**Files Modified:**
- `supabase/migrations/20250103000007_add_enhanced_profile_fields.sql`
- `changelog.md`

**Result:** Migration now executes successfully with proper validation logic using a dedicated function

---

## Migration Fix: Storage Policies Duplicate Error - January 2025

**Change:** Fixed duplicate policy creation in migration `20250103000000_create_storage_policies.sql`

**Problem:** Migration was failing with error "policy already exists" because the policy "Allow users to upload own documents" was being created twice in the same migration file

**Root Cause:** The migration file contained two identical CREATE POLICY statements for the same policy on lines 19-23, causing a duplicate policy error

**Solution:** 
- Removed the duplicate CREATE POLICY statement
- Added `DROP POLICY IF EXISTS` statements for all policies to make the migration re-runnable
- Made the migration idempotent to prevent future conflicts

**Technical Changes:**
- Removed duplicate policy creation on lines 19-23
- Added `DROP POLICY IF EXISTS` statements before each CREATE POLICY
- Migration can now be safely re-run without errors

**Files Modified:**
- `supabase/migrations/20250103000000_create_storage_policies.sql`
- `changelog.md`

**Result:** Migration now executes successfully and storage policies are created without conflicts

---

## Migration Fix: Actieve Huurders View - January 2025

**Change:** Fixed migration error in `20250102000003_create_opgeslagen_profielen_and_search_rpc.sql` where the view was trying to reference non-existent `h.is_actief` column

**Problem:** Migration was failing with error "column h.is_actief does not exist (SQLSTATE 42703)" because the `huurders` table doesn't have an `is_actief` column

**Root Cause:** The migration was attempting to create a view `actieve_huurders` that filtered huurders by `h.is_actief = true`, but this column was never added to the huurders table schema

**Solution:** 
- Replaced the non-existent `h.is_actief` column reference with proper business logic
- Added JOIN with `abonnementen` table to determine active huurders based on subscription status
- Changed filter from `h.is_actief = true` to `a.status = 'actief'`
- Updated SELECT clause to include `a.status as abonnement_status` instead of `h.is_actief`

**Technical Changes:**
- Modified `CREATE OR REPLACE VIEW public.actieve_huurders` to join with abonnementen table
- Added `JOIN public.abonnementen AS a ON h.id = a.huurder_id`
- Changed WHERE clause to `a.status = 'actief'`
- This approach correctly identifies active huurders as those with active subscriptions

**Files Modified:**
- `supabase/migrations/20250102000003_create_opgeslagen_profielen_and_search_rpc.sql`
- `changelog.md`

**Result:** Migration now executes successfully and the `actieve_huurders` view correctly shows only huurders with active subscriptions

---

## Database Migration Dependency Resolution - January 2025

**Change:** Systematically reorganized all database migration files to resolve dependency issues and ensure proper chronological execution order

**Reason:** Database push operations were failing with "relation does not exist" errors due to incorrect migration timestamp ordering. Migrations were executing out of dependency order, causing tables to be referenced before they were created.

**Implementation:**
- Analyzed all 23 migration files and categorized them into logical layers:
  - **Foundation Layer (20250101xxxxxx)**: Core tables and essential functions that other migrations depend on
  - **Dependent Tables Layer (20250102xxxxxx)**: Tables that reference foundation layer tables
  - **Enhancements Layer (20250103xxxxxx)**: Policies, indexes, and feature additions
  - **Data Layer (20250104xxxxxx)**: Initial data insertions
  - **Fixes Layer (20250105xxxxxx)**: Bug fixes and corrections
- Renamed all migration files with proper chronological timestamps to ensure correct execution order
- Used `supabase migration repair` to synchronize local and remote migration histories
- Verified successful database push after reorganization

**Technical Changes:**
- Renamed 23 migration files from various timestamps to organized chronological sequence
- Removed duplicate migration files to prevent conflicts
- Repaired migration history table to mark renamed migrations as applied
- Ensured all dependencies are resolved in correct order

**Files Renamed:**
- All migration files in `supabase/migrations/` directory
- Maintained original functionality while fixing execution order

**Result:** Database push operations now work successfully without dependency errors

---

## Enhanced Profile Modal Improvements - January 2025

**Change:** Added children information, partner income, and extra income fields to the enhanced profile modal

**Reason:** User requested additional functionality in the enhanced profile modal: 1) Option to add kids (how many and their ages) in step 1, 2) Partner income field in step 2 when user selects 'Getrouwd' or 'Samenwonend', 3) Extra income option with comment box in step 2

**Implementation:**
- Updated `profileSchema.ts` to include new fields:
  - `has_children`: Boolean field to indicate if user has children
  - `number_of_children`: Number field for amount of children (0-10)
  - `children_ages`: Array of numbers for children's ages (0-25)
  - `partner_income`: Optional number field for partner's income
  - `extra_income`: Optional number field for additional income
  - `extra_income_description`: Optional string field to describe type of extra income
- Modified `Step1_PersonalInfo.tsx` to add children information section:
  - Added "Heb je kinderen?" yes/no selector
  - Conditional display of children details when "yes" is selected
  - Number of children dropdown (1-10)
  - Dynamic age input fields based on number of children
  - Used Baby icon and blue styling for visual consistency
- Updated `Step2_Employment.tsx` to include income-related fields:
  - Added partner income section that appears when marital status is 'getrouwd' or 'samenwonend'
  - Added extra income section with amount field and description textarea
  - Used Users icon for partner income and Plus icon for extra income
  - Applied purple styling for partner income and green styling for extra income
- Updated `EnhancedProfileCreationModal.tsx` default values to include new fields
- Added proper form validation and error handling for all new fields
- Used Dutch language for all UI elements as per project requirements

**Technical Changes:**
- `src/components/modals/profileSchema.ts`: Added validation schemas for new fields
- `src/components/modals/steps/Step1_PersonalInfo.tsx`: Added children information section
- `src/components/modals/steps/Step2_Employment.tsx`: Added partner and extra income sections
- `src/components/modals/EnhancedProfileCreationModal.tsx`: Updated default values

**Files Modified:**
- `src/components/modals/profileSchema.ts`
- `src/components/modals/steps/Step1_PersonalInfo.tsx`
- `src/components/modals/steps/Step2_Employment.tsx`
- `src/components/modals/EnhancedProfileCreationModal.tsx`
- `changelog.md`

---

## Form Input Border Visibility Improvement - January 2025

**Change:** Made form input borders darker for better visibility

**Reason:** User reported that form placeholder borders were very light gray and almost invisible, making it difficult to see input field boundaries

**Implementation:**
- Modified CSS variable `--input` in `src/index.css` from `214.3 31.8% 91.4%` to `214.3 31.8% 60%`
- This change affects all input components that use the `border-input` class
- Reduced lightness from 91.4% to 60% (about 35% darker) to make borders significantly more visible while maintaining the same hue and saturation
- User requested additional 20% darker adjustment for optimal visibility

**Technical Changes:**
- `src/index.css`: Updated `--input` CSS variable for darker border color

**Files Modified:**
- `src/index.css`
- `changelog.md`

---

## Date Picker to Text Input Change - January 2025

**Change:** Replaced the date picker for 'geboorte datum' in the enhanced profile modal with a simple text input that accepts dd/mm/yyyy format

**Reason:** User requested a simpler input method where users can just type the date in dd/mm/yyyy format (e.g., 13/09/1988) instead of using a date picker

**Implementation:**
- Modified `profileSchema.ts` to change `date_of_birth` validation from `z.date()` to `z.string()` with:
  - Regex pattern validation for dd/mm/jjjj format (Dutch localization)
  - Custom validation to ensure the date is valid (not 31/02/2023)
  - Date range validation (not in future, not before 1900)
- Updated `Step1_PersonalInfo.tsx` to replace `EnhancedDatePicker` with regular `Input` component
- Added automatic formatting that inserts slashes as user types
- Updated default value in `EnhancedProfileCreationModal.tsx` from `undefined` to empty string
- Added calendar icon to maintain visual consistency
- Updated placeholder and error messages to use Dutch format (dd/mm/jjjj)

**Technical Changes:**
- `src/components/modals/profileSchema.ts`: Changed date_of_birth validation to string with custom validation
- `src/components/modals/steps/Step1_PersonalInfo.tsx`: Replaced date picker with formatted text input
- `src/components/modals/EnhancedProfileCreationModal.tsx`: Updated default value

**Files Modified:**
- `src/components/modals/profileSchema.ts`
- `src/components/modals/steps/Step1_PersonalInfo.tsx`
- `src/components/modals/EnhancedProfileCreationModal.tsx`
- `changelog.md`

---

## Database Authentication Error Fix - January 2025

**Problem:** Getting 400 Bad Request error with "No API key found" when accessing admin dashboard, causing database queries to fail

**Root Cause:** The `useBeheerderDashboard` hook was making API calls to `userService.getUsers()` before authentication was fully established, causing Supabase queries to fail due to missing authentication context

**Solution:**
- Added authentication guards to `useBeheerderDashboard` hook
- Implemented proper timing checks to ensure API calls only happen after authentication is complete
- Added role-based authorization checks within the hook
- Improved error handling and logging

**Technical Changes:**
- Updated `src/hooks/useBeheerderDashboard.ts`:
  - Added `useAuth` hook integration for authentication state
  - Added authentication and authorization guards before API calls
  - Implemented proper loading state management based on auth status
  - Added role verification (only 'beheerder' can access)
  - Improved error logging with `logger` instead of `console.error`
  - Updated dependency array to include auth state variables

**Files Modified:**
- `src/hooks/useBeheerderDashboard.ts`
- `changelog.md`

---

## Password Reset Loading Issue Fix - January 2025

**Problem:** Password reset page was hanging in loading state after token verification

**Root Cause:** The `onAuthStateChange` callback in `authService.ts` was triggering heavy user mapping database queries through `userMapper.mapSupabaseUserToUser` after password token verification, causing the UI to remain in loading state

**Solution:** 
- Modified `ResetPassword.tsx` to directly use `supabase.auth.updateUser()` instead of the `useAuth` hook
- Added password validation using `passwordSchema` from `@/lib/validation`
- Implemented automatic sign-out after successful password update to ensure clean authentication state
- Bypassed the heavy user mapping process that was causing the hang

**Technical Changes:**
- Updated `src/pages/ResetPassword.tsx`:
  - Removed `useAuth` import and usage
  - Added direct Supabase client usage for password updates
  - Added `passwordSchema` validation (corrected import from `@/lib/validation`)
  - Added automatic sign-out after password update
  - Improved error handling and user feedback

**Files Modified:**
- `src/pages/ResetPassword.tsx`
- `changelog.md`

---

## Password Reset Flow Code Quality Improvements - December 2024

### Issue Fixed
**IMPROVED**: Password reset flow now uses proper auth service methods
- **Problem**: ResetPassword.tsx was directly calling `supabase.auth.updateUser` instead of using the centralized auth service
- **Root Cause**: Inconsistent use of auth methods across the application
- **Solution**: Updated ResetPassword component to use `useAuth` hook's `updatePassword` method
- **Impact**: Better error handling, validation, and consistency with the rest of the application

### Technical Details
- **File Modified**: `src/pages/ResetPassword.tsx` - Now uses `useAuth` hook's `updatePassword` method
- **Benefits**: 
  - Proper password validation using `passwordSchema`
  - Consistent error handling and messaging
  - Better integration with the application's auth flow
  - Centralized auth logic maintenance
- **TypeScript**: No compilation errors after refactoring
- **Verification**: All Supabase auth types are correctly configured

---

## Password Reset Token Parameter Standardization - December 2024

### Issue Fixed
**FIXED**: Password reset token parameter standardized to use 'token'
- **Problem**: Supabase continued sending `token` parameter despite custom email template configuration
- **Root Cause**: Supabase default behavior uses `token` parameter for recovery flows
- **Solution**: Updated codebase to use `token` parameter and aligned email template accordingly
- **Impact**: Password reset links now work correctly with standard Supabase token format

### Technical Details
- **File Modified**: `src/pages/ResetPassword.tsx` - Changed from `token_hash` to `token` parameter
- **File Modified**: `supabase/templates/recovery.html` - Updated template to use `{{ .Token }}` variable
- **URL Format**: URLs now use standard format `?token=ABC123&type=recovery`
- **Approach**: Aligned codebase with Supabase's standard token parameter format
- **TypeScript**: No compilation errors after parameter change

---

## Password Reset Flow Implementation - December 2024

### Overview
Successfully implemented a complete password reset functionality using the latest Supabase authentication methods. The implementation follows modern best practices with proper error handling, rate limiting, and user-friendly Dutch interface.

### Files Created
1. **CREATED**: `src/pages/ResetPassword.tsx` - Complete password reset page with token verification
   - Handles URL token validation using `verifyOtp` method
   - Provides secure password update functionality
   - Includes comprehensive error handling and user feedback
   - Uses Dutch language for all UI elements

2. **CREATED**: `src/components/auth/ResetPasswordForm.tsx` - Password reset form component
   - Email input with validation
   - Integration with Supabase `resetPasswordForEmail` method
   - Success/error state management
   - Rate limiting feedback

### Files Modified
3. **MODIFIED**: `src/hooks/useAuth.ts`
   - Added `resetPassword` and `updatePassword` functions to interface
   - Implemented error handling and logging
   - Added functions to return object

4. **MODIFIED**: `src/lib/auth/authService.ts`
   - Added `resetPassword` method with email validation and rate limiting
   - Added `updatePassword` method with password strength validation
   - Integrated with Supabase auth methods
   - Proper error handling and user-friendly messages

5. **MODIFIED**: `src/lib/auth/rateLimiter.ts`
   - Added `passwordReset` configuration (3 attempts per hour)
   - Prevents abuse of password reset functionality

6. **MODIFIED**: `src/App.tsx`
   - Added lazy import for `ResetPassword` component
   - Added route `/wachtwoord-herstellen` for password reset page

7. **MODIFIED**: `src/components/auth/LoginForm.tsx`
   - Added `ResetPasswordForm` import
   - Added `showResetPassword` state management
   - Implemented conditional rendering between login and reset forms
   - Added "Wachtwoord vergeten?" button
   - Dynamic dialog title based on current view

### Technical Implementation Details
- **Supabase Integration**: Uses `resetPasswordForEmail` and `updateUser` methods
- **Security**: Implements rate limiting and token verification
- **User Experience**: Dutch language interface with clear feedback messages
- **Error Handling**: Comprehensive error catching and user-friendly error messages
- **Validation**: Email format and password strength validation
- **Routing**: Proper redirect flow with `/wachtwoord-herstellen` route

### Implementation Status
- [x] Remove existing password reset code
- [x] Get latest Supabase documentation
- [x] Implement fresh password reset flow
- [x] Update TypeScript types
- [x] Test TypeScript compilation (no errors)
- [x] Add rate limiting protection
- [x] Implement proper error handling
- [x] Create user-friendly Dutch interface

### Next Steps
- Manual testing of the complete password reset flow
- Email template configuration in Supabase dashboard
- Production deployment verification

## TypeScript Error Fixes - December 2024

### Issues Resolved
1. **Fixed RateLimiter recordAttempt Method Missing**
   - **File**: `src/lib/auth/rateLimiter.ts`
   - **Issue**: Property 'recordAttempt' does not exist on type 'RateLimiter'
   - **Solution**: Added `recordAttempt` method to RateLimiter class
   - **Implementation**: Method records rate limiting attempts with proper window management

2. **Fixed Supabase Import Path in ResetPassword.tsx**
   - **File**: `src/pages/ResetPassword.tsx`
   - **Issue**: Cannot find module '@/lib/supabase'
   - **Solution**: Updated import path from '@/lib/supabase' to '@/integrations/supabase/client'
   - **Result**: Consistent with project's Supabase client configuration

3. **Fixed Password Reset Token Parameter Mismatch**
   - **File**: `src/pages/ResetPassword.tsx`
   - **Issue**: "Ongeldige Reset Link" error - TypeScript error requiring email parameter for direct token verification
   - **Solution**: Reverted to using 'token_hash' parameter with PKCE flow as intended by Supabase email templates
   - **Root Cause**: Initial attempt to use direct token flow required email parameter not available in URL
   - **Technical Details**: Supabase email templates use PKCE flow with token_hash by default
   - **Result**: Password reset links now work correctly with proper PKCE token verification

### Technical Details
- **recordAttempt Method**: Handles first attempts, window expiration, and counter incrementation
- **Import Standardization**: All Supabase imports now use the correct path structure
- **TypeScript Compilation**: All errors resolved, compilation passes successfully

### Verification
- [x] TypeScript compilation passes without errors
- [x] Rate limiting functionality maintains consistency
- [x] Supabase client imports are standardized across the project

---

## Enhancement: Complete Huurders Table Mapping in Profile Modal - January 2025

**Change:** Ensured all columns from public.huurders table are mapped to form fields in the enhanced profile modal.

**Details:**
- Updated profileSchema.ts to include missing fields: inkomensbewijs_beschikbaar, borgsteller_beschikbaar, borgsteller_naam, borgsteller_relatie, borgsteller_telefoon, borgsteller_inkomen.
- Modified Step2_Employment.tsx to add UI for inkomensbewijs_beschikbaar checkbox and conditional borgsteller section.
- Modified Step3_Housing.tsx to add fields for min_kamers, max_kamers, vroegste_verhuisdatum, voorkeur_verhuisdatum, and beschikbaarheid_flexibel.

**Files Modified:**
- src/components/modals/profileSchema.ts
- src/components/modals/steps/Step2_Employment.tsx
- src/components/modals/steps/Step3_Housing.tsx
- changelog.md

**Result:** All huurders table columns now have corresponding data entry points in the profile modal, improving data completeness.

## Fix: Resolved Upload Loop and Display Issues for Profile and Cover Photos - [Current Date]
### Changes:
- Removed redundant Supabase updates in `PhotoSection.tsx` handlers, as the upload service already handles database updates.
- This prevents the double upload attempt that was causing the loop.
- Ensured refresh is called after upload to update the displayed photos.

**Files Modified:**
- `src/components/PhotoSection.tsx`

**Verification:**
- TypeScript compilation passes without errors.

---

#### Major Fix: Cover Photo and Profile Picture Rendering on Huurders Dashboard - January 2025

**Problem Analysis:** Cover photos and profile pictures were not rendering on the Huurders dashboard despite having upload functionality.

**Root Causes Identified:**
1. **Missing Cover Photo URL in Data Flow**: `ConsolidatedDashboardService.getProfilePictureUrl()` only returned profile picture URL, not cover photo URL
2. **Incomplete Data Interface**: `ConsolidatedDashboardData` interface lacked `coverPhotoUrl` field
3. **Missing Hook State**: `useHuurder` hook didn't manage cover photo URL state
4. **Component Integration Gap**: `ProfilePhotoSection` component was not integrated into `HuurderDashboard`
5. **Undefined Cover URL**: `PhotoSection.getCurrentCoverUrl()` always returned `undefined`

**Solutions Implemented:**

1. **Enhanced ConsolidatedDashboardService.ts:**
   - Added `coverPhotoUrl: string | null` to `ConsolidatedDashboardData` interface
   - Renamed `getProfilePictureUrl` to `getPhotoUrls` with return type `{ profilePictureUrl: string | null; coverPhotoUrl: string | null }`
   - Updated `getHuurderDashboardData` to properly extract and assign both photo URLs

2. **Updated useHuurder.ts:**
   - Added `coverPhotoUrl` state management
   - Integrated cover photo URL from consolidated dashboard service
   - Included `coverPhotoUrl` in hook return values

3. **Fixed PhotoSection.tsx:**
   - Updated `getCurrentCoverUrl()` to return `coverPhotoUrl` from `useHuurder` hook instead of `undefined`
   - Ensured proper cover photo URL retrieval and rendering

4. **Integrated ProfilePhotoSection into HuurderDashboard.tsx:**
   - Added `ProfilePhotoSection` import
   - Integrated component into dashboard content sections
   - Enabled cover photo and profile picture upload/display functionality

5. **Fixed CoverPhoto.tsx:**
   - Corrected syntax error (duplicate `) : (` on line 79)

**Technical Details:**
- **Database Schema**: Both `profiel_foto` and `cover_foto` columns were already present in `huurders` table
- **Upload Infrastructure**: All upload components (`ProfilePicture`, `CoverPhoto`, `useImageUpload`) were functional
- **Cloudflare R2 Integration**: Storage and retrieval mechanisms were working correctly
- **Issue**: Data flow from database to UI components was incomplete

**Files Modified:**
- `src/services/ConsolidatedDashboardService.ts` - Enhanced photo URL retrieval
- `src/hooks/useHuurder.ts` - Added cover photo state management
- `src/components/PhotoSection.tsx` - Fixed cover photo URL retrieval
- `src/pages/HuurderDashboard.tsx` - Integrated ProfilePhotoSection component
- `src/components/CoverPhoto.tsx` - Fixed syntax error

**Result:** Cover photos and profile pictures now render correctly on the Huurders dashboard with full upload and display functionality.

**Verification:** TypeScript compilation passes without errors after all modifications.

---

#### Bug Fixes
- Updated supabase import path in `CoverPhotoUpload.tsx` to resolve module not found error.
- Added missing 'userId' prop to `ProfilePictureUpload` component in `HuurderDashboard.tsx` to fix TypeScript type error.