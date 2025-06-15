
import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/UserService';
import { User, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { BaseModal, BaseModalActions, useModalState, useModalForm } from './BaseModal';
import { PersonalInfoStep } from './ProfileCreation/PersonalInfoStep';
import { HousingPreferencesStep } from './ProfileCreation/HousingPreferencesStep';
import { PersonalDescriptionStep } from './ProfileCreation/PersonalDescriptionStep';
import { ProfileOverviewStep } from './ProfileCreation/ProfileOverviewStep';
import { StepIndicator } from './ProfileCreation/StepIndicator';
import { useProfileValidation } from './ProfileCreation/useProfileValidation';
import { ProfileData } from './ProfileCreation/types';

interface ProfileCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (profileData: any) => void;
}

const ProfileCreationModal = ({ open, onOpenChange, onComplete }: ProfileCreationModalProps) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const { isSubmitting, setIsSubmitting } = useModalState();
  const { isStepValid } = useProfileValidation();
  
  const initialData: ProfileData = {
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: undefined,
    profession: '',
    monthlyIncome: 0,
    bio: '',
    city: 'Amsterdam',
    minBudget: 1000,
    maxBudget: 2000,
    bedrooms: 1,
    propertyType: 'Appartement',
    motivation: '',
    hasDocuments: false,
  };

  const { data: profileData, updateField } = useModalForm(initialData);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

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
      const result = await userService.createTenantProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth ? format(profileData.dateOfBirth, 'yyyy-MM-dd') : '',
        profession: profileData.profession,
        monthlyIncome: profileData.monthlyIncome,
        bio: profileData.bio,
        city: profileData.city,
        minBudget: profileData.minBudget,
        maxBudget: profileData.maxBudget,
        bedrooms: profileData.bedrooms,
        propertyType: profileData.propertyType,
        motivation: profileData.motivation,
      });

      if (result.success && result.data) {
        toast({
          title: "Profiel aangemaakt!",
          description: "Je profiel is succesvol aangemaakt en is nu zichtbaar voor verhuurders."
        });
        
        onComplete(result.data);
        onOpenChange(false);
        setCurrentStep(1);
      } else {
        throw result.error || new Error('Profiel aanmaken mislukt');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Er is iets misgegaan. Probeer het opnieuw.';
      toast({
        title: "Fout bij aanmaken profiel",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const stepProps = { profileData, updateField };
    
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep {...stepProps} />;
      case 2:
        return <HousingPreferencesStep {...stepProps} />;
      case 3:
        return <PersonalDescriptionStep {...stepProps} />;
      case 4:
        return <ProfileOverviewStep profileData={profileData} />;
      default:
        return null;
    }
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Profiel Aanmaken"
      icon={User}
      size="2xl"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Stap {currentStep} van {totalSteps}</span>
            <span>{Math.round(progress)}% voltooid</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Step Indicators */}
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>
        
        <BaseModalActions
          customActions={
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Vorige
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep, profileData)}
                >
                  Volgende
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(currentStep, profileData) || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Profiel aanmaken...' : 'Profiel Aanmaken'}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          }
        />
      </div>
    </BaseModal>
  );
};

export default ProfileCreationModal;
