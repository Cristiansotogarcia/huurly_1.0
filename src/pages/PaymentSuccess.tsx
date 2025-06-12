import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Betaling gelukt</h1>
          <p className="text-gray-600 mb-6">
            Bedankt voor je betaling! Je abonnement is nu actief.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Ga naar home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
