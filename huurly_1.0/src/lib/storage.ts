import { supabase } from '@/integrations/supabase/client';

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

export class StorageService {
  private readonly BUCKET_NAME = 'documents';
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

  /**
   * Validate file before upload
   */
  validateFile(file: File): FileValidation {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Bestand is te groot. Maximum grootte is ${this.formatFileSize(this.MAX_FILE_SIZE)}.`
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
   * Generate unique file path
   */
  private generateFilePath(userId: string, fileName: string, folder: string = 'general'): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split('.').pop();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    return `${folder}/${userId}/${timestamp}_${randomString}_${sanitizedName}`;
  }

  /**
   * Upload file to Supabase Storage
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
      const filePath = this.generateFilePath(userId, file.name, folder);

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        return {
          url: null,
          path: null,
          error: new Error('Fout bij uploaden van bestand'),
          success: false
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
        error: null,
        success: true
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
   * Upload document with metadata
   */
  async uploadDocument(
    file: File,
    userId: string,
    documentType: 'identity' | 'payslip'
  ): Promise<UploadResult> {
    return this.uploadFile(file, userId, `documents/${documentType}`);
  }

  /**
   * Upload property image
   */
  async uploadPropertyImage(
    file: File,
    userId: string,
    propertyId: string
  ): Promise<UploadResult> {
    return this.uploadFile(file, userId, `properties/${propertyId}`);
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(
    file: File,
    userId: string
  ): Promise<UploadResult> {
    return this.uploadFile(file, userId, 'profiles');
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Storage delete error:', error);
        return {
          success: false,
          error: new Error('Fout bij verwijderen van bestand')
        };
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error as Error
      };
    }
  }

  /**
   * Get signed URL for private file access
   */
  async getSignedUrl(
    filePath: string,
    expiresIn: number = 3600
  ): Promise<{ url: string | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Signed URL error:', error);
        return {
          url: null,
          error: new Error('Fout bij genereren van toegangslink')
        };
      }

      return {
        url: data.signedUrl,
        error: null
      };
    } catch (error) {
      console.error('Signed URL error:', error);
      return {
        url: null,
        error: error as Error
      };
    }
  }

  /**
   * Get public URL for file
   */
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
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

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(filePath.split('/').slice(0, -1).join('/'));

      if (error) {
        return false;
      }

      const fileName = filePath.split('/').pop();
      return data.some(file => file.name === fileName);
    } catch (error) {
      console.error('File exists check error:', error);
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string): Promise<any> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(filePath.split('/').slice(0, -1).join('/'));

      if (error) {
        throw error;
      }

      const fileName = filePath.split('/').pop();
      const file = data.find(f => f.name === fileName);
      
      return file || null;
    } catch (error) {
      console.error('Get file metadata error:', error);
      return null;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(
    folderPath: string,
    limit: number = 100
  ): Promise<{ files: any[]; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(folderPath, {
          limit,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('List files error:', error);
        return {
          files: [],
          error: new Error('Fout bij ophalen van bestanden')
        };
      }

      return {
        files: data || [],
        error: null
      };
    } catch (error) {
      console.error('List files error:', error);
      return {
        files: [],
        error: error as Error
      };
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
