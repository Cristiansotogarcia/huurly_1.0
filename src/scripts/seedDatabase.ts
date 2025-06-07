/**
 * Database seeding script to create real demo accounts in Supabase
 * This will create actual database records for all 4 demo accounts
 */

import { supabase } from '@/integrations/supabase/client';
import logger from '@/lib/logger';

// Demo account data that will be inserted into the database
const DEMO_ACCOUNTS = [
  {
    id: 'demo-huurder-1',
    email: 'emma.bakker@email.nl',
    firstName: 'Emma',
    lastName: 'Bakker',
    role: 'Huurder' as const,
    hasPayment: true,
    profileData: {
      age: 28,
      profession: 'Software Developer',
      monthly_income: 4500,
      bio: 'Rustige, betrouwbare huurder die op zoek is naar een moderne woning in Amsterdam. Werk als software developer bij een tech startup.',
      motivation: 'Ik ben op zoek naar een rustige woning waar ik kan werken en ontspannen.',
      preferred_location: 'Amsterdam',
      max_rent: 1800,
      preferred_bedrooms: 2,
      documents_verified: true,
      profile_views: 34,
      landlord_interest: 7
    }
  },
  {
    id: 'demo-verhuurder-1',
    email: 'bas.verhuur@email.nl',
    firstName: 'Bas',
    lastName: 'van der Berg',
    role: 'Verhuurder' as const,
    hasPayment: false,
    profileData: null
  },
  {
    id: 'demo-beoordelaar-1',
    email: 'lisa.reviewer@huurly.nl',
    firstName: 'Lisa',
    lastName: 'de Vries',
    role: 'Manager' as const,
    hasPayment: false,
    profileData: null
  },
  {
    id: 'demo-beheerder-1',
    email: 'admin@huurly.nl',
    firstName: 'Admin',
    lastName: 'Huurly',
    role: 'Manager' as const,
    hasPayment: false,
    profileData: null
  }
];

// Properties for the verhuurder
const DEMO_PROPERTIES = [
  {
    id: 'prop-1',
    landlord_id: 'demo-verhuurder-1',
    title: 'Modern 2-kamer appartement in Amsterdam Centrum',
    description: 'Prachtig gerenoveerd appartement met moderne afwerking en veel lichtinval.',
    address: 'Prinsengracht 123',
    city: 'Amsterdam',
    postal_code: '1015 DS',
    province: 'Noord-Holland',
    rent_amount: 1650,
    bedrooms: 2,
    bathrooms: 1,
    square_meters: 75,
    property_type: 'Appartement',
    furnished: true,
    pets_allowed: false,
    smoking_allowed: false,
    available_from: '2024-02-01',
    status: 'available',
    application_count: 23,
    offers_sent: 8
  },
  {
    id: 'prop-2',
    landlord_id: 'demo-verhuurder-1',
    title: 'Ruime studio in Amsterdam Noord',
    description: 'Moderne studio met eigen keuken en badkamer, perfect voor young professionals.',
    address: 'Noorderdok 45',
    city: 'Amsterdam',
    postal_code: '1033 RG',
    province: 'Noord-Holland',
    rent_amount: 1200,
    bedrooms: 1,
    bathrooms: 1,
    square_meters: 45,
    property_type: 'Studio',
    furnished: false,
    pets_allowed: true,
    smoking_allowed: false,
    available_from: '2024-01-15',
    status: 'available',
    application_count: 15,
    offers_sent: 4
  }
];

// Documents for the huurder
const DEMO_DOCUMENTS = [
  {
    id: 'doc-1',
    user_id: 'demo-huurder-1',
    document_type: 'identity' as const,
    file_name: 'Identiteitsbewijs_Emma_Bakker.pdf',
    file_path: '/uploads/demo/doc-1.pdf',
    file_size: 2048576,
    mime_type: 'application/pdf',
    status: 'approved' as const,
    approved_by: 'demo-beoordelaar-1',
    approved_at: '2024-01-16T12:00:00Z'
  },
  {
    id: 'doc-2',
    user_id: 'demo-huurder-1',
    document_type: 'payslip' as const,
    file_name: 'Inkomensverklaring_2024.pdf',
    file_path: '/uploads/demo/doc-2.pdf',
    file_size: 1536000,
    mime_type: 'application/pdf',
    status: 'approved' as const,
    approved_by: 'demo-beoordelaar-1',
    approved_at: '2024-01-16T12:15:00Z'
  },
  {
    id: 'doc-3',
    user_id: 'demo-huurder-1',
    document_type: 'payslip' as const,
    file_name: 'Arbeidscontract_TechCorp.pdf',
    file_path: '/uploads/demo/doc-3.pdf',
    file_size: 1024000,
    mime_type: 'application/pdf',
    status: 'pending' as const
  }
];

// Property applications
const DEMO_APPLICATIONS = [
  {
    id: 'app-1',
    property_id: 'prop-1',
    tenant_id: 'demo-huurder-1',
    status: 'pending',
    application_message: 'Ik ben zeer geïnteresseerd in dit appartement. Mijn profiel is compleet en geverifieerd.',
    applied_at: '2024-01-22T10:00:00Z'
  },
  {
    id: 'app-2',
    property_id: 'prop-2',
    tenant_id: 'demo-huurder-1',
    status: 'accepted',
    application_message: 'Perfect voor mijn situatie als young professional.',
    applied_at: '2024-01-20T14:00:00Z',
    reviewed_at: '2024-01-21T09:00:00Z'
  }
];

// Viewing invitations
const DEMO_VIEWINGS = [
  {
    id: 'viewing-1',
    tenant_id: 'demo-huurder-1',
    landlord_id: 'demo-verhuurder-1',
    property_address: 'Prinsengracht 123, Amsterdam',
    proposed_date: '2024-01-25T14:00:00Z',
    status: 'pending'
  },
  {
    id: 'viewing-2',
    tenant_id: 'demo-huurder-1',
    landlord_id: 'demo-verhuurder-1',
    property_address: 'Noorderdok 45, Amsterdam',
    proposed_date: '2024-01-23T16:00:00Z',
    status: 'accepted'
  }
];

// Payment records
const DEMO_PAYMENTS = [
  {
    id: 'payment-1',
    user_id: 'demo-huurder-1',
    email: 'emma.bakker@email.nl',
    user_type: 'huurder',
    amount: 7259, // €72.59 in cents (€59.99 + 21% BTW)
    status: 'completed',
    stripe_session_id: 'cs_demo_session_1',
    created_at: '2024-01-15T11:00:00Z'
  }
];

export class DatabaseSeeder {
  async seedAll() {
    logger.info('🌱 Starting database seeding...');
    
    try {
      await this.seedProfiles();
      await this.seedUserRoles();
      await this.seedTenantProfiles();
      await this.seedProperties();
      await this.seedDocuments();
      await this.seedApplications();
      await this.seedViewings();
      await this.seedPayments();
      
      logger.info('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  private async seedProfiles() {
    logger.info('📝 Seeding profiles...');
    
    const profiles = DEMO_ACCOUNTS.map(account => ({
      id: account.id,
      first_name: account.firstName,
      last_name: account.lastName
    }));

    const { error } = await supabase
      .from('profiles')
      .upsert(profiles, { onConflict: 'id' });

    if (error) {
      console.error('Error seeding profiles:', error);
      throw error;
    }
    
    logger.info(`✅ Seeded ${profiles.length} profiles`);
  }

  private async seedUserRoles() {
    logger.info('👥 Seeding user roles...');
    
    const roles = DEMO_ACCOUNTS.map(account => ({
      user_id: account.id,
      role: account.role,
      subscription_status: account.hasPayment ? 'active' : 'inactive'
    }));

    const { error } = await supabase
      .from('user_roles')
      .upsert(roles, { onConflict: 'user_id' });

    if (error) {
      console.error('Error seeding user roles:', error);
      throw error;
    }
    
    logger.info(`✅ Seeded ${roles.length} user roles`);
  }

  private async seedTenantProfiles() {
    logger.info('🏠 Seeding tenant profiles...');
    
    const tenantProfiles = DEMO_ACCOUNTS
      .filter(account => account.role === 'Huurder' && account.profileData)
      .map(account => ({
        user_id: account.id,
        first_name: account.firstName,
        last_name: account.lastName,
        ...account.profileData
      }));

    if (tenantProfiles.length > 0) {
      const { error } = await supabase
        .from('tenant_profiles')
        .upsert(tenantProfiles, { onConflict: 'user_id' });

      if (error) {
        console.error('Error seeding tenant profiles:', error);
        throw error;
      }
    }
    
    logger.info(`✅ Seeded ${tenantProfiles.length} tenant profiles`);
  }

  private async seedProperties() {
    logger.info('🏢 Seeding properties...');
    
    const { error } = await supabase
      .from('properties')
      .upsert(DEMO_PROPERTIES, { onConflict: 'id' });

    if (error) {
      console.error('Error seeding properties:', error);
      throw error;
    }
    
    logger.info(`✅ Seeded ${DEMO_PROPERTIES.length} properties`);
  }

  private async seedDocuments() {
    logger.info('📄 Seeding documents...');
    
    const { error } = await supabase
      .from('user_documents')
      .upsert(DEMO_DOCUMENTS, { onConflict: 'id' });

    if (error) {
      console.error('Error seeding documents:', error);
      throw error;
    }
    
    logger.info(`✅ Seeded ${DEMO_DOCUMENTS.length} documents`);
  }

  private async seedApplications() {
    logger.info('📋 Seeding applications...');
    
    const { error } = await supabase
      .from('property_applications')
      .upsert(DEMO_APPLICATIONS, { onConflict: 'id' });

    if (error) {
      console.error('Error seeding applications:', error);
      throw error;
    }
    
    logger.info(`✅ Seeded ${DEMO_APPLICATIONS.length} applications`);
  }

  private async seedViewings() {
    logger.info('👁️ Seeding viewings...');
    
    const { error } = await supabase
      .from('viewing_invitations')
      .upsert(DEMO_VIEWINGS, { onConflict: 'id' });

    if (error) {
      console.error('Error seeding viewings:', error);
      throw error;
    }
    
    logger.info(`✅ Seeded ${DEMO_VIEWINGS.length} viewings`);
  }

  private async seedPayments() {
    logger.info('💳 Seeding payments...');
    
    const { error } = await supabase
      .from('payment_records')
      .upsert(DEMO_PAYMENTS, { onConflict: 'id' });

    if (error) {
      console.error('Error seeding payments:', error);
      throw error;
    }
    
    logger.info(`✅ Seeded ${DEMO_PAYMENTS.length} payments`);
  }

  async clearAll() {
    logger.info('🧹 Clearing existing demo data...');
    
    try {
      // Clear in reverse order due to foreign key constraints
      await supabase.from('viewing_invitations').delete().in('id', DEMO_VIEWINGS.map(v => v.id));
      await supabase.from('property_applications').delete().in('id', DEMO_APPLICATIONS.map(a => a.id));
      await supabase.from('user_documents').delete().in('id', DEMO_DOCUMENTS.map(d => d.id));
      await supabase.from('properties').delete().in('id', DEMO_PROPERTIES.map(p => p.id));
      await supabase.from('payment_records').delete().in('id', DEMO_PAYMENTS.map(p => p.id));
      await supabase.from('tenant_profiles').delete().in('user_id', DEMO_ACCOUNTS.map(a => a.id));
      await supabase.from('user_roles').delete().in('user_id', DEMO_ACCOUNTS.map(a => a.id));
      await supabase.from('profiles').delete().in('id', DEMO_ACCOUNTS.map(a => a.id));
      
      logger.info('✅ Cleared existing demo data');
    } catch (error) {
      console.error('Error clearing demo data:', error);
      throw error;
    }
  }
}

// Export for use in other files
export const databaseSeeder = new DatabaseSeeder();

// If running directly, execute seeding
if (typeof window === 'undefined') {
  // This is running in Node.js context
  databaseSeeder.seedAll().catch(console.error);
}
