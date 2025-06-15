import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EnhancedProfileCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (profileData: any) => Promise<void>;
  editMode: boolean;
}

interface ProfileFormData {
  // Basic Information
  first_name: string;
  last_name: string;
  date_of_birth: Date | undefined;
  phone: string;
  sex: string;
  nationality: string;
  marital_status: string;
  
  // Employment & Income
  profession: string;
  employer: string;
  employment_status: string;
  work_contract_type: string;
  monthly_income: number;
  work_from_home: boolean;
  
  // Household Composition
  has_partner: boolean;
  partner_name: string;
  partner_profession: string;
  partner_employment_status: string;
  partner_monthly_income: number;
  has_children: boolean;
  number_of_children: number;
  
  // Housing Preferences
  preferred_city: string;
  preferred_property_type: string;
  preferred_bedrooms: number;
  max_budget: number;
  min_budget: number;
  furnished_preference: string;
  parking_required: boolean;
  storage_needs: string;
  
  // Timing & Availability
  move_in_date_preferred: Date | undefined;
  move_in_date_earliest: Date | undefined;
  availability_flexible: boolean;
  lease_duration_preference: string;
  
  // Guarantor Information
  guarantor_available: boolean;
  guarantor_name: string;
  guarantor_phone: string;
  guarantor_income: number;
  guarantor_relationship: string;
  income_proof_available: boolean;
  
  // Emergency Contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  
  // Lifestyle & Preferences
  has_pets: boolean;
  pet_details: string;
  smokes: boolean;
  smoking_details: string;
  
  // References & History
  references_available: boolean;
  rental_history_years: number;
  reason_for_moving: string;
  
  // Profile Content
  bio: string;
  motivation: string;
  
  // Profile Picture
  profilePictureUrl: string;
}

const initialFormData: ProfileFormData = {
  first_name: '',
  last_name: '',
  date_of_birth: undefined,
  phone: '',
  sex: '',
  nationality: 'Nederlandse',
  marital_status: 'single',
  profession: '',
  employer: '',
  employment_status: '',
  work_contract_type: '',
  monthly_income: 0,
  work_from_home: false,
  has_partner: false,
  partner_name: '',
  partner_profession: '',
  partner_employment_status: '',
  partner_monthly_income: 0,
  has_children: false,
  number_of_children: 0,
  preferred_city: '',
  preferred_property_type: '',
  preferred_bedrooms: 1,
  max_budget: 0,
  min_budget: 0,
  furnished_preference: 'geen_voorkeur',
  parking_required: false,
  storage_needs: '',
  move_in_date_preferred: undefined,
  move_in_date_earliest: undefined,
  availability_flexible: true,
  lease_duration_preference: '',
  guarantor_available: false,
  guarantor_name: '',
  guarantor_phone: '',
  guarantor_income: 0,
  guarantor_relationship: '',
  income_proof_available: true,
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  has_pets: false,
  pet_details: '',
  smokes: false,
  smoking_details: '',
  references_available: true,
  rental_history_years: 0,
  reason_for_moving: '',
  bio: '',
  motivation: '',
  profilePictureUrl: ''
};

// Define allowed furnished_preference values - now using Dutch values
const ALLOWED_FURNISHED_PREFERENCES = ["gemeubileerd", "ongemeubileerd", "geen_voorkeur"];

// Enhanced Date Picker with Year Navigation
const EnhancedDatePicker = ({ 
  selected, 
  onSelect, 
  placeholder = "Selecteer datum",
  disabled
}: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
}) => {
  const [currentYear, setCurrentYear] = useState(selected?.getFullYear() || new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(selected?.getMonth() || new Date().getMonth());

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentYear(prev => direction === 'prev' ? prev - 1 : prev + 1);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    }
  };

  const displayDate = new Date(currentYear, currentMonth, 1);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? (
            format(selected, "dd/MM/yyyy", { locale: nl })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Year and Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateYear('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium min-w-[120px] text-center">
                {format(displayDate, "MMMM yyyy", { locale: nl })}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateYear('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          month={displayDate}
          onMonthChange={(date) => {
            setCurrentYear(date.getFullYear());
            setCurrentMonth(date.getMonth());
          }}
          disabled={disabled}
          locale={nl}
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

import Step1PersonalInfo from "./EnhancedProfileSteps/Step1PersonalInfo";
import Step2Employment from "./EnhancedProfileSteps/Step2Employment";
import Step3Household from "./EnhancedProfileSteps/Step3Household";
import Step4Housing from "./EnhancedProfileSteps/Step4Housing";
import Step5Timing from "./EnhancedProfileSteps/Step5Timing";
import Step6Guarantor from "./EnhancedProfileSteps/Step6Guarantor";
import Step7References from "./EnhancedProfileSteps/Step7References";
import Step8ProfileMotivation from "./EnhancedProfileSteps/Step8ProfileMotivation";

export function EnhancedProfileCreationModal({ 
  open, 
  onOpenChange, 
  onComplete, 
  editMode 
}: EnhancedProfileCreationModalProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const { toast } = useToast();

  const totalSteps = 8;

  // Fetch & load tenant profile when opening in editMode
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || !user.id) {
          setIsLoadingProfile(false);
          return;
        }
        
        const { data: tenantProfile, error } = await supabase
          .from('tenant_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading tenant profile:', error);
          setIsLoadingProfile(false);
          return;
        }
        if (!tenantProfile) {
          setIsLoadingProfile(false);
          return;
        }

        // Map DB to modal fields (converting types as needed)
        setFormData({
          first_name: tenantProfile.first_name || '',
          last_name: tenantProfile.last_name || '',
          date_of_birth: tenantProfile.date_of_birth ? new Date(tenantProfile.date_of_birth) : undefined,
          phone: tenantProfile.phone || '',
          sex: tenantProfile.sex || '',
          nationality: tenantProfile.nationality || 'Nederlandse',
          marital_status: tenantProfile.marital_status || 'single',
          
          profession: tenantProfile.profession || '',
          employer: tenantProfile.employer || '',
          employment_status: tenantProfile.employment_status || '',
          work_contract_type: tenantProfile.work_contract_type || '',
          monthly_income: tenantProfile.monthly_income ? Number(tenantProfile.monthly_income) : 0,
          work_from_home: !!tenantProfile.work_from_home,

          has_partner: !!tenantProfile.has_partner,
          partner_name: tenantProfile.partner_name || '',
          partner_profession: tenantProfile.partner_profession || '',
          partner_employment_status: tenantProfile.partner_employment_status || '',
          partner_monthly_income: tenantProfile.partner_monthly_income ? Number(tenantProfile.partner_monthly_income) : 0,

          has_children: !!tenantProfile.has_children,
          number_of_children: tenantProfile.number_of_children ? Number(tenantProfile.number_of_children) : 0,

          preferred_city: tenantProfile.preferred_city || '',
          preferred_property_type: tenantProfile.preferred_property_type || '',
          preferred_bedrooms: tenantProfile.preferred_bedrooms ? Number(tenantProfile.preferred_bedrooms) : 1,
          max_budget: tenantProfile.max_budget ? Number(tenantProfile.max_budget) : 0,
          min_budget: tenantProfile.min_budget ? Number(tenantProfile.min_budget) : 0,
          furnished_preference: tenantProfile.furnished_preference || 'geen_voorkeur',
          parking_required: !!tenantProfile.parking_required,
          storage_needs: tenantProfile.storage_needs || '',

          move_in_date_preferred: tenantProfile.move_in_date_preferred ? new Date(tenantProfile.move_in_date_preferred) : undefined,
          move_in_date_earliest: tenantProfile.move_in_date_earliest ? new Date(tenantProfile.move_in_date_earliest) : undefined,
          availability_flexible: !!tenantProfile.availability_flexible,
          lease_duration_preference: tenantProfile.lease_duration_preference || '',

          guarantor_available: !!tenantProfile.guarantor_available,
          guarantor_name: tenantProfile.guarantor_name || '',
          guarantor_phone: tenantProfile.guarantor_phone || '',
          guarantor_income: tenantProfile.guarantor_income ? Number(tenantProfile.guarantor_income) : 0,
          guarantor_relationship: tenantProfile.guarantor_relationship || '',
          income_proof_available: !!tenantProfile.income_proof_available,

          emergency_contact_name: tenantProfile.emergency_contact_name || '',
          emergency_contact_phone: tenantProfile.emergency_contact_phone || '',
          emergency_contact_relationship: tenantProfile.emergency_contact_relationship || '',

          has_pets: !!tenantProfile.has_pets,
          pet_details: tenantProfile.pet_details || '',

          smokes: !!tenantProfile.smokes,
          smoking_details: tenantProfile.smoking_details || '',

          references_available: !!tenantProfile.references_available,
          rental_history_years: tenantProfile.rental_history_years ? Number(tenantProfile.rental_history_years) : 0,
          reason_for_moving: tenantProfile.reason_for_moving || '',

          bio: tenantProfile.bio || '',
          motivation: tenantProfile.motivation || '',
          
          profilePictureUrl: tenantProfile.profile_picture_url || ''
        });
      } catch (err) {
        console.error('Error loading profile:', err);
      }
      setIsLoadingProfile(false);
    };

    if (open && editMode) {
      fetchProfile();
    } else if (open && !editMode) {
      setFormData(initialFormData);
    }
  }, [open, editMode]);

  // Calculate household size automatically
  const calculateHouseholdSize = () => {
    let size = 1; // User always counts as 1
    if (formData.has_partner) size += 1;
    if (formData.has_children) size += formData.number_of_children;
    return size;
  };

  // Updated sanitize function to ensure Dutch values
  const sanitizeFurnishedPreference = (value: string) => {
    if (ALLOWED_FURNISHED_PREFERENCES.includes(value)) return value;
    // Convert English values to Dutch
    if (value === 'furnished') return 'gemeubileerd';
    if (value === 'unfurnished') return 'ongemeubileerd';
    if (value === 'no_preference') return 'geen_voorkeur';
    
    console.warn(
      "Invalid furnished_preference detected in form, converting to 'geen_voorkeur'. Value was:",
      value
    );
    return "geen_voorkeur";
  };

  useEffect(() => {
    // Log furnished_preference on every modal open
    if (open) {
      console.debug(
        "Modal opened, current furnished_preference:", formData.furnished_preference
      );
    }
  }, [open]);

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    // If updating furnished_preference, sanitize and log
    if (field === "furnished_preference") {
      const sanitized = sanitizeFurnishedPreference(value);
      setFormData(prev => ({ ...prev, [field]: sanitized }));
      console.debug("furnished_preference changed to:", sanitized);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
      // For debugging all values during profile creation process
      if (typeof value !== "object") {
        console.debug(`Field changed: ${field} =`, value);
      }
    }
  };

  const handleDateSelect = (field: 'date_of_birth' | 'move_in_date_preferred' | 'move_in_date_earliest', date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate household size
      const householdSize = calculateHouseholdSize();

      // Ensure furnished_preference has a valid Dutch value
      const validFurnishedPreference = sanitizeFurnishedPreference(formData.furnished_preference);
      
      // Ensure sex has a valid value if provided
      const validSex = formData.sex && ['man', 'vrouw', 'anders', 'geen_antwoord'].includes(formData.sex) 
        ? formData.sex 
        : null;

      // Ensure marital_status has a valid value
      const validMaritalStatus = formData.marital_status && ['single', 'relationship', 'married', 'divorced', 'widowed'].includes(formData.marital_status)
        ? formData.marital_status 
        : 'single';

      // Ensure employment_status has a valid value if provided
      const validEmploymentStatus = formData.employment_status && ['vast_contract', 'tijdelijk_contract', 'zzp', 'student', 'werkloos', 'pensioen'].includes(formData.employment_status)
        ? formData.employment_status 
        : null;

      // Ensure guarantor_relationship has a valid value if provided
      const validGuarantorRelationship = formData.guarantor_relationship && ['ouder', 'familie', 'vriend', 'werkgever', 'anders'].includes(formData.guarantor_relationship)
        ? formData.guarantor_relationship 
        : null;

      // Ensure lease_duration_preference has a valid value if provided
      const validLeaseDurationPreference = formData.lease_duration_preference && ['6_maanden', '1_jaar', '2_jaar', 'langer', 'flexibel'].includes(formData.lease_duration_preference)
        ? formData.lease_duration_preference 
        : null;

      // Convert Date objects to strings for database
      const profileData = {
        user_id: user.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        // Convert dates to ISO strings or null
        date_of_birth: formData.date_of_birth ? formData.date_of_birth.toISOString().split('T')[0] : null,
        sex: validSex,
        nationality: formData.nationality,
        marital_status: validMaritalStatus,
        profession: formData.profession,
        employer: formData.employer,
        employment_status: validEmploymentStatus,
        work_contract_type: formData.work_contract_type,
        monthly_income: formData.monthly_income,
        work_from_home: formData.work_from_home,
        has_partner: formData.has_partner,
        partner_name: formData.partner_name,
        partner_profession: formData.partner_profession,
        partner_employment_status: formData.partner_employment_status,
        partner_monthly_income: formData.partner_monthly_income,
        has_children: formData.has_children,
        number_of_children: formData.number_of_children,
        preferred_city: formData.preferred_city,
        preferred_property_type: formData.preferred_property_type,
        preferred_bedrooms: formData.preferred_bedrooms,
        max_budget: formData.max_budget,
        min_budget: formData.min_budget,
        furnished_preference: validFurnishedPreference,
        parking_required: formData.parking_required,
        storage_needs: formData.storage_needs,
        move_in_date_preferred: formData.move_in_date_preferred ? formData.move_in_date_preferred.toISOString().split('T')[0] : null,
        move_in_date_earliest: formData.move_in_date_earliest ? formData.move_in_date_earliest.toISOString().split('T')[0] : null,
        availability_flexible: formData.availability_flexible,
        lease_duration_preference: validLeaseDurationPreference,
        guarantor_available: formData.guarantor_available,
        guarantor_name: formData.guarantor_name,
        guarantor_phone: formData.guarantor_phone,
        guarantor_income: formData.guarantor_income,
        guarantor_relationship: validGuarantorRelationship,
        income_proof_available: formData.income_proof_available,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        has_pets: formData.has_pets,
        pet_details: formData.pet_details,
        smokes: formData.smokes,
        smoking_details: formData.smoking_details,
        references_available: formData.references_available,
        rental_history_years: formData.rental_history_years,
        reason_for_moving: formData.reason_for_moving,
        bio: formData.bio,
        motivation: formData.motivation,
        // Auto-calculated household size
        household_size: householdSize,
        profile_completed: true,
        profile_completion_percentage: 100,
        profile_picture_url: formData.profilePictureUrl || null
      };

      console.log('Submitting profile data with furnished_preference:', validFurnishedPreference);

      const { error } = await supabase
        .from('tenant_profiles')
        .upsert(profileData);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Profiel succesvol aangemaakt!",
        description: "Je profiel is compleet en je kunt nu zoeken naar woningen.",
      });

      await onComplete(profileData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Fout bij aanmaken profiel",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refactored renderStep
  const renderStep = () => {
    if (isLoadingProfile) {
      // Show spinner while loading
      return (
        <div className="flex flex-col items-center py-14">
          <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm mt-2 text-blue-700">Profielgegevens laden...</p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return <Step1PersonalInfo formData={formData} handleInputChange={handleInputChange} handleDateSelect={handleDateSelect} />;
      case 2:
        return <Step2Employment formData={formData} handleInputChange={handleInputChange} />;
      case 3:
        return <Step3Household formData={formData} handleInputChange={handleInputChange} calculateHouseholdSize={calculateHouseholdSize} />;
      case 4:
        return <Step4Housing formData={formData} handleInputChange={handleInputChange} />;
      case 5:
        return <Step5Timing formData={formData} handleInputChange={handleInputChange} handleDateSelect={handleDateSelect} />;
      case 6:
        return <Step6Guarantor formData={formData} handleInputChange={handleInputChange} />;
      case 7:
        return <Step7References formData={formData} handleInputChange={handleInputChange} />;
      case 8:
        return <Step8ProfileMotivation formData={formData} handleInputChange={handleInputChange} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Profiel Aanmaken - Stap {currentStep} van {totalSteps}
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <div className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Vorige
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
              >
                Volgende
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Bezig met opslaan...' : 'Profiel Aanmaken'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
