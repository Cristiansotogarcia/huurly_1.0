import { supabase } from '@/integrations/supabase/client'

export interface UploadResult {
  url: string | null;
  path: string | null;
  error: Error | null;
  success: boolean;
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
}

export class SignedUrlStorageService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];

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

    // Check if file name is valid
    if (file.name.length > 255) {
      return {
        isValid: false,
        error: 'Bestandsnaam is te lang.'
      };
    }

    return { isValid: true };
  }

  /**
   * Generate signed URL for direct upload to Cloudflare R2
   */
  async generateSignedUrl(
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
          path: null,
          error: new Error(validation.error),
          success: false
        };
      }

      // Generate unique file path
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${folder}/${userId}/${timestamp}_${randomString}_${sanitizedName}`;

      // Call Supabase Edge Function to generate signed URL
      const { data, error } = await supabase.functions.invoke('generate-upload-url', {
        body: {
          fileName: file.name,
          fileType: file.type,
          userId,
          folder
        }
      });

      if (error) {
        throw error;
      }

      if (!data.signedUrl || !data.publicUrl) {
        throw new Error('Failed to generate signed URL');
      }

      return {
        url: data.publicUrl,
        path: filePath,
        error: null,
        success: true,
      };

    } catch (error) {
      console.error('Error generating signed URL:', error);
      return {
        url: null,
        path: null,
        error: error as Error,
        success: false
      };
    }
  }

  /**
   * Upload file using signed URL (bypasses CORS)
   */
  async uploadFile(
    file: File,
    userId: string,
    folder: string = 'general'
  ): Promise<UploadResult> {
    try {
      // Generate signed URL
      const signedResult = await this.generateSignedUrl(file, userId, folder);
      
      if (!signedResult.success || !signedResult.url) {
        return signedResult;
      }

      // Upload file directly to Cloudflare R2 using signed URL
      const response = await fetch(signedResult.url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      return {
        url: signedResult.url,
        path: signedResult.path,
        error: null,
        success: true,
      };

    } catch (error) {
      console.error('Upload error:', error);
      return {
        url: null,
        path: null,
        error: error as Error,
        success: false
      };
    }
  }

  /**
   * Upload profile picture using signed URL
   */
  async uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
    return this.uploadFile(file, userId, 'Profile');
  }

  /**
   * Upload document using signed URL
   */
  async uploadDocument(file: File, userId: string, documentType: string): Promise<UploadResult> {
    const folder = documentType.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    return this.uploadFile(file, userId, folder);
  }

  /**
   * Upload property image using signed URL
   */
  async uploadPropertyImage(file: File, userId: string, propertyId: string): Promise<UploadResult> {
    return this.uploadFile(file, userId, `properties/${propertyId}`);
  }

  /**
   * Delete file (placeholder - would need server-side implementation)
   */
  async deleteFile(_filePath: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      // For signed URL approach, deletion would need a separate server function
      // This is a placeholder for now
      console.warn('File deletion not implemented for signed URL approach');
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  /**
   * Get public URL for file
   */
  getPublicUrl(filePath: string): string {
    // Use Cloudflare Images instead of R2 for profile/cover photos
    const accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
    if (accountId && (filePath.includes('Profile') || filePath.includes('Cover'))) {
      // This is a Cloudflare Images ID - use imagedelivery.net
      return `https://imagedelivery.net/${accountId}/${filePath}/public`;
    }
    
    // Check if this is an image file (Profile, Cover, or in beelden bucket)
    if (filePath.includes('Profile') || filePath.includes('Cover') || filePath.includes('beelden')) {
      // Use custom domain for images
      return `https://beelden.huurly.nl/${filePath}`;
    }
    
    // For documents, use the documents custom domain
    return `https://documents.huurly.nl/${filePath}`;
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
export const signedStorageService = new SignedUrlStorageService();
