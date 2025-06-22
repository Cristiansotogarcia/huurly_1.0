import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Laden...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
      <h3 className="text-lg font-medium text-gray-900">{message}</h3>
      <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
        Even geduld terwijl we je gegevens laden.
      </p>
    </div>
  );
};

export default LoadingState;