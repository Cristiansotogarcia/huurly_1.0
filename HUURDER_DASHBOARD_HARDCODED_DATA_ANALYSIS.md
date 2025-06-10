# Huurder Dashboard Hardcoded Data Analysis

## Overview
This analysis identifies hardcoded data in the Huurder Dashboard that could be confusing or cause problems for the system design.

## Critical Issues Found

### 1. **Hardcoded Demo/Test IDs**

#### Location: `HuurderDashboard.tsx` - Line 264
```typescript
"beoordelaar-demo-id", // In real app, this would be actual beoordelaar ID
```
**Problem**: Using hardcoded demo ID for notifications
**Impact**: All document upload notifications go to a non-existent beoordelaar
**Solution**: Implement proper beoordelaar assignment logic

### 2. **Hardcoded Empty State Messages**

#### Location: `HuurderDashboard.tsx` - Lines 30-37
```typescript
const EMPTY_STATE_MESSAGES = {
  noUsers: 'Nog geen gebruikers geregistreerd',
  noProperties: 'Nog geen woningen toegevoegd',
  noDocuments: 'Nog geen documenten geüpload',
  noViewings: 'Nog geen bezichtigingen gepland',
  noIssues: 'Geen openstaande issues',
  noNotifications: 'Geen nieuwe notificaties',
};
```
**Problem**: Static messages that don't reflect actual system state
**Impact**: Confusing user experience, messages may not match actual functionality
**Solution**: Make messages dynamic based on actual system capabilities

### 3. **Hardcoded Subscription Calculation**

#### Location: `HuurderDashboard.tsx` - Lines 318-325
```typescript
const getSubscriptionEndDate = () => {
  if (user?.hasPayment) {
    // For now, we'll calculate 1 year from current date since we don't have subscription_start_date
    // In production, this should come from the subscription data
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    return endDate.toLocaleDateString('nl-NL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  return null;
};
```
**Problem**: Subscription end date calculated from current date instead of actual subscription start
**Impact**: Incorrect subscription expiry information shown to users
**Solution**: Use actual subscription_start_date from database

### 4. **Hardcoded Default Values in Profile Modal**

#### Location: `EnhancedProfileCreationModal.tsx` - Lines 85-130
```typescript
// Step 5: Location Preferences
city: 'Amsterdam',  // Hardcoded default city
preferredDistricts: [],
maxCommuteTime: 30,  // Hardcoded default
transportationPreference: 'public_transport',  // Hardcoded default

// Step 6: Housing & Lifestyle Preferences
minBudget: 1000,  // Hardcoded default budget
maxBudget: 2000,  // Hardcoded default budget
bedrooms: 1,      // Hardcoded default
propertyType: 'Appartement',  // Hardcoded default
```
**Problem**: Hardcoded defaults may not be appropriate for all users
**Impact**: Users may not notice defaults and submit inappropriate preferences
**Solution**: Use dynamic defaults based on user location or make fields explicitly required

### 5. **Hardcoded Dutch Cities and Districts**

#### Location: `EnhancedProfileCreationModal.tsx` - Lines 430-450
```typescript
const dutchCitiesData = {
  'Amsterdam': ['Centrum', 'Jordaan', 'Oud-Zuid', ...],
  'Rotterdam': ['Centrum', 'Noord', 'Delfshaven', ...],
  // ... extensive hardcoded city/district mapping
};
```
**Problem**: Static city/district data that requires code changes to update
**Impact**: Maintenance burden, inability to dynamically add new locations
**Solution**: Move to database-driven location data

### 6. **Hardcoded Amenities Options**

#### Location: `EnhancedProfileCreationModal.tsx` - Lines 420-429
```typescript
const amenitiesOptions = [
  { id: 'balkon', label: 'Balkon', icon: TreePine },
  { id: 'tuin', label: 'Tuin', icon: TreePine },
  { id: 'parkeerplaats', label: 'Parkeerplaats', icon: ParkingCircle },
  // ... more hardcoded amenities
];
```
**Problem**: Static amenities list that requires code changes to modify
**Impact**: Cannot dynamically add new amenities without deployment
**Solution**: Move amenities to database configuration

### 7. **Hardcoded Property Search Defaults**

#### Location: `PropertySearchModal.tsx` - Lines 18-24
```typescript
const [filters, setFilters] = useState<SearchFilters>({
  city: '',
  minPrice: 0,
  maxPrice: 3000,  // Hardcoded max price
  bedrooms: '',
  propertyType: '',
});
```
**Problem**: Hardcoded maximum price limit
**Impact**: May not reflect current market conditions
**Solution**: Make price ranges configurable

### 8. **Hardcoded Document Type Mappings**

#### Location: `HuurderDashboard.tsx` - Lines 580-584
```typescript
{doc.document_type === 'identity' ? 'Identiteitsbewijs' :
 doc.document_type === 'payslip' ? 'Loonstrook' :
 doc.document_type === 'employment_contract' ? 'Arbeidscontract' :
 doc.document_type === 'reference' ? 'Referentie' : doc.document_type}
```
**Problem**: Hardcoded document type translations
**Impact**: Difficult to maintain, add new document types
**Solution**: Use centralized translation/mapping service

### 9. **Hardcoded Status Messages**

#### Location: `HuurderDashboard.tsx` - Lines 590-592
```typescript
{doc.status === 'pending' ? 'In behandeling' :
 doc.status === 'approved' ? 'Goedgekeurd' :
 doc.status === 'rejected' ? 'Afgewezen' : doc.status}
```
**Problem**: Hardcoded status translations
**Impact**: Inconsistent status handling across the application
**Solution**: Centralized status translation system

### 10. **Hardcoded Payment Amount**

#### Location: `HuurderDashboard.tsx` - Line 107
```typescript
Je hebt een actief abonnement (€65/jaar inclusief BTW).
```
**Problem**: Hardcoded subscription price
**Impact**: Price changes require code updates
**Solution**: Get pricing from configuration or Stripe

## Recommendations

### Immediate Actions (High Priority)

1. **Fix Demo Beoordelaar ID**: Implement proper beoordelaar assignment logic
2. **Fix Subscription Date Calculation**: Use actual subscription_start_date from database
3. **Remove Hardcoded Pricing**: Get pricing from Stripe or configuration

### Medium Priority

4. **Centralize Translations**: Create translation service for document types, statuses
5. **Dynamic Location Data**: Move cities/districts to database
6. **Configurable Defaults**: Make profile defaults configurable per region

### Long Term

7. **Dynamic Amenities**: Move amenities to database configuration
8. **Market-Based Pricing**: Make search price ranges dynamic based on market data
9. **Contextual Empty States**: Make empty state messages context-aware

## Impact Assessment

### User Experience Issues
- Incorrect subscription information confuses users
- Hardcoded defaults may not match user expectations
- Static location data limits expansion to new areas

### Maintenance Issues
- Code changes required for business configuration updates
- Inconsistent data handling across components
- Difficult to localize for different regions

### System Design Issues
- Tight coupling between business logic and UI
- Lack of centralized configuration management
- Poor separation of concerns

## Conclusion

The Huurder Dashboard contains significant amounts of hardcoded data that should be moved to configuration, database, or service layers. The most critical issues involve incorrect subscription information and demo IDs that could cause functional problems. The extensive hardcoded location and amenity data creates maintenance burden and limits system flexibility.

Priority should be given to fixing functional issues first, then addressing architectural concerns to improve maintainability and scalability.
