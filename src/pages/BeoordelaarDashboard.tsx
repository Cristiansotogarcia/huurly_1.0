
import React from 'react';
import { DashboardHeader, DashboardContent } from '@/components/dashboard';
import { useBeoordelaarActions } from '@/hooks/useBeoordelaarActions';
import { withAuth } from '@/hocs/withAuth';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileX, Info } from 'lucide-react';

interface BeoordelaarDashboardProps {
  user: User;
}

const BeoordelaarDashboard: React.FC<BeoordelaarDashboardProps> = ({ user }) => {
  const actions = useBeoordelaarActions();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DashboardHeader user={user} onLogout={actions.handleLogout} />
      <DashboardContent>
        <h1 className="text-3xl font-bold text-gray-800">Beoordelaar Dashboard</h1>
        <p className="mt-2 text-gray-600">Welkom, {user.name}</p>

        <div className="mt-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Document Review Feature Verwijderd
              </CardTitle>
              <CardDescription>
                Informatie over de update
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <FileX className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Document Verificatie Functionaliteit Verwijderd
                  </h3>
                  <p className="text-sm text-gray-700">
                    De document upload en verificatie functionaliteit is verwijderd uit het platform 
                    voor betere GDPR compliance en een eenvoudigere gebruikerservaring.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Wat betekent dit?</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Huurders hoeven geen documenten meer te uploaden</li>
                  <li>Document review taken zijn niet meer beschikbaar</li>
                  <li>Verhuurders kunnen direct contact opnemen met huurders</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Voor vragen over deze wijziging, neem contact op met het beheerteam.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardContent>
    </div>
  );
};

export default withAuth(BeoordelaarDashboard, 'beoordelaar');
