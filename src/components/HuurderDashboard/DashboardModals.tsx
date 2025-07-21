
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
  tenantProfile,
}) => {
  // Convert tenant profile data to form format for editing
  const getInitialFormData = (): Partial<ProfileFormData> | undefined => {
    if (!tenantProfile) return undefined;

    return {
      // Step 1: Personal Info
      first_name: tenantProfile.personalInfo?.firstName || tenantProfile.voornaam || '',
      last_name: tenantProfile.personalInfo?.lastName || tenantProfile.achternaam || '',
      date_of_birth: tenantProfile.personalInfo?.dateOfBirth || tenantProfile.geboortedatum || '',
      phone: tenantProfile.personalInfo?.phone || tenantProfile.telefoon || '',
      nationality: tenantProfile.personalInfo?.nationality || tenantProfile.nationaliteit || 'Nederlandse',
      marital_status: tenantProfile.personalInfo?.maritalStatus || tenantProfile.burgerlijke_staat || 'single',
      has_children: (tenantProfile.personalInfo?.numberOfChildren || tenantProfile.aantal_kinderen || 0) > 0,
      number_of_children: tenantProfile.personalInfo?.numberOfChildren || tenantProfile.aantal_kinderen || 0,
      
      // Step 2: Employment
      profession: tenantProfile.workAndIncome?.profession || tenantProfile.beroep || '',
      employer: tenantProfile.workAndIncome?.employer || tenantProfile.werkgever || '',
      employment_status: tenantProfile.workAndIncome?.employmentStatus || tenantProfile.dienstverband || 'full-time',
      monthly_income: tenantProfile.workAndIncome?.monthlyIncome || tenantProfile.maandinkomen || 0,
      
      // Step 3: Household
      has_partner: tenantProfile.personalInfo?.maritalStatus === 'getrouwd' || tenantProfile.personalInfo?.maritalStatus === 'samenwonend' || 
                   tenantProfile.burgerlijke_staat === 'getrouwd' || tenantProfile.burgerlijke_staat === 'samenwonend',
      
      // Step 4: Housing Preferences
      preferred_property_type: tenantProfile.housingPreferences?.propertyType || tenantProfile.woningtype_voorkeur || 'appartement',
      preferred_bedrooms: tenantProfile.housingPreferences?.bedrooms || tenantProfile.slaapkamers,
      min_budget: tenantProfile.housingPreferences?.minBudget || tenantProfile.min_budget,
      max_budget: tenantProfile.housingPreferences?.maxBudget || tenantProfile.max_budget || 1000,
      
      // Lifestyle
      hasPets: tenantProfile.lifestyle?.hasPets || tenantProfile.heeftHuisdieren || false,
      smokes: tenantProfile.lifestyle?.smokes || tenantProfile.rookt || false,
      
      // Profile & Motivation
      bio: tenantProfile.profileAndMotivation?.bio || tenantProfile.bio || '',
      motivation: tenantProfile.profileAndMotivation?.motivation || tenantProfile.motivation || '',
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
        initialData={getInitialFormData()}
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
