-- Add performance indexes for production optimization
-- These indexes will improve query performance for common operations

-- Indexes for payment_records table
CREATE INDEX IF NOT EXISTS idx_payment_records_user_status ON public.payment_records(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_records_created_at ON public.payment_records(created_at DESC);

-- Indexes for property_applications table
CREATE INDEX IF NOT EXISTS idx_property_applications_tenant_status ON public.property_applications(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_property_applications_property_status ON public.property_applications(property_id, status);
CREATE INDEX IF NOT EXISTS idx_property_applications_applied_at ON public.property_applications(applied_at DESC);

-- Indexes for user_documents table
CREATE INDEX IF NOT EXISTS idx_user_documents_user_status ON public.user_documents(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_documents_type_status ON public.user_documents(document_type, status);
CREATE INDEX IF NOT EXISTS idx_user_documents_created_at ON public.user_documents(created_at DESC);

-- Indexes for properties table
CREATE INDEX IF NOT EXISTS idx_properties_status_city ON public.properties(status, city);
CREATE INDEX IF NOT EXISTS idx_properties_rent_bedrooms ON public.properties(rent_amount, bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_available_from ON public.properties(available_from);

-- Indexes for viewing_invitations table
CREATE INDEX IF NOT EXISTS idx_viewing_invitations_tenant_status ON public.viewing_invitations(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_viewing_invitations_landlord_status ON public.viewing_invitations(landlord_id, status);
CREATE INDEX IF NOT EXISTS idx_viewing_invitations_proposed_date ON public.viewing_invitations(proposed_date);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Indexes for tenant_profiles table
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_max_rent ON public.tenant_profiles(max_rent);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_preferred_location ON public.tenant_profiles(preferred_location);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_available_from ON public.tenant_profiles(available_from);

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_recipient_read ON public.messages(recipient_id, read_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON public.messages(sender_id, created_at DESC);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_properties_search ON public.properties(city, rent_amount, bedrooms, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_tenant_search ON public.tenant_profiles(preferred_location, max_rent, preferred_bedrooms) WHERE documents_verified = true;

-- Indexes for audit logs performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_table ON public.audit_logs(action, table_name);

-- Indexes for subscribers table
CREATE INDEX IF NOT EXISTS idx_subscribers_subscription_end ON public.subscribers(subscription_end);
CREATE INDEX IF NOT EXISTS idx_subscribers_subscribed ON public.subscribers(subscribed);

-- Add partial indexes for better performance on filtered queries
CREATE INDEX IF NOT EXISTS idx_properties_active ON public.properties(created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_documents_pending ON public.user_documents(created_at DESC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_applications_pending ON public.property_applications(applied_at DESC) WHERE status = 'pending';

-- Add indexes for foreign key relationships that don't have them yet
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_offers_tenant_id ON public.property_offers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_offers_landlord_id ON public.property_offers(landlord_id);
CREATE INDEX IF NOT EXISTS idx_viewing_slots_property_id ON public.viewing_slots(property_id);
CREATE INDEX IF NOT EXISTS idx_viewing_slots_tenant_id ON public.viewing_slots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON public.household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_household_info_user_id ON public.household_info(user_id);

-- Add text search indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_properties_title_search ON public.properties USING gin(to_tsvector('dutch', title));
CREATE INDEX IF NOT EXISTS idx_properties_description_search ON public.properties USING gin(to_tsvector('dutch', description));
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_bio_search ON public.tenant_profiles USING gin(to_tsvector('dutch', bio));

-- Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_payment_records_monthly ON public.payment_records(date_trunc('month', created_at), status);
CREATE INDEX IF NOT EXISTS idx_user_roles_subscription_status ON public.user_roles(subscription_status);

COMMENT ON INDEX idx_payment_records_user_status IS 'Optimizes user payment history queries';
COMMENT ON INDEX idx_properties_search IS 'Optimizes property search queries with filters';
COMMENT ON INDEX idx_tenant_search IS 'Optimizes tenant matching queries';
COMMENT ON INDEX idx_properties_title_search IS 'Enables full-text search on property titles';
COMMENT ON INDEX idx_properties_description_search IS 'Enables full-text search on property descriptions';
