
import { Briefcase } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StepProps } from './types';

export const PersonalDescriptionStep = ({ profileData, updateField }: StepProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Briefcase className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h3 className="text-lg font-semibold">Over Jezelf</h3>
        <p className="text-gray-600">Maak een goede eerste indruk</p>
      </div>
      
      <div>
        <Label htmlFor="bio">Korte beschrijving van jezelf *</Label>
        <Textarea
          id="bio"
          value={profileData.bio}
          onChange={(e) => updateField('bio', e.target.value)}
          placeholder="Vertel iets over jezelf, je hobby's, werk en wat voor huurder je bent..."
          rows={4}
        />
        <p className="text-sm text-gray-500 mt-1">
          {profileData.bio.length}/500 karakters
        </p>
      </div>
      
      <div>
        <Label htmlFor="motivation">Waarom ben je op zoek naar een woning? *</Label>
        <Textarea
          id="motivation"
          value={profileData.motivation}
          onChange={(e) => updateField('motivation', e.target.value)}
          placeholder="Bijvoorbeeld: nieuwe baan, studie, samenwonen..."
          rows={3}
        />
      </div>
    </div>
  );
};
