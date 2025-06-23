
import { supabase } from '../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse } from '../lib/database.ts';
import { ErrorHandler } from '../lib/errors.ts';
import { storageService } from '../lib/storage.ts';
import { Tables, TablesInsert } from '../integrations/supabase/types.ts';
import { logger } from '../lib/logger.ts';

export type Document = Tables<'documenten'>;
export type DocumentInsert = TablesInsert<'documenten'>;

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
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Bestand validatie mislukt');
      }

      const fileUploadResult = await storageService.uploadFile(file, 'documents', currentUserId);
      if (!fileUploadResult.success || !fileUploadResult.url) {
        throw new Error('Bestand upload mislukt');
      }

      const documentData: DocumentInsert = {
        huurder_id: currentUserId,
        bestandsnaam: file.name,
        type: documentType,
        bestand_url: fileUploadResult.url,
        status: 'wachtend',
        omschrijving: description,
      };

      const { data, error } = await supabase
        .from('documenten')
        .insert(documentData)
        .select()
        .single();

      if (error) {
        if (fileUploadResult.path) {
          await storageService.deleteFile(fileUploadResult.path);
        }
        throw ErrorHandler.handleDatabaseError(error);
      }

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

  async getUserDocuments(userId?: string): Promise<DatabaseResponse<Document[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

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
        .eq('huurder_id', targetUserId)
        .order('aangemaakt_op', { ascending: false });

      return { data, error };
    });
  }

  async getPendingDocuments(): Promise<DatabaseResponse<Document[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

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
        .order('aangemaakt_op', { ascending: true });

      return { data, error };
    });
  }

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
          beoordelaar_id: currentUserId,
          beoordeling_notitie: reviewNotes,
          bijgewerkt_op: new Date().toISOString(),
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

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
      const { data: document, error: fetchError } = await supabase
        .from('documenten')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        throw ErrorHandler.handleDatabaseError(fetchError);
      }

      if (document.huurder_id !== currentUserId) {
        const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
        if (!hasPermission) {
          throw new Error('Geen toegang tot dit document');
        }
      }

      if (document.bestand_url) {
        const path = document.bestand_url.split('/').pop();
        if (path) {
          await storageService.deleteFile(path);
        }
      }

      const { error: deleteError } = await supabase
        .from('documenten')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        throw ErrorHandler.handleDatabaseError(deleteError);
      }

      await this.createAuditLog('DOCUMENT_DELETED', 'documenten', documentId, document, null);

      logger.info('Document deleted', {
        documentId,
        userId: currentUserId,
        fileName: document.bestandsnaam,
      });

      return { data: undefined, error: null };
    });
  }

  validateFile(file: File): DocumentValidation {
    const errors: string[] = [];
    const suggestions: string[] = [];

    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`Bestand is te groot (${this.formatFileSize(file.size)}). Maximum toegestaan: ${this.formatFileSize(this.MAX_FILE_SIZE)}`);
      suggestions.push('Compress het bestand of gebruik een kleiner bestand');
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.ALLOWED_FILE_TYPES.includes(fileExtension)) {
      errors.push(`Bestandstype .${fileExtension} is niet toegestaan`);
      suggestions.push(`Toegestane bestandstypes: ${this.ALLOWED_FILE_TYPES.join(', ')}`);
    }

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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

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
      const { data: statusCounts, error: statusError } = await supabase
        .from('documenten')
        .select('status')
        .eq('huurder_id', currentUserId);

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

export const documentService = new DocumentService();
