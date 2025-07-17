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

export class CloudflareR2EdgeUploadService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];

  /**
   * Validate file before upload
   */
  validateFile(file: File): FileValidation {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Bestand is te groot. Maximum grootte is 10MB.`
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
   * Upload file using Supabase Edge Function
   */
  async uploadFile(
    file: File,
    userId: string,
    folder: string = 'general'
  ): Promise<UploadResult> {
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

      // Create FormData for edge function
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('folder', folder);

      // Upload via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('cloudflare-r2-upload', {
        body: formData,
      });

      if (error) {
        console.error('Edge function upload error:', error);
        return {
          url: null,
          error: new Error(error.message || 'Upload failed'),
          success: false
        };
      }

      if (!data?.success || !data?.url) {
        return {
          url: null,
          error: new Error(data?.error || 'Upload failed'),
          success: false
        };
      }

      return {
        url: data.url,
        error: null,
        success: true,
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
   * Upload profile picture and update Supabase
   */
  async uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
    try {
      const uploadResult = await this.uploadFile(file, userId, 'Profile');
      
      if (!uploadResult.success || !uploadResult.url) {
        return uploadResult;
      }

      // Update Supabase with the new URL
      const { error } = await supabase
        .from('huurders')
        .update({ profiel_foto: uploadResult.url })
        .eq('id', userId);

      if (error) {
        console.error('Error updating Supabase:', error);
        return {
          url: null,
          error: new Error('Failed to update profile picture in database'),
          success: false
        };
      }

      return uploadResult;
    } catch (error) {
      console.error('Error in uploadProfilePicture:', error);
      return {
        url: null,
        error: error as Error,
        success: false
      };
    }
  }

  /**
   * Upload cover photo and update Supabase
   */
  async uploadCoverPhoto(file: File, userId: string): Promise<UploadResult> {
    try {
      const uploadResult = await this.uploadFile(file, userId, 'Cover');
      
      if (!uploadResult.success || !uploadResult.url) {
        return uploadResult;
      }

      // Update Supabase with the new URL
      const { error } = await supabase
        .from('huurders')
        .update({ cover_foto: uploadResult.url })
        .eq('id', userId);

      if (error) {
        console.error('Error updating Supabase:', error);
        return {
          url: null,
          error: new Error('Failed to update cover photo in database'),
          success: false
        };
      }

      return uploadResult;
    } catch (error) {
      console.error('Error in uploadCoverPhoto:', error);
      return {
        url: null,
        error: error as Error,
        success: false
      };
    }
  }

  /**
   * Upload document and update Supabase
   */
  async uploadDocument(
    file: File,
    userId: string,
    documentType: 'identiteit' | 'inkomen' | 'referentie' | 'uittreksel_bkr' | 'arbeidscontract'
  ): Promise<UploadResult> {
    try {
      const uploadResult = await this.uploadFile(file, userId, `documents/${documentType}`);
      
      if (!uploadResult.success || !uploadResult.url) {
        return uploadResult;
      }

      // Create document record in Supabase
      const { error } = await supabase
        .from('documenten')
        .insert({
          huurder_id: userId,
          type: documentType,
          bestand_url: uploadResult.url,
          bestandsnaam: file.name,
          status: 'wachtend',
          aangemaakt_op: new Date().toISOString(),
          bijgewerkt_op: new Date().toISOString(),
        });

      if (error) {
        console.error('Error creating document record:', error);
        return {
          url: null,
          error: new Error('Failed to create document record'),
          success: false
        };
      }

      return uploadResult;
    } catch (error) {
      console.error('Error in uploadDocument:', error);
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
export const cloudflareR2EdgeUploadService = new CloudflareR2EdgeUploadService();
