import { useState } from 'react';
import { cloudflareR2UploadService, UploadResult } from '@/lib/cloudflare-r2-upload';
import { useToast } from '@/hooks/use-toast';

interface UseImageUploadOptions {
  userId: string;
  type: 'profile' | 'cover';
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<void>;
  isUploading: boolean;
  progress: number;
  error: Error | null;
}

export const useImageUpload = ({
  userId,
  type,
  onSuccess,
  onError
}: UseImageUploadOptions): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    if (!userId) {
      const error = new Error('Gebruiker ID is vereist');
      setError(error);
      onError?.(error);
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      let result: UploadResult;
      
      if (type === 'profile') {
        result = await cloudflareR2UploadService.uploadProfilePicture(file, userId);
      } else {
        result = await cloudflareR2UploadService.uploadCoverPhoto(file, userId);
      }

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.url) {
        onSuccess?.(result.url);
        toast({
          title: "Upload succesvol",
          description: `Je ${type === 'profile' ? 'profiel' : 'cover'} foto is succesvol geüpload.`,
        });
      } else {
        throw result.error || new Error('Upload mislukt');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Er is een fout opgetreden bij het uploaden');
      setError(error);
      onError?.(error);
      
      toast({
        title: "Upload mislukt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadImage,
    isUploading,
    progress,
    error
  };
};
