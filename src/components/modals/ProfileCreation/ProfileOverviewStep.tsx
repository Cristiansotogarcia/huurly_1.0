
import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StepProps } from './types';

export const ProfileOverviewStep = ({ profileData }: Pick<StepProps, 'profileData'>) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h3 className="text-lg font-semibold">Profiel Overzicht</h3>
        <p className="text-gray-600">Controleer je gegevens voordat je het profiel aanmaakt</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Persoonlijke Informatie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Naam:</span>
            <span>{profileData.firstName} {profileData.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Telefoon:</span>
            <span>{profileData.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Geboortedatum:</span>
            <span>{profileData.dateOfBirth ? format(profileData.dateOfBirth, "PPP") : 'Niet ingevuld'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Beroep:</span>
            <span>{profileData.profession}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Inkomen:</span>
            <span>€{profileData.monthlyIncome.toLocaleString()}/maand</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Woonvoorkeuren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Stad:</span>
            <span>{profileData.city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Budget:</span>
            <span>€{profileData.minBudget} - €{profileData.maxBudget}/maand</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Slaapkamers:</span>
            <span>{profileData.bedrooms}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span>{profileData.propertyType}</span>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Volgende stappen:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Je profiel wordt zichtbaar voor verhuurders</li>
          <li>• Upload je documenten voor verificatie</li>
          <li>• Begin met zoeken naar woningen</li>
          <li>• Ontvang uitnodigingen voor bezichtigingen</li>
        </ul>
      </div>
    </div>
  );
};
