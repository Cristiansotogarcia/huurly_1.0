
-- Remove tables that are no longer needed for the simplified Huurder-only application

-- Drop tables related to property management (Verhuurder functionality)
DROP TABLE IF EXISTS property_applications CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- Drop tables related to profile viewing and analytics (unused features)
DROP TABLE IF EXISTS profile_views CASCADE;
DROP TABLE IF EXISTS profile_view_notifications CASCADE;
DROP TABLE IF EXISTS profile_analytics CASCADE;

-- Drop tables related to messaging system (not implemented in current app)
DROP TABLE IF EXISTS messages CASCADE;

-- Drop tables related to audit logging (not needed for simplified app)
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Drop tables related to children details (redundant with tenant_profiles)
DROP TABLE IF EXISTS children_details CASCADE;

-- Drop tables related to geographic data (not actively used)
DROP TABLE IF EXISTS dutch_cities_neighborhoods CASCADE;

-- Drop tables related to subscription management (redundant with payment_records)
DROP TABLE IF EXISTS subscribers CASCADE;

-- Clean up any orphaned sequences or constraints that might remain
-- Note: CASCADE should handle most dependencies automatically
