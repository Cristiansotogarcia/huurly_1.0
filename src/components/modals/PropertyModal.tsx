import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { propertyService, PropertyCreateData } from '@/services/PropertyService';
import { Property } from '@/types';
import { Plus, X } from 'lucide-react';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property | null;
  onSave: () => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  property,
  onSave,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PropertyCreateData>({
    titel: '',
    beschrijving: '',
    adres: '',
    stad: '',
    huurprijs: 0,
    woning_type: 'appartement',
    beschikbaar_vanaf: '',
  });

  const [newVoorziening, setNewVoorziening] = useState('');

  useEffect(() => {
    if (property) {
      setFormData({
        titel: property.title,
        beschrijving: property.description || '',
        adres: property.address,
        stad: property.city,
        huurprijs: property.rent,
        woning_type: property.propertyType || 'appartement',
        beschikbaar_vanaf: property.availableFrom || '',
      });
    } else {
      // Reset form for new property
      setFormData({
        titel: '',
        beschrijving: '',
        adres: '',
        stad: '',
        huurprijs: 0,
        woning_type: 'appartement',
        beschikbaar_vanaf: '',
      });
    }
  }, [property, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (property) {
        // Update existing property
        const result = await propertyService.updateProperty(property.id, formData);
        if (result.success) {
          toast({
            title: 'Woning bijgewerkt',
            description: 'De woning is succesvol bijgewerkt.',
          });
          onSave();
          onClose();
        } else {
          throw new Error(result.error?.message || 'Fout bij bijwerken');
        }
      } else {
        // Create new property
        const result = await propertyService.createProperty(formData);
        if (result.success) {
          toast({
            title: 'Woning toegevoegd',
            description: 'De nieuwe woning is succesvol toegevoegd.',
          });
          onSave();
          onClose();
        } else {
          throw new Error(result.error?.message || 'Fout bij toevoegen');
        }
      }
    } catch (error) {
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Er is een onverwachte fout opgetreden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addVoorziening = () => {
    if (newVoorziening.trim()) {
      setFormData(prev => ({
        ...prev,
        voorzieningen: [...prev.voorzieningen, newVoorziening.trim()]
      }));
      setNewVoorziening('');
    }
  };

  const removeVoorziening = (index: number) => {
    setFormData(prev => ({
      ...prev,
      voorzieningen: prev.voorzieningen.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {property ? 'Woning Bewerken' : 'Nieuwe Woning Toevoegen'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titel">Titel *</Label>
              <Input
                id="titel"
                value={formData.titel}
                onChange={(e) => setFormData(prev => ({ ...prev, titel: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="woning_type">Woningtype</Label>
              <Select
                value={formData.woning_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, woning_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appartement">Appartement</SelectItem>
                  <SelectItem value="huis">Huis</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="kamer">Kamer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="beschrijving">Beschrijving</Label>
            <Textarea
              id="beschrijving"
              value={formData.beschrijving}
              onChange={(e) => setFormData(prev => ({ ...prev, beschrijving: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adres">Adres *</Label>
              <Input
                id="adres"
                value={formData.adres}
                onChange={(e) => setFormData(prev => ({ ...prev, adres: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="stad">Stad *</Label>
              <Input
                id="stad"
                value={formData.stad}
                onChange={(e) => setFormData(prev => ({ ...prev, stad: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provincie">Provincie</Label>
              <Input
                id="provincie"
                value={formData.provincie}
                onChange={(e) => setFormData(prev => ({ ...prev, provincie: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="huurprijs">Huurprijs (€) *</Label>
              <Input
                id="huurprijs"
                type="number"
                value={formData.huurprijs}
                onChange={(e) => setFormData(prev => ({ ...prev, huurprijs: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="oppervlakte">Oppervlakte (m²)</Label>
              <Input
                id="oppervlakte"
                type="number"
                value={formData.oppervlakte}
                onChange={(e) => setFormData(prev => ({ ...prev, oppervlakte: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="aantal_kamers">Aantal kamers</Label>
              <Input
                id="aantal_kamers"
                type="number"
                min="1"
                value={formData.aantal_kamers}
                onChange={(e) => setFormData(prev => ({ ...prev, aantal_kamers: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="aantal_slaapkamers">Aantal slaapkamers</Label>
              <Input
                id="aantal_slaapkamers"
                type="number"
                min="0"
                value={formData.aantal_slaapkamers}
                onChange={(e) => setFormData(prev => ({ ...prev, aantal_slaapkamers: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="meubilering">Meubilering</Label>
              <Select
                value={formData.meubilering}
                onValueChange={(value) => setFormData(prev => ({ ...prev, meubilering: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongemeubileerd">Ongemeubileerd</SelectItem>
                  <SelectItem value="gemeubileerd">Gemeubileerd</SelectItem>
                  <SelectItem value="gedeeltelijk_gemeubileerd">Gedeeltelijk gemeubileerd</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="beschikbaar_vanaf">Beschikbaar vanaf</Label>
            <Input
              id="beschikbaar_vanaf"
              type="date"
              value={formData.beschikbaar_vanaf}
              onChange={(e) => setFormData(prev => ({ ...prev, beschikbaar_vanaf: e.target.value }))}
            />
          </div>

          <div>
            <Label>Voorzieningen</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Nieuwe voorziening toevoegen"
                value={newVoorziening}
                onChange={(e) => setNewVoorziening(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVoorziening())}
              />
              <Button type="button" onClick={addVoorziening} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.voorzieningen.map((voorziening, index) => (
                <div key={index} className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1 text-sm">
                  {voorziening}
                  <button
                    type="button"
                    onClick={() => removeVoorziening(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>


          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Bezig...' : property ? 'Bijwerken' : 'Toevoegen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};