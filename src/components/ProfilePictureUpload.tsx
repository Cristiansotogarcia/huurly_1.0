
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { r2Client, R2_BUCKET, R2_PUBLIC_BASE } from '@/integrations/cloudflare/client';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfilePictureUploadProps {
  userId: string;
  currentImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  className?: string;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  userId,
  currentImageUrl,
  onImageUploaded,
  className = ""
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Ongeldig bestandstype",
        description: "Selecteer alleen afbeeldingsbestanden (JPG, PNG, WebP, GIF).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Bestand te groot",
        description: "De afbeelding mag maximaal 5MB groot zijn.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique filename
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}.${fileExtension}`;
      const filePath = `${userId}/${fileName}`;

      // Delete existing profile picture if it exists
      if (currentImageUrl) {
        const existingPath = currentImageUrl.replace(`${R2_PUBLIC_BASE}/`, '');
        if (existingPath) {
          await r2Client.send(
            new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: existingPath })
          );
        }
      }

      // Upload new file
      await r2Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: filePath,
          Body: file,
          ContentType: file.type,
        })
      );

      const publicUrl = `${R2_PUBLIC_BASE}/${filePath}`;

      // Store URL in Supabase
      await supabase
        .from('huurders')
        .update({ profielfoto_url: publicUrl })
        .eq('id', userId);

      // Update preview immediately
      setPreviewUrl(publicUrl);

      // Notify parent component
      onImageUploaded(publicUrl);

      toast({
        title: "Profielfoto geüpload",
        description: "Je profielfoto is succesvol bijgewerkt.",
      });

    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload mislukt",
        description: "Er is een fout opgetreden bij het uploaden van je profielfoto.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImageUrl && !previewUrl) return;

    setIsUploading(true);

    try {
      // Remove from storage if exists
      if (currentImageUrl || previewUrl) {
        const imageUrl = currentImageUrl || previewUrl;
        const existingPath = imageUrl!.replace(`${R2_PUBLIC_BASE}/`, '');
        if (existingPath) {
          await r2Client.send(
            new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: existingPath })
          );
        }
      }

      // Remove URL from Supabase
      await supabase
        .from('huurders')
        .update({ profielfoto_url: null })
        .eq('id', userId);

      // Clear preview and notify parent
      setPreviewUrl(null);
      onImageUploaded('');

      toast({
        title: "Profielfoto verwijderd",
        description: "Je profielfoto is succesvol verwijderd.",
      });

    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast({
        title: "Verwijderen mislukt",
        description: "Er is een fout opgetreden bij het verwijderen van je profielfoto.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative">
        <Avatar className="w-24 h-24 cursor-pointer" onClick={openFileDialog}>
          <AvatarImage 
            src={previewUrl || currentImageUrl || undefined} 
            alt="Profielfoto"
            className="object-cover"
          />
          <AvatarFallback className="bg-gray-200">
            <Camera className="w-8 h-8 text-gray-400" />
          </AvatarFallback>
        </Avatar>
        
        {(previewUrl || currentImageUrl) && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={openFileDialog}
          disabled={isUploading}
          className="flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>{previewUrl || currentImageUrl ? 'Wijzig foto' : 'Upload foto'}</span>
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          JPG, PNG, WebP of GIF<br />
          Maximaal 5MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
