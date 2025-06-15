
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Clock, Heart } from 'lucide-react';

interface Step7ReferencesProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export default function Step7References({ formData, handleInputChange }: Step7ReferencesProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold">Referenties & Geschiedenis</h2>
        </div>
        <p className="text-gray-600">Vertel ons over je huurverleden en referenties</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="references_available"
            checked={formData.references_available}
            onCheckedChange={(checked) => handleInputChange('references_available', checked)}
          />
          <Label htmlFor="references_available">Ik kan referenties van vorige verhuurders overleggen</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rental_history_years">Hoeveel jaar huurervaring heb je?</Label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="rental_history_years"
            type="number"
            min="0"
            max="50"
            value={formData.rental_history_years}
            onChange={(e) => handleInputChange('rental_history_years', parseInt(e.target.value) || 0)}
            placeholder="5"
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason_for_moving">Reden voor verhuizing</Label>
        <Textarea
          id="reason_for_moving"
          value={formData.reason_for_moving}
          onChange={(e) => handleInputChange('reason_for_moving', e.target.value)}
          placeholder="Beschrijf waarom je op zoek bent naar een nieuwe woning (bijv. nieuwe baan, studiebeëindiging, groeiende familie)"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold flex items-center">
          <Heart className="w-4 h-4 mr-2 text-red-500" />
          Levensstijl
        </h3>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_pets"
              checked={formData.has_pets}
              onCheckedChange={(checked) => handleInputChange('has_pets', checked)}
            />
            <Label htmlFor="has_pets">Ik heb huisdieren</Label>
          </div>

          {formData.has_pets && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="pet_details">Huisdier details</Label>
              <Textarea
                id="pet_details"
                value={formData.pet_details}
                onChange={(e) => handleInputChange('pet_details', e.target.value)}
                placeholder="Beschrijf je huisdieren (type, aantal, grootte, etc.)"
                className="min-h-[80px]"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="smokes"
              checked={formData.smokes}
              onCheckedChange={(checked) => handleInputChange('smokes', checked)}
            />
            <Label htmlFor="smokes">Ik rook</Label>
          </div>

          {formData.smokes && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="smoking_details">Rook details</Label>
              <Textarea
                id="smoking_details"
                value={formData.smoking_details}
                onChange={(e) => handleInputChange('smoking_details', e.target.value)}
                placeholder="Beschrijf je rookgewoonten (bijv. alleen buiten, sociale roker, etc.)"
                className="min-h-[80px]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
