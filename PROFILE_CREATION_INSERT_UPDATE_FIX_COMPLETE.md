# Profile Creation INSERT/UPDATE Fix - Complete Solution

## Problem Analysis

### Root Cause Identified
The Enhanced Profile Creation Modal was failing because it always called `userService.createTenantProfile()` regardless of whether the user was creating a new profile or editing an existing one. This caused database conflicts when trying to INSERT data for users who already had tenant profiles.

### Intended Behavior
- **New Users**: First time creating profile → INSERT operation
- **Existing Users**: Editing/updating profile → UPDATE operation

## Solution Implemented

### 1. Added Separate Update Method in UserService ✅

Created `updateTenantProfile()` method that:
- Uses UPDATE instead of INSERT/UPSERT
- Properly handles existing profile data
- Maintains audit logging for updates
- Includes all enhanced fields

```typescript
async updateTenantProfile(data: CreateTenantProfileData): Promise<DatabaseResponse<any>> {
  // ... validation and sanitization
  
  // Update tenant profile with all enhanced fields
  const { data: tenantProfile, error: tenantError } = await supabase
    .from('tenant_profiles')
    .update(tenantProfileData)  // UPDATE instead of INSERT
    .eq('user_id', currentUserId)
    .select()
    .single();
    
  // ... audit logging
}
```

### 2. Updated Modal Logic to Use Correct Method ✅

Modified `handleSubmit()` in EnhancedProfileCreationModal to:
- Check `editMode` prop to determine operation type
- Call appropriate service method based on mode
- Provide appropriate user feedback

```typescript
// Use the appropriate method based on edit mode
const result = editMode 
  ? await userService.updateTenantProfile(profileDataToSubmit)
  : await userService.createTenantProfile(profileDataToSubmit);
```

### 3. Enhanced User Feedback ✅

Updated toast messages to reflect the actual operation:
- Create mode: "Profiel aangemaakt!"
- Edit mode: "Profiel bijgewerkt!"

### 4. Database Schema Support ✅

- ✅ All enhanced fields added to database schema
- ✅ Proper constraints and validation
- ✅ Performance indexes created
- ✅ RLS policies automatically cover new fields

## Technical Implementation Details

### UserService Methods

#### `createTenantProfile()` - For New Users
- Uses `upsert()` for initial profile creation
- Includes `user_id` in data for INSERT operation
- Creates audit log with 'CREATE' action

#### `updateTenantProfile()` - For Existing Users
- Uses `update()` with `WHERE user_id = currentUserId`
- Excludes `user_id` from update data (not needed for UPDATE)
- Creates audit log with 'UPDATE' action
- Gets current data before update for audit trail

### Modal Integration

#### Edit Mode Detection
```typescript
const result = editMode 
  ? await userService.updateTenantProfile(profileDataToSubmit)
  : await userService.createTenantProfile(profileDataToSubmit);
```

#### Data Loading for Edit Mode
- Loads existing profile data when `editMode = true`
- Safely accesses enhanced fields using type casting
- Populates all form fields with existing data
- Handles missing fields gracefully with defaults

## Enhanced Fields Supported

### Personal Information
- `nationality` - Nationality selection
- `sex` - Gender identity (man/vrouw/anders/zeg_ik_liever_niet)

### Family & Relationships
- `marital_status` - Marital status
- `has_children` - Boolean for children
- `number_of_children` - Count of children
- `children_ages` - Array of children ages
- `has_partner` - Boolean for partner
- `partner_name` - Partner name
- `partner_profession` - Partner profession
- `partner_monthly_income` - Partner income
- `partner_employment_status` - Partner employment

### Location & Preferences
- `preferred_districts` - Array of preferred districts
- `max_commute_time` - Maximum commute time
- `transportation_preference` - Transportation preference
- `furnished_preference` - Furnished preference
- `desired_amenities` - Array of desired amenities

### Lifestyle Details
- `smoking_details` - Detailed smoking preferences
- `profile_picture_url` - Profile picture URL

### Computed Fields
- `total_household_income` - Automatically calculated combined income

## Database Schema Enhancements

### Performance Optimizations
- GIN indexes for array fields (districts, amenities)
- Regular indexes for frequently queried fields
- Computed column for total household income

### Data Integrity
- CHECK constraints for enum-like fields
- Proper data types for all fields
- Default values where appropriate

## RLS (Row Level Security)

### Automatic Coverage
- Existing RLS policies automatically cover new fields
- Users can only access their own tenant profile data
- Proper authentication required for all operations

### Policy Types
- **SELECT**: Users can read their own profile
- **INSERT**: Users can create their own profile
- **UPDATE**: Users can update their own profile
- **DELETE**: Users can delete their own profile (for GDPR compliance)

## Testing & Validation

### Scenarios Covered
1. **New User Profile Creation**: ✅ Works with INSERT
2. **Existing User Profile Update**: ✅ Works with UPDATE
3. **Enhanced Fields Storage**: ✅ All fields properly saved
4. **Edit Mode Data Loading**: ✅ Existing data properly loaded
5. **Form Validation**: ✅ Step-by-step validation works
6. **Error Handling**: ✅ Proper error messages displayed

## Files Modified

### Core Components
- `src/services/UserService.ts` - Added `updateTenantProfile()` method
- `src/components/modals/EnhancedProfileCreationModal.tsx` - Updated submission logic

### Database
- `supabase/migrations/20250610_add_enhanced_profile_fields.sql` - Schema migration (applied)
- `setup-profile-pictures-storage.sql` - Storage bucket setup (ready)

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✅ Complete | All enhanced fields added |
| UserService Methods | ✅ Complete | Both create and update methods |
| Modal Logic | ✅ Complete | Proper method selection |
| Form Validation | ✅ Complete | All steps validated |
| Error Handling | ✅ Complete | Proper user feedback |
| Edit Mode Support | ✅ Complete | Loads and updates existing data |
| RLS Policies | ✅ Complete | Automatic coverage |
| Profile Pictures | 🔄 Ready | Storage setup script created |

## Result

The Enhanced Profile Creation Modal now properly handles both scenarios:

### ✅ New Users (Create Mode)
- Modal calls `createTenantProfile()`
- Uses INSERT operation via upsert
- Creates new tenant profile record
- Shows "Profiel aangemaakt!" message

### ✅ Existing Users (Edit Mode)
- Modal calls `updateTenantProfile()`
- Uses UPDATE operation
- Updates existing tenant profile record
- Shows "Profiel bijgewerkt!" message

### ✅ Enhanced Features
- All 19 enhanced fields properly stored
- Comprehensive Dutch cities and districts
- Enhanced smoking and pet details
- Profile picture upload support
- Step-by-step validation
- Progress tracking
- Data persistence between steps

The system now correctly distinguishes between creating new profiles and updating existing ones, eliminating the database conflict errors and providing a smooth user experience for both scenarios.
