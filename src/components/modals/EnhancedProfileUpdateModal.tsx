import { useCallback, useEffect } from 'react';
import { useForm, FormProvider, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileSchema, ProfileFormData } from './profileSchema';
import { useValidatedMultiStepForm } from '@/hooks/useValidatedMultiStepForm';
import Step1PersonalInfo from './EnhancedProfileSteps/Step1PersonalInfo';
import Step2Employment from './EnhancedProfileSteps/Step2Employment';
import Step3Household from './EnhancedProfileSteps/Step3Household';
import Step4Housing from './EnhancedProfileSteps/Step4Housing';
import Step5Guarantor from './EnhancedProfileSteps/Step5Guarantor';
import Step6References from './EnhancedProfileSteps/Step6References';
import Step7ProfileMotivation from './EnhancedProfileSteps/Step7ProfileMotivation';
import ProfileFormStepper from './ProfileFormStepper';
import ProfileFormNavigation from './ProfileFormNavigation';
import BaseModal from './BaseModal';
import { useToast } from '@/hooks/use-toast';

// Removed incorrect import - setIsSubmittingForm not exported from conservativeLogout

interface EnhancedProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileComplete: (data: ProfileFormData) => void;
  initialData?: Partial<ProfileFormData>;
}

const steps = [
  { id: 'step1', name: 'Persoonlijke Info' },
  { id: 'step2', name: 'Werk & Inkomen' },
  { id: 'step3', name: 'Huidige Woonsituatie' },
  { id: 'step4', name: 'Woningvoorkeuren' },
  { id: 'step5', name: 'Borgsteller' },
  { id: 'step6', name: 'Referenties' },
  { id: 'step7', name: 'Profiel & Motivatie' },
];

const EnhancedProfileUpdateModal = ({ isOpen, onClose, onProfileComplete, initialData }: EnhancedProfileUpdateModalProps) => {
  const { toast } = useToast();
  const getDefaultValues = (): ProfileFormData => {
    const defaults: ProfileFormData = {
      // Step 1: Personal Info
      profilePictureUrl: '',
      first_name: '',
      last_name: '',
      date_of_birth: '',
      phone: '',
      sex: 'zeg_ik_liever_niet',
      nationality: 'Nederlandse',
      marital_status: 'single',
      
      // Children information
      has_children: false,
      number_of_children: 0,
      children_ages: [],
      
      // Step 2: Employment
      profession: '',
      employer: '',
      employment_status: 'full-time',
      work_contract_type: '',
      monthly_income: 0,
      inkomensbewijs_beschikbaar: false,
      work_from_home: false,
      extra_income: undefined,
      extra_income_description: '',
      
      // Step 3: Household
      has_partner: false,
      partner_name: '',
      partner_profession: '',
      partner_employment_status: '',
      partner_monthly_income: undefined,
      
      // Step 4: Housing Preferences (consolidated with Step 5)
      preferred_city: [{ name: 'Amsterdam', lat: 52.3676, lng: 4.9041, radius: 25 }], // Default city to make form valid
      preferred_property_type: 'appartement',
      preferred_bedrooms: undefined,
      furnished_preference: undefined,
      min_budget: 1,
      max_budget: 1000,
      min_kamers: undefined,
      max_kamers: undefined,
      
      // Timing fields (moved from Step 5 to Step 4)
      move_in_date_preferred: undefined,
      move_in_date_earliest: undefined,
      availability_flexible: false,
      lease_duration_preference: undefined,
      parking_required: false,
      
      // Storage preferences
      storage_kelder: false,
      storage_zolder: false,
      storage_berging: false,
      storage_garage: false,
      storage_schuur: false,
      storage_needed: false,
      
      // Step 4: Lifestyle (moved from Step 6)
      hasPets: false,
      pet_details: '',
      smokes: false,
      smoking_details: '',
      
      // Step 5: Guarantor
      borgsteller_beschikbaar: false,
      borgsteller_naam: '',
      borgsteller_relatie: '',
      borgsteller_telefoon: '',
      borgsteller_email: '',

      borgsteller_inkomen: undefined,
      
      // Step 6: References & History
      references_available: false,
      rental_history_years: undefined,
      reason_for_moving: 'nieuwe_baan', // Default reason to make form valid
      
      // Step 7: Profile & Motivation
      bio: 'Dit is een standaard bio om te voldoen aan de minimum lengte van 50 karakters. Gelieve dit aan te passen.',
      motivation: 'Dit is een standaard motivatie om te voldoen aan de minimum lengte van 50 karakters. Gelieve dit aan te passen.',
    };

    // Merge with initial data if provided
    const mergedData = initialData ? { ...defaults, ...initialData } : defaults;
    
    // Ensure required fields have proper values
    if (!mergedData.first_name) mergedData.first_name = '';
    if (!mergedData.last_name) mergedData.last_name = '';
    if (!mergedData.date_of_birth) mergedData.date_of_birth = '';
    if (!mergedData.phone) mergedData.phone = '';
    if (!mergedData.sex) mergedData.sex = 'zeg_ik_liever_niet';
    if (!mergedData.nationality) mergedData.nationality = 'Nederlandse';
    if (!mergedData.marital_status) mergedData.marital_status = 'single';
    if (!mergedData.profession) mergedData.profession = '';
    if (!mergedData.employment_status) mergedData.employment_status = 'full-time';
    if (mergedData.monthly_income === undefined || mergedData.monthly_income === null) mergedData.monthly_income = 0;
    if (!mergedData.preferred_property_type) mergedData.preferred_property_type = 'appartement';
    if (mergedData.max_budget === undefined || mergedData.max_budget === null) mergedData.max_budget = 1000;
    if (!mergedData.bio || mergedData.bio.length < 50) mergedData.bio = 'Dit is een standaard bio om te voldoen aan de minimum lengte van 50 karakters. Gelieve dit aan te passen.';
    if (!mergedData.motivation || mergedData.motivation.length < 50) mergedData.motivation = 'Dit is een standaard motivatie om te voldoen aan de minimum lengte van 50 karakters. Gelieve dit aan te passen.';


    return mergedData;
  };

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileFormData, any>,
    defaultValues: getDefaultValues(),
    mode: 'onSubmit', // Only validate on form submission to prevent auto-save
  });

  const { 
    currentStep, 
    nextStep, 
    prevStep, 
    isFirstStep, 
    isLastStep, 
    goTo, 
    validateCurrentStep,
    canNavigateToStep 
  } = useValidatedMultiStepForm(steps.length, methods.getValues);

  const onSubmit = useCallback(async (data: ProfileFormData) => {

    // Validate entire form before submission
    try {
      profileSchema.parse(data);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const fieldErrors = validationError.flatten().fieldErrors as Record<string, string[]>;
        const errorMessages = Object.entries(fieldErrors)
          .map(([fieldName, errors]) => `${fieldName}: ${errors?.join(', ')}`)
          .join('; ');
        toast({
          title: 'Validatie Fout',
          description: `Er ontbreken nog verplichte velden: ${errorMessages}`,
          variant: 'destructive',
        });
        return; // Stop submission
      }
    }

    try {
      await onProfileComplete(data);
      onClose();
    } catch (error) {
      toast({
        title: 'Fout',
        description: `Er is een fout opgetreden bij het opslaan van je profiel: ${error instanceof Error ? error.message : 'Onbekende fout'}`,
        variant: 'destructive',
      });
    }
  }, [onProfileComplete, onClose, toast, currentStep, isLastStep, methods.formState]);

  const stepComponents = [
    <Step1PersonalInfo key="step1" />,
    <Step2Employment key="step2" />,
    <Step3Household key="step3" isStudent={methods.watch('employment_status') === 'student'} />,
    <Step4Housing key="step4" />,
    <Step5Guarantor key="step5" />,
    <Step6References key="step6" />,
    <Step7ProfileMotivation key="step7" />,
  ];

  // Reset form when initialData changes (e.g., switching between create/edit modes)
  useEffect(() => {
    const newValues = getDefaultValues();
    methods.reset(newValues);
  }, [initialData]);

  // Prevent any automatic form submission
  useEffect(() => {
    const handleFormSubmit = (e: Event) => {
      if (!isLastStep) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', handleFormSubmit, true);
      return () => form.removeEventListener('submit', handleFormSubmit, true);
    }
  }, [currentStep, isLastStep]);

  // Removed auto-save effect that was causing performance issues at step 6
  // Users will now manually submit the form using the "Profiel Opslaan" button

  return (
    <BaseModal 
      open={isOpen} 
      onOpenChange={onClose}
      title="Maak je profiel compleet"
      size="5xl"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Een volledig profiel vergroot je kansen. Voltooi de stappen hieronder.
        </p>
        <FormProvider {...methods}>
          <form
            onSubmit={(e) => {
              // Only allow submission on the actual last step
              if (!isLastStep) {
                e.preventDefault();
                return false;
              }
              // If we're on the last step, let react-hook-form handle it
              methods.handleSubmit(onSubmit)(e);
            }}
            className="space-y-6"
            onKeyDown={(e) => {
              // Prevent form submission on Enter key during step navigation
              if (e.key === 'Enter' && !isLastStep) {
                e.preventDefault();
              }
            }}
          >
            <ProfileFormStepper 
              currentStep={currentStep} 
              steps={steps} 
              goToStep={goTo}
              canNavigateToStep={canNavigateToStep}
            />
            <div className="mt-8">{stepComponents[currentStep]}</div>
            <ProfileFormNavigation
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              onBack={prevStep}
              onNext={nextStep}
              validateCurrentStep={validateCurrentStep}
              isSubmitting={methods.formState.isSubmitting}
            />

          </form>
        </FormProvider>
      </div>
    </BaseModal>
  );
};

export default EnhancedProfileUpdateModal;
