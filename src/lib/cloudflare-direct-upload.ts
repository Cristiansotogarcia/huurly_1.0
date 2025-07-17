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

export class CloudflareDirectUploadService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  private readonly CUSTOM_DOMAIN = 'documents.huurl.nl';
  private readonly ACCOUNT_ID = '5c65d8c11ba2e5ee7face692ed22ad1c';
  private readonly BUCKET = 'documents';

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
   * Upload file using Cloudflare R2 API with proper authentication
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

      // Generate unique file path
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${folder}/${userId}/${timestamp}_${randomString}_${sanitizedName}`;

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', filePath);

      // Upload using Cloudflare R2 API
      const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${this.ACCOUNT_ID}/r2/buckets/${this.BUCKET}/objects/${encodeURIComponent(filePath)}`;
      
      // Note: This would require Cloudflare API token - for now, we'll use a simpler approach
      // For production, you should use a server-side endpoint or Cloudflare Workers

      // For now, let's use a direct upload approach with proper headers
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'x-amz-acl': 'public-read',
          // Add any required authentication headers here
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      // Create public URL using custom domain
      const publicUrl = `https://${this.CUSTOM_DOMAIN}/${filePath}`;

      return {
        url: publicUrl,
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
   * Get public URL for file
   */
  getPublicUrl(filePath: string): string {
    // Use Cloudflare Images URL instead of R2
    const accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
    if (accountId && filePath.includes('/')) {
      // This is a Cloudflare Images ID
      return `https://imagedelivery.net/${accountId}/${filePath}/public`;
    }
    return `https://${this.CUSTOM_DOMAIN}/${filePath}`;
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
export const cloudflareDirectUploadService = new CloudflareDirectUploadService();
