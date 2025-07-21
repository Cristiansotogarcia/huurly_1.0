import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from './profileSchema';
import { useValidatedMultiStepForm } from '@/hooks/useValidatedMultiStepForm';
import Step1PersonalInfo from './EnhancedProfileSteps/Step1PersonalInfo';
import Step2Employment from './EnhancedProfileSteps/Step2Employment';
import Step3Household from './EnhancedProfileSteps/Step3Household';
import Step4Housing from './EnhancedProfileSteps/Step4Housing';
import Step5Timing from './EnhancedProfileSteps/Step5Timing';
import Step6Guarantor from './EnhancedProfileSteps/Step6Guarantor';
import Step7References from './EnhancedProfileSteps/Step7References';
import Step8ProfileMotivation from './EnhancedProfileSteps/Step8ProfileMotivation';
import { ProfileFormStepper } from './ProfileFormStepper';
import { ProfileFormNavigation } from './ProfileFormNavigation';
import { BaseModal } from './BaseModal';
import { useToast } from '@/hooks/use-toast';

interface EnhancedProfileCreationModalProps {
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
  { id: 'step5', name: 'Timing & Beschikbaarheid' },
  { id: 'step6', name: 'Borgsteller' },
  { id: 'step7', name: 'Referenties' },
  { id: 'step8', name: 'Profiel & Motivatie' },
];

const stepComponents = [
  <Step1PersonalInfo key="step1" />,
  <Step2Employment key="step2" />,
  <Step3Household key="step3" />,
  <Step4Housing key="step4" />,
  <Step5Timing key="step5" />,
  <Step6Guarantor key="step6" />,
  <Step7References key="step7" />,
  <Step8ProfileMotivation key="step8" />,
];

export const EnhancedProfileCreationModal = ({ isOpen, onClose, onProfileComplete, initialData }: EnhancedProfileCreationModalProps) => {
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
      work_from_home: false,
      extra_income: undefined,
      extra_income_description: '',
      
      // Step 3: Household
      has_partner: false,
      partner_name: '',
      partner_profession: '',
      partner_employment_status: '',
      partner_monthly_income: undefined,
      
      // Step 4: Housing Preferences
      preferred_city: [],
      preferred_property_type: 'appartement',
      preferred_bedrooms: undefined,
      furnished_preference: undefined,
      min_budget: undefined,
      max_budget: 1000,
      min_kamers: undefined,
      max_kamers: undefined,
      vroegste_verhuisdatum: '',
      voorkeur_verhuisdatum: '',

      beschikbaarheid_flexibel: false,
      parking_required: false,
      
      // Storage preferences
      storage_kelder: false,
      storage_zolder: false,
      storage_berging: false,
      storage_garage: false,
      storage_schuur: false,
      
      // Timing fields (moved from Step 5)
      move_in_date_preferred: undefined,
      move_in_date_earliest: undefined,
      availability_flexible: false,
      lease_duration_preference: undefined,
      storage_needs: '',
      
      // Step 4: Lifestyle
      hasPets: false,
      pet_details: '',
      smokes: false,
      smoking_details: '',
      
      // Step 7: References & History
      references_available: false,
      rental_history_years: undefined,
      reason_for_moving: '',
      
      // Step 8: Profile & Motivation
      bio: '',
      motivation: '',
    };

    // Merge with initial data if provided
    return initialData ? { ...defaults, ...initialData } : defaults;
  };

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: getDefaultValues(),
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

  const onSubmit = (data: ProfileFormData) => {
    console.log('Form submission started', data);
    try {
      onProfileComplete(data);
      console.log('onProfileComplete called successfully');
      toast({
        title: 'Profiel Opgeslagen',
        description: 'Je profiel is succesvol opgeslagen.',
      });
      onClose();
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        title: 'Fout',
        description: 'Er is een fout opgetreden bij het opslaan van je profiel.',
        variant: 'destructive',
      });
    }
  };

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
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
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
            />
          </form>
        </FormProvider>
      </div>
    </BaseModal>
  );
};
