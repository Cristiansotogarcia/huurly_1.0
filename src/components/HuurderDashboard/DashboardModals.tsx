import React from 'react';
import { EnhancedProfileUpdateModal } from '@/components/modals/EnhancedProfileUpdateModal';
import DocumentUploadModal from '@/components/modals/DocumentUploadModal';
import { PaymentModal } from '@/components/PaymentModal';
import { ProfileFormData } from '@/components/modals/profileSchema';
import { convertFromISODate } from '@/utils/dateUtils';

interface DashboardModalsProps {
  showProfileModal: boolean;
  showDocumentModal: boolean;
  showPaymentModal: boolean;
  hasProfile: boolean;
  setShowProfileModal: (show: boolean) => void;
  setShowDocumentModal: (show: boolean) => void;
  setShowPaymentModal: (show: boolean) => void;
  onProfileComplete: (profileData: any) => Promise<void>;
  onDocumentUploadComplete: (documents: any[]) => Promise<void>;
  user?: any;
  tenantProfile?: any;
}

export const DashboardModals: React.FC<DashboardModalsProps> = ({
  showProfileModal,
  showDocumentModal,
  showPaymentModal,
  hasProfile,
  setShowProfileModal,
  setShowDocumentModal,
  setShowPaymentModal,
  onProfileComplete,
  onDocumentUploadComplete,
  user,
  tenantProfile,
}) => {
  // Convert tenant profile data to form format for editing
  const getInitialFormData = (user?: any): Partial<ProfileFormData> | undefined => {
    if (!tenantProfile && !user) return undefined;

    console.log('🔍 DashboardModals: tenantProfile data:', tenantProfile);
    console.log('🖼️ DashboardModals: tenantProfile.profiel_foto:', tenantProfile?.profiel_foto);

    // Properly handle multi-word last names like "Soto Garcia"
    const nameParts = user?.name?.split(' ') || [''];
    const firstNameFromUser = nameParts[0] || '';
    const lastNameFromUser = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    return {
      // Step 1: Personal Info - FIXED: Added date conversion
      first_name: tenantProfile?.voornaam || firstNameFromUser || '',
      last_name: tenantProfile?.achternaam || lastNameFromUser || '',
      date_of_birth: tenantProfile?.geboortedatum ? convertFromISODate(tenantProfile.geboortedatum) : '',
      phone: tenantProfile?.telefoon || '',
      sex: tenantProfile?.geslacht || 'zeg_ik_liever_niet',
      nationality: tenantProfile?.nationaliteit || 'Nederlandse',
      marital_status: tenantProfile?.burgerlijke_staat || 'single',
      has_children: tenantProfile?.heeft_kinderen || false, // FIXED: Correct field name
      number_of_children: tenantProfile?.aantal_kinderen || 0, // FIXED: Correct field name
      children_ages: tenantProfile?.kinderen_leeftijden || [], // FIXED: Correct field name
      
      // Step 2: Employment - FIXED: Corrected field mappings
      profession: tenantProfile?.beroep || '',
      employer: tenantProfile?.werkgever || '',
      employment_status: tenantProfile?.dienstverband || 'full-time',
      work_contract_type: tenantProfile?.contract_type || '',
      monthly_income: tenantProfile?.inkomen || 0, // FIXED: was maandinkomen
      inkomensbewijs_beschikbaar: tenantProfile?.inkomensbewijs_beschikbaar || false,
      work_from_home: tenantProfile?.thuiswerken || false,
      extra_income: tenantProfile?.extra_inkomen || 0,
      extra_income_description: tenantProfile?.extra_inkomen_beschrijving || '',
      
      // Step 3: Household - FIXED: Corrected field mappings
      has_partner: tenantProfile?.partner || false, // FIXED: was heeft_partner
      partner_name: tenantProfile?.partner_naam || '',
      partner_profession: tenantProfile?.partner_beroep || '',
      partner_employment_status: tenantProfile?.partner_dienstverband || '',
      partner_monthly_income: tenantProfile?.partner_inkomen || 0, // FIXED: was partner_maandinkomen
      borgsteller_beschikbaar: tenantProfile?.borgsteller_beschikbaar || false,
      borgsteller_naam: tenantProfile?.borgsteller_naam || '',
      borgsteller_relatie: tenantProfile?.borgsteller_relatie || '',
      borgsteller_telefoon: tenantProfile?.borgsteller_telefoon || '',
      borgsteller_inkomen: tenantProfile?.borgsteller_inkomen || 0,
      
      // Step 4: Housing Preferences (consolidated)
      preferred_city: tenantProfile?.voorkeurslocaties || [],
      preferred_property_type: tenantProfile?.woningtype || 'appartement',
      preferred_bedrooms: tenantProfile?.voorkeurs_slaapkamers || tenantProfile?.slaapkamers,
      furnished_preference: tenantProfile?.meubilering_voorkeur || undefined,
      min_budget: tenantProfile?.min_budget || 0,
      max_budget: tenantProfile?.maxBudget || tenantProfile?.max_budget || 1000,
      min_kamers: tenantProfile?.min_kamers || 1,
      max_kamers: tenantProfile?.max_kamers || 5,
      
      // Timing & Storage (consolidated) - FIXED: Added date conversion
      move_in_date_preferred: tenantProfile?.voorkeur_verhuisdatum ? convertFromISODate(tenantProfile.voorkeur_verhuisdatum) : undefined,
      move_in_date_earliest: tenantProfile?.vroegste_verhuisdatum ? convertFromISODate(tenantProfile.vroegste_verhuisdatum) : undefined,
      availability_flexible: tenantProfile?.beschikbaarheid_flexibel_timing || tenantProfile?.beschikbaarheid_flexibel || false,
      lease_duration_preference: tenantProfile?.huurcontract_voorkeur || undefined,
      storage_kelder: tenantProfile?.opslag_kelder || false,
      storage_zolder: tenantProfile?.opslag_zolder || false,
      storage_berging: tenantProfile?.opslag_berging || false,
      storage_garage: tenantProfile?.opslag_garage || false,
      storage_schuur: tenantProfile?.opslag_schuur || false,
      
      // Lifestyle (consolidated) - FIXED: Corrected field mappings
      hasPets: tenantProfile?.huisdieren || false, // FIXED: Correct field name
      pet_details: tenantProfile?.huisdier_details || '',
      smokes: tenantProfile?.roken || false, // FIXED: was rookt, should be roken
      smoking_details: tenantProfile?.rook_details || '',
      
      // References & History
      references_available: tenantProfile?.referenties_beschikbaar || false,
      rental_history_years: tenantProfile?.verhuurgeschiedenis_jaren || 0,
      reason_for_moving: tenantProfile?.reden_verhuizing || '',
      
      // Profile & Motivation - FIXED: Corrected field mappings
      profilePictureUrl: tenantProfile?.profilePicture || '', // FIXED: Use mapped field from ConsolidatedDashboardService
      bio: tenantProfile?.beschrijving || '', // FIXED: was bio, should be beschrijving
      motivation: tenantProfile?.motivatie || '',
    };
  };
  return (
    <>
      {/* Profile Creation Modal */}
      <EnhancedProfileUpdateModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileComplete={onProfileComplete}
        initialData={getInitialFormData(user)}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        open={showDocumentModal}
        onOpenChange={setShowDocumentModal}
        onUploadComplete={onDocumentUploadComplete}
      />

      {/* Persistent Payment Modal - cannot be closed without payment */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={(open) => setShowPaymentModal(open)}
        persistent={true}
      />
    </>
  );
};
