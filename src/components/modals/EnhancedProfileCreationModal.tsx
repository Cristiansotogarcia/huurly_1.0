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
import { userService, AuthenticationError } from '@/services/UserService';
import { 
  User, ArrowLeft, ArrowRight, CheckCircle, Upload, MapPin, Euro, Home, 
  Briefcase, Heart, Users, Baby, Camera, Clock, Car, Wifi, Bath, 
  TreePine, ParkingCircle, WashingMachine, Utensils, Shield, Calendar 
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
  
  // Step 3: Work & Employment + Guarantor Information
  profession: string;
  employer: string;
  employmentStatus: string;
  workContractType: string;
  monthlyIncome: number;
  housingAllowanceEligible: boolean;
  // Priority 1: Guarantor Information
  guarantorAvailable: boolean;
  guarantorName: string;
  guarantorPhone: string;
  guarantorIncome: number;
  guarantorRelationship: 'ouder' | 'familie' | 'vriend' | 'werkgever' | 'anders' | '';
  incomeProofAvailable: boolean;
  
  // Step 4: Partner Information
  hasPartner: boolean;
  partnerName: string;
  partnerProfession: string;
  partnerMonthlyIncome: number;
  partnerEmploymentStatus: string;
  
  // Step 5: Location Preferences + Timing Information
  city: string;
  preferredDistricts: string[];
  maxCommuteTime: number;
  transportationPreference: string;
  // Priority 2: Timing Information
  moveInDatePreferred: string;
  moveInDateEarliest: string;
  availabilityFlexible: boolean;
  
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
    
    // Step 3: Work & Employment + Guarantor Information
    profession: '',
    employer: '',
    employmentStatus: 'employed',
    workContractType: 'permanent',
    monthlyIncome: 0,
    housingAllowanceEligible: false,
    guarantorAvailable: false,
    guarantorName: '',
    guarantorPhone: '',
    guarantorIncome: 0,
    guarantorRelationship: '',
    incomeProofAvailable: false,
    
    // Step 4: Partner Information
    hasPartner: false,
    partnerName: '',
    partnerProfession: '',
    partnerMonthlyIncome: 0,
    partnerEmploymentStatus: 'employed',
    
    // Step 5: Location Preferences + Timing Information
    city: 'Amsterdam',
    preferredDistricts: [],
    maxCommuteTime: 30,
    transportationPreference: 'public_transport',
    moveInDatePreferred: '',
    moveInDateEarliest: '',
    availabilityFlexible: false,
    
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
        
        // Priority 1: Guarantor Information
        guarantorAvailable: profileData.guarantorAvailable,
        guarantorName: profileData.guarantorName,
        guarantorPhone: profileData.guarantorPhone,
        guarantorIncome: profileData.guarantorIncome,
        guarantorRelationship: profileData.guarantorRelationship,
        incomeProofAvailable: profileData.incomeProofAvailable,
        
        // Priority 2: Timing Information
        moveInDatePreferred: profileData.moveInDatePreferred,
        moveInDateEarliest: profileData.moveInDateEarliest,
        availabilityFlexible: profileData.availabilityFlexible,
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
      console.error('Profile submission error:', error);
      
      if (error instanceof AuthenticationError) {
        toast({
          title: "Sessie verlopen",
          description: "Je sessie is verlopen. Je wordt automatisch uitgelogd. Log opnieuw in om door te gaan.",
          variant: "destructive"
        });
        
        onOpenChange(false);
        return;
      }
      
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
      if (!editMode || !user?.id || !open) return;
      
      setIsLoadingProfile(true);
      try {
        const result = await userService.getTenantProfile(user.id);
        
        if (result.success && result.data) {
          const existingData = result.data;
          const data = existingData as any;
          
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
            guarantorAvailable: data.guarantor_available || false,
            guarantorName: data.guarantor_name || '',
            guarantorPhone: data.guarantor_phone || '',
            guarantorIncome: data.guarantor_income || 0,
            guarantorRelationship: data.guarantor_relationship || '',
            incomeProofAvailable: data.income_proof_available || false,
            
            hasPartner: data.has_partner || false,
            partnerName: data.partner_name || '',
            partnerProfession: data.partner_profession || '',
            partnerMonthlyIncome: data.partner_monthly_income || 0,
            partnerEmploymentStatus: data.partner_employment_status || 'employed',
            
            city: existingData.preferred_city || 'Amsterdam',
            preferredDistricts: data.preferred_districts || [],
            maxCommuteTime: data.max_commute_time || 30,
            transportationPreference: data.transportation_preference || 'public_transport',
            moveInDatePreferred: data.move_in_date_preferred || '',
            moveInDateEarliest: data.move_in_date_earliest || '',
            availabilityFlexible: data.availability_flexible || false,
            
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
            profilePictureUrl: data.profile_picture_url || '',
          });
          
          if (data.profile_picture_url) {
            setImagePreview(data.profile_picture_url);
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
  }, [editMode, user?.id, toast, open]);

  // Initialize Dutch cities and neighborhoods data
  useEffect(() => {
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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Ongeldig bestandstype",
        description: "Alleen JPEG, PNG en WebP bestanden zijn toegestaan.",
        variant: "destructive"
      });
      return;
    }

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
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile-picture.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      updateProfileData('profilePictureUrl', publicUrl);
      updateProfileData('profilePicture', file);

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

  // Dutch date formatting functions
  const formatDateToDutch = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDutchDateChange = (dutchDate: string) => {
    // Remove any non-digit characters except /
    let cleaned = dutchDate.replace(/[^\d/]/g, '');
    
    // Auto-format as user types
    if (cleaned.length >= 2 && cleaned.charAt(2) !== '/') {
      cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    if (cleaned.length >= 5 && cleaned.charAt(5) !== '/') {
      cleaned = cleaned.substring(0, 5) + '/' + cleaned.substring(5);
    }
    
    // Limit to 10 characters (dd/mm/yyyy)
    cleaned = cleaned.substring(0, 10);
    
    // Validate and convert to ISO format for storage
    if (cleaned.length === 10) {
      const parts = cleaned.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        
        // Basic validation
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
          // Convert to ISO format (yyyy-mm-dd) for database storage
          const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          updateProfileData('dateOfBirth', isoDate);
          return;
        }
      }
    }
    
    // If not a complete valid date, just store the partial input for display
    // but don't update the actual dateOfBirth field until it's valid
    if (cleaned !== dutchDate) {
      // This is just for display formatting, we'll handle the actual update above
    }
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
              <Label htmlFor="dateOfBirth">Geboortedatum * (dd/mm/yyyy)</Label>
              <Input
                id="dateOfBirth"
                type="text"
                value={profileData.dateOfBirth ? formatDateToDutch(profileData.dateOfBirth) : ''}
                onChange={(e) => handleDutchDateChange(e.target.value)}
                placeholder="dd/mm/yyyy"
                maxLength={10}
                pattern="\d{2}/\d{2}/\d{4}"
              />
              <p className="text-xs text-gray-500 mt-1">Nederlandse datumnotatie: dag/maand/jaar (bijvoorbeeld: 15/03/1990)</p>
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
                onCheckedChange={(checked) => updateProfileData('hasChildren', checked)}
              />
              <Label htmlFor="hasChildren">Ik heb kinderen</Label>
            </div>
            
            {profileData.hasChildren && (
              <>
                <div>
                  <Label htmlFor="numberOfChildren">Aantal kinderen *</Label>
                  <Input
                    id="numberOfChildren"
                    type="number"
                    min="1"
                    max="10"
                    value={profileData.numberOfChildren}
                    onChange={(e) => updateProfileData('numberOfChildren', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label>Leeftijden van kinderen *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {Array.from({ length: profileData.numberOfChildren }, (_, index) => (
                      <Input
                        key={index}
                        type="number"
                        min="0"
                        max="25"
                        placeholder={`Kind ${index + 1}`}
                        value={profileData.childrenAges[index] || ''}
                        onChange={(e) => {
                          const newAges = [...profileData.childrenAges];
                          newAges[index] = parseInt(e.target.value) || 0;
                          updateProfileData('childrenAges', newAges);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold">Werk & Inkomen + Borg</h3>
              <p className="text-gray-600">Informatie over je werk en financiële zekerheid</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
                  placeholder="Tech Company B.V."
                />
              </div>
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
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="unemployed">Werkloos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="workContractType">Contract type</Label>
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
              <Label htmlFor="monthlyIncome">Maandelijks bruto inkomen * (€)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                min="0"
                value={profileData.monthlyIncome}
                onChange={(e) => updateProfileData('monthlyIncome', parseInt(e.target.value) || 0)}
                placeholder="3500"
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
            
            {/* Guarantor Information */}
            <div className="border-t pt-4 mt-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Borg/Garantstelling
              </h4>
              
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="guarantorAvailable"
                  checked={profileData.guarantorAvailable}
                  onCheckedChange={(checked) => updateProfileData('guarantorAvailable', checked)}
                />
                <Label htmlFor="guarantorAvailable">Ik heb een borg/garantsteller beschikbaar</Label>
              </div>
              
              {profileData.guarantorAvailable && (
                <div className="space-y-4 pl-6 border-l-2 border-green-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guarantorName">Naam borg/garantsteller</Label>
                      <Input
                        id="guarantorName"
                        value={profileData.guarantorName}
                        onChange={(e) => updateProfileData('guarantorName', e.target.value)}
                        placeholder="Jan Bakker"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guarantorPhone">Telefoonnummer borg</Label>
                      <Input
                        id="guarantorPhone"
                        value={profileData.guarantorPhone}
                        onChange={(e) => updateProfileData('guarantorPhone', e.target.value)}
                        placeholder="+31 6 12345678"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guarantorIncome">Maandelijks inkomen borg (€)</Label>
                      <Input
                        id="guarantorIncome"
                        type="number"
                        min="0"
                        value={profileData.guarantorIncome}
                        onChange={(e) => updateProfileData('guarantorIncome', parseInt(e.target.value) || 0)}
                        placeholder="4000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guarantorRelationship">Relatie tot borg</Label>
                      <Select value={profileData.guarantorRelationship} onValueChange={(value: any) => updateProfileData('guarantorRelationship', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer relatie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ouder">Ouder</SelectItem>
                          <SelectItem value="familie">Familie</SelectItem>
                          <SelectItem value="vriend">Vriend/Vriendin</SelectItem>
                          <SelectItem value="werkgever">Werkgever</SelectItem>
                          <SelectItem value="anders">Anders</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="incomeProofAvailable"
                      checked={profileData.incomeProofAvailable}
                      onCheckedChange={(checked) => updateProfileData('incomeProofAvailable', checked)}
                    />
                    <Label htmlFor="incomeProofAvailable">Ik kan inkomensbewijzen overleggen</Label>
                  </div>
                </div>
              )}
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
                onCheckedChange={(checked) => updateProfileData('hasPartner', checked)}
              />
              <Label htmlFor="hasPartner">Ik heb een partner die mee gaat verhuizen</Label>
            </div>
            
            {profileData.hasPartner && (
              <div className="space-y-4 pl-6 border-l-2 border-pink-200">
                <div>
                  <Label htmlFor="partnerName">Naam partner</Label>
                  <Input
                    id="partnerName"
                    value={profileData.partnerName}
                    onChange={(e) => updateProfileData('partnerName', e.target.value)}
                    placeholder="Alex Jansen"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="partnerProfession">Beroep partner</Label>
                    <Input
                      id="partnerProfession"
                      value={profileData.partnerProfession}
                      onChange={(e) => updateProfileData('partnerProfession', e.target.value)}
                      placeholder="Grafisch ontwerper"
                    />
                  </div>
                  <div>
                    <Label htmlFor="partnerEmploymentStatus">Dienstverband partner</Label>
                    <Select value={profileData.partnerEmploymentStatus} onValueChange={(value) => updateProfileData('partnerEmploymentStatus', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employed">In dienst</SelectItem>
                        <SelectItem value="self_employed">Zelfstandig</SelectItem>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="unemployed">Werkloos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="partnerMonthlyIncome">Maandelijks bruto inkomen partner (€)</Label>
                  <Input
                    id="partnerMonthlyIncome"
                    type="number"
                    min="0"
                    value={profileData.partnerMonthlyIncome}
                    onChange={(e) => updateProfileData('partnerMonthlyIncome', parseInt(e.target.value) || 0)}
                    placeholder="2800"
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Totaal huishoudinkomen:</strong> €{calculateTotalHouseholdIncome().toLocaleString('nl-NL')} per maand
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold">Locatie & Timing</h3>
              <p className="text-gray-600">Waar wil je wonen en wanneer?</p>
            </div>
            
            <div>
              <Label htmlFor="city">Gewenste stad *</Label>
              <Select value={profileData.city} onValueChange={(value) => updateProfileData('city', value)}>
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
              <div className="grid grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto">
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
                <Label htmlFor="maxCommuteTime">Max reistijd naar werk (minuten)</Label>
                <Input
                  id="maxCommuteTime"
                  type="number"
                  min="5"
                  max="120"
                  value={profileData.maxCommuteTime}
                  onChange={(e) => updateProfileData('maxCommuteTime', parseInt(e.target.value) || 30)}
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
            
            {/* Timing Information */}
            <div className="border-t pt-4 mt-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Timing & Beschikbaarheid
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="moveInDatePreferred">Gewenste intrekdatum (dd/mm/yyyy)</Label>
                  <Input
                    id="moveInDatePreferred"
                    type="text"
                    value={profileData.moveInDatePreferred ? formatDateToDutch(profileData.moveInDatePreferred) : ''}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^\d/]/g, '');
                      if (cleaned.length === 10) {
                        const parts = cleaned.split('/');
                        if (parts.length === 3) {
                          const day = parseInt(parts[0]);
                          const month = parseInt(parts[1]);
                          const year = parseInt(parts[2]);
                          if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2024) {
                            const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                            updateProfileData('moveInDatePreferred', isoDate);
                          }
                        }
                      }
                    }}
                    placeholder="dd/mm/yyyy"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label htmlFor="moveInDateEarliest">Vroegst mogelijke intrekdatum (dd/mm/yyyy)</Label>
                  <Input
                    id="moveInDateEarliest"
                    type="text"
                    value={profileData.moveInDateEarliest ? formatDateToDutch(profileData.moveInDateEarliest) : ''}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^\d/]/g, '');
                      if (cleaned.length === 10) {
                        const parts = cleaned.split('/');
                        if (parts.length === 3) {
                          const day = parseInt(parts[0]);
                          const month = parseInt(parts[1]);
                          const year = parseInt(parts[2]);
                          if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2024) {
                            const isoDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                            updateProfileData('moveInDateEarliest', isoDate);
                          }
                        }
                      }
                    }}
                    placeholder="dd/mm/yyyy"
                    maxLength={10}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="availabilityFlexible"
                  checked={profileData.availabilityFlexible}
                  onCheckedChange={(checked) => updateProfileData('availabilityFlexible', checked)}
                />
                <Label htmlFor="availabilityFlexible">Mijn timing is flexibel</Label>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Home className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-lg font-semibold">Woning & Lifestyle</h3>
              <p className="text-gray-600">Wat voor woning zoek je?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minBudget">Minimum budget (€/maand) *</Label>
                <Input
                  id="minBudget"
                  type="number"
                  min="500"
                  value={profileData.minBudget}
                  onChange={(e) => updateProfileData('minBudget', parseInt(e.target.value) || 1000)}
                />
              </div>
              <div>
                <Label htmlFor="maxBudget">Maximum budget (€/maand) *</Label>
                <Input
                  id="maxBudget"
                  type="number"
                  min="500"
                  value={profileData.maxBudget}
                  onChange={(e) => updateProfileData('maxBudget', parseInt(e.target.value) || 2000)}
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
                    <SelectItem value="Loft">Loft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="furnishedPreference">Inrichting voorkeur</Label>
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
              <div className="grid grid-cols-2 gap-3 mt-2">
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPets"
                    checked={profileData.hasPets}
                    onCheckedChange={(checked) => updateProfileData('hasPets', checked)}
                  />
                  <Label htmlFor="hasPets">Ik heb huisdieren</Label>
                </div>
                {profileData.hasPets && (
                  <Textarea
                    className="mt-2"
                    placeholder="Beschrijf je huisdieren..."
                    value={profileData.petDetails}
                    onChange={(e) => updateProfileData('petDetails', e.target.value)}
                  />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smokes"
                    checked={profileData.smokes}
                    onCheckedChange={(checked) => updateProfileData('smokes', checked)}
                  />
                  <Label htmlFor="smokes">Ik rook</Label>
                </div>
                {profileData.smokes && (
                  <Textarea
                    className="mt-2"
                    placeholder="Details over roken..."
                    value={profileData.smokingDetails}
                    onChange={(e) => updateProfileData('smokingDetails', e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-lg font-semibold">Over Jou & Overzicht</h3>
              <p className="text-gray-600">Vertel iets over jezelf en controleer je gegevens</p>
            </div>
            
            <div>
              <Label htmlFor="bio">Persoonlijke beschrijving *</Label>
              <Textarea
                id="bio"
                placeholder="Vertel iets over jezelf, je hobby's, levensstijl..."
                value={profileData.bio}
                onChange={(e) => updateProfileData('bio', e.target.value)}
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="motivation">Waarom ben je op zoek naar een woning? *</Label>
              <Textarea
                id="motivation"
                placeholder="Vertel waarom je op zoek bent naar een nieuwe woning..."
                value={profileData.motivation}
                onChange={(e) => updateProfileData('motivation', e.target.value)}
                rows={3}
              />
            </div>
            
            {/* Profile Summary */}
            <div className="border-t pt-6 mt-6">
              <h4 className="text-lg font-semibold mb-4">Profiel Overzicht</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><strong>Naam:</strong> {profileData.firstName} {profileData.lastName}</p>
                  <p><strong>Leeftijd:</strong> {profileData.dateOfBirth ? new Date().getFullYear() - new Date(profileData.dateOfBirth).getFullYear() : 'Niet ingevuld'}</p>
                  <p><strong>Beroep:</strong> {profileData.profession || 'Niet ingevuld'}</p>
                  <p><strong>Inkomen:</strong> €{profileData.monthlyIncome.toLocaleString('nl-NL')}/maand</p>
                  {profileData.hasPartner && (
                    <p><strong>Partner inkomen:</strong> €{profileData.partnerMonthlyIncome.toLocaleString('nl-NL')}/maand</p>
                  )}
                  <p><strong>Totaal huishoudinkomen:</strong> €{calculateTotalHouseholdIncome().toLocaleString('nl-NL')}/maand</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Gewenste stad:</strong> {profileData.city}</p>
                  <p><strong>Budget:</strong> €{profileData.minBudget} - €{profileData.maxBudget}/maand</p>
                  <p><strong>Slaapkamers:</strong> {profileData.bedrooms}</p>
                  <p><strong>Type:</strong> {profileData.propertyType}</p>
                  <p><strong>Borg beschikbaar:</strong> {profileData.guarantorAvailable ? 'Ja' : 'Nee'}</p>
                  <p><strong>Huisdieren:</strong> {profileData.hasPets ? 'Ja' : 'Nee'}</p>
                  <p><strong>Roken:</strong> {profileData.smokes ? 'Ja' : 'Nee'}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editMode ? 'Profiel Bewerken' : 'Profiel Aanmaken'} - Stap {currentStep} van {totalSteps}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={progress} className="w-full" />
          
          {isLoadingProfile ? (
            <div className="text-center py-8">
              <p>Profiel wordt geladen...</p>
            </div>
          ) : (
            renderStep()
          )}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Vorige
            </Button>

            {currentStep === totalSteps ? (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
              >
                {isSubmitting ? 'Opslaan...' : editMode ? 'Bijwerken' : 'Profiel Aanmaken'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
              >
                Volgende
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedProfileCreationModal;
