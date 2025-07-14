import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProfilePictureUpload } from '@/components/ProfilePictureUpload';
import { User, Calendar, Phone, Globe } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

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

  // Handle date input formatting for dd/mm/yyyy
  const handleDateInputChange = (value: string) => {
    // Remove any non-numeric characters except /
    let cleaned = value.replace(/[^\d/]/g, '');
    
    // Auto-format as user types
    if (cleaned.length >= 2 && cleaned.charAt(2) !== '/') {
      cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2);
    }
    if (cleaned.length >= 5 && cleaned.charAt(5) !== '/') {
      cleaned = cleaned.substring(0, 5) + '/' + cleaned.substring(5);
    }
    
    // Limit to dd/mm/yyyy format (10 characters)
    if (cleaned.length > 10) {
      cleaned = cleaned.substring(0, 10);
    }
    
    handleInputChange('date_of_birth', cleaned);
    
    // If complete date is entered, try to parse it
    if (cleaned.length === 10) {
      const parts = cleaned.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        
        // Basic validation
        if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900 && year <= new Date().getFullYear()) {
          const date = new Date(year, month, day);
          // Verify the date is valid (handles invalid dates like 31/02/2023)
          if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
            handleDateSelect('date_of_birth', date);
          }
        }
      }
    }
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
            <Input
              id="date_of_birth"
              value={formData.date_of_birth || ''}
              onChange={(e) => handleDateInputChange(e.target.value)}
              placeholder="dd/mm/yyyy"
              className="pl-10"
              maxLength={10}
              required
            />
          </div>
          <p className="text-xs text-gray-500">Voer je geboortedatum in als dd/mm/yyyy (bijvoorbeeld: 15/03/1990)</p>
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
              <SelectItem value="zeg_ik_liever_niet">Zeg ik liever niet</SelectItem>
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
            <SelectItem value="samenwonend">Samenwonend</SelectItem>
            <SelectItem value="getrouwd">Getrouwd</SelectItem>
            <SelectItem value="gescheiden">Gescheiden</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}