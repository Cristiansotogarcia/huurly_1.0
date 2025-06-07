import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { propertyService } from '@/services/PropertyService';

interface AddPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (property: any) => void;
}

const AddPropertyModal = ({ open, onOpenChange, onCreated }: AddPropertyModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    rent: 0,
    bedrooms: 1,
    propertyType: 'Appartement'
  });

  const updateField = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

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
      setData({
        title: '',
        description: '',
        address: '',
        city: '',
        rent: 0,
        bedrooms: 1,
        propertyType: 'Appartement'
      });
    } else {
      toast({
        title: 'Fout bij toevoegen',
        description: result.error?.message || 'Onbekende fout',
        variant: 'destructive'
      });
    }
    setIsSubmitting(false);
  };

  const isValid = data.title && data.description && data.address && data.city && data.rent > 0 && data.bedrooms > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">Nieuw Object</DialogTitle>
        </DialogHeader>
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
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
              Annuleren
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid || isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? 'Toevoegen...' : 'Woning Toevoegen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPropertyModal;
