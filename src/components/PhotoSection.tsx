import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { ProfilePicture } from '@/components/ProfilePicture';
import { CoverPhoto } from '@/components/CoverPhoto';
import { useHuurder } from '@/hooks/useHuurder';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const PhotoSection: React.FC = () => {
  const { user } = useAuthStore();
  const { profilePictureUrl, coverPhotoUrl, refresh, isLoading } = useHuurder();
  const { toast } = useToast();

  const handleProfilePictureUploaded = async (url: string) => {
    if (!user?.id) return;
    
    try {
      await refresh();
      toast({
        title: "Profielfoto bijgewerkt",
        description: "Je profielfoto is succesvol bijgewerkt."
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      toast({
        title: "Fout",
        description: "Kon profielfoto niet bijwerken.",
        variant: "destructive"
      });
    }
  };

  const handleCoverPhotoUploaded = async (url: string) => {
    if (!user?.id) return;
    
    try {
      await refresh();
      toast({
        title: "Cover foto bijgewerkt",
        description: "Je cover foto is succesvol bijgewerkt."
      });
    } catch (error) {
      console.error('Error updating cover photo:', error);
      toast({
        title: "Fout",
        description: "Kon cover foto niet bijwerken.",
        variant: "destructive"
      });
    }
  };

  // Get current cover photo URL from the hook
  const getCurrentCoverUrl = () => {
    return coverPhotoUrl;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cover Photo */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Cover Foto</h2>
        <CoverPhoto
          userId={user?.id || ''}
          currentImageUrl={getCurrentCoverUrl()}
          onImageUploaded={handleCoverPhotoUploaded}
        />
      </div>

      {/* Profile Picture */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Profielfoto</h2>
        <ProfilePicture
          userId={user?.id || ''}
          currentImageUrl={profilePictureUrl}
          onImageUploaded={handleProfilePictureUploaded}
          size="large"
        />
      </div>
    </div>
  );
};
