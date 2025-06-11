import { useToast } from '@/hooks/use-toast';
import { propertyService } from '@/services/PropertyService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Home } from 'lucide-react';
import { BaseModal, BaseModalActions, useModalState, useModalForm } from './BaseModal';

interface AddPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (property: any) => void;
}

interface PropertyFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  rent: number;
  bedrooms: number;
  propertyType: string;
}

const initialData: PropertyFormData = {
  title: '',
  description: '',
  address: '',
  city: '',
  rent: 0,
  bedrooms: 1,
  propertyType: 'Appartement'
};

const validateForm = (data: PropertyFormData): boolean => {
  return !!(data.title && data.description && data.address && data.city && data.rent > 0 && data.bedrooms > 0);
};

const AddPropertyModal = ({ open, onOpenChange, onCreated }: AddPropertyModalProps) => {
  const { toast } = useToast();
  const { isSubmitting, setIsSubmitting } = useModalState();
  const { data, updateField, resetForm, isValid } = useModalForm(initialData, validateForm);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await propertyService.createProperty({
      title: data.title,
      description: data.description,
      address: data.address,
      city: data.city,
      rentAmount: data.rent,
      bedrooms: data.bedrooms,
      propertyType: data.propertyType
    });

    if (result.success && result.data) {
      toast({
        title: 'Woning toegevoegd',
        description: 'De woning is succesvol toegevoegd.'
      });
      onCreated(result.data);
      onOpenChange(false);
      resetForm();
    } else {
      toast({
        title: 'Fout bij toevoegen',
        description: result.error?.message || 'Onbekende fout',
        variant: 'destructive'
      });
    }
    setIsSubmitting(false);
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Nieuw Object"
      icon={Home}
      size="xl"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Titel *</Label>
          <Input id="title" value={data.title} onChange={e => updateField('title', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="description">Beschrijving *</Label>
          <Input id="description" value={data.description} onChange={e => updateField('description', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="address">Adres *</Label>
          <Input id="address" value={data.address} onChange={e => updateField('address', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="city">Stad *</Label>
          <Input id="city" value={data.city} onChange={e => updateField('city', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="rent">Huurprijs (€) *</Label>
          <Input id="rent" type="number" value={data.rent || ''} onChange={e => updateField('rent', parseInt(e.target.value) || 0)} />
        </div>
        <div>
          <Label htmlFor="bedrooms">Slaapkamers *</Label>
          <Input id="bedrooms" type="number" value={data.bedrooms || ''} onChange={e => updateField('bedrooms', parseInt(e.target.value) || 1)} />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={data.propertyType} onValueChange={value => updateField('propertyType', value)}>
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
        
        <BaseModalActions
          cancelAction={{
            label: 'Annuleren',
            onClick: () => onOpenChange(false)
          }}
          primaryAction={{
            label: 'Woning Toevoegen',
            onClick: handleSubmit,
            disabled: !isValid,
            loading: isSubmitting,
            className: 'bg-green-600 hover:bg-green-700'
          }}
        />
      </div>
    </BaseModal>
  );
};

export default AddPropertyModal;
