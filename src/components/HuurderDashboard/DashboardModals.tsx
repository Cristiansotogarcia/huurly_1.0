import React from 'react';
import { EnhancedProfileCreationModal } from '@/components/modals/EnhancedProfileCreationModal';
import DocumentUploadModal from '@/components/modals/DocumentUploadModal';
import { PaymentModal } from '@/components/PaymentModal';
import { ProfileFormData } from '@/components/modals/profileSchema';

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

    const [firstNameFromUser, lastNameFromUser] = user?.name?.split(' ') || ['', ''];

    return {
      // Step 1: Personal Info
      first_name: tenantProfile?.voornaam || firstNameFromUser || '',
      last_name: tenantProfile?.achternaam || lastNameFromUser || '',
      date_of_birth: tenantProfile?.geboortedatum || '',
      phone: tenantProfile?.telefoon || '',
      sex: tenantProfile?.geslacht || '',
      nationality: tenantProfile?.nationaliteit || 'Nederlandse',
      marital_status: tenantProfile?.burgerlijke_staat || 'single',
      has_children: tenantProfile?.heeft_kinderen || false,
      number_of_children: tenantProfile?.aantal_kinderen || 0,
      children_ages: tenantProfile?.kinderen_leeftijden || [],
      
      // Step 2: Employment
      profession: tenantProfile?.beroep || '',
      employer: tenantProfile?.werkgever || '',
      employment_status: tenantProfile?.dienstverband || 'full-time',
      work_contract_type: tenantProfile?.contract_type || '',
      monthly_income: tenantProfile?.maandinkomen || 0,
      inkomensbewijs_beschikbaar: tenantProfile?.inkomensbewijs_beschikbaar || false,
      work_from_home: tenantProfile?.thuiswerken || false,
      extra_income: tenantProfile?.extra_inkomen || 0,
      extra_income_description: tenantProfile?.extra_inkomen_beschrijving || '',
      
      // Step 3: Household
      has_partner: tenantProfile?.heeft_partner || false,
      partner_name: tenantProfile?.partner_naam || '',
      partner_profession: tenantProfile?.partner_beroep || '',
      partner_employment_status: tenantProfile?.partner_dienstverband || '',
      partner_monthly_income: tenantProfile?.partner_maandinkomen || 0,
      borgsteller_beschikbaar: tenantProfile?.borgsteller_beschikbaar || false,
      borgsteller_naam: tenantProfile?.borgsteller_naam || '',
      borgsteller_relatie: tenantProfile?.borgsteller_relatie || '',
      borgsteller_telefoon: tenantProfile?.borgsteller_telefoon || '',
      borgsteller_inkomen: tenantProfile?.borgsteller_inkomen || 0,
      
      // Step 4: Housing Preferences (consolidated)
      preferred_city: tenantProfile?.voorkeurslocaties || [],
      preferred_property_type: tenantProfile?.woningtype || 'appartement',
      preferred_bedrooms: tenantProfile?.voorkeurs_slaapkamers || tenantProfile?.slaapkamers,
      furnished_preference: tenantProfile?.meubilering_voorkeur || '',
      min_budget: tenantProfile?.min_budget || 0,
      max_budget: tenantProfile?.maxBudget || tenantProfile?.max_budget || 1000,
      min_kamers: tenantProfile?.min_kamers || 1,
      max_kamers: tenantProfile?.max_kamers || 5,
      
      // Timing & Storage (consolidated)
      move_in_date_preferred: tenantProfile?.verhuis_datum_voorkeur || tenantProfile?.voorkeur_verhuisdatum || undefined,
      move_in_date_earliest: tenantProfile?.verhuis_datum_vroegst || tenantProfile?.vroegste_verhuisdatum || undefined,
      availability_flexible: tenantProfile?.beschikbaarheid_flexibel_timing || tenantProfile?.beschikbaarheid_flexibel || false,
      lease_duration_preference: tenantProfile?.huurcontract_voorkeur || '',
      storage_kelder: tenantProfile?.opslag_kelder || false,
      storage_zolder: tenantProfile?.opslag_zolder || false,
      storage_berging: tenantProfile?.opslag_berging || false,
      storage_garage: tenantProfile?.opslag_garage || false,
      storage_schuur: tenantProfile?.opslag_schuur || false,
      
      // Lifestyle (consolidated)
      hasPets: tenantProfile?.huisdieren || false,
      pet_details: tenantProfile?.huisdier_details || '',
      smokes: tenantProfile?.rookt || false,
      smoking_details: tenantProfile?.rook_details || '',
      
      // References & History
      references_available: tenantProfile?.referenties_beschikbaar || false,
      rental_history_years: tenantProfile?.verhuurgeschiedenis_jaren || 0,
      reason_for_moving: tenantProfile?.reden_verhuizing || '',
      
      // Profile & Motivation
      profilePictureUrl: tenantProfile?.profielfoto_url || '',
      bio: tenantProfile?.bio || '',
      motivation: tenantProfile?.motivatie || '',
    };
  };
  return (
    <>
      {/* Profile Creation Modal */}
      <EnhancedProfileCreationModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileComplete={async (profileData) => {
          await onProfileComplete(profileData);
          setShowProfileModal(false);
        }}
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
