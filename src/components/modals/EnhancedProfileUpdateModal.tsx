import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
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
import { ProfileFormStepper } from './ProfileFormStepper';
import { ProfileFormNavigation } from './ProfileFormNavigation';
import { BaseModal } from './BaseModal';
import { useToast } from '@/hooks/use-toast';

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

const stepComponents = [
  <Step1PersonalInfo key="step1" />,
  <Step2Employment key="step2" />,
  <Step3Household key="step3" />,
  <Step4Housing key="step4" />,
  <Step5Guarantor key="step5" />,
  <Step6References key="step6" />,
  <Step7ProfileMotivation key="step7" />,
];

export const EnhancedProfileUpdateModal = ({ isOpen, onClose, onProfileComplete, initialData }: EnhancedProfileUpdateModalProps) => {
  const { toast } = useToast();
  const [isManuallySubmitting, setIsManuallySubmitting] = React.useState(false);
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
      preferred_city: [],
      preferred_property_type: 'appartement',
      preferred_bedrooms: undefined,
      furnished_preference: undefined,
      min_budget: undefined,
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
      borgsteller_inkomen: undefined,
      
      // Step 6: References & History
      references_available: false,
      rental_history_years: undefined,
      reason_for_moving: '',
      
      // Step 7: Profile & Motivation
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

  // Reset form when initialData changes (e.g., switching between create/edit modes)
  useEffect(() => {
    const newValues = getDefaultValues();
    console.log('🔄 EnhancedProfileUpdateModal: Resetting form with values:', newValues);
    console.log('🖼️ Profile picture URL from initialData:', initialData?.profilePictureUrl);
    console.log('🖼️ Profile picture URL in newValues:', newValues.profilePictureUrl);
    methods.reset(newValues);
  }, [initialData]);

  const onSubmit = async (data: ProfileFormData) => {
    console.log('🚀 Form submission started', data);
    console.log('📋 Form validation status:', methods.formState.isValid);
    console.log('📋 Form errors:', methods.formState.errors);
    
    // Debug: Check if we're on the last step
    console.log('📍 Current step (0-indexed):', currentStep);
    console.log('📍 Current step (1-indexed):', currentStep + 1);
    console.log('📍 Total steps:', steps.length);
    console.log('📍 Is last step calculation:', currentStep, '===', steps.length - 1, '=', currentStep === steps.length - 1);
    console.log('📍 Is last step:', isLastStep);
    console.log('📍 Steps array:', steps);
    console.log('📍 Step components length:', stepComponents.length);
    
    // Validate entire form before submission
    try {
      console.log('🔍 Validating entire form...');
      const validationResult = profileSchema.parse(data);
      console.log('✅ Full form validation passed');
    } catch (validationError) {
      console.error('❌ Full form validation failed:', validationError);
      if (validationError instanceof z.ZodError) {
        const errorMessages = validationError.errors.map(err => err.message).join(', ');
        toast({
          title: 'Validatie Fout',
          description: `Er ontbreken nog verplichte velden: ${errorMessages}`,
          variant: 'destructive',
        });
        return; // Stop submission
      }
    }

    // Set manual loading state for async operation
    setIsManuallySubmitting(true);
    console.log('🔄 Manual loading state set to true');

    try {
      console.log('🔄 Calling onProfileComplete with data:', data);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Profiel opslaan duurt te lang')), 30000)
      );
      
      const savePromise = onProfileComplete(data);
      await Promise.race([savePromise, timeoutPromise]);
      
      console.log('✅ onProfileComplete called successfully');
      toast({
        title: 'Profiel Opgeslagen',
        description: 'Je profiel is succesvol opgeslagen.',
      });
      onClose();
    } catch (error) {
      console.error('❌ Error in form submission:', error);
      toast({
        title: 'Fout',
        description: `Er is een fout opgetreden bij het opslaan van je profiel: ${error instanceof Error ? error.message : 'Onbekende fout'}`,
        variant: 'destructive',
      });
    } finally {
      // Always reset manual loading state
      setIsManuallySubmitting(false);
      console.log('🔄 Manual loading state set to false');
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
          <form 
            onSubmit={(e) => {
              console.log('🔥 Form onSubmit triggered!', e);
              console.log('🔥 Form target:', e.target);
              console.log('🔥 Form current target:', e.currentTarget);
              console.log('🔥 Form validation state:', {
                isValid: methods.formState.isValid,
                errors: methods.formState.errors,
                isDirty: methods.formState.isDirty,
                isSubmitting: methods.formState.isSubmitting
              });
              console.log('🔥 Current form values:', methods.getValues());
              
              // Add explicit validation check
              const formData = methods.getValues();
              console.log('🔥 About to call handleSubmit with onSubmit function');
              
              methods.handleSubmit(
                (data) => {
                  console.log('🔥 handleSubmit SUCCESS callback called with data:', data);
                  onSubmit(data);
                },
                (errors) => {
                  console.log('🔥 handleSubmit ERROR callback called with errors:', errors);
                }
              )(e);
            }} 
            className="space-y-6"
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
              isSubmitting={methods.formState.isSubmitting || isManuallySubmitting}
            />
            
            {/* Debug button for testing - remove after fixing */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">🐛 Debug Mode Active</p>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    console.log('🧪 Debug: Current form values:', methods.getValues());
                    console.log('🧪 Debug: Form errors:', methods.formState.errors);
                    console.log('🧪 Debug: Is valid:', methods.formState.isValid);
                  }}
                  className="px-3 py-1 bg-yellow-500 text-white text-xs rounded"
                >
                  Log Form State
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    console.log('🧪 Debug: Force submit triggered');
                    methods.handleSubmit(onSubmit)();
                  }}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded"
                >
                  Force Submit
                </button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </BaseModal>
  );
};
