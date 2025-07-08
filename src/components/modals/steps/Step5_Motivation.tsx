import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProfileFormData } from '../profileSchema';
import { MessageSquare, Target } from 'lucide-react';

export const Step5_Motivation = () => {
  const { register, formState: { errors }, watch } = useFormContext<ProfileFormData>();
  
  const bioLength = watch('bio')?.length || 0;
  const motivationLength = watch('motivation')?.length || 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold">Persoonlijke Motivatie</h2>
        </div>
        <p className="text-gray-600">Vertel wie je bent en waarom verhuurders je zouden kiezen</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Persoonlijke bio *</span>
            </Label>
            <span className="text-sm text-gray-500">
              {bioLength}/500 karakters
            </span>
          </div>
          <Textarea
            id="bio"
            {...register('bio')}
            placeholder="Vertel iets over jezelf: je hobbies, interesses, wat voor persoon je bent..."
            className={errors.bio ? 'border-red-500' : ''}
            rows={4}
            maxLength={500}
          />
          {errors.bio && (
            <p className="text-sm text-red-600">{errors.bio.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Minimum 50 karakters. Vertel over je persoonlijkheid, hobbies en interesses.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="motivation" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Waarom zou een verhuurder jou kiezen? *</span>
            </Label>
            <span className="text-sm text-gray-500">
              {motivationLength}/500 karakters
            </span>
          </div>
          <Textarea
            id="motivation"
            {...register('motivation')}
            placeholder="Bijvoorbeeld: Ik ben een betrouwbare huurder met stabiel inkomen, zorg goed voor eigendommen, ben rustig en respectvol naar buren..."
            className={errors.motivation ? 'border-red-500' : ''}
            rows={4}
            maxLength={500}
          />
          {errors.motivation && (
            <p className="text-sm text-red-600">{errors.motivation.message}</p>
          )}
          <p className="text-xs text-gray-500">
            Minimum 50 karakters. Overtuig verhuurders waarom jij de ideale huurder bent.
          </p>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-medium text-green-900 mb-2">💡 Tips voor een sterke motivatie</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Benadruk je betrouwbaarheid en stabiliteit</li>
          <li>• Vermelding van een vast inkomen en werkgever</li>
          <li>• Toon respect voor eigendommen en buren</li>
          <li>• Deel relevante ervaringen als huurder</li>
          <li>• Wees eerlijk en authentiek</li>
        </ul>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">🎉 Laatste stap!</h3>
        <p className="text-sm text-blue-800">
          Na het voltooien van deze stap is je profiel compleet en kun je gezien worden door verhuurders. 
          Zorg ervoor dat je ook alle benodigde documenten uploadt.
        </p>
      </div>
    </div>
  );
};