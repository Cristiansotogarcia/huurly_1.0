# Tenant Profiles Schema Analysis & Cleanup Recommendations

## Overview
Analysis of the `tenant_profiles` table to identify unused, duplicate, or missing columns that could improve the 7-step profile creation modal.

## Current Modal Usage Analysis

### ✅ Columns Currently Used in 7-Step Modal (47 fields)

#### Step 1: Personal Information
- `first_name`, `last_name`, `phone`, `date_of_birth`
- `nationality`, `sex`, `profile_picture_url`

#### Step 2: Family & Relationship Status  
- `marital_status`, `has_children`, `number_of_children`, `children_ages`

#### Step 3: Work & Employment
- `profession`, `employer`, `employment_status`, `work_contract_type`
- `monthly_income`, `housing_allowance_eligible`

#### Step 4: Partner Information
- `has_partner`, `partner_name`, `partner_profession`
- `partner_monthly_income`, `partner_employment_status`

#### Step 5: Location Preferences
- `preferred_city`, `preferred_districts`, `max_commute_time`, `transportation_preference`

#### Step 6: Housing & Lifestyle Preferences
- `min_budget`, `max_budget`, `preferred_bedrooms`, `preferred_property_type`
- `furnished_preference`, `desired_amenities`, `has_pets`, `pet_details`
- `smokes`, `smoking_details`

#### Step 7: About You & Review
- `bio`, `motivation`

#### System Fields
- `user_id`, `profile_completed`, `created_at`, `updated_at`
- `total_household_income` (computed), `family_composition` (computed)

## 🔍 Identified Issues & Recommendations

### 1. 🗑️ Columns to Consider Removing (Unused/Redundant)

Based on typical database schemas, these columns are likely unused:

#### Duplicate/Legacy Fields
- `email` (already in profiles table)
- `name` (replaced by first_name/last_name)
- `city` (replaced by preferred_city)
- `budget` (replaced by min_budget/max_budget)
- `bedrooms` (replaced by preferred_bedrooms)
- `property_type` (replaced by preferred_property_type)

#### Outdated/Unused Fields
- `is_active` (use profile_completed instead)
- `is_verified` (should be in separate verification table)
- `last_login` (belongs in user activity table)
- `subscription_status` (belongs in user_roles table)
- `payment_status` (belongs in payment_records table)

### 2. ➕ High-Value Columns to Add to Modal

#### Financial Security (Step 3 - Work & Employment)
- `guarantor_available` (BOOLEAN) - "Ik heb een borg/garantsteller"
- `guarantor_name` (TEXT) - Guarantor full name
- `guarantor_phone` (TEXT) - Guarantor contact
- `guarantor_income` (DECIMAL) - Guarantor monthly income
- `guarantor_relationship` (TEXT) - Relationship to guarantor
- `income_proof_available` (BOOLEAN) - "Ik kan inkomensbewijzen verstrekken"

#### Emergency Contact (Step 1 - Personal Information)
- `emergency_contact_name` (TEXT) - Emergency contact name
- `emergency_contact_phone` (TEXT) - Emergency contact phone
- `emergency_contact_relationship` (TEXT) - Relationship

#### Timing & Availability (Step 5 - Location Preferences)
- `move_in_date_preferred` (DATE) - Preferred move-in date
- `move_in_date_earliest` (DATE) - Earliest possible move-in
- `availability_flexible` (BOOLEAN) - "Ik ben flexibel met de datum"

#### Housing Details (Step 6 - Housing Preferences)
- `lease_duration_preference` (TEXT) - Preferred lease length
- `parking_required` (BOOLEAN) - "Ik heb een parkeerplaats nodig"
- `storage_needs` (TEXT) - Storage requirements
- `work_from_home` (BOOLEAN) - "Ik werk (deels) thuis"

#### References & History (Step 7 - About You)
- `references_available` (BOOLEAN) - "Ik kan referenties verstrekken"
- `rental_history_years` (INTEGER) - Years of rental experience
- `current_living_situation` (TEXT) - Current housing situation
- `reason_for_moving` (TEXT) - Why looking for new place

### 3. 🔍 Potential Duplicates Found

#### Income Fields
- `monthly_income` vs `income` vs `gross_income`
- `partner_monthly_income` vs `partner_income`
- **Recommendation:** Keep `monthly_income` and `partner_monthly_income`

#### Budget Fields  
- `min_budget` vs `budget_min` vs `minimum_rent`
- `max_budget` vs `budget_max` vs `maximum_rent`
- **Recommendation:** Keep `min_budget` and `max_budget`

#### Contact Fields
- `phone` vs `phone_number` vs `mobile`
- **Recommendation:** Keep `phone`

#### Status Fields
- `employment_status` vs `work_status` vs `job_status`
- **Recommendation:** Keep `employment_status`

## 📋 Recommended Modal Enhancements

### Step 3 Enhancement: Add Guarantor Section
```
💼 Werk & Inkomen
├── [Existing fields...]
└── 🛡️ Financiële Zekerheid
    ├── ☑️ Ik heb een borg/garantsteller beschikbaar
    ├── 📝 Naam garantsteller
    ├── 📞 Telefoon garantsteller  
    ├── 💰 Maandelijks inkomen garantsteller
    ├── 👥 Relatie tot garantsteller
    └── ☑️ Ik kan inkomensbewijzen verstrekken
```

### Step 1 Enhancement: Add Emergency Contact
```
👤 Persoonlijke Informatie
├── [Existing fields...]
└── 🚨 Noodcontact
    ├── 📝 Naam noodcontact
    ├── 📞 Telefoon noodcontact
    └── 👥 Relatie tot noodcontact
```

### Step 5 Enhancement: Add Timing
```
📍 Locatie Voorkeuren
├── [Existing fields...]
└── ⏰ Beschikbaarheid
    ├── 📅 Gewenste intrekdatum
    ├── 📅 Vroegst mogelijke intrekdatum
    └── ☑️ Ik ben flexibel met de datum
```

### Step 6 Enhancement: Add Housing Details
```
🏠 Woning & Lifestyle Voorkeuren
├── [Existing fields...]
└── 🔧 Extra Voorzieningen
    ├── 📝 Gewenste huurperiode (6 maanden, 1 jaar, 2+ jaar)
    ├── ☑️ Ik heb een parkeerplaats nodig
    ├── ☑️ Ik werk (deels) thuis
    └── 📝 Opslag/berging behoeften
```

### Step 7 Enhancement: Add References
```
✅ Over Jezelf & Overzicht
├── [Existing fields...]
└── 📋 Referenties & Ervaring
    ├── ☑️ Ik kan huurrreferenties verstrekken
    ├── 🔢 Jaren huurervaring
    ├── 📝 Huidige woonsituatie
    └── 📝 Reden voor verhuizing
```

## 🎯 Implementation Priority

### High Priority (Immediate Value)
1. **guarantor_available** - Critical for landlord confidence
2. **move_in_date_preferred** - Essential for matching
3. **references_available** - Important trust signal
4. **work_from_home** - Relevant for space needs

### Medium Priority (Nice to Have)
1. **emergency_contact_name/phone** - Safety/responsibility
2. **lease_duration_preference** - Matching preferences
3. **parking_required** - Important filter
4. **rental_history_years** - Experience indicator

### Low Priority (Future Enhancement)
1. **guarantor_income/name/phone** - Detailed guarantor info
2. **storage_needs** - Specific requirements
3. **current_living_situation** - Background context

## 📊 Database Impact

### Columns to Add: ~15 new fields
### Columns to Remove: ~10-15 unused fields  
### Net Change: Neutral to slightly positive
### Performance: Improved (fewer unused indexes)

## 🔧 Migration Strategy

1. **Phase 1:** Add high-priority fields to modal
2. **Phase 2:** Remove confirmed unused columns
3. **Phase 3:** Add medium-priority enhancements
4. **Phase 4:** Consolidate duplicate fields

This analysis provides a roadmap for cleaning up the tenant_profiles table while adding valuable functionality to enhance the user experience and provide better matching capabilities for landlords.
