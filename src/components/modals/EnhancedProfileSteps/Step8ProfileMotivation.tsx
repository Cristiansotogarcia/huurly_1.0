
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, User } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export default function Step8ProfileMotivation() {
  const { register, watch, formState: { errors } } = useFormContext();
  const bio = watch('bio', '');
  const motivation = watch('motivation', '');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-pink-600" />
          </div>
          <h2 className="text-xl font-semibold">Profiel & Motivatie</h2>
        </div>
        <p className="text-gray-600">Vertel ons over jezelf en je motivatie</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Over mij *</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <Textarea
            {...register('bio')}
            placeholder="Vertel iets over jezelf, je hobby's, werk, en wat voor type huurder je bent. Dit helpt verhuurders om je beter te leren kennen."
            className="min-h-[120px] pl-10 pt-3"
            required
          />
        </div>
        {errors.bio && <p className="text-red-500 text-xs">{`${errors.bio.message}`}</p>}
        <p className="text-sm text-gray-500">
          Tekens: {bio.length}/500 (minimaal 50 tekens aanbevolen)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivation">Motivatie *</Label>
        <div className="relative">
          <MessageCircle className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <Textarea
            {...register('motivation')}
            placeholder="Vertel waarom je op zoek bent naar een nieuwe woning en wat je zoekt. Bijvoorbeeld: nieuwe baan, studiebeëindiging, of gewoon tijd voor verandering."
            className="min-h-[120px] pl-10 pt-3"
            required
          />
        </div>
        {errors.motivation && <p className="text-red-500 text-xs">{`${errors.motivation.message}`}</p>}
        <p className="text-sm text-gray-500">
          Tekens: {motivation.length}/500 (minimaal 30 tekens aanbevolen)
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips voor een sterke motivatie</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Wees eerlijk en authentiek</li>
          <li>• Leg uit waarom je deze specifieke woning/locatie zoekt</li>
          <li>• Vertel iets over je toekomstplannen</li>
          <li>• Toon dat je een betrouwbare huurder bent</li>
        </ul>
      </div>

      <div className="p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">🎉 Bijna klaar!</h3>
        <p className="text-green-700 text-sm">
          Je bent bijna klaar met je profiel. Na het voltooien kun je direct beginnen met zoeken naar je ideale woning!
        </p>
      </div>
    </div>
  );
}
