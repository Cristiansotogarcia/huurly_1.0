import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string | null;
  error: Error | null;
  success: boolean;
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
}

export class CloudflareR2UploadService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  private readonly CUSTOM_DOMAIN = 'documents.huurly.nl';

  /**
   * Validate file before upload
   */
  validateFile(file: File): FileValidation {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Bestand is te groot. Maximum grootte is 5MB.`
      };
    }

    // Check file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.ALLOWED_TYPES.includes(extension)) {
      return {
        isValid: false,
        error: `Bestandstype niet toegestaan. Toegestane types: ${this.ALLOWED_TYPES.join(', ')}.`
      };
    }

    return { isValid: true };
  }

  /**
   * Upload profile picture using Supabase Edge Function
   */
  async uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          url: null,
          error: new Error(validation.error),
          success: false
        };
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('folder', 'Profile');

      // Upload using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('cloudflare-r2-upload', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message || 'Upload failed');
      }

      if (!data?.success || !data?.url) {
        throw new Error(data?.error || 'Upload failed');
      }

      // Update Supabase with the new URL
      const { error: updateError } = await supabase
        .from('huurders')
        .update({ profiel_foto: data.url })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating Supabase:', updateError);
        return {
          url: null,
          error: new Error('Failed to update profile picture in database'),
          success: false
        };
      }

      return {
        url: data.url,
        error: null,
        success: true
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        url: null,
        error: error as Error,
        success: false
      };
    }
  }

  /**
   * Upload cover photo using Supabase Edge Function
   */
  async uploadCoverPhoto(file: File, userId: string): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          url: null,
          error: new Error(validation.error),
          success: false
        };
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('folder', 'Cover');

      // Upload using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('cloudflare-r2-upload', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message || 'Upload failed');
      }

      if (!data?.success || !data?.url) {
        throw new Error(data?.error || 'Upload failed');
      }

      // Update Supabase with the new URL
      const { error: updateError } = await supabase
        .from('huurders')
        .update({ cover_foto: data.url })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating Supabase:', updateError);
        return {
          url: null,
          error: new Error('Failed to update cover photo in database'),
          success: false
        };
      }

      return {
        url: data.url,
        error: null,
        success: true
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        url: null,
        error: error as Error,
        success: false
      };
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const cloudflareR2UploadService = new CloudflareR2UploadService();
