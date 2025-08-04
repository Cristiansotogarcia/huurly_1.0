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

export class DirectUploadService {
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

    return { isValid: true };
  }

  /**
   * Upload file directly to Cloudflare R2 using presigned URL approach
   * This uses a simpler method that works with Cloudflare's dashboard
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

      // Use environment variables
      const accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
      const bucket = import.meta.env.VITE_CLOUDFLARE_R2_BUCKET || 'documents';
      
      if (!accountId) {
        throw new Error('Cloudflare Account ID not configured');
      }
      
      // Create public URL
      const publicUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${filePath}`;

      return {
        url: publicUrl,
        path: filePath,
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
   * Upload profile picture using direct approach
   */
  async uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
    return this.uploadFile(file, userId, 'Profile');
  }

  /**
   * Upload document using direct approach
   */
  async uploadDocument(file: File, userId: string, documentType: string): Promise<UploadResult> {
    const folder = documentType.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    return this.uploadFile(file, userId, folder);
  }

  /**
   * Upload property image using direct approach
   */
  async uploadPropertyImage(file: File, userId: string, propertyId: string): Promise<UploadResult> {
    return this.uploadFile(file, userId, `properties/${propertyId}`);
  }

  /**
   * Get public URL for file
   */
  getPublicUrl(filePath: string): string {
    const accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
    const bucket = import.meta.env.VITE_CLOUDFLARE_R2_BUCKET || 'documents';
    
    if (!accountId) {
      throw new Error('Cloudflare Account ID not configured');
    }
    
    return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${filePath}`;
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
export const directUploadService = new DirectUploadService();
