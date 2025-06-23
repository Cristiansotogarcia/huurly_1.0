
import { supabase } from '../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse } from '../lib/database.ts';
import { ErrorHandler } from '../lib/errors.ts';
import { storageService } from '../lib/storage.ts';
import { Tables, TablesInsert } from '../integrations/supabase/types.ts';
import { logger } from '../lib/logger.ts';

export type Document = Tables<'documenten'>;
export type DocumentInsert = TablesInsert<'documenten'>;

// Define document types that match the database enum
export type DocumentType = 'identiteitsbewijs' | 'inkomensverklaring' | 'werkgeversverklaring' | 'bankafschrift' | 'uittreksel_bkr' | 'huurgarantie' | 'overig';

export interface DocumentUpload {
  file: File;
  type: DocumentType;
  description?: string;
}

export interface DocumentValidation {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

export class DocumentService extends DatabaseService {
  private readonly ALLOWED_FILE_TYPES = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Upload a document for a user
   */
  async uploadDocument(file: File, documentType: DocumentType, description?: string): Promise<DatabaseResponse<Document>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Bestand validatie mislukt');
      }

      // Upload file to storage
      const fileUploadResult = await storageService.uploadFile(file, 'documents', currentUserId);
      if (!fileUploadResult.success || !fileUploadResult.data) {
        throw new Error('Bestand upload mislukt');
      }

      // Create document record
      const documentData: DocumentInsert = {
        user_id: currentUserId,
        naam: file.name,
        type: documentType,
        bestandsgrootte: file.size,
        bestandspad: fileUploadResult.data.path,
        bestandsurl: fileUploadResult.data.url,
        status: 'wachtend',
        omschrijving: description,
      };

      const { data, error } = await supabase
        .from('documenten')
        .insert(documentData)
        .select()
        .single();

      if (error) {
        // Clean up uploaded file if database insert fails
        await storageService.deleteFile(fileUploadResult.data.path);
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Create audit log
      await this.createAuditLog('DOCUMENT_UPLOADED', 'documenten', data.id, null, {
        documentType,
        fileName: file.name,
        fileSize: file.size,
      });

      logger.info('Document uploaded successfully', {
        documentId: data.id,
        userId: currentUserId,
        fileName: file.name,
        type: documentType,
      });

      return { data, error: null };
    });
  }

  /**
   * Get documents for a user
   */
  async getUserDocuments(userId?: string): Promise<DatabaseResponse<Document[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    // If userId is provided, check if current user has permission to view other user's documents
    const targetUserId = userId || currentUserId;
    if (targetUserId !== currentUserId) {
      const hasPermission = await this.checkUserPermission(targetUserId, ['Beheerder', 'Beoordelaar']);
      if (!hasPermission) {
        return {
          data: null,
          error: ErrorHandler.normalize('Geen toegang tot documenten van andere gebruikers'),
          success: false,
        };
      }
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('documenten')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      return { data, error };
    });
  }

  /**
   * Get documents pending review
   */
  async getPendingDocuments(): Promise<DatabaseResponse<Document[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check if user has reviewer permissions
    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder', 'Beoordelaar']);
    if (!hasPermission) {
      return {
        data: null,
        error: ErrorHandler.normalize('Geen toegang tot documenten voor beoordeling'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('documenten')
        .select('*')
        .eq('status', 'wachtend')
        .order('created_at', { ascending: true });

      return { data, error };
    });
  }

  /**
   * Review a document (approve/reject)
   */
  async reviewDocument(
    documentId: string,
    status: 'goedgekeurd' | 'afgewezen',
    reviewNotes?: string
  ): Promise<DatabaseResponse<Document>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check if user has reviewer permissions
    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder', 'Beoordelaar']);
    if (!hasPermission) {
      return {
        data: null,
        error: ErrorHandler.normalize('Geen toegang tot document beoordeling'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('documenten')
        .update({
          status,
          reviewed_by: currentUserId,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Create audit log
      await this.createAuditLog('DOCUMENT_REVIEWED', 'documenten', documentId, null, {
        status,
        reviewerId: currentUserId,
        reviewNotes,
      });

      logger.info('Document reviewed', {
        documentId,
        status,
        reviewerId: currentUserId,
      });

      return { data, error: null };
    });
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<DatabaseResponse<void>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get document details first
      const { data: document, error: fetchError } = await supabase
        .from('documenten')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        throw ErrorHandler.handleDatabaseError(fetchError);
      }

      // Check if user owns the document or has admin permissions
      if (document.user_id !== currentUserId) {
        const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
        if (!hasPermission) {
          throw new Error('Geen toegang tot dit document');
        }
      }

      // Delete from storage
      if (document.bestandspad) {
        await storageService.deleteFile(document.bestandspad);
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('documenten')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        throw ErrorHandler.handleDatabaseError(deleteError);
      }

      // Create audit log
      await this.createAuditLog('DOCUMENT_DELETED', 'documenten', documentId, document, null);

      logger.info('Document deleted', {
        documentId,
        userId: currentUserId,
        fileName: document.naam,
      });

      return { data: undefined, error: null };
    });
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): DocumentValidation {
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`Bestand is te groot (${this.formatFileSize(file.size)}). Maximum toegestaan: ${this.formatFileSize(this.MAX_FILE_SIZE)}`);
      suggestions.push('Compress het bestand of gebruik een kleiner bestand');
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.ALLOWED_FILE_TYPES.includes(fileExtension)) {
      errors.push(`Bestandstype .${fileExtension} is niet toegestaan`);
      suggestions.push(`Toegestane bestandstypes: ${this.ALLOWED_FILE_TYPES.join(', ')}`);
    }

    // Check file name
    if (file.name.length > 255) {
      errors.push('Bestandsnaam is te lang (maximum 255 karakters)');
      suggestions.push('Hernoem het bestand met een kortere naam');
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from('documenten')
        .select('status')
        .eq('user_id', currentUserId);

      if (statusError) {
        throw ErrorHandler.handleDatabaseError(statusError);
      }

      const stats = {
        total: statusCounts.length,
        pending: statusCounts.filter(d => d.status === 'wachtend').length,
        approved: statusCounts.filter(d => d.status === 'goedgekeurd').length,
        rejected: statusCounts.filter(d => d.status === 'afgewezen').length,
      };

      return { data: stats, error: null };
    });
  }
}

// Export singleton instance
export const documentService = new DocumentService();
