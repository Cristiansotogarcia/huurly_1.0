import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { userService } from '@/services/UserService';
import { UserRole } from '@/types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateUserModal = ({ isOpen, onClose, onSuccess }: CreateUserModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'verhuurder' as UserRole,
    voornaam: '',
    achternaam: '',
    telefoon: ''
  });
  const { toast } = useToast();

  const generatePassword = () => {
    // Generate a secure password: 12 chars with uppercase, lowercase, numbers, and special chars
    const length = 12;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const all = uppercase + lowercase + numbers + special;
    
    let password = '';
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData(prev => ({ ...prev, password }));
    setShowPassword(true);
    
    toast({
      title: 'Wachtwoord gegenereerd',
      description: 'Een veilig wachtwoord is aangemaakt. Kopieer dit voor de gebruiker.',
    });
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(formData.password);
    toast({
      title: 'Gekopieerd',
      description: 'Wachtwoord is gekopieerd naar klembord.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password || !formData.voornaam || !formData.achternaam) {
      toast({
        title: 'Ontbrekende velden',
        description: 'Vul alle verplichte velden in.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Zwak wachtwoord',
        description: 'Wachtwoord moet minimaal 8 karakters bevatten.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await userService.createUserAccount({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        voornaam: formData.voornaam,
        achternaam: formData.achternaam,
        telefoon: formData.telefoon || undefined,
      });

      if (response.success) {
        toast({
          title: 'Gebruiker aangemaakt',
          description: `${formData.voornaam} ${formData.achternaam} is succesvol aangemaakt als ${formData.role}.`,
        });
        
        // Reset form
        setFormData({
          email: '',
          password: '',
          role: 'verhuurder',
          voornaam: '',
          achternaam: '',
          telefoon: ''
        });
        
        if (onSuccess) onSuccess();
        onClose();
      } else {
        throw new Error(response.error?.message || 'Onbekende fout');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Fout bij aanmaken gebruiker',
        description: error.message || 'Er is iets misgegaan. Probeer het opnieuw.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="create-user-description">
        <DialogHeader>
          <DialogTitle>Nieuwe Gebruiker Aanmaken</DialogTitle>
          <DialogDescription id="create-user-description">
            Maak een nieuwe gebruiker aan. Deze ontvangt automatisch een bevestigingsmail.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="role">Rol *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => updateFormData('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="verhuurder">Verhuurder</SelectItem>
                <SelectItem value="beoordelaar">Beoordelaar</SelectItem>
                <SelectItem value="beheerder">Beheerder</SelectItem>
                <SelectItem value="huurder">Huurder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="voornaam">Voornaam *</Label>
            <Input
              id="voornaam"
              value={formData.voornaam}
              onChange={(e) => updateFormData('voornaam', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="achternaam">Achternaam *</Label>
            <Input
              id="achternaam"
              value={formData.achternaam}
              onChange={(e) => updateFormData('achternaam', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">E-mailadres *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="telefoon">Telefoonnummer</Label>
            <Input
              id="telefoon"
              type="tel"
              value={formData.telefoon}
              onChange={(e) => updateFormData('telefoon', e.target.value)}
              placeholder="+31 6 12345678"
            />
          </div>

          <div>
            <Label htmlFor="password">Wachtwoord *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button type="button" variant="outline" onClick={generatePassword}>
                Genereer
              </Button>
            </div>
            {formData.password && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-600">
                  Wachtwoord sterkte: {formData.password.length >= 12 ? '✅ Sterk' : formData.password.length >= 8 ? '⚠️ Gemiddeld' : '❌ Zwak'}
                </span>
                {formData.password && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyPassword}
                    className="h-6 px-2 text-xs"
                  >
                    Kopieer
                  </Button>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aanmaken...
                </>
              ) : (
                'Gebruiker Aanmaken'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
