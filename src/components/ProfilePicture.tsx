import React, { useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Loader2 } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ProfilePictureProps {
  userId: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({
  userId,
  currentImageUrl,
  onImageUploaded,
  size = 'large',
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadImage, isUploading, progress } = useImageUpload({
    userId,
    type: 'profile',
    onSuccess: (url) => {
      onImageUploaded(url);
    }
  });

  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-40 h-40',
    large: 'w-48 h-48'
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
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
      {/* Profile Picture Container */}
      <div className="relative group">
        <Avatar className={cn(
          sizeClasses[size],
          'border-4 border-white shadow-lg',
          'ring-2 ring-gray-200'
        )}>
          <AvatarImage 
            src={getImageUrl() || undefined} 
            alt="Profiel foto"
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <Camera className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>

        {/* Camera Overlay */}
        {!isUploading && (
          <label
            {...getRootProps()}
            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-white group-hover:scale-110"
          >
            <input {...getInputProps()} ref={fileInputRef} />
            <Camera className="w-5 h-5" />
          </label>
        )}

        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="text-center">
              <Progress value={progress} className="w-20 mb-2" />
              <span className="text-white text-sm">{progress}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
