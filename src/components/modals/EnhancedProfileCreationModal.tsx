import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from './profileSchema';
import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { Step1_PersonalInfo } from './steps/Step1_PersonalInfo';
import { Step2_Employment } from './steps/Step2_Employment';
import { Step3_Housing } from './steps/Step3_Housing';
import { Step4_Lifestyle } from './steps/Step4_Lifestyle';
import { Step5_Motivation } from './steps/Step5_Motivation';
import { ProfileFormStepper } from './ProfileFormStepper';
import { ProfileFormNavigation } from './ProfileFormNavigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface EnhancedProfileCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileComplete: (data: ProfileFormData) => void;
}

const steps = [
  { id: 'step1', name: 'Persoonlijke Info' },
  { id: 'step2', name: 'Werk & Inkomen' },
  { id: 'step3', name: 'Huidige Woonsituatie' },
  { id: 'step4', name: 'Levensstijl' },
  { id: 'step5', name: 'Motivatie' },
];

const stepComponents = [
  <Step1_PersonalInfo key="step1" />,
  <Step2_Employment key="step2" />,
  <Step3_Housing key="step3" />,
  <Step4_Lifestyle key="step4" />,
  <Step5_Motivation key="step5" />,
];

export const EnhancedProfileCreationModal = ({ isOpen, onClose, onProfileComplete }: EnhancedProfileCreationModalProps) => {
  const { toast } = useToast();
  const methods = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      // Initialize with default values
      firstName: '',
      lastName: '',
      dateOfBirth: undefined,
      phone: '',
      sex: 'zeg_ik_liever_niet',
      nationality: 'Nederlandse',
      maritalStatus: 'single',
      profession: '',
      employer: '',
      employmentStatus: 'employed',
      monthlyIncome: 0,
      city: '',
      propertyType: 'apartment',
      bedrooms: 1,
      maxBudget: 1000,
      has_pets: false,
      smokes: false,
      bio: '',
      motivation: '',
    },
  });

  const { currentStep, nextStep, prevStep, isFirstStep, isLastStep, goTo } = useMultiStepForm(steps.length);

  const onSubmit = (data: ProfileFormData) => {
    onProfileComplete(data);
    toast({
      title: 'Profiel Opgeslagen',
      description: 'Je profiel is succesvol opgeslagen.',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Maak je profiel compleet</DialogTitle>
          <DialogDescription>
            Een volledig profiel vergroot je kansen. Voltooi de stappen hieronder.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <ProfileFormStepper currentStep={currentStep} steps={steps} setCurrentStep={goTo} />
            <div className="mt-8">{stepComponents[currentStep]}</div>
            <ProfileFormNavigation
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              onBack={prevStep}
              onNext={nextStep}
            />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
