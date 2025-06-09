import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/UserService';
import { User, ArrowLeft, ArrowRight, CheckCircle, Upload, MapPin, Euro, Home, Briefcase } from 'lucide-react';

interface ProfileCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (profileData: any) => void;
}

interface ProfileData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  profession: string;
  monthlyIncome: number;
  bio: string;
  
  // Housing Preferences
  city: string;
  minBudget: number;
  maxBudget: number;
  bedrooms: number;
  propertyType: string;
  
  // Additional Info
  motivation: string;
  hasDocuments: boolean;
}

const ProfileCreationModal = ({ open, onOpenChange, onComplete }: ProfileCreationModalProps) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
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
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateProfileData = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
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
      // Create tenant profile using UserService
      const result = await userService.createTenantProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        dateOfBirth: profileData.dateOfBirth,
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

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return profileData.firstName && profileData.lastName && profileData.phone && 
               profileData.dateOfBirth && profileData.profession && profileData.monthlyIncome > 0;
      case 2:
        return profileData.city && profileData.minBudget > 0 && profileData.maxBudget > profileData.minBudget;
      case 3:
        return profileData.bio && profileData.motivation;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-12 h-12 mx-auto mb-4 text-dutch-blue" />
              <h3 className="text-lg font-semibold">Persoonlijke Informatie</h3>
              <p className="text-gray-600">Vertel ons iets over jezelf</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Voornaam *</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName}
                  onChange={(e) => updateProfileData('firstName', e.target.value)}
                  placeholder="Emma"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Achternaam *</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName}
                  onChange={(e) => updateProfileData('lastName', e.target.value)}
                  placeholder="Bakker"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">E-mailadres</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Telefoonnummer *</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => updateProfileData('phone', e.target.value)}
                placeholder="+31 6 12345678"
              />
            </div>
            
            <div>
              <Label htmlFor="dateOfBirth">Geboortedatum *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => updateProfileData('dateOfBirth', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="profession">Beroep *</Label>
              <Input
                id="profession"
                value={profileData.profession}
                onChange={(e) => updateProfileData('profession', e.target.value)}
                placeholder="Software Developer"
              />
            </div>
            
            <div>
              <Label htmlFor="monthlyIncome">Maandelijks bruto inkomen * (€)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                value={profileData.monthlyIncome || ''}
                onChange={(e) => updateProfileData('monthlyIncome', parseInt(e.target.value) || 0)}
                placeholder="4500"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Home className="w-12 h-12 mx-auto mb-4 text-dutch-orange" />
              <h3 className="text-lg font-semibold">Woonvoorkeuren</h3>
              <p className="text-gray-600">Wat voor woning zoek je?</p>
            </div>
            
            <div>
              <Label htmlFor="city">Gewenste stad *</Label>
              <Select value={profileData.city} onValueChange={(value) => updateProfileData('city', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Amsterdam">Amsterdam</SelectItem>
                  <SelectItem value="Rotterdam">Rotterdam</SelectItem>
                  <SelectItem value="Den Haag">Den Haag</SelectItem>
                  <SelectItem value="Utrecht">Utrecht</SelectItem>
                  <SelectItem value="Eindhoven">Eindhoven</SelectItem>
                  <SelectItem value="Groningen">Groningen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minBudget">Minimum budget * (€/maand)</Label>
                <Input
                  id="minBudget"
                  type="number"
                  value={profileData.minBudget || ''}
                  onChange={(e) => updateProfileData('minBudget', parseInt(e.target.value) || 0)}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="maxBudget">Maximum budget * (€/maand)</Label>
                <Input
                  id="maxBudget"
                  type="number"
                  value={profileData.maxBudget || ''}
                  onChange={(e) => updateProfileData('maxBudget', parseInt(e.target.value) || 0)}
                  placeholder="2000"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="bedrooms">Aantal slaapkamers</Label>
              <Select value={profileData.bedrooms.toString()} onValueChange={(value) => updateProfileData('bedrooms', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 slaapkamer</SelectItem>
                  <SelectItem value="2">2 slaapkamers</SelectItem>
                  <SelectItem value="3">3 slaapkamers</SelectItem>
                  <SelectItem value="4">4+ slaapkamers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="propertyType">Type woning</Label>
              <Select value={profileData.propertyType} onValueChange={(value) => updateProfileData('propertyType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Appartement">Appartement</SelectItem>
                  <SelectItem value="Studio">Studio</SelectItem>
                  <SelectItem value="Huis">Huis</SelectItem>
                  <SelectItem value="Kamer">Kamer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold">Over Jezelf</h3>
              <p className="text-gray-600">Maak een goede eerste indruk</p>
            </div>
            
            <div>
              <Label htmlFor="bio">Korte beschrijving van jezelf *</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => updateProfileData('bio', e.target.value)}
                placeholder="Vertel iets over jezelf, je hobby's, werk en wat voor huurder je bent..."
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                {profileData.bio.length}/500 karakters
              </p>
            </div>
            
            <div>
              <Label htmlFor="motivation">Waarom ben je op zoek naar een woning? *</Label>
              <Textarea
                id="motivation"
                value={profileData.motivation}
                onChange={(e) => updateProfileData('motivation', e.target.value)}
                placeholder="Bijvoorbeeld: nieuwe baan, studie, samenwonen..."
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold">Profiel Overzicht</h3>
              <p className="text-gray-600">Controleer je gegevens voordat je het profiel aanmaakt</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Persoonlijke Informatie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Naam:</span>
                  <span>{profileData.firstName} {profileData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telefoon:</span>
                  <span>{profileData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Beroep:</span>
                  <span>{profileData.profession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inkomen:</span>
                  <span>€{profileData.monthlyIncome.toLocaleString()}/maand</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Woonvoorkeuren</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Stad:</span>
                  <span>{profileData.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span>€{profileData.minBudget} - €{profileData.maxBudget}/maand</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Slaapkamers:</span>
                  <span>{profileData.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span>{profileData.propertyType}</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Volgende stappen:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Je profiel wordt zichtbaar voor verhuurders</li>
                <li>• Upload je documenten voor verificatie</li>
                <li>• Begin met zoeken naar woningen</li>
                <li>• Ontvang uitnodigingen voor bezichtigingen</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profiel Aanmaken
          </DialogTitle>
        </DialogHeader>
        
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
          <div className="flex justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step < currentStep ? 'bg-green-500 text-white' :
                  step === currentStep ? 'bg-dutch-blue text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStep()}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
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
                disabled={!isStepValid()}
              >
                Volgende
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Profiel aanmaken...' : 'Profiel Aanmaken'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCreationModal;
