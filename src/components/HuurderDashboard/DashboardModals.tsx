import React, { useMemo } from "react";
import EnhancedProfileUpdateModal from "@/components/modals/EnhancedProfileUpdateModal";
import DocumentUploadModal from "@/components/modals/DocumentUploadModal";
import PaymentModal from "@/components/PaymentModal";
import { ProfileFormData } from "@/components/modals/profileSchema";
import { convertFromISODate } from "@/utils/dateUtils";
import { useModalRouter } from "@/hooks/useModalRouter";

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

const getInitialFormData = (
  tenantProfile?: any,
  user?: any,
): Partial<ProfileFormData> | undefined => {
  if (!tenantProfile && !user) return undefined;

  const nameParts = user?.name?.split(" ") || [""];
  const firstNameFromUser = nameParts[0] || "";
  const lastNameFromUser =
    nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  return {
    first_name: tenantProfile?.firstName || firstNameFromUser || "",
    last_name: tenantProfile?.lastName || lastNameFromUser || "",
    date_of_birth: tenantProfile?.dateOfBirth
      ? convertFromISODate(tenantProfile.dateOfBirth)
      : "",
    phone: tenantProfile?.phone || "",
    sex: tenantProfile?.personalInfo?.sex || "zeg_ik_liever_niet",
    nationality: tenantProfile?.personalInfo?.nationality || "Nederlandse",
    marital_status: tenantProfile?.personalInfo?.maritalStatus || "single",
    has_children: tenantProfile?.hasChildren || false,
    number_of_children: tenantProfile?.numberOfChildren || 0,
    children_ages: tenantProfile?.childrenAges || [],

    profession:
      tenantProfile?.profession ||
      tenantProfile?.workAndIncome?.profession ||
      "",
    employer: tenantProfile?.workAndIncome?.employer || "",
    employment_status:
      tenantProfile?.workAndIncome?.employmentStatus || "full-time",
    work_contract_type: tenantProfile?.workAndIncome?.contractType || "",
    monthly_income:
      tenantProfile?.workAndIncome?.monthlyIncome ??
      (tenantProfile?.income || 0),
    inkomensbewijs_beschikbaar:
      tenantProfile?.incomeProofAvailable ??
      (tenantProfile?.workAndIncome?.incomeProofAvailable || false),
    work_from_home: tenantProfile?.workAndIncome?.workFromHome || false,
    extra_income: tenantProfile?.extraIncome || 0,
    extra_income_description: tenantProfile?.extraIncomeDescription || "",

    has_partner: tenantProfile?.hasPartner || false,
    partner_name: tenantProfile?.partnerName || "",
    partner_profession: tenantProfile?.partnerProfession || "",
    partner_employment_status: tenantProfile?.partnerEmploymentStatus || "",
    partner_monthly_income: tenantProfile?.partnerMonthlyIncome || 0,
    borgsteller_beschikbaar: tenantProfile?.guarantorAvailable || false,
    borgsteller_naam: tenantProfile?.guarantorName || "",
    borgsteller_relatie: tenantProfile?.guarantorRelationship || "",
    borgsteller_telefoon: tenantProfile?.guarantorPhone || "",
    borgsteller_inkomen: tenantProfile?.guarantorIncome || 0,

    preferred_city: tenantProfile?.preferredLocations || [],
    preferred_property_type:
      tenantProfile?.housingPreferences?.propertyType || "appartement",
    preferred_bedrooms: tenantProfile?.housingPreferences?.bedrooms,
    furnished_preference:
      tenantProfile?.housingPreferences?.furnishedPreference,
    min_budget:
      tenantProfile?.preferences?.minBudget ??
      tenantProfile?.housingPreferences?.minBudget ??
      0,
    max_budget:
      tenantProfile?.maxRent ??
      tenantProfile?.preferences?.maxBudget ??
      tenantProfile?.housingPreferences?.maxBudget ??
      1000,
    min_kamers:
      tenantProfile?.minRooms ??
      tenantProfile?.housingPreferences?.minRooms ??
      1,
    max_kamers:
      tenantProfile?.maxRooms ??
      tenantProfile?.housingPreferences?.maxRooms ??
      5,

    move_in_date_preferred: tenantProfile?.preferredMoveDate
      ? convertFromISODate(tenantProfile.preferredMoveDate)
      : tenantProfile?.moveInDatePreferred
        ? convertFromISODate(tenantProfile.moveInDatePreferred)
        : undefined,
    move_in_date_earliest: tenantProfile?.earliestMoveDate
      ? convertFromISODate(tenantProfile.earliestMoveDate)
      : tenantProfile?.moveInDateEarliest
        ? convertFromISODate(tenantProfile.moveInDateEarliest)
        : undefined,
    availability_flexible: tenantProfile?.availabilityFlexible || false,
    parking_required:
      tenantProfile?.housingPreferences?.parkingRequired || false,
    lease_duration_preference:
      tenantProfile?.housingPreferences?.leaseDurationPreference,
    storage_kelder: tenantProfile?.storageKelder || false,
    storage_zolder: tenantProfile?.storageZolder || false,
    storage_berging: tenantProfile?.storageBerging || false,
    storage_garage: tenantProfile?.storageGarage || false,
    storage_schuur: tenantProfile?.storageSchuur || false,

    hasPets: tenantProfile?.hasPets || false,
    pet_details: tenantProfile?.petDetails || "",
    smokes: tenantProfile?.smokes || false,
    smoking_details: tenantProfile?.smokingDetails || "",

    references_available: tenantProfile?.referencesAvailable || false,
    rental_history_years: tenantProfile?.rentalHistoryYears || 0,
    reason_for_moving: tenantProfile?.reasonForMoving || "",

    profilePictureUrl: tenantProfile?.profilePicture || "",
    bio: tenantProfile?.bio || "",
    motivation: tenantProfile?.motivation || "",
  };
};

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
  const initialData = useMemo(
    () => getInitialFormData(tenantProfile, user),
    [tenantProfile, user],
  );
  
  const { openModal, isMobile } = useModalRouter();
  
  // Handle profile modal opening with route-based approach
  React.useEffect(() => {
    if (showProfileModal) {
      const shouldShowDesktopModal = openModal('profileEdit', {
        initialData,
        returnPath: '/huurder-dashboard'
      });
      
      if (!shouldShowDesktopModal) {
        // On mobile, we navigated to a page, so close the modal state
        setShowProfileModal(false);
      }
    }
  }, [showProfileModal, openModal, initialData, setShowProfileModal]);
  
  return (
    <>
      {/* Profile Creation Modal - Only shown on desktop */}
      {!isMobile && (
        <EnhancedProfileUpdateModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onProfileComplete={onProfileComplete}
          initialData={initialData}
        />
      )}

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
