import React, { useEffect, useRef } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { profileSchema, ProfileFormData } from '@/components/modals/profileSchema';
import { useValidatedMultiStepForm } from '@/hooks/useValidatedMultiStepForm';
import Step1PersonalInfo from '@/components/modals/EnhancedProfileSteps/Step1PersonalInfo';
import Step2Employment from '@/components/modals/EnhancedProfileSteps/Step2Employment';
import Step3Household from '@/components/modals/EnhancedProfileSteps/Step3Household';
import Step4Housing from '@/components/modals/EnhancedProfileSteps/Step4Housing';
import Step5Guarantor from '@/components/modals/EnhancedProfileSteps/Step5Guarantor';
import Step6References from '@/components/modals/EnhancedProfileSteps/Step6References';
import Step7ProfileMotivation from '@/components/modals/EnhancedProfileSteps/Step7ProfileMotivation';
import ProfileFormNavigation from '@/components/modals/ProfileFormNavigation';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useHuurder } from '@/hooks/useHuurder';
// Removed incorrect import - setIsSubmittingForm not exported from conservativeLogout

const steps = [
  { id: 'step1', name: 'Persoonlijke Info' },
  { id: 'step2', name: 'Werk & Inkomen' },
  { id: 'step3', name: 'Huidige Woonsituatie' },
  { id: 'step4', name: 'Woningvoorkeuren' },
  { id: 'step5', name: 'Borgsteller' },
  { id: 'step6', name: 'Referenties' },
  { id: 'step7', name: 'Profiel & Motivatie' },
];

const ProfileEditPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const huurderHook = useHuurder();
  const { handleProfileComplete: defaultHandleProfileComplete } = huurderHook;
  
  // Get data from navigation state with fallbacks for refresh scenarios
  const state = location.state as any;
  const initialData = state?.modalData?.initialData;
  
  // Determine returnTo with intelligent fallback
  // If no state (e.g., after refresh), default to dashboard based on user role
  const getDefaultReturnPath = () => {
    if (!huurderHook.user) return '/';
    switch (huurderHook.user.role) {
      case 'huurder':
        return '/huurder-dashboard';
      case 'verhuurder':
        return '/verhuurder-dashboard';
      case 'beoordelaar':
        return '/beoordelaar-dashboard';
      case 'beheerder':
        return '/beheerder-dashboard';
      default:
        return '/';
    }
  };
  
  const returnTo = state?.returnTo || getDefaultReturnPath();
  const onProfileComplete = state?.modalData?.onProfileComplete; // Get callback from state



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

      // Step 4: Housing Preferences
      preferred_city: [],
      preferred_property_type: 'appartement',
      preferred_bedrooms: undefined,
      furnished_preference: undefined,
      min_budget: undefined as unknown as number,
      max_budget: undefined as unknown as number,
      min_kamers: undefined,
      max_kamers: undefined,

      // Timing fields
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

      // Step 4: Lifestyle
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
      reason_for_moving: undefined,

      // Step 7: Profile & Motivation
      bio: '',
      motivation: '',
    };

    const mergedData = initialData ? { ...defaults, ...initialData } : defaults;
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

    return mergedData;
  };

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: getDefaultValues(),
  });

  const {
    currentStep,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
    validateCurrentStep
  } = useValidatedMultiStepForm(steps.length, methods.getValues);

  // Track if we just transitioned to the last step to prevent auto-submission
  const allowSubmissionRef = useRef(false);
  const previousStepRef = useRef(currentStep);

  // Track step changes - when moving to last step, disallow submission initially
  useEffect(() => {
    if (currentStep !== previousStepRef.current) {
      if (isLastStep && previousStepRef.current !== steps.length - 1) {
        // Just transitioned TO the last step - block submission
        allowSubmissionRef.current = false;
      }
      previousStepRef.current = currentStep;
    }
  }, [currentStep, isLastStep]);

  // Reset form when initialData changes
  useEffect(() => {
    methods.reset(getDefaultValues());
  }, [initialData]);

  // Create step components inside the component to access methods
  const stepComponents = [
    <Step1PersonalInfo key="step1" />,
    <Step2Employment key="step2" />,
    <Step3Household key="step3" isStudent={methods.watch('employment_status') === 'student'} />,
    <Step4Housing key="step4" />,
    <Step5Guarantor key="step5" />,
    <Step6References key="step6" />,
    <Step7ProfileMotivation key="step7" />,
  ];

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    // Ensure required fields are explicitly provided
    if (
      !data.bio ||
      !data.motivation ||
      !data.preferred_city?.length ||
      data.min_budget === undefined ||
      data.max_budget === undefined
    ) {
      toast({
        title: 'Validatie Fout',
        description:
          'Vul je bio, motivatie, budget en gewenste stad in voordat je doorgaat.',
        variant: 'destructive',
      } as any);
      return;
    }

    // Validate entire form before submission
    try {
      const parsed = profileSchema.parse(data);
      data = parsed;
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMessages = validationError.issues.map(err => err.message).join(', ');
        toast({
          title: 'Validatie Fout',
          description: `Er ontbreken nog verplichte velden: ${errorMessages}`,
          variant: 'destructive',
        } as any);
        return;
      }
    }

    // Form submission started - removed setIsSubmittingForm call

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: Profiel opslaan duurt te lang')), 30000)
      );
      
      // Use the callback from navigation state if available, otherwise use default
      const handleProfileComplete = onProfileComplete || defaultHandleProfileComplete;
      const savePromise = handleProfileComplete(data);
      await Promise.race([savePromise, timeoutPromise]);
      
      toast({
        title: 'Profiel Opgeslagen',
        description: 'Je profiel is succesvol opgeslagen.',
      } as any);
      
      // Navigate back to the original page
      navigate(returnTo, { replace: true });
    } catch (error) {
      toast({
        title: 'Fout',
        description: `Er is een fout opgetreden bij het opslaan van je profiel: ${error instanceof Error ? error.message : 'Onbekende fout'}`,
        variant: 'destructive',
      } as any);
      // Don't navigate away on error - let user fix the issue
      // Don't re-throw the error as it's already handled
    } finally {
      // Form submission completed - removed setIsSubmittingForm call
    }
  };

  const handleClose = () => {
    navigate(returnTo, { replace: true });
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // Prevent body scroll when this page is active
  useEffect(() => {
    // Save original overflow value
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    // Cleanup: restore original values when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

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

  return (
    <div className="fixed inset-0 z-50 h-dvh bg-background flex flex-col">
      {/* Fixed Header with Back Button and Title */}
      <div className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="flex items-center justify-between p-3 sm:p-4 pt-safe">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 sm:p-2 hover:bg-accent rounded-md transition-colors shrink-0"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-base sm:text-lg font-semibold truncate">
              Stap {currentStep + 1}: {steps[currentStep].name}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 sm:p-2 hover:bg-accent rounded-md transition-colors shrink-0"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Fixed Progress Stepper */}
        <div className="px-3 sm:px-4 pb-2">
          <Progress value={progressPercentage} className="h-1.5" />
        </div>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            // ALWAYS prevent default form submission
            // Submission is now handled exclusively through the button onClick
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
          onKeyDown={(e) => {
            // Prevent form submission on Enter key
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          className="flex-1 flex flex-col min-h-0"
        >
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-4">
            <div className="max-w-2xl mx-auto pb-24 sm:pb-4">
              {stepComponents[currentStep]}
            </div>
          </div>

          {/* Fixed Navigation Footer */}
          <div className="shrink-0 bg-background border-t border-border p-3 sm:p-3 pb-6 sm:pb-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
            <div className="max-w-2xl mx-auto">
              <ProfileFormNavigation
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
                onBack={prevStep}
                onNext={nextStep}
                validateCurrentStep={validateCurrentStep}
                isSubmitting={methods.formState.isSubmitting}
                onSubmitClick={() => {
                  // Manually trigger form submission
                  allowSubmissionRef.current = true;
                  methods.handleSubmit(onSubmit)();
                }}
              />
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ProfileEditPage;
