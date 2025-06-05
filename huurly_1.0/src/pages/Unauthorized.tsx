import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Geen toegang</h1>
          <p className="text-gray-600 mb-6">
            Je hebt geen toegang tot deze pagina. Mogelijk heb je niet de juiste rechten of is je account niet actief.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Terug naar home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)} 
              className="w-full"
            >
              Ga terug
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
