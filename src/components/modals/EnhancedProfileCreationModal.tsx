import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/UserService';
import { 
  User, ArrowLeft, ArrowRight, CheckCircle, Upload, MapPin, Euro, Home, 
  Briefcase, Heart, Users, Baby, Camera, Clock, Car, Wifi, Bath, 
  TreePine, ParkingCircle, WashingMachine, Utensils 
} from 'lucide-react';

interface EnhancedProfileCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (profileData: any) => void;
  editMode?: boolean;
  existingProfileId?: string;
}

interface EnhancedProfileData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  sex: 'man' | 'vrouw' | 'anders' | 'zeg_ik_liever_niet' | '';
  profilePicture?: File;
  profilePictureUrl?: string;
  
  // Step 2: Marital & Family Status
  maritalStatus: 'single' | 'married' | 'partnership' | 'divorced' | 'widowed';
  hasChildren: boolean;
  numberOfChildren: number;
  childrenAges: number[];
  
  // Step 3: Work & Employment
  profession: string;
  employer: string;
  employmentStatus: string;
  workContractType: string;
  monthlyIncome: number;
  housingAllowanceEligible: boolean;
  
  // Step 4: Partner Information
  hasPartner: boolean;
  partnerName: string;
  partnerProfession: string;
  partnerMonthlyIncome: number;
  partnerEmploymentStatus: string;
  
  // Step 5: Location Preferences
  city: string;
  preferredDistricts: string[];
  maxCommuteTime: number;
  transportationPreference: string;
  
  // Step 6: Housing & Lifestyle Preferences
  minBudget: number;
  maxBudget: number;
  bedrooms: number;
  propertyType: string;
  furnishedPreference: 'furnished' | 'unfurnished' | 'no_preference';
  desiredAmenities: string[];
  hasPets: boolean;
  petDetails: string;
  smokes: boolean;
  smokingDetails: string;
  
  // Step 7: About You & Review
  bio: string;
  motivation: string;
}

const EnhancedProfileCreationModal = ({ open, onOpenChange, onComplete, editMode = false, existingProfileId }: EnhancedProfileCreationModalProps) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [profileData, setProfileData] = useState<EnhancedProfileData>({
    // Step 1: Personal Information
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    nationality: 'Nederlandse',
    sex: '',
    
    // Step 2: Marital & Family Status
    maritalStatus: 'single',
    hasChildren: false,
    numberOfChildren: 0,
    childrenAges: [],
    
    // Step 3: Work & Employment
    profession: '',
    employer: '',
    employmentStatus: 'employed',
    workContractType: 'permanent',
    monthlyIncome: 0,
    housingAllowanceEligible: false,
    
    // Step 4: Partner Information
    hasPartner: false,
    partnerName: '',
    partnerProfession: '',
    partnerMonthlyIncome: 0,
    partnerEmploymentStatus: 'employed',
    
    // Step 5: Location Preferences
    city: 'Amsterdam',
    preferredDistricts: [],
    maxCommuteTime: 30,
    transportationPreference: 'public_transport',
    
    // Step 6: Housing & Lifestyle Preferences
    minBudget: 1000,
    maxBudget: 2000,
    bedrooms: 1,
    propertyType: 'Appartement',
    furnishedPreference: 'no_preference',
    desiredAmenities: [],
    hasPets: false,
    petDetails: '',
    smokes: false,
    smokingDetails: '',
    
    // Step 7: About You & Review
    bio: '',
    motivation: '',
  });

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const updateProfileData = (field: keyof EnhancedProfileData, value: any) => {
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
      const profileDataToSubmit = {
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
        // Enhanced fields
        employer: profileData.employer,
        employmentStatus: profileData.employmentStatus,
        workContractType: profileData.workContractType,
        housingAllowanceEligible: profileData.housingAllowanceEligible,
        hasPets: profileData.hasPets,
        petDetails: profileData.petDetails,
        smokes: profileData.smokes,
        smokingDetails: profileData.smokingDetails,
        // New enhanced fields
        nationality: profileData.nationality,
        sex: profileData.sex,
        maritalStatus: profileData.maritalStatus,
        hasChildren: profileData.hasChildren,
        numberOfChildren: profileData.numberOfChildren,
        childrenAges: profileData.childrenAges,
        hasPartner: profileData.hasPartner,
        partnerName: profileData.partnerName,
        partnerProfession: profileData.partnerProfession,
        partnerMonthlyIncome: profileData.partnerMonthlyIncome,
        partnerEmploymentStatus: profileData.partnerEmploymentStatus,
        preferredDistricts: profileData.preferredDistricts,
        maxCommuteTime: profileData.maxCommuteTime,
        transportationPreference: profileData.transportationPreference,
        furnishedPreference: profileData.furnishedPreference,
        desiredAmenities: profileData.desiredAmenities,
        profilePictureUrl: profileData.profilePictureUrl,
      } as any;

      // Use the appropriate method based on edit mode
      const result = editMode 
        ? await userService.updateTenantProfile(profileDataToSubmit)
        : await userService.createTenantProfile(profileDataToSubmit);

      if (result.success && result.data) {
        toast({
          title: editMode ? "Profiel bijgewerkt!" : "Profiel aangemaakt!",
          description: editMode 
            ? "Je profiel is succesvol bijgewerkt."
            : "Je complete profiel is succesvol aangemaakt en is nu zichtbaar voor verhuurders."
        });
        
        onComplete(result.data);
        onOpenChange(false);
        setCurrentStep(1);
      } else {
        throw result.error || new Error(editMode ? 'Profiel bijwerken mislukt' : 'Profiel aanmaken mislukt');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Er is iets misgegaan. Probeer het opnieuw.';
      toast({
        title: editMode ? "Fout bij bijwerken profiel" : "Fout bij aanmaken profiel",
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
               profileData.dateOfBirth && profileData.nationality;
      case 2:
        return profileData.maritalStatus && 
               (!profileData.hasChildren || profileData.childrenAges.length === profileData.numberOfChildren);
      case 3:
        return profileData.profession && profileData.monthlyIncome > 0;
      case 4:
        return !profileData.hasPartner || 
               (profileData.partnerName && profileData.partnerProfession && profileData.partnerMonthlyIncome > 0);
      case 5:
        return profileData.city && profileData.preferredDistricts.length > 0;
      case 6:
        return profileData.minBudget > 0 && profileData.maxBudget > profileData.minBudget;
      case 7:
        return profileData.bio && profileData.motivation;
      default:
        return false;
    }
  };

  const calculateTotalHouseholdIncome = () => {
    return profileData.monthlyIncome + (profileData.hasPartner ? profileData.partnerMonthlyIncome : 0);
  };

  const [dutchCities, setDutchCities] = useState<{[key: string]: string[]}>({});
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Load existing profile data when in edit mode
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!editMode || !user?.id) return;
      
      setIsLoadingProfile(true);
      try {
        const result = await userService.getTenantProfile(user.id);
        
        if (result.success && result.data) {
          const existingData = result.data;
          
          // Map database fields to form fields with safe property access
          const data = existingData as any; // Use any to avoid TypeScript errors for new fields
          
          setProfileData({
            firstName: existingData.first_name || '',
            lastName: existingData.last_name || '',
            email: user.email || '',
            phone: existingData.phone || '',
            dateOfBirth: existingData.date_of_birth || '',
            nationality: data.nationality || 'Nederlandse',
            sex: data.sex || '',
            
            maritalStatus: data.marital_status || 'single',
            hasChildren: data.has_children || false,
            numberOfChildren: data.number_of_children || 0,
            childrenAges: data.children_ages || [],
            
            profession: existingData.profession || '',
            employer: existingData.employer || '',
            employmentStatus: existingData.employment_status || 'employed',
            workContractType: existingData.work_contract_type || 'permanent',
            monthlyIncome: existingData.monthly_income || 0,
            housingAllowanceEligible: existingData.housing_allowance_eligible || false,
            
            hasPartner: data.has_partner || false,
            partnerName: data.partner_name || '',
            partnerProfession: data.partner_profession || '',
            partnerMonthlyIncome: data.partner_monthly_income || 0,
            partnerEmploymentStatus: data.partner_employment_status || 'employed',
            
            city: existingData.preferred_city || 'Amsterdam',
            preferredDistricts: data.preferred_districts || [],
            maxCommuteTime: data.max_commute_time || 30,
            transportationPreference: data.transportation_preference || 'public_transport',
            
            minBudget: existingData.min_budget || 1000,
            maxBudget: existingData.max_budget || 2000,
            bedrooms: existingData.preferred_bedrooms || 1,
            propertyType: existingData.preferred_property_type || 'Appartement',
            furnishedPreference: data.furnished_preference || 'no_preference',
            desiredAmenities: data.desired_amenities || [],
            hasPets: existingData.has_pets || false,
            petDetails: existingData.pet_details || '',
            smokes: existingData.smokes || false,
            smokingDetails: data.smoking_details || '',
            
            bio: existingData.bio || '',
            motivation: existingData.motivation || '',
            profilePictureUrl: existingData.profile_picture_url || '',
          });
          
          // Set image preview if profile picture exists
          if (existingData.profile_picture_url) {
            setImagePreview(existingData.profile_picture_url);
          }
        }
      } catch (error) {
        console.error('Error loading existing profile:', error);
        toast({
          title: "Fout bij laden profiel",
          description: "Er is een fout opgetreden bij het laden van je bestaande profiel.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadExistingProfile();
  }, [editMode, user?.id, toast]);

  // Initialize Dutch cities and neighborhoods data
  useEffect(() => {
    // Use comprehensive Dutch cities data from our database
    const dutchCitiesData = {
      'Amsterdam': ['Centrum', 'Jordaan', 'Oud-Zuid', 'Oud-West', 'Noord', 'Oost', 'West', 'Zuid', 'Zuidoost', 'De Pijp', 'Vondelpark', 'Museumkwartier'],
      'Rotterdam': ['Centrum', 'Noord', 'Delfshaven', 'Overschie', 'Hillegersberg-Schiebroek', 'Kralingen-Crooswijk', 'Feijenoord', 'IJsselmonde', 'Pernis', 'Prins Alexander'],
      'Den Haag': ['Centrum', 'Scheveningen', 'Bezuidenhout', 'Haagse Hout', 'Laak', 'Leidschenveen-Ypenburg', 'Loosduinen', 'Segbroek', 'Escamp'],
      'Utrecht': ['Centrum', 'Noord', 'Oost', 'West', 'Zuid', 'Nieuwegein', 'Vleuten-De Meern', 'Zuilen', 'Overvecht', 'Kanaleneiland'],
      'Eindhoven': ['Centrum', 'Noord', 'Oost', 'West', 'Zuid', 'Woensel', 'Stratum', 'Gestel', 'Strijp'],
      'Groningen': ['Centrum', 'Noord', 'Oost', 'West', 'Zuid', 'Paddepoel', 'Vinkhuizen'],
      'Tilburg': ['Centrum', 'Noord', 'Oost', 'West', 'Zuid'],
      'Almere': ['Centrum', 'Haven', 'Stad', 'Buiten', 'Poort'],
      'Breda': ['Centrum', 'Noord', 'Oost', 'West', 'Zuid'],
      'Nijmegen': ['Centrum', 'Noord', 'Oost', 'West', 'Zuid'],
      'Apeldoorn': ['Centrum', 'Noord', 'Oost', 'West', 'Zuid'],
      'Haarlem': ['Centrum', 'Noord', 'Oost', 'West', 'Zuid'],
      'Arnhem': ['Centrum', 'Noord', 'Oost', 'West', 'Zuid'],
      'Zaanstad': ['Zaandam', 'Koog aan de Zaan', 'Zaandijk', 'Wormerveer'],
      'Amersfoort': ['Centrum', 'Noord', 'Oost', 'West', 'Zuid'],
      'Maastricht': ['Centrum', 'Noord', 'Oost', 'West', 'Zuid'],
      'Dordrecht': ['Centrum', 'Noord', 'Oost', 'West'],
      'Leiden': ['Centrum', 'Noord', 'Oost', 'West'],
      'Haarlemmermeer': ['Hoofddorp', 'Nieuw-Vennep', 'Badhoevedorp'],
      'Zoetermeer': ['Centrum', 'Noord', 'Oost', 'West'],
      'Zwolle': ['Centrum', 'Noord', 'Oost', 'West']
    };

    setDutchCities(dutchCitiesData);
    setAvailableCities(Object.keys(dutchCitiesData));
  }, []);

  const getDistrictsForCity = (city: string) => {
    return dutchCities[city] || [];
  };

  // Profile picture upload functionality
  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Ongeldig bestandstype",
        description: "Alleen JPEG, PNG en WebP bestanden zijn toegestaan.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Bestand te groot",
        description: "De afbeelding mag maximaal 5MB groot zijn.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingImage(true);

    try {
      // Create file path with user ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile-picture.${fileExt}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update profile data
      updateProfileData('profilePictureUrl', publicUrl);
      updateProfileData('profilePicture', file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      toast({
        title: "Foto geüpload",
        description: "Je profielfoto is succesvol geüpload."
      });

    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload mislukt",
        description: "Er is een fout opgetreden bij het uploaden van je foto.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeProfilePicture = () => {
    updateProfileData('profilePictureUrl', '');
    updateProfileData('profilePicture', undefined);
    setImagePreview(null);
  };

  const amenitiesOptions = [
    { id: 'balkon', label: 'Balkon', icon: TreePine },
    { id: 'tuin', label: 'Tuin', icon: TreePine },
    { id: 'parkeerplaats', label: 'Parkeerplaats', icon: ParkingCircle },
    { id: 'lift', label: 'Lift', icon: ArrowRight },
    { id: 'wasmachine', label: 'Wasmachine aansluiting', icon: WashingMachine },
    { id: 'vaatwasser', label: 'Vaatwasser', icon: Utensils },
    { id: 'wifi', label: 'Internet/WiFi', icon: Wifi },
    { id: 'bad', label: 'Bad', icon: Bath },
  ];

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
              <Label htmlFor="nationality">Nationaliteit *</Label>
              <Select value={profileData.nationality} onValueChange={(value) => updateProfileData('nationality', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nederlandse">Nederlandse</SelectItem>
                  <SelectItem value="Duitse">Duitse</SelectItem>
                  <SelectItem value="Belgische">Belgische</SelectItem>
                  <SelectItem value="Franse">Franse</SelectItem>
                  <SelectItem value="Britse">Britse</SelectItem>
                  <SelectItem value="Andere EU">Andere EU</SelectItem>
                  <SelectItem value="Niet-EU">Niet-EU</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sex">Geslacht</Label>
              <Select value={profileData.sex} onValueChange={(value: any) => updateProfileData('sex', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer geslacht" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="man">Man</SelectItem>
                  <SelectItem value="vrouw">Vrouw</SelectItem>
                  <SelectItem value="anders">Anders</SelectItem>
                  <SelectItem value="zeg_ik_liever_niet">Zeg ik liever niet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="profilePicture">Profielfoto (optioneel)</Label>
              <div className="flex items-center space-x-4 mt-2">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    id="profilePictureInput"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('profilePictureInput')?.click()}
                    disabled={isUploadingImage}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploadingImage ? 'Uploaden...' : 'Upload foto'}
                  </Button>
                  {imagePreview && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={removeProfilePicture}
                      className="text-red-600 hover:text-red-700"
                    >
                      Verwijder foto
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 mx-auto mb-4 text-dutch-orange" />
              <h3 className="text-lg font-semibold">Familie & Relatiestatus</h3>
              <p className="text-gray-600">Informatie over je gezinssituatie</p>
            </div>
            
            <div>
              <Label htmlFor="maritalStatus">Burgerlijke staat *</Label>
              <Select value={profileData.maritalStatus} onValueChange={(value: any) => updateProfileData('maritalStatus', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Alleenstaand</SelectItem>
                  <SelectItem value="married">Getrouwd</SelectItem>
                  <SelectItem value="partnership">Samenwonend</SelectItem>
                  <SelectItem value="divorced">Gescheiden</SelectItem>
                  <SelectItem value="widowed">Weduwe/weduwnaar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasChildren"
                checked={profileData.hasChildren}
                onCheckedChange={(checked) => {
                  updateProfileData('hasChildren', checked);
                  if (!checked) {
                    updateProfileData('numberOfChildren', 0);
                    updateProfileData('childrenAges', []);
                  }
                }}
              />
              <Label htmlFor="hasChildren">Ik heb kinderen</Label>
            </div>
            
            {profileData.hasChildren && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <Label htmlFor="numberOfChildren">Aantal kinderen</Label>
                  <Select 
                    value={profileData.numberOfChildren.toString()} 
                    onValueChange={(value) => {
                      const num = parseInt(value);
                      updateProfileData('numberOfChildren', num);
                      updateProfileData('childrenAges', Array(num).fill(0));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'kind' : 'kinderen'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {profileData.numberOfChildren > 0 && (
                  <div>
                    <Label>Leeftijden van de kinderen</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Array(profileData.numberOfChildren).fill(0).map((_, index) => (
                        <Input
                          key={index}
                          type="number"
                          placeholder={`Kind ${index + 1} leeftijd`}
                          value={profileData.childrenAges[index] || ''}
                          onChange={(e) => {
                            const newAges = [...profileData.childrenAges];
                            newAges[index] = parseInt(e.target.value) || 0;
                            updateProfileData('childrenAges', newAges);
                          }}
                          min="0"
                          max="25"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold">Werk & Inkomen</h3>
              <p className="text-gray-600">Je werkgerelateerde informatie</p>
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
              <Label htmlFor="employer">Werkgever</Label>
              <Input
                id="employer"
                value={profileData.employer}
                onChange={(e) => updateProfileData('employer', e.target.value)}
                placeholder="TechCorp B.V."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employmentStatus">Dienstverband</Label>
                <Select value={profileData.employmentStatus} onValueChange={(value) => updateProfileData('employmentStatus', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employed">In dienst</SelectItem>
                    <SelectItem value="self_employed">Zelfstandig</SelectItem>
                    <SelectItem value="freelance">Freelancer</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="unemployed">Werkloos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="workContractType">Type contract</Label>
                <Select value={profileData.workContractType} onValueChange={(value) => updateProfileData('workContractType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Vast contract</SelectItem>
                    <SelectItem value="temporary">Tijdelijk contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="internship">Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="monthlyIncome">Jouw maandelijks bruto inkomen * (€)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                value={profileData.monthlyIncome || ''}
                onChange={(e) => updateProfileData('monthlyIncome', parseInt(e.target.value) || 0)}
                placeholder="4500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="housingAllowanceEligible"
                checked={profileData.housingAllowanceEligible}
                onCheckedChange={(checked) => updateProfileData('housingAllowanceEligible', checked)}
              />
              <Label htmlFor="housingAllowanceEligible">Ik kom in aanmerking voor huurtoeslag</Label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Heart className="w-12 h-12 mx-auto mb-4 text-pink-600" />
              <h3 className="text-lg font-semibold">Partner Informatie</h3>
              <p className="text-gray-600">Informatie over je partner (indien van toepassing)</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPartner"
                checked={profileData.hasPartner}
                onCheckedChange={(checked) => {
                  updateProfileData('hasPartner', checked);
                  if (!checked) {
                    updateProfileData('partnerName', '');
                    updateProfileData('partnerProfession', '');
                    updateProfileData('partnerMonthlyIncome', 0);
                    updateProfileData('partnerEmploymentStatus', 'employed');
                  }
                }}
              />
              <Label htmlFor="hasPartner">Ik heb een partner die mee gaat wonen</Label>
            </div>
            
            {profileData.hasPartner && (
              <div className="space-y-4 p-4 bg-pink-50 rounded-lg">
                <div>
                  <Label htmlFor="partnerName">Naam van partner</Label>
                  <Input
                    id="partnerName"
                    value={profileData.partnerName}
                    onChange={(e) => updateProfileData('partnerName', e.target.value)}
                    placeholder="Alex Jansen"
                  />
                </div>
                
                <div>
                  <Label htmlFor="partnerProfession">Beroep van partner</Label>
                  <Input
                    id="partnerProfession"
                    value={profileData.partnerProfession}
                    onChange={(e) => updateProfileData('partnerProfession', e.target.value)}
                    placeholder="Grafisch ontwerper"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partnerEmploymentStatus">Dienstverband partner</Label>
                    <Select value={profileData.partnerEmploymentStatus} onValueChange={(value) => updateProfileData('partnerEmploymentStatus', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">In dienst</SelectItem>
                        <SelectItem value="self_employed">Zelfstandig</SelectItem>
                        <SelectItem value="freelance">Freelancer</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="unemployed">Werkloos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="partnerMonthlyIncome">Maandelijks bruto inkomen partner (€)</Label>
                    <Input
                      id="partnerMonthlyIncome"
                      type="number"
                      value={profileData.partnerMonthlyIncome || ''}
                      onChange={(e) => updateProfileData('partnerMonthlyIncome', parseInt(e.target.value) || 0)}
                      placeholder="3200"
                    />
                  </div>
                </div>
                
                <div className="bg-green-100 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    Totaal huishoudinkomen: €{calculateTotalHouseholdIncome().toLocaleString()}/maand
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Dit wordt gebruikt voor inkomensfiltering door verhuurders
                  </p>
                </div>
              </div>
            )}
            
            {!profileData.hasPartner && (
              <div className="bg-blue-100 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  Jouw inkomen: €{profileData.monthlyIncome.toLocaleString()}/maand
                </p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-lg font-semibold">Locatie Voorkeuren</h3>
              <p className="text-gray-600">Waar wil je graag wonen?</p>
            </div>
            
            <div>
              <Label htmlFor="city">Gewenste stad *</Label>
              <Select value={profileData.city} onValueChange={(value) => {
                updateProfileData('city', value);
                updateProfileData('preferredDistricts', []);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Gewenste wijken/buurten *</Label>
              <p className="text-sm text-gray-600 mb-2">Selecteer minimaal 1 wijk</p>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {getDistrictsForCity(profileData.city).map((district) => (
                  <div key={district} className="flex items-center space-x-2">
                    <Checkbox
                      id={`district-${district}`}
                      checked={profileData.preferredDistricts.includes(district)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateProfileData('preferredDistricts', [...profileData.preferredDistricts, district]);
                        } else {
                          updateProfileData('preferredDistricts', profileData.preferredDistricts.filter(d => d !== district));
                        }
                      }}
                    />
                    <Label htmlFor={`district-${district}`} className="text-sm">{district}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxCommuteTime">Max. reistijd naar werk (minuten)</Label>
                <Input
                  id="maxCommuteTime"
                  type="number"
                  value={profileData.maxCommuteTime || ''}
                  onChange={(e) => updateProfileData('maxCommuteTime', parseInt(e.target.value) || 30)}
                  placeholder="30"
                />
              </div>
              
              <div>
                <Label htmlFor="transportationPreference">Vervoer voorkeur</Label>
                <Select value={profileData.transportationPreference} onValueChange={(value) => updateProfileData('transportationPreference', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public_transport">Openbaar vervoer</SelectItem>
                    <SelectItem value="bicycle">Fiets</SelectItem>
                    <SelectItem value="car">Auto</SelectItem>
                    <SelectItem value="walking">Lopen</SelectItem>
                    <SelectItem value="mixed">Combinatie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Home className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-lg font-semibold">Woning & Lifestyle Voorkeuren</h3>
              <p className="text-gray-600">Wat voor woning zoek je?</p>
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
            
            <div className="grid grid-cols-2 gap-4">
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
            
            <div>
              <Label htmlFor="furnishedPreference">Gemeubileerd voorkeur</Label>
              <Select value={profileData.furnishedPreference} onValueChange={(value: any) => updateProfileData('furnishedPreference', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="furnished">Gemeubileerd</SelectItem>
                  <SelectItem value="unfurnished">Ongemeubileerd</SelectItem>
                  <SelectItem value="no_preference">Geen voorkeur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Gewenste voorzieningen</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {amenitiesOptions.map((amenity) => (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity.id}`}
                      checked={profileData.desiredAmenities.includes(amenity.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateProfileData('desiredAmenities', [...profileData.desiredAmenities, amenity.id]);
                        } else {
                          updateProfileData('desiredAmenities', profileData.desiredAmenities.filter(a => a !== amenity.id));
                        }
                      }}
                    />
                    <Label htmlFor={`amenity-${amenity.id}`} className="text-sm flex items-center">
                      <amenity.icon className="w-4 h-4 mr-1" />
                      {amenity.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasPets"
                  checked={profileData.hasPets}
                  onCheckedChange={(checked) => {
                    updateProfileData('hasPets', checked);
                    if (!checked) {
                      updateProfileData('petDetails', '');
                    }
                  }}
                />
                <Label htmlFor="hasPets">Ik heb huisdieren</Label>
              </div>
              
              {profileData.hasPets && (
                <div>
                  <Label htmlFor="petDetails">Details over huisdieren</Label>
                  <Textarea
                    id="petDetails"
                    value={profileData.petDetails}
                    onChange={(e) => updateProfileData('petDetails', e.target.value)}
                    placeholder="Bijvoorbeeld: 1 kat, 2 jaar oud, gecastreerd"
                    rows={2}
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smokes"
                  checked={profileData.smokes}
                  onCheckedChange={(checked) => {
                    updateProfileData('smokes', checked);
                    if (!checked) {
                      updateProfileData('smokingDetails', '');
                    }
                  }}
                />
                <Label htmlFor="smokes">Ik rook</Label>
              </div>
              
              {profileData.smokes && (
                <div>
                  <Label htmlFor="smokingDetails">Details over roken</Label>
                  <Textarea
                    id="smokingDetails"
                    value={profileData.smokingDetails}
                    onChange={(e) => updateProfileData('smokingDetails', e.target.value)}
                    placeholder="Bijvoorbeeld: alleen buiten, op balkon, binnen huis, alleen sigaretten, e-sigaretten, pijp, etc."
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Geef aan waar je rookt (binnen/buiten), wat je rookt (sigaretten/e-sigaretten/pijp), en hoe vaak
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold">Over Jezelf & Overzicht</h3>
              <p className="text-gray-600">Maak een goede eerste indruk en controleer je gegevens</p>
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
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Profiel Overzicht</h4>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Persoonlijke Informatie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Naam:</span>
                    <span>{profileData.firstName} {profileData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nationaliteit:</span>
                    <span>{profileData.nationality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Familie:</span>
                    <span>
                      {profileData.maritalStatus === 'single' ? 'Alleenstaand' :
                       profileData.maritalStatus === 'married' ? 'Getrouwd' :
                       profileData.maritalStatus === 'partnership' ? 'Samenwonend' :
                       profileData.maritalStatus === 'divorced' ? 'Gescheiden' : 'Weduwe/weduwnaar'}
                      {profileData.hasChildren && `, ${profileData.numberOfChildren} ${profileData.numberOfChildren === 1 ? 'kind' : 'kinderen'}`}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Inkomen & Werk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beroep:</span>
                    <span>{profileData.profession}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jouw inkomen:</span>
                    <span>€{profileData.monthlyIncome.toLocaleString()}/maand</span>
                  </div>
                  {profileData.hasPartner && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Partner inkomen:</span>
                        <span>€{profileData.partnerMonthlyIncome.toLocaleString()}/maand</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-gray-600">Totaal huishoudinkomen:</span>
                        <span>€{calculateTotalHouseholdIncome().toLocaleString()}/maand</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Woonvoorkeuren</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Locatie:</span>
                    <span>{profileData.city} ({profileData.preferredDistricts.join(', ')})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span>€{profileData.minBudget} - €{profileData.maxBudget}/maand</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span>{profileData.propertyType}, {profileData.bedrooms} slaapkamer(s)</span>
                  </div>
                  {profileData.desiredAmenities.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Voorzieningen:</span>
                      <span className="text-right">{profileData.desiredAmenities.length} gewenst</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Volgende stappen:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Je uitgebreide profiel wordt zichtbaar voor verhuurders</li>
                <li>• Upload je documenten voor verificatie</li>
                <li>• Begin met zoeken naar woningen</li>
                <li>• Ontvang uitnodigingen voor bezichtigingen</li>
                <li>• Krijg meldingen wanneer verhuurders je profiel bekijken</li>
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step < currentStep ? 'bg-green-500 text-white' :
                  step === currentStep ? 'bg-dutch-blue text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 7 && (
                  <div className={`w-8 h-1 mx-1 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Step Content */}
          <div className="min-h-[500px]">
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

export default EnhancedProfileCreationModal;
