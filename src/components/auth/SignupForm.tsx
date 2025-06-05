
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { User, Users, MapPin, Briefcase, FileText, Shield, Upload } from 'lucide-react';

interface SignupFormProps {
  onClose: () => void;
}

export const SignupForm = ({ onClose }: SignupFormProps) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'huurder' | 'verhuurder'>('huurder');
  const [formData, setFormData] = useState({
    // Step 1: Type selection
    userType: 'huurder',
    
    // Step 2: Personal info
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    householdSize: '',
    
    // Step 3: Household details
    hasPets: false,
    smoking: false,
    
    // Step 4: Housing preferences
    preferredProvince: '',
    preferredStreet: '',
    bedrooms: '',
    maxRent: '',
    availableFrom: '',
    
    // Step 5: Work & income
    employer: '',
    jobTitle: '',
    contractType: '',
    monthlyIncome: '',
    
    // Step 6: Documents (files would be handled separately)
    
    // Step 7: Terms & conditions
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToNewsletter: false
  });

  const { toast } = useToast();

  const handleNext = () => {
    if (step < 7) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Account wordt aangemaakt...",
      description: "Je ontvangt binnenkort een bevestigingsmail."
    });
    onClose();
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Type selectie';
      case 2: return 'Persoonlijke gegevens';
      case 3: return 'Huishouden details';
      case 4: return 'Woonvoorkeuren';
      case 5: return 'Werk & inkomen';
      case 6: return 'Documenten';
      case 7: return 'Voorwaarden';
      default: return '';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 1: return <User className="w-12 h-12 text-dutch-blue" />;
      case 2: return <Users className="w-12 h-12 text-dutch-blue" />;
      case 3: return <Users className="w-12 h-12 text-dutch-blue" />;
      case 4: return <MapPin className="w-12 h-12 text-dutch-blue" />;
      case 5: return <Briefcase className="w-12 h-12 text-dutch-blue" />;
      case 6: return <FileText className="w-12 h-12 text-dutch-blue" />;
      case 7: return <Shield className="w-12 h-12 text-dutch-blue" />;
      default: return <User className="w-12 h-12 text-dutch-blue" />;
    }
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-dutch-blue">Account aanmaken</h2>
        <p className="text-gray-600 mt-2">Stap {step} van 7 - {getStepTitle()}</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-gradient-to-r from-dutch-blue to-dutch-orange h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex justify-center mb-6">
        {getStepIcon()}
      </div>

      {/* Step 1: Type Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Wat ben je?</h3>
            <p className="text-gray-600">Kies je rol om de juiste ervaring te krijgen</p>
          </div>

          <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'huurder' | 'verhuurder')}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="huurder" id="huurder" />
                <User className="w-6 h-6 text-dutch-blue" />
                <div className="flex-1">
                  <Label htmlFor="huurder" className="text-lg font-medium cursor-pointer">
                    Huurder
                  </Label>
                  <p className="text-sm text-gray-600">Ik zoek een woning</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="verhuurder" id="verhuurder" />
                <Briefcase className="w-6 h-6 text-dutch-blue" />
                <div className="flex-1">
                  <Label htmlFor="verhuurder" className="text-lg font-medium cursor-pointer">
                    Verhuurder
                  </Label>
                  <p className="text-sm text-gray-600">Ik verhuur woningen</p>
                </div>
              </div>
            </div>
          </RadioGroup>

          <Button onClick={handleNext} className="w-full">
            Volgende
          </Button>
        </div>
      )}

      {/* Step 2: Personal Information */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold mb-2">Persoon & huishouden</h3>
            <p className="text-gray-600">Vertel ons over jezelf en je huishouden</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Voornaam *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="Jan"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Achternaam *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="Jansen"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Geboortedatum * (dd/mm/jjjj)</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">E-mailadres *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="jan@email.nl"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Wachtwoord *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Bevestig wachtwoord *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefoonnummer *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="06 12345678"
              required
            />
          </div>

          <div>
            <Label htmlFor="householdSize">Huishoudgrootte *</Label>
            <select 
              id="householdSize"
              value={formData.householdSize}
              onChange={(e) => setFormData({...formData, householdSize: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dutch-blue"
              required
            >
              <option value="">Selecteer huishoudgrootte</option>
              <option value="1">1 persoon</option>
              <option value="2">2 personen</option>
              <option value="3">3 personen</option>
              <option value="4">4 personen</option>
              <option value="5+">5+ personen</option>
            </select>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Vorige
            </Button>
            <Button onClick={handleNext} className="flex-1">
              Volgende
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Household Details */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold mb-2">Huishouden details</h3>
            <p className="text-gray-600">Vertel ons meer over je huishouden</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPets"
                checked={formData.hasPets}
                onCheckedChange={(checked) => setFormData({...formData, hasPets: checked as boolean})}
              />
              <Label htmlFor="hasPets">Wij hebben huisdieren</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="smoking"
                checked={formData.smoking}
                onCheckedChange={(checked) => setFormData({...formData, smoking: checked as boolean})}
              />
              <Label htmlFor="smoking">Er wordt gerookt in ons huishouden</Label>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Vorige
            </Button>
            <Button onClick={handleNext} className="flex-1">
              Volgende
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Housing Preferences */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold mb-2">Woonwensen</h3>
            <p className="text-gray-600">Waar wil je wonen en wat zijn je eisen?</p>
          </div>

          <div>
            <Label htmlFor="preferredProvince">Gewenste locatie *</Label>
            <select 
              id="preferredProvince"
              value={formData.preferredProvince}
              onChange={(e) => setFormData({...formData, preferredProvince: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dutch-blue"
              required
            >
              <option value="">Selecteer een provincie</option>
              <option value="noord-holland">Noord-Holland</option>
              <option value="zuid-holland">Zuid-Holland</option>
              <option value="utrecht">Utrecht</option>
              <option value="gelderland">Gelderland</option>
              <option value="noord-brabant">Noord-Brabant</option>
              <option value="overijssel">Overijssel</option>
              <option value="limburg">Limburg</option>
              <option value="groningen">Groningen</option>
              <option value="friesland">Friesland</option>
              <option value="drenthe">Drenthe</option>
              <option value="flevoland">Flevoland</option>
              <option value="zeeland">Zeeland</option>
            </select>
          </div>

          <div>
            <Label htmlFor="preferredStreet">Straal (km) *</Label>
            <select 
              id="preferredStreet"
              value={formData.preferredStreet}
              onChange={(e) => setFormData({...formData, preferredStreet: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dutch-blue"
              required
            >
              <option value="">Selecteer straal</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="15">15 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bedrooms">Aantal slaapkamers *</Label>
              <select 
                id="bedrooms"
                value={formData.bedrooms}
                onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dutch-blue"
                required
              >
                <option value="">Selecteer aantal</option>
                <option value="1">1 slaapkamer</option>
                <option value="2">2 slaapkamers</option>
                <option value="3">3 slaapkamers</option>
                <option value="4">4 slaapkamers</option>
                <option value="5+">5+ slaapkamers</option>
              </select>
            </div>

            <div>
              <Label htmlFor="maxRent">Maximale huur *</Label>
              <select 
                id="maxRent"
                value={formData.maxRent}
                onChange={(e) => setFormData({...formData, maxRent: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dutch-blue"
                required
              >
                <option value="">€ per maand</option>
                <option value="500">€ 500</option>
                <option value="750">€ 750</option>
                <option value="1000">€ 1.000</option>
                <option value="1250">€ 1.250</option>
                <option value="1500">€ 1.500</option>
                <option value="2000">€ 2.000</option>
                <option value="2500">€ 2.500</option>
                <option value="3000+">€ 3.000+</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="availableFrom">Klaar om te huren vanaf * (dd/mm/jjjj)</Label>
            <Input
              id="availableFrom"
              type="date"
              value={formData.availableFrom}
              onChange={(e) => setFormData({...formData, availableFrom: e.target.value})}
              required
            />
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Vorige
            </Button>
            <Button onClick={handleNext} className="flex-1">
              Volgende
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Work & Income */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold mb-2">Werk & inkomen</h3>
            <p className="text-gray-600">Informatie over je werk en inkomen</p>
          </div>

          <div>
            <Label htmlFor="employer">Dienstverband *</Label>
            <select 
              id="employer"
              value={formData.employer}
              onChange={(e) => setFormData({...formData, employer: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dutch-blue"
              required
            >
              <option value="">Selecteer dienstverband</option>
              <option value="vast">Vaste aanstelling</option>
              <option value="tijdelijk">Tijdelijke aanstelling</option>
              <option value="zzp">ZZP/Freelancer</option>
              <option value="student">Student</option>
              <option value="uitkering">Uitkering</option>
              <option value="pensioen">Pensioen</option>
            </select>
          </div>

          <div>
            <Label htmlFor="jobTitle">Werkgever *</Label>
            <Input
              id="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
              placeholder="Bedrijfsnaam"
              required
            />
          </div>

          <div>
            <Label htmlFor="contractType">Type contract *</Label>
            <select 
              id="contractType"
              value={formData.contractType}
              onChange={(e) => setFormData({...formData, contractType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dutch-blue"
              required
            >
              <option value="">Selecteer contract type</option>
              <option value="onbepaalde-tijd">Onbepaalde tijd</option>
              <option value="bepaalde-tijd">Bepaalde tijd</option>
              <option value="uitzend">Uitzendcontract</option>
              <option value="freelance">Freelance</option>
              <option value="stage">Stage</option>
            </select>
          </div>

          <div>
            <Label htmlFor="monthlyIncome">Huishoudinkomen (bruto per maand) *</Label>
            <select 
              id="monthlyIncome"
              value={formData.monthlyIncome}
              onChange={(e) => setFormData({...formData, monthlyIncome: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dutch-blue"
              required
            >
              <option value="">Selecteer inkomen</option>
              <option value="1500">€ 1.500</option>
              <option value="2000">€ 2.000</option>
              <option value="2500">€ 2.500</option>
              <option value="3000">€ 3.000</option>
              <option value="3500">€ 3.500</option>
              <option value="4000">€ 4.000</option>
              <option value="4500">€ 4.500</option>
              <option value="5000">€ 5.000</option>
              <option value="5500+">€ 5.500+</option>
            </select>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Vorige
            </Button>
            <Button onClick={handleNext} className="flex-1">
              Volgende
            </Button>
          </div>
        </div>
      )}

      {/* Step 6: Documents */}
      {step === 6 && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold mb-2">Documenten</h3>
            <p className="text-gray-600">Upload je documenten voor verificatie</p>
          </div>

          <div className="text-center mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                Deze documenten kunnen ook later toegevoegd worden in het dashboard
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                  <div>
                    <p className="font-medium">Kopie identiteitsbewijs</p>
                    <p className="text-sm text-red-500">Verplicht</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Uploaden
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                  <div>
                    <p className="font-medium">Loonstrook (laatste 3 maanden)</p>
                    <p className="text-sm text-red-500">Verplicht</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Uploaden
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                  <div>
                    <p className="font-medium">Arbeidscontract</p>
                    <p className="text-sm text-red-500">Verplicht</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Uploaden
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                  <div>
                    <p className="font-medium">Bankafschrift (laatste 3 maanden)</p>
                    <p className="text-sm text-red-500">Verplicht</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Uploaden
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                  <div>
                    <p className="font-medium">Uittreksel BKR</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Uploaden
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                  <div>
                    <p className="font-medium">Verhuurderverklaring</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Uploaden
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Extra documenten uploaden</p>
            <p className="text-xs text-gray-500">Andere documenten die je wilt meenemen</p>
            <Button variant="outline" className="mt-2">
              Bestanden selecteren
            </Button>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Vorige
            </Button>
            <Button onClick={handleNext} className="flex-1">
              Volgende
            </Button>
          </div>
        </div>
      )}

      {/* Step 7: Terms & Conditions */}
      {step === 7 && (
        <div className="space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-semibold mb-2">AVG-toestemming</h3>
            <p className="text-gray-600">Privacy en gegevensverwerking</p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Gegevensverwerking</h4>
              <p className="text-sm text-gray-600 mb-4">
                Wij verwerken je gegevens om onze diensten te kunnen leveren. Dit 
                omvat het matchen met geschikte woningen, communicatie met 
                verhuurders, en het verbeteren van onze services.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Je gegevens worden veilig opgeslagen en nooit gedeeld met derden 
                zonder je toestemming, behalve waar wettelijk vereist.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData({...formData, agreeToTerms: checked as boolean})}
                  className="mt-1"
                />
                <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                  Ik ga akkoord met de{' '}
                  <a href="/algemene-voorwaarden" target="_blank" className="text-dutch-orange hover:underline">
                    algemene voorwaarden
                  </a>{' '}
                  en{' '}
                  <a href="/privacybeleid" target="_blank" className="text-dutch-orange hover:underline">
                    privacybeleid
                  </a>{' '}
                  *
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToNewsletter"
                  checked={formData.agreeToNewsletter}
                  onCheckedChange={(checked) => setFormData({...formData, agreeToNewsletter: checked as boolean})}
                  className="mt-1"
                />
                <Label htmlFor="agreeToNewsletter" className="text-sm leading-relaxed">
                  Ik wil updates en tips ontvangen via e-mail
                </Label>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Vorige
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!formData.agreeToTerms}
            >
              Account aanmaken
            </Button>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-500">
        Heb je al een account?{' '}
        <button className="text-dutch-orange hover:underline" onClick={onClose}>
          Inloggen
        </button>
      </div>
    </div>
  );
};
