import { useEffect } from 'react';
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
import { setIsSubmittingForm } from '@/store/auth/conservativeLogout';
import { getDefaultProfileValues } from '@/utils/profileDefaults';

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

  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema) as Resolver<ProfileFormData, any>,
    defaultValues: getDefaultProfileValues(initialData),
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
    const newValues = getDefaultProfileValues(initialData);
    methods.reset(newValues);
  }, [initialData]);

  const onSubmit = async (data: ProfileFormData) => {
    console.log('🔥 EnhancedProfileUpdateModal.onSubmit - Form data:', data);
    
    // Validate entire form before submission
    try {
      const parsedData = profileSchema.parse(data);
      console.log('🔥 EnhancedProfileUpdateModal.onSubmit - Parsed data:', parsedData);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const fieldErrors = validationError.flatten().fieldErrors as Record<string, string[]>;
        const errorMessages = Object.entries(fieldErrors)
          .map(([fieldName, errors]) => `${fieldName}: ${errors?.join(', ')}`)
          .join('; ');
        console.error('🔥 Final Profile Validation Error:', fieldErrors);
        toast({
          title: 'Validatie Fout',
          description: `Er ontbreken nog verplichte velden: ${errorMessages}`,
          variant: 'destructive',
        });
        return; // Stop submission
      }
    }


    try {
      setIsSubmittingForm(true);
      console.log('🔥 EnhancedProfileUpdateModal.onSubmit - Calling onProfileComplete');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Profiel opslaan duurt te lang')), 30000)
      );
      
      const savePromise = onProfileComplete(data);
      await Promise.race([savePromise, timeoutPromise]);
      toast({
        title: 'Profiel Opgeslagen',
        description: 'Je profiel is succesvol opgeslagen.',
      });
      onClose();
    } catch (error) {
      console.error('🔥 EnhancedProfileUpdateModal.onSubmit - Error:', error);
      toast({
        title: 'Fout',
        description: `Er is een fout opgetreden bij het opslaan van je profiel: ${error instanceof Error ? error.message : 'Onbekende fout'} `,
        variant: 'destructive',
      });
      // Don't close the modal on error - let user fix the issue
      // Don't re-throw the error as it's already handled
    } finally {
      setIsSubmittingForm(false);
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
              console.log('🔥 EnhancedProfileUpdateModal - Form submit event triggered!');
              console.log('🔥 EnhancedProfileUpdateModal - Event:', e);
              methods.handleSubmit(onSubmit)(e);
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
              isSubmitting={methods.formState.isSubmitting}
            />

          </form>
        </FormProvider>
      </div>
    </BaseModal>
  );
};

export default EnhancedProfileUpdateModal;
