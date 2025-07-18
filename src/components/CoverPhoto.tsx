import React, { useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Loader2 } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface CoverPhotoProps {
  userId: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  className?: string;
}

export const CoverPhoto: React.FC<CoverPhotoProps> = ({
  userId,
  currentImageUrl,
  onImageUploaded,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadImage, isUploading, progress } = useImageUpload({
    userId,
    type: 'cover',
    onSuccess: (url) => {
      onImageUploaded(url);
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    disabled: isUploading,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileSelect(acceptedFiles[0]);
      }
    }
  });

  const handleFileSelect = async (file: File) => {
    await uploadImage(file);
  };

  const getImageUrl = () => {
    return currentImageUrl || null;
  };

  return (
    <div className={cn('relative', className)}>
      {/* Cover Photo Container */}
      <div className="relative group">
        <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {getImageUrl() ? (
            <img
              src={getImageUrl()}
              alt="Cover foto"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Voeg een cover foto toe</p>
              </div>
            </div>
          )}

          {/* Upload Button Overlay */}
          {!isUploading && (
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <label
                {...getRootProps()}
                className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 border border-gray-300"
              >
                <input {...getInputProps()} ref={fileInputRef} />
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">Foto wijzigen</span>
              </label>
            </div>
          )}

          {/* Upload Progress Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-4 text-center">
                <Progress value={progress} className="w-48 mb-2" />
                <p className="text-sm text-gray-600">Cover foto uploaden... {progress}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
