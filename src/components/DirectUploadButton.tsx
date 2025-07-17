import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { directUploadService } from '@/lib/direct-upload';
import { supabase } from '@/integrations/supabase/client';

interface DirectUploadButtonProps {
  userId: string;
  onUploadComplete: (url: string) => void;
  folder?: string;
  buttonText?: string;
  accept?: string;
  className?: string;
}

export const DirectUploadButton: React.FC<DirectUploadButtonProps> = ({
  userId,
  onUploadComplete,
  folder = 'general',
  buttonText = 'Upload Bestand',
  accept = 'image/*',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Validate file
      const validation = directUploadService.validateFile(file);
      if (!validation.isValid) {
        toast({
          title: "Upload mislukt",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      // Generate file path
      const uploadResult = await directUploadService.uploadFile(file, userId, folder);
      
      if (!uploadResult.success || !uploadResult.url) {
        throw uploadResult.error || new Error('Upload failed');
      }

      // Create FormData for direct upload
      const formData = new FormData();
      formData.append('file', file);

      // Use the URL from uploadResult
      const response = await fetch(uploadResult.url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'x-amz-acl': 'public-read',
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      // Update database with the new URL
      const publicUrl = uploadResult.url;
      
      // Update the appropriate table based on folder
      if (folder === 'Profile') {
        await supabase
          .from('huurders')
          .update({ profiel_foto: publicUrl })
          .eq('id', userId);
      } else if (folder.startsWith('properties/')) {
        // Handle property images
        const propertyId = folder.split('/')[1];
        await supabase
          .from('woningen')
          .update({ foto_urls: [publicUrl] }) // Use foto_urls array
          .eq('id', propertyId);
      }

      onUploadComplete(publicUrl);

      toast({
        title: "Upload succesvol",
        description: "Bestand is succesvol geüpload.",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload mislukt",
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden bij het uploaden',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id={`upload-${folder}-${userId}`}
        disabled={isUploading}
      />
      <Button
        onClick={() => document.getElementById(`upload-${folder}-${userId}`)?.click()}
        disabled={isUploading}
        className="flex items-center space-x-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Uploaden...</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>{buttonText}</span>
          </>
        )}
      </Button>
    </div>
  );
};
