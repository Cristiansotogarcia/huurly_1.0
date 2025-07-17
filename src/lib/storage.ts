import { r2Client, R2_BUCKET, R2_PUBLIC_BASE, isR2ConfigValid } from '../integrations/cloudflare/client.ts';
import { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@/lib/logger';
import { DocumentType, DOCUMENT_STORAGE_PATHS, FILE_VALIDATION_RULES } from '@/types/documents';

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
  private readonly BUCKET_NAME = R2_BUCKET;
  private readonly MAX_FILE_SIZE = FILE_VALIDATION_RULES.maxFileSize;
  private readonly ALLOWED_TYPES = FILE_VALIDATION_RULES.allowedExtensions;

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
      // Validate Cloudflare configuration
      if (!isR2ConfigValid || !r2Client) {
        return {
          url: null,
          path: null,
          error: new Error('Cloudflare R2 is niet correct geconfigureerd. Neem contact op met support.'),
          success: false
        };
      }

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

      // Convert File to Uint8Array for AWS SDK compatibility
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Upload file to Cloudflare R2
      await r2Client.send(
        new PutObjectCommand({
          Bucket: this.BUCKET_NAME,
          Key: filePath,
          Body: uint8Array,
          ContentType: file.type,
        })
      );

      const publicUrl = `${R2_PUBLIC_BASE}/${filePath}`;

      return {
        url: publicUrl,
        path: filePath,
        error: null,
        success: true,
      };

    } catch (error) {
      logger.error('Upload error:', error);
      return {
        url: null,
        path: null,
        error: error as Error,
        success: false
      };
    }
  }

  /**
   * Upload document with metadata (simplified for direct usage)
   */
  async uploadDocument(
    file: File,
    userId: string,
    documentType: DocumentType
  ): Promise<UploadResult> {
    try {
      // Validate Cloudflare configuration
      if (!isR2ConfigValid || !r2Client) {
        return {
          url: null,
          path: null,
          error: new Error('Cloudflare R2 is niet correct geconfigureerd. Neem contact op met support.'),
          success: false
        };
      }

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

      // Generate unique file path using standardized storage paths
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const basePath = DOCUMENT_STORAGE_PATHS[documentType];
      const filePath = `${basePath}/${userId}/${timestamp}_${randomString}_${sanitizedName}`;

      // Convert File to Uint8Array for AWS SDK compatibility
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Upload file
      await r2Client.send(
        new PutObjectCommand({
          Bucket: this.BUCKET_NAME,
          Key: filePath,
          Body: uint8Array,
          ContentType: file.type,
        })
      );

      const publicUrl = `${R2_PUBLIC_BASE}/${filePath}`;

      return {
        url: publicUrl,
        path: filePath,
        error: null,
        success: true,
      };

    } catch (error) {
      logger.error('Upload error:', error);
      return {
        url: null,
        path: null,
        error: error as Error,
        success: false
      };
    }
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
    return this.uploadFile(file, userId, 'Profile');
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      if (!isR2ConfigValid || !r2Client) {
        return {
          success: false,
          error: new Error('Cloudflare R2 is niet correct geconfigureerd. Neem contact op met support.')
        };
      }

      await r2Client.send(
        new DeleteObjectCommand({ Bucket: this.BUCKET_NAME, Key: filePath })
      );
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      logger.error('Delete error:', error);
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
      if (!isR2ConfigValid || !r2Client) {
        return {
          url: null,
          error: new Error('Cloudflare R2 is niet correct geconfigureerd. Neem contact op met support.')
        };
      }

      const command = new GetObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: filePath,
      });
      const url = await getSignedUrl(r2Client, command, { expiresIn });
      return { url, error: null };
    } catch (error) {
      logger.error('Signed URL error:', error);
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
    if (!isR2ConfigValid || !R2_PUBLIC_BASE) {
      return '';
    }
    return `${R2_PUBLIC_BASE}/${filePath}`;
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
      if (!isR2ConfigValid || !r2Client) {
        return false;
      }

      await r2Client.send(
        new HeadObjectCommand({ Bucket: this.BUCKET_NAME, Key: filePath })
      );
      return true;
    } catch (error) {
      logger.error('File exists check error:', error);
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string): Promise<any> {
    try {
      if (!isR2ConfigValid || !r2Client) {
        return null;
      }

      const { Metadata } = await r2Client.send(
        new HeadObjectCommand({ Bucket: this.BUCKET_NAME, Key: filePath })
      );
      return Metadata || null;
    } catch (error) {
      logger.error('Get file metadata error:', error);
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
      if (!isR2ConfigValid || !r2Client) {
        return {
          files: [],
          error: new Error('Cloudflare R2 is niet correct geconfigureerd. Neem contact op met support.')
        };
      }

      const { Contents } = await r2Client.send(
        new ListObjectsV2Command({ Bucket: this.BUCKET_NAME, Prefix: folderPath, MaxKeys: limit })
      );
      return {
        files: Contents || [],
        error: null,
      };
    } catch (error) {
      logger.error('List files error:', error);
      return {
        files: [],
        error: error as Error,
      };
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
