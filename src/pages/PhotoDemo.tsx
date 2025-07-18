import React from 'react';
import { PhotoSection } from '@/components/PhotoSection';

const PhotoDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Foto Upload</h1>
          <p className="text-gray-600 mb-6">
            Upload profielfoto's en cover foto's met moderne interface
          </p>
          
          <PhotoSection />
        </div>
      </div>
    </div>
  );
};

export default PhotoDemo;
