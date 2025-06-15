import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, User, Heart, Home, Building, Car, Briefcase, Shield, Clock, MapPin, Users, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EnhancedProfileCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (profileData: any) => Promise<void>;
  editMode: boolean;
}

interface ProfileFormData {
  // Basic Information
  first_name: string;
  last_name: string;
  date_of_birth: Date | undefined;
  phone: string;
  sex: string;
  nationality: string;
  marital_status: string;
  
  // Employment & Income
  profession: string;
  employer: string;
  employment_status: string;
  work_contract_type: string;
  monthly_income: number;
  work_from_home: boolean;
  
  // Household Composition
  has_partner: boolean;
  partner_name: string;
  partner_profession: string;
  partner_employment_status: string;
  partner_monthly_income: number;
  has_children: boolean;
  number_of_children: number;
  
  // Housing Preferences
  preferred_city: string;
  preferred_property_type: string;
  preferred_bedrooms: number;
  max_budget: number;
  min_budget: number;
  furnished_preference: string;
  parking_required: boolean;
  storage_needs: string;
  
  // Timing & Availability
  move_in_date_preferred: Date | undefined;
  move_in_date_earliest: Date | undefined;
  availability_flexible: boolean;
  lease_duration_preference: string;
  
  // Guarantor Information
  guarantor_available: boolean;
  guarantor_name: string;
  guarantor_phone: string;
  guarantor_income: number;
  guarantor_relationship: string;
  income_proof_available: boolean;
  
  // Emergency Contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  
  // Lifestyle & Preferences
  has_pets: boolean;
  pet_details: string;
  smokes: boolean;
  smoking_details: string;
  
  // References & History
  references_available: boolean;
  rental_history_years: number;
  reason_for_moving: string;
  
  // Profile Content
  bio: string;
  motivation: string;
}

const initialFormData: ProfileFormData = {
  first_name: '',
  last_name: '',
  date_of_birth: undefined,
  phone: '',
  sex: '',
  nationality: 'Nederlandse',
  marital_status: 'single',
  profession: '',
  employer: '',
  employment_status: '',
  work_contract_type: '',
  monthly_income: 0,
  work_from_home: false,
  has_partner: false,
  partner_name: '',
  partner_profession: '',
  partner_employment_status: '',
  partner_monthly_income: 0,
  has_children: false,
  number_of_children: 0,
  preferred_city: '',
  preferred_property_type: '',
  preferred_bedrooms: 1,
  max_budget: 0,
  min_budget: 0,
  furnished_preference: 'geen_voorkeur',
  parking_required: false,
  storage_needs: '',
  move_in_date_preferred: undefined,
  move_in_date_earliest: undefined,
  availability_flexible: true,
  lease_duration_preference: '',
  guarantor_available: false,
  guarantor_name: '',
  guarantor_phone: '',
  guarantor_income: 0,
  guarantor_relationship: '',
  income_proof_available: true,
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relationship: '',
  has_pets: false,
  pet_details: '',
  smokes: false,
  smoking_details: '',
  references_available: true,
  rental_history_years: 0,
  reason_for_moving: '',
  bio: '',
  motivation: ''
};

// Define allowed furnished_preference values - now using Dutch values
const ALLOWED_FURNISHED_PREFERENCES = ["gemeubileerd", "ongemeubileerd", "geen_voorkeur"];

// Enhanced Date Picker with Year Navigation
const EnhancedDatePicker = ({ 
  selected, 
  onSelect, 
  placeholder = "Selecteer datum",
  disabled
}: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
}) => {
  const [currentYear, setCurrentYear] = useState(selected?.getFullYear() || new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(selected?.getMonth() || new Date().getMonth());

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentYear(prev => direction === 'prev' ? prev - 1 : prev + 1);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(prev => prev - 1);
      } else {
        setCurrentMonth(prev => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(prev => prev + 1);
      } else {
        setCurrentMonth(prev => prev + 1);
      }
    }
  };

  const displayDate = new Date(currentYear, currentMonth, 1);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? (
            format(selected, "dd/MM/yyyy", { locale: nl })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Year and Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateYear('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium min-w-[120px] text-center">
                {format(displayDate, "MMMM yyyy", { locale: nl })}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateYear('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          month={displayDate}
          onMonthChange={(date) => {
            setCurrentYear(date.getFullYear());
            setCurrentMonth(date.getMonth());
          }}
          disabled={disabled}
          locale={nl}
          className="pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

export function EnhancedProfileCreationModal({ 
  open, 
  onOpenChange, 
  onComplete, 
  editMode 
}: EnhancedProfileCreationModalProps) {
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const totalSteps = 8;

  // Load user data from auth metadata on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata) {
          setFormData(prev => ({
            ...prev,
            first_name: user.user_metadata.first_name || '',
            last_name: user.user_metadata.last_name || ''
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    if (open) {
      loadUserData();
    }
  }, [open]);

  // Calculate household size automatically
  const calculateHouseholdSize = () => {
    let size = 1; // User always counts as 1
    if (formData.has_partner) size += 1;
    if (formData.has_children) size += formData.number_of_children;
    return size;
  };

  // Updated sanitize function to ensure Dutch values
  const sanitizeFurnishedPreference = (value: string) => {
    if (ALLOWED_FURNISHED_PREFERENCES.includes(value)) return value;
    // Convert English values to Dutch
    if (value === 'furnished') return 'gemeubileerd';
    if (value === 'unfurnished') return 'ongemeubileerd';
    if (value === 'no_preference') return 'geen_voorkeur';
    
    console.warn(
      "Invalid furnished_preference detected in form, converting to 'geen_voorkeur'. Value was:",
      value
    );
    return "geen_voorkeur";
  };

  useEffect(() => {
    // Log furnished_preference on every modal open
    if (open) {
      console.debug(
        "Modal opened, current furnished_preference:", formData.furnished_preference
      );
    }
  }, [open]);

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    // If updating furnished_preference, sanitize and log
    if (field === "furnished_preference") {
      const sanitized = sanitizeFurnishedPreference(value);
      setFormData(prev => ({ ...prev, [field]: sanitized }));
      console.debug("furnished_preference changed to:", sanitized);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
      // For debugging all values during profile creation process
      if (typeof value !== "object") {
        console.debug(`Field changed: ${field} =`, value);
      }
    }
  };

  const handleDateSelect = (field: 'date_of_birth' | 'move_in_date_preferred' | 'move_in_date_earliest', date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date }));
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate household size
      const householdSize = calculateHouseholdSize();

      // Ensure furnished_preference has a valid Dutch value
      const validFurnishedPreference = sanitizeFurnishedPreference(formData.furnished_preference);
      
      // Ensure sex has a valid value if provided
      const validSex = formData.sex && ['man', 'vrouw', 'anders', 'geen_antwoord'].includes(formData.sex) 
        ? formData.sex 
        : null;

      // Ensure marital_status has a valid value
      const validMaritalStatus = formData.marital_status && ['single', 'relationship', 'married', 'divorced', 'widowed'].includes(formData.marital_status)
        ? formData.marital_status 
        : 'single';

      // Ensure employment_status has a valid value if provided
      const validEmploymentStatus = formData.employment_status && ['vast_contract', 'tijdelijk_contract', 'zzp', 'student', 'werkloos', 'pensioen'].includes(formData.employment_status)
        ? formData.employment_status 
        : null;

      // Ensure guarantor_relationship has a valid value if provided
      const validGuarantorRelationship = formData.guarantor_relationship && ['ouder', 'familie', 'vriend', 'werkgever', 'anders'].includes(formData.guarantor_relationship)
        ? formData.guarantor_relationship 
        : null;

      // Ensure lease_duration_preference has a valid value if provided
      const validLeaseDurationPreference = formData.lease_duration_preference && ['6_maanden', '1_jaar', '2_jaar', 'langer', 'flexibel'].includes(formData.lease_duration_preference)
        ? formData.lease_duration_preference 
        : null;

      // Convert Date objects to strings for database
      const profileData = {
        user_id: user.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        // Convert dates to ISO strings or null
        date_of_birth: formData.date_of_birth ? formData.date_of_birth.toISOString().split('T')[0] : null,
        sex: validSex,
        nationality: formData.nationality,
        marital_status: validMaritalStatus,
        profession: formData.profession,
        employer: formData.employer,
        employment_status: validEmploymentStatus,
        work_contract_type: formData.work_contract_type,
        monthly_income: formData.monthly_income,
        work_from_home: formData.work_from_home,
        has_partner: formData.has_partner,
        partner_name: formData.partner_name,
        partner_profession: formData.partner_profession,
        partner_employment_status: formData.partner_employment_status,
        partner_monthly_income: formData.partner_monthly_income,
        has_children: formData.has_children,
        number_of_children: formData.number_of_children,
        preferred_city: formData.preferred_city,
        preferred_property_type: formData.preferred_property_type,
        preferred_bedrooms: formData.preferred_bedrooms,
        max_budget: formData.max_budget,
        min_budget: formData.min_budget,
        furnished_preference: validFurnishedPreference,
        parking_required: formData.parking_required,
        storage_needs: formData.storage_needs,
        move_in_date_preferred: formData.move_in_date_preferred ? formData.move_in_date_preferred.toISOString().split('T')[0] : null,
        move_in_date_earliest: formData.move_in_date_earliest ? formData.move_in_date_earliest.toISOString().split('T')[0] : null,
        availability_flexible: formData.availability_flexible,
        lease_duration_preference: validLeaseDurationPreference,
        guarantor_available: formData.guarantor_available,
        guarantor_name: formData.guarantor_name,
        guarantor_phone: formData.guarantor_phone,
        guarantor_income: formData.guarantor_income,
        guarantor_relationship: validGuarantorRelationship,
        income_proof_available: formData.income_proof_available,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        has_pets: formData.has_pets,
        pet_details: formData.pet_details,
        smokes: formData.smokes,
        smoking_details: formData.smoking_details,
        references_available: formData.references_available,
        rental_history_years: formData.rental_history_years,
        reason_for_moving: formData.reason_for_moving,
        bio: formData.bio,
        motivation: formData.motivation,
        // Auto-calculated household size
        household_size: householdSize,
        profile_completed: true,
        profile_completion_percentage: 100
      };

      console.log('Submitting profile data with furnished_preference:', validFurnishedPreference);

      const { error } = await supabase
        .from('tenant_profiles')
        .upsert(profileData);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Profiel succesvol aangemaakt!",
        description: "Je profiel is compleet en je kunt nu zoeken naar woningen.",
      });

      await onComplete(profileData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Fout bij aanmaken profiel",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Persoonlijke Gegevens</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Voornaam *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Je voornaam"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Achternaam *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Je achternaam"
                />
              </div>
            </div>

            <div>
              <Label>Geboortedatum *</Label>
              <EnhancedDatePicker
                selected={formData.date_of_birth}
                onSelect={(date) => handleDateSelect('date_of_birth', date)}
                placeholder="Selecteer geboortedatum"
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefoonnummer *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+31 6 12345678"
                />
              </div>
              <div>
                <Label htmlFor="sex">Geslacht</Label>
                <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer geslacht" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="man">Man</SelectItem>
                    <SelectItem value="vrouw">Vrouw</SelectItem>
                    <SelectItem value="anders">Anders</SelectItem>
                    <SelectItem value="geen_antwoord">Geen antwoord</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nationality">Nationaliteit</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="Nederlandse"
                />
              </div>
              <div>
                <Label htmlFor="marital_status">Burgerlijke staat</Label>
                <Select value={formData.marital_status} onValueChange={(value) => handleInputChange('marital_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Alleenstaand</SelectItem>
                    <SelectItem value="relationship">Relatie</SelectItem>
                    <SelectItem value="married">Getrouwd</SelectItem>
                    <SelectItem value="divorced">Gescheiden</SelectItem>
                    <SelectItem value="widowed">Weduwe/Weduwnaar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Werk & Inkomen</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profession">Beroep *</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => handleInputChange('profession', e.target.value)}
                  placeholder="Je beroep"
                />
              </div>
              <div>
                <Label htmlFor="employer">Werkgever</Label>
                <Input
                  id="employer"
                  value={formData.employer}
                  onChange={(e) => handleInputChange('employer', e.target.value)}
                  placeholder="Naam werkgever"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employment_status">Arbeidscontract</Label>
                <Select value={formData.employment_status} onValueChange={(value) => handleInputChange('employment_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type contract" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vast_contract">Vast contract</SelectItem>
                    <SelectItem value="tijdelijk_contract">Tijdelijk contract</SelectItem>
                    <SelectItem value="zzp">ZZP/Freelancer</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="werkloos">Werkloos</SelectItem>
                    <SelectItem value="pensioen">Pensioen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="monthly_income">Bruto maandinkomen (€) *</Label>
                <Input
                  id="monthly_income"
                  type="number"
                  value={formData.monthly_income || ''}
                  onChange={(e) => handleInputChange('monthly_income', Number(e.target.value))}
                  placeholder="3000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="work_from_home"
                  checked={formData.work_from_home}
                  onCheckedChange={(checked) => handleInputChange('work_from_home', checked)}
                />
                <Label htmlFor="work_from_home">Ik werk (deels) thuis</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="income_proof_available"
                  checked={formData.income_proof_available}
                  onCheckedChange={(checked) => handleInputChange('income_proof_available', checked)}
                />
                <Label htmlFor="income_proof_available">Ik kan inkomensbewijzen overleggen</Label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Huishoudsamenstelling</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_partner"
                  checked={formData.has_partner}
                  onCheckedChange={(checked) => handleInputChange('has_partner', checked)}
                />
                <Label htmlFor="has_partner">Ik heb een partner</Label>
              </div>

              {formData.has_partner && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="partner_name">Naam partner</Label>
                      <Input
                        id="partner_name"
                        value={formData.partner_name}
                        onChange={(e) => handleInputChange('partner_name', e.target.value)}
                        placeholder="Naam van je partner"
                      />
                    </div>
                    <div>
                      <Label htmlFor="partner_profession">Beroep partner</Label>
                      <Input
                        id="partner_profession"
                        value={formData.partner_profession}
                        onChange={(e) => handleInputChange('partner_profession', e.target.value)}
                        placeholder="Beroep van je partner"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="partner_monthly_income">Bruto maandinkomen partner (€)</Label>
                    <Input
                      id="partner_monthly_income"
                      type="number"
                      value={formData.partner_monthly_income || ''}
                      onChange={(e) => handleInputChange('partner_monthly_income', Number(e.target.value))}
                      placeholder="2500"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_children"
                  checked={formData.has_children}
                  onCheckedChange={(checked) => handleInputChange('has_children', checked)}
                />
                <Label htmlFor="has_children">Ik heb kinderen</Label>
              </div>

              {formData.has_children && (
                <div className="pl-6 border-l-2 border-blue-200">
                  <Label htmlFor="number_of_children">Aantal kinderen</Label>
                  <Input
                    id="number_of_children"
                    type="number"
                    value={formData.number_of_children || ''}
                    onChange={(e) => handleInputChange('number_of_children', Number(e.target.value))}
                    placeholder="2"
                    min="1"
                  />
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg">
                <Label className="text-sm font-medium text-blue-800">
                  Totaal aantal personen in huishouden: {calculateHouseholdSize()}
                </Label>
                <p className="text-xs text-blue-600 mt-1">
                  Dit wordt automatisch berekend op basis van je gezinssamenstelling
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Woonvoorkeuren</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferred_city">Gewenste stad/plaats *</Label>
                <Input
                  id="preferred_city"
                  value={formData.preferred_city}
                  onChange={(e) => handleInputChange('preferred_city', e.target.value)}
                  placeholder="Amsterdam"
                />
              </div>
              <div>
                <Label htmlFor="preferred_property_type">Type woning</Label>
                <Select value={formData.preferred_property_type} onValueChange={(value) => handleInputChange('preferred_property_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appartement">Appartement</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="eengezinswoning">Eengezinswoning</SelectItem>
                    <SelectItem value="kamer">Kamer</SelectItem>
                    <SelectItem value="penthouse">Penthouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="preferred_bedrooms">Aantal slaapkamers</Label>
                <Input
                  id="preferred_bedrooms"
                  type="number"
                  value={formData.preferred_bedrooms || ''}
                  onChange={(e) => handleInputChange('preferred_bedrooms', Number(e.target.value))}
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <Label htmlFor="min_budget">Min. budget (€/maand)</Label>
                <Input
                  id="min_budget"
                  type="number"
                  value={formData.min_budget || ''}
                  onChange={(e) => handleInputChange('min_budget', Number(e.target.value))}
                  placeholder="800"
                />
              </div>
              <div>
                <Label htmlFor="max_budget">Max. budget (€/maand) *</Label>
                <Input
                  id="max_budget"
                  type="number"
                  value={formData.max_budget || ''}
                  onChange={(e) => handleInputChange('max_budget', Number(e.target.value))}
                  placeholder="1500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="furnished_preference">Meubilering voorkeur</Label>
                <Select value={formData.furnished_preference} onValueChange={(value) => handleInputChange('furnished_preference', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer voorkeur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemeubileerd">Gemeubileerd</SelectItem>
                    <SelectItem value="ongemeubileerd">Ongemeubileerd</SelectItem>
                    <SelectItem value="geen_voorkeur">Geen voorkeur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lease_duration_preference">Gewenste huurperiode</Label>
                <Select value={formData.lease_duration_preference} onValueChange={(value) => handleInputChange('lease_duration_preference', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6_maanden">6 maanden</SelectItem>
                    <SelectItem value="1_jaar">1 jaar</SelectItem>
                    <SelectItem value="2_jaar">2 jaar</SelectItem>
                    <SelectItem value="langer">Langer dan 2 jaar</SelectItem>
                    <SelectItem value="flexibel">Flexibel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parking_required"
                  checked={formData.parking_required}
                  onCheckedChange={(checked) => handleInputChange('parking_required', checked)}
                />
                <Label htmlFor="parking_required">Parkeerplaats gewenst</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="storage_needs">Bergruimte/opslag wensen</Label>
              <Textarea
                id="storage_needs"
                value={formData.storage_needs}
                onChange={(e) => handleInputChange('storage_needs', e.target.value)}
                placeholder="Beschrijf eventuele bergruimte behoeften..."
                rows={2}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Timing & Beschikbaarheid</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gewenste intrekdatum</Label>
                <EnhancedDatePicker
                  selected={formData.move_in_date_preferred}
                  onSelect={(date) => handleDateSelect('move_in_date_preferred', date)}
                  placeholder="Selecteer datum"
                />
              </div>
              
              <div>
                <Label>Vroegst mogelijke intrekdatum</Label>
                <EnhancedDatePicker
                  selected={formData.move_in_date_earliest}
                  onSelect={(date) => handleDateSelect('move_in_date_earliest', date)}
                  placeholder="Selecteer datum"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="availability_flexible"
                checked={formData.availability_flexible}
                onCheckedChange={(checked) => handleInputChange('availability_flexible', checked)}
              />
              <Label htmlFor="availability_flexible">Ik ben flexibel met de intrekdatum</Label>
            </div>

            <div>
              <Label htmlFor="reason_for_moving">Reden voor verhuizing</Label>
              <Textarea
                id="reason_for_moving"
                value={formData.reason_for_moving}
                onChange={(e) => handleInputChange('reason_for_moving', e.target.value)}
                placeholder="Waarom zoek je een nieuwe woning?"
                rows={3}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Borg & Garantie</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="guarantor_available"
                  checked={formData.guarantor_available}
                  onCheckedChange={(checked) => handleInputChange('guarantor_available', checked)}
                />
                <Label htmlFor="guarantor_available">Ik heb een borg/garantiesteller beschikbaar</Label>
              </div>

              {formData.guarantor_available && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guarantor_name">Naam borg/garantiesteller</Label>
                      <Input
                        id="guarantor_name"
                        value={formData.guarantor_name}
                        onChange={(e) => handleInputChange('guarantor_name', e.target.value)}
                        placeholder="Volledige naam"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guarantor_phone">Telefoonnummer borg</Label>
                      <Input
                        id="guarantor_phone"
                        value={formData.guarantor_phone}
                        onChange={(e) => handleInputChange('guarantor_phone', e.target.value)}
                        placeholder="+31 6 12345678"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guarantor_income">Maandinkomen borg (€)</Label>
                      <Input
                        id="guarantor_income"
                        type="number"
                        value={formData.guarantor_income || ''}
                        onChange={(e) => handleInputChange('guarantor_income', Number(e.target.value))}
                        placeholder="4000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guarantor_relationship">Relatie tot borg</Label>
                      <Select value={formData.guarantor_relationship} onValueChange={(value) => handleInputChange('guarantor_relationship', value)}>
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
                </div>
              )}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Referenties & Contact</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency_contact_name">Noodcontact naam</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                    placeholder="Volledige naam"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Noodcontact telefoon</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                    placeholder="+31 6 12345678"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergency_contact_relationship">Relatie tot noodcontact</Label>
                <Input
                  id="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={(e) => handleInputChange('emergency_contact_relationship', e.target.value)}
                  placeholder="Ouder, partner, vriend(in), etc."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="references_available"
                    checked={formData.references_available}
                    onCheckedChange={(checked) => handleInputChange('references_available', checked)}
                  />
                  <Label htmlFor="references_available">Ik kan huurderreferenties overleggen</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="rental_history_years">Jaren huurervaring</Label>
                <Input
                  id="rental_history_years"
                  type="number"
                  value={formData.rental_history_years || ''}
                  onChange={(e) => handleInputChange('rental_history_years', Number(e.target.value))}
                  placeholder="2"
                  min="0"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has_pets"
                      checked={formData.has_pets}
                      onCheckedChange={(checked) => handleInputChange('has_pets', checked)}
                    />
                    <Label htmlFor="has_pets">Ik heb huisdieren</Label>
                  </div>
                  
                  {formData.has_pets && (
                    <div className="pl-6 border-l-2 border-blue-200">
                      <Label htmlFor="pet_details">Details over huisdieren</Label>
                      <Textarea
                        id="pet_details"
                        value={formData.pet_details}
                        onChange={(e) => handleInputChange('pet_details', e.target.value)}
                        placeholder="Type, aantal, leeftijd, gedrag..."
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smokes"
                      checked={formData.smokes}
                      onCheckedChange={(checked) => handleInputChange('smokes', checked)}
                    />
                    <Label htmlFor="smokes">Ik rook</Label>
                  </div>
                  
                  {formData.smokes && (
                    <div className="pl-6 border-l-2 border-blue-200">
                      <Label htmlFor="smoking_details">Rookgewoonten</Label>
                      <Textarea
                        id="smoking_details"
                        value={formData.smoking_details}
                        onChange={(e) => handleInputChange('smoking_details', e.target.value)}
                        placeholder="Alleen buiten, binnen toegestaan, etc."
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Profiel & Motivatie</h3>
            </div>
            
            <div>
              <Label htmlFor="bio">Beschrijf jezelf (bio)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Vertel iets over jezelf, je hobbies, levensstijl..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="motivation">Motivatie</Label>
              <Textarea
                id="motivation"
                value={formData.motivation}
                onChange={(e) => handleInputChange('motivation', e.target.value)}
                placeholder="Waarom ben je de ideale huurder? Wat maakt je bijzonder?"
                rows={4}
              />
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
          <DialogTitle className="text-xl font-bold text-center">
            Profiel Aanmaken - Stap {currentStep} van {totalSteps}
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <div className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Vorige
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
              >
                Volgende
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Bezig met opslaan...' : 'Profiel Aanmaken'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
