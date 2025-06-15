
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfilePictureUpload } from '@/components/ProfilePictureUpload';
import { User, Calendar, Phone, Globe } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

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
  return (
    <Input
      type="date"
      value={selected ? selected.toISOString().split('T')[0] : ''}
      onChange={(e) => {
        const date = e.target.value ? new Date(e.target.value) : undefined;
        onSelect(date);
      }}
      placeholder={placeholder}
    />
  );
};

interface Step1PersonalInfoProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleDateSelect: (field: 'date_of_birth' | 'move_in_date_preferred' | 'move_in_date_earliest', date: Date | undefined) => void;
}

export default function Step1PersonalInfo({ 
  formData, 
  handleInputChange, 
  handleDateSelect 
}: Step1PersonalInfoProps) {
  const { user } = useAuthStore();

  const handleProfilePictureUpload = (url: string) => {
    handleInputChange('profilePictureUrl', url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold">Persoonlijke Informatie</h2>
        </div>
        <p className="text-gray-600">Begin met je basisgegevens en profielfoto</p>
      </div>

      {/* Profile Picture Upload */}
      <div className="flex justify-center">
        <ProfilePictureUpload
          userId={user?.id || ''}
          currentImageUrl={formData.profilePictureUrl}
          onImageUploaded={handleProfilePictureUpload}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Voornaam *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            placeholder="Je voornaam"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Achternaam *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            placeholder="Je achternaam"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Geboortedatum *</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <EnhancedDatePicker
              selected={formData.date_of_birth}
              onSelect={(date) => handleDateSelect('date_of_birth', date)}
              placeholder="Selecteer je geboortedatum"
              disabled={(date) => date > new Date() || date < new Date(1900, 0, 1)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefoonnummer *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+31 6 12345678"
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sex">Geslacht</Label>
          <Select value={formData.sex} onValueChange={(value) => handleInputChange('sex', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecteer geslacht" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="man">Man</SelectItem>
              <SelectItem value="vrouw">Vrouw</SelectItem>
              <SelectItem value="anders">Anders</SelectItem>
              <SelectItem value="geen_antwoord">Zeg ik liever niet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationaliteit</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              placeholder="Nederlandse"
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="marital_status">Burgerlijke staat</Label>
        <Select value={formData.marital_status} onValueChange={(value) => handleInputChange('marital_status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer burgerlijke staat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Alleenstaand</SelectItem>
            <SelectItem value="relationship">Relatie</SelectItem>
            <SelectItem value="married">Getrouwd</SelectItem>
            <SelectItem value="divorced">Gescheiden</SelectItem>
            <SelectItem value="widowed">Weduwe/weduwnaar</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
