
import { supabase } from '../integrations/supabase/client';
import { BaseService, ServiceResponse, ValidationError, PermissionError } from './BaseService';
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
import { isTenant, hasRole } from '@/utils/roleUtils';
import { validateFile, ValidationPresets } from '@/utils/validationUtils';

export class DocumentService extends BaseService {
  constructor() {
    super('DocumentService');
  }
  async uploadDocument(
    file: File,
    documentType: DocumentType,
    userId: string
  ): Promise<ServiceResponse<Document>> {
    return this.executeAuthenticatedOperation(async (currentUserId) => {
      // Validate user authorization
      if (currentUserId !== userId) {
        throw new PermissionError('Alleen eigen documenten kunnen worden geüpload');
      }

      // Validate user role
      const { data: gebruiker } = await supabase
        .from('gebruikers')
        .select('rol')
        .eq('id', currentUserId)
        .single();

      if (!gebruiker || !isTenant(gebruiker.rol)) {
        throw new PermissionError('Alleen huurders kunnen documenten uploaden');
      }

      // Validate inputs
      const fileValidation = validateFile(file, ['image/jpeg', 'image/png', 'application/pdf'], 10);
      if (!fileValidation.isValid) {
        throw new ValidationError(fileValidation.error!);
      }

      if (!validateDocumentType(documentType)) {
        throw new ValidationError(`Ongeldig documenttype: ${documentType}`);
      }

      // Ensure huurder record exists before upload
      await this.ensureHuurderExists(userId);

      // Upload to Cloudflare R2 using storage service with proper path
      const uploadResult = await storageService.uploadFile(file, userId, DOCUMENT_STORAGE_PATHS[documentType]);
      
      if (!uploadResult.success || !uploadResult.path) {
        throw new Error(uploadResult.error?.message || 'Bestand upload mislukt');
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
        // Handle specific foreign key constraint error
        if (dbError.code === '23503' && dbError.message?.includes('huurder_id')) {
          throw new Error('Huurder profiel niet gevonden. Probeer opnieuw in te loggen of neem contact op met support.');
        }
        
        throw this.handleDatabaseError(dbError);
      }

      await this.createStandardAuditLog('DOCUMENT_UPLOAD', 'documenten', document.id, null, document, userId);

      return document;
    }, 'uploadDocument', file.name);
  }

  async getDocuments(userId: string): Promise<ServiceResponse<Document[]>> {
    return this.executeAuthenticatedOperation(async (currentUserId) => {
      // Validate user authorization
      if (currentUserId !== userId) {
        throw new PermissionError('Alleen eigen documenten kunnen worden bekeken');
      }

      const { data, error } = await supabase
        .from('documenten')
        .select('*')
        .eq('huurder_id', userId)
        .order('aangemaakt_op', { ascending: false });

      if (error) {
        throw this.handleDatabaseError(error);
      }

      return data || [];
    }, 'getDocuments', userId);
  }

  async getDocumentsForReview(): Promise<ServiceResponse<Document[]>> {
    return this.executeServiceOperation(async () => {
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
        throw this.handleDatabaseError(error);
      }

      return data || [];
    }, { operation: 'getDocumentsForReview' });
  }

  async reviewDocument(
    documentId: string,
    status: 'goedgekeurd' | 'afgekeurd',
    notes?: string
  ): Promise<ServiceResponse<Document>> {
    return this.executeAuthenticatedOperation(async (currentUserId) => {
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
        throw this.handleDatabaseError(error);
      }

      await this.createStandardAuditLog('DOCUMENT_REVIEW', 'documenten', documentId, {
        status,
        notes,
      });

      return data;
    }, 'reviewDocument', documentId, { status, notes });
  }

  async deleteDocument(documentId: string, userId: string): Promise<ServiceResponse<boolean>> {
    return this.executeAuthenticatedOperation(async (currentUserId) => {
      if (currentUserId !== userId) {
        throw new PermissionError('Alleen eigen documenten kunnen worden verwijderd');
      }

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
        throw this.handleDatabaseError(error);
      }

      await this.createStandardAuditLog('DOCUMENT_DELETE', 'documenten', documentId, null);

      return true;
    }, 'deleteDocument', documentId, { userId });
  }

  async getDocumentUrl(documentId: string, userId: string): Promise<ServiceResponse<string>> {
    return this.executeAuthenticatedOperation(async (currentUserId) => {
      const { data: document, error } = await supabase
        .from('documenten')
        .select('bestand_url')
        .eq('id', documentId)
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const signedUrlResult = await storageService.getSignedUrl(document.bestand_url, 300);

      if (!signedUrlResult.url) {
        throw new Error('Kon geen toegang verkrijgen tot document');
      }

      return signedUrlResult.url;
    }, 'getDocumentUrl', documentId, { userId });
  }

  async getDocumentStats(): Promise<ServiceResponse<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }>> {
    return this.executeServiceOperation(async () => {
      const { data, error } = await supabase
        .from('documenten')
        .select('status');

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const stats = {
        total: data.length,
        pending: data.filter(doc => doc.status === 'wachtend').length,
        approved: data.filter(doc => doc.status === 'goedgekeurd').length,
        rejected: data.filter(doc => doc.status === 'afgekeurd').length,
      };

      return stats;
    }, { operation: 'getDocumentStats' });
  }

  /**
   * Ensure huurder record exists for the user
   * This prevents foreign key constraint errors when uploading documents
   */
  private async ensureHuurderExists(userId: string): Promise<void> {
    // Check if huurder record exists
    const { data: existingHuurder, error: huurderError } = await supabase
      .from('huurders')
      .select('id')
      .eq('id', userId)
      .single();

    if (huurderError && huurderError.code !== 'PGRST116') {
      throw this.handleDatabaseError(huurderError);
    }

    // If huurder doesn't exist, create one
    if (!existingHuurder) {
      const { error: createError } = await supabase
        .from('huurders')
        .insert({
          id: userId,
          aangemaakt_op: new Date().toISOString(),
          bijgewerkt_op: new Date().toISOString(),
        });

      if (createError) {
        throw this.handleDatabaseError(createError);
      }

      // Huurder record created successfully
    }
  }
}

export const documentService = new DocumentService();
export type { DocumentType, Document };
