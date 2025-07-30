import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cloudflareR2UploadService } from '@/lib/cloudflare-r2-upload';
import { ImageOptimizer } from '@/lib/image-optimization';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ProfilePictureUploadProps {
  userId: string;
  type: 'profile' | 'cover';
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  userId,
  type,
  currentImageUrl,
  onImageUploaded,
  className = '',
  size = 'medium'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    },
    maxSize: type === 'profile' ? 5 * 1024 * 1024 : 10 * 1024 * 1024, // 5MB for profile, 10MB for cover
    maxFiles: 1,
    disabled: isUploading,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileSelect(acceptedFiles[0]);
      }
    }
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      let result;
      if (type === 'profile') {
        result = await cloudflareR2UploadService.uploadProfilePicture(selectedFile, userId);
      } else {
        result = await cloudflareR2UploadService.uploadCoverPhoto(selectedFile, userId);
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.url) {
        onImageUploaded(result.url);
        setPreviewUrl(null);
        setSelectedFile(null);
        
        toast({
          title: "Upload succesvol",
          description: `Je ${type === 'profile' ? 'profiel' : 'cover'} foto is succesvol geüpload.`,
        });
      } else {
        throw result.error || new Error('Upload mislukt');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload mislukt",
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden bij het uploaden',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getPlaceholderText = () => {
    if (type === 'profile') {
      return 'Upload profielfoto';
    }
    return 'Upload cover foto';
  };

  const getImageUrl = () => {
    const result = previewUrl || currentImageUrl || null;
    return result;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col items-center space-y-4">
        {/* Image Display */}
        <div className="relative">
          {type === 'profile' ? (
            <Avatar className={cn(sizeClasses[size], 'border-2 border-gray-200')}>
              <AvatarImage src={getImageUrl() || undefined} alt="Profile" />
              <AvatarFallback className="bg-gray-100">
                <Camera className="w-8 h-8 text-gray-400" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className={cn(
              'relative overflow-hidden rounded-lg border-2 border-dashed',
              size === 'small' ? 'w-32 h-20' : size === 'medium' ? 'w-48 h-32' : 'w-64 h-40',
              'border-gray-300'
            )}>
              {getImageUrl() ? (
                <img
                  src={getImageUrl()}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          )}

          {/* Upload Overlay */}
          {!isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
              <label
                {...getRootProps()}
                className="cursor-pointer text-white opacity-0 hover:opacity-100 transition-opacity"
              >
                <input {...getInputProps()} ref={fileInputRef} />
                <Upload className="w-6 h-6" />
              </label>
            </div>
          )}
        </div>

        {/* Upload Area */}
        {(!currentImageUrl || selectedFile) && !isUploading && (
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
              'w-full max-w-xs'
            )}
          >
            <input {...getInputProps()} />
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive ? 'Laat los om te uploaden' : 'Sleep een foto hierheen of klik om te selecteren'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {type === 'profile' ? 'Max 5MB' : 'Max 10MB'} • JPG, PNG, WebP
            </p>
          </div>
        )}

        {/* Preview Actions */}
        {previewUrl && selectedFile && !isUploading && (
          <div className="flex space-x-2">
            <Button onClick={handleUpload} size="sm">
              Upload {type === 'profile' ? 'Profielfoto' : 'Cover Foto'}
            </Button>
            <Button onClick={handleRemove} variant="outline" size="sm">
              <X className="w-4 h-4 mr-1" />
              Annuleren
            </Button>
          </div>
        )}

        {/* Progress */}
        {isUploading && (
          <div className="w-full max-w-xs space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-center text-gray-600">
              Uploaden... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Current Image Actions */}
        {currentImageUrl && !previewUrl && !isUploading && (
          <div className="flex space-x-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
            >
              <Camera className="w-4 h-4 mr-1" />
              Vervangen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
