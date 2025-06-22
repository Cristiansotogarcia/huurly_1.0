import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedStateProps {
  message?: string;
  redirectPath?: string;
  redirectLabel?: string;
}

const AccessDeniedState: React.FC<AccessDeniedStateProps> = ({ 
  message = 'Je hebt geen toegang tot deze pagina',
  redirectPath = '/',
  redirectLabel = 'Terug naar Home'
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="bg-red-100 p-3 rounded-full mb-4">
        <ShieldAlert className="h-10 w-10 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">{message}</h3>
      <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
        Je hebt niet de juiste rechten om deze pagina te bekijken. Neem contact op met de beheerder als je denkt dat dit een fout is.
      </p>
      <Button 
        className="mt-6" 
        onClick={() => navigate(redirectPath)}
      >
        {redirectLabel}
      </Button>
    </div>
  );
};

export default AccessDeniedState;