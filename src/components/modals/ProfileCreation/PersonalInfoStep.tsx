
import { CalendarIcon, User } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { StepProps } from './types';

export const PersonalInfoStep = ({ profileData, updateField }: StepProps) => {
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
            onChange={(e) => updateField('firstName', e.target.value)}
            placeholder="Emma"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Achternaam *</Label>
          <Input
            id="lastName"
            value={profileData.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
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
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="+31 6 12345678"
        />
      </div>
      
      <div>
        <Label htmlFor="dateOfBirth">Geboortedatum *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !profileData.dateOfBirth && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {profileData.dateOfBirth ? format(profileData.dateOfBirth, "PPP") : <span>Selecteer geboortedatum</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
            <Calendar
              mode="single"
              selected={profileData.dateOfBirth}
              onSelect={(date) => updateField('dateOfBirth', date)}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div>
        <Label htmlFor="profession">Beroep *</Label>
        <Input
          id="profession"
          value={profileData.profession}
          onChange={(e) => updateField('profession', e.target.value)}
          placeholder="Software Developer"
        />
      </div>
      
      <div>
        <Label htmlFor="monthlyIncome">Maandelijks bruto inkomen * (€)</Label>
        <Input
          id="monthlyIncome"
          type="number"
          value={profileData.monthlyIncome || ''}
          onChange={(e) => updateField('monthlyIncome', parseInt(e.target.value) || 0)}
          placeholder="4500"
        />
      </div>
    </div>
  );
};
