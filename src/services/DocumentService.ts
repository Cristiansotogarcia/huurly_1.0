
import { supabase } from '../integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '../lib/database';
import { ErrorHandler } from '../lib/errors';
import { logger } from '../lib/logger';
import { storageService } from '../lib/storage';
import { 
  DocumentType, 
  DocumentStatus, 
  Document,
  DocumentUploadData,
  DocumentReviewData,
  DOCUMENT_STORAGE_PATHS,
  validateDocumentType,
  validateDocumentStatus
} from '@/types/documents';

export class DocumentService extends DatabaseService {
  async uploadDocument(
    file: File,
    documentType: DocumentType,
    userId: string
  ): Promise<DatabaseResponse<Document>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Validate document type
      if (!validateDocumentType(documentType)) {
        throw new Error(`Ongeldig documenttype: ${documentType}`);
      }

      // Upload to Cloudflare R2 using storage service with proper path
      const uploadResult = await storageService.uploadFile(file, userId, DOCUMENT_STORAGE_PATHS[documentType]);
      
      if (!uploadResult.success || !uploadResult.path) {
        throw ErrorHandler.createFileUploadError(uploadResult.error?.message || 'Upload failed');
      }

      const { data: document, error: dbError } = await supabase
        .from('documenten')
        .insert({
          huurder_id: userId,
          type: documentType,
          bestand_url: uploadResult.path,
          bestandsnaam: file.name,
          status: 'wachtend',
          aangemaakt_op: new Date().toISOString(),
          bijgewerkt_op: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbError) {
        throw ErrorHandler.handleDatabaseError(dbError);
      }

      await this.createAuditLog('DOCUMENT_UPLOAD', 'documenten', document.id, userId, document);

      return { data: document, error: null };
    });
  }

  async getDocuments(userId: string): Promise<DatabaseResponse<Document[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('documenten')
        .select('*')
        .eq('huurder_id', userId)
        .order('aangemaakt_op', { ascending: false });

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: data || [], error: null };
    });
  }

  async getDocumentsForReview(): Promise<DatabaseResponse<Document[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('documenten')
        .select(`
          *,
          huurders (
            naam,
            email
          )
        `)
        .eq('status', 'wachtend')
        .order('aangemaakt_op', { ascending: true });

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: data || [], error: null };
    });
  }

  async reviewDocument(
    documentId: string,
    status: 'goedgekeurd' | 'afgekeurd',
    notes?: string
  ): Promise<DatabaseResponse<Document>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('documenten')
        .update({
          status,
          beoordelaar_id: currentUserId,
          beoordeling_notitie: notes || null,
          bijgewerkt_op: new Date().toISOString(),
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      await this.createAuditLog('DOCUMENT_REVIEW', 'documenten', documentId, currentUserId, {
        status,
        notes,
      });

      return { data, error: null };
    });
  }

  async deleteDocument(documentId: string, userId: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data: document } = await supabase
        .from('documenten')
        .select('bestand_url')
        .eq('id', documentId)
        .eq('huurder_id', userId)
        .single();

      if (document?.bestand_url) {
        await storageService.deleteFile(document.bestand_url);
      }

      const { error } = await supabase
        .from('documenten')
        .delete()
        .eq('id', documentId)
        .eq('huurder_id', userId);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      await this.createAuditLog('DOCUMENT_DELETE', 'documenten', documentId, userId, null);

      return { data: true, error: null };
    });
  }

  async getDocumentUrl(documentId: string, userId: string): Promise<DatabaseResponse<string>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data: document, error } = await supabase
        .from('documenten')
        .select('bestand_url')
        .eq('id', documentId)
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      const signedUrlResult = await storageService.getSignedUrl(document.bestand_url, 300);

      if (!signedUrlResult.url) {
        throw new Error('Kon geen toegang verkrijgen tot document');
      }

      return { data: signedUrlResult.url, error: null };
    });
  }

  async getDocumentStats(): Promise<DatabaseResponse<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('documenten')
        .select('status');

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      const stats = {
        total: data.length,
        pending: data.filter(doc => doc.status === 'wachtend').length,
        approved: data.filter(doc => doc.status === 'goedgekeurd').length,
        rejected: data.filter(doc => doc.status === 'afgekeurd').length,
      };

      return { data: stats, error: null };
    });
  }
}

export const documentService = new DocumentService();
