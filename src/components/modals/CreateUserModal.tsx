import React, { useState } from 'react';
import UnifiedModal from './UnifiedModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/UserService';
import { UserRole } from '@/types';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

interface CreateUserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole | '';
  voornaam: string;
  achternaam: string;
  telefoon: string;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    voornaam: '',
    achternaam: '',
    telefoon: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateUserFormData, string>> = {};

    if (!formData.email) {
      newErrors.email = 'E-mailadres is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ongeldig e-mailadres';
    }

    if (!formData.password) {
      newErrors.password = 'Wachtwoord is verplicht';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Wachtwoord moet minimaal 8 karakters bevatten';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Bevestig je wachtwoord';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
    }

    if (!formData.role) {
      newErrors.role = 'Rol is verplicht';
    }

    if (!formData.voornaam) {
      newErrors.voornaam = 'Voornaam is verplicht';
    }

    if (!formData.achternaam) {
      newErrors.achternaam = 'Achternaam is verplicht';
    }

    if (formData.telefoon && !/^(\+31|0)[1-9][0-9]{8}$/.test(formData.telefoon)) {
      newErrors.telefoon = 'Ongeldig Nederlands telefoonnummer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await userService.createUserAccount({
        email: formData.email,
        password: formData.password,
        role: formData.role as UserRole,
        voornaam: formData.voornaam,
        achternaam: formData.achternaam,
        telefoon: formData.telefoon || undefined,
      });

      if (result.success) {
        toast({
          title: 'Gebruiker aangemaakt',
          description: `${formData.voornaam} ${formData.achternaam} is succesvol aangemaakt als ${formData.role}.`,
        });
        
        // Reset form
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          role: '',
          voornaam: '',
          achternaam: '',
          telefoon: '',
        });
        setErrors({});
        
        onUserCreated();
        onClose();
      } else {
        throw new Error(result.error?.message || 'Fout bij aanmaken gebruiker');
      }
    } catch (error) {
      toast({
        title: 'Fout bij aanmaken gebruiker',
        description: error instanceof Error ? error.message : 'Er is een onverwachte fout opgetreden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateUserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password, confirmPassword: password }));
    setErrors(prev => ({ ...prev, password: undefined, confirmPassword: undefined }));
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      huurder: 'Huurder',
      verhuurder: 'Verhuurder',
      beoordelaar: 'Beoordelaar',
      beheerder: 'Beheerder'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleDescription = (role: string) => {
    const descriptions = {
      huurder: 'Kan woningen zoeken en aanvragen doen',
      verhuurder: 'Kan woningen aanbieden en huurders zoeken',
      beoordelaar: 'Kan documenten beoordelen en profielen reviewen',
      beheerder: 'Heeft volledige toegang tot alle functies'
    };
    return descriptions[role as keyof typeof descriptions] || '';
  };

  return (
    <UnifiedModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Nieuwe gebruiker aanmaken"
      size="lg"
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">
            Annuleren
          </Button>
          <Button onClick={handleSubmit} variant="default" disabled={loading}>
            Gebruiker aanmaken
          </Button>
        </div>
      }
    >

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="voornaam">Voornaam *</Label>
              <Input
                id="voornaam"
                value={formData.voornaam}
                onChange={(e) => handleInputChange('voornaam', e.target.value)}
                className={errors.voornaam ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.voornaam && (
                <p className="text-sm text-red-500 mt-1">{errors.voornaam}</p>
              )}
            </div>
            <div>
              <Label htmlFor="achternaam">Achternaam *</Label>
              <Input
                id="achternaam"
                value={formData.achternaam}
                onChange={(e) => handleInputChange('achternaam', e.target.value)}
                className={errors.achternaam ? 'border-red-500' : ''}
                disabled={loading}
              />
              {errors.achternaam && (
                <p className="text-sm text-red-500 mt-1">{errors.achternaam}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">E-mailadres *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="telefoon">Telefoonnummer</Label>
            <Input
              id="telefoon"
              type="tel"
              placeholder="+31 6 12345678 of 06 12345678"
              value={formData.telefoon}
              onChange={(e) => handleInputChange('telefoon', e.target.value)}
              className={errors.telefoon ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.telefoon && (
              <p className="text-sm text-red-500 mt-1">{errors.telefoon}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Gebruikersrol *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => handleInputChange('role', value)}
              disabled={loading}
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecteer een rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="huurder">
                  <div>
                    <div className="font-medium">{getRoleDisplayName('huurder')}</div>
                    <div className="text-xs text-gray-500">{getRoleDescription('huurder')}</div>
                  </div>
                </SelectItem>
                <SelectItem value="verhuurder">
                  <div>
                    <div className="font-medium">{getRoleDisplayName('verhuurder')}</div>
                    <div className="text-xs text-gray-500">{getRoleDescription('verhuurder')}</div>
                  </div>
                </SelectItem>
                <SelectItem value="beoordelaar">
                  <div>
                    <div className="font-medium">{getRoleDisplayName('beoordelaar')}</div>
                    <div className="text-xs text-gray-500">{getRoleDescription('beoordelaar')}</div>
                  </div>
                </SelectItem>
                <SelectItem value="beheerder">
                  <div>
                    <div className="font-medium">{getRoleDisplayName('beheerder')}</div>
                    <div className="text-xs text-gray-500">{getRoleDescription('beheerder')}</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Wachtwoord *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generatePassword}
                  disabled={loading}
                >
                  Genereer
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Bevestig Wachtwoord *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Belangrijk</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• De gebruiker ontvangt een bevestigingsmail op het opgegeven e-mailadres</li>
              <li>• Voor huurders: Het account wordt aangemaakt, maar ze moeten nog een abonnement afsluiten</li>
              <li>• Voor andere rollen: Het account is direct actief en bruikbaar</li>
              <li>• Je kunt het wachtwoord later resetten via de gebruikerslijst</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Gebruiker aanmaken...' : 'Gebruiker aanmaken'}
            </Button>
          </div>
        </form>
    </UnifiedModal>
  );
};

export default CreateUserModal;