import { supabase } from '@/integrations/supabase/client';
import { PaginationOptions, SortOptions } from '@/lib/database';
import { storageService } from '@/lib/storage';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { BaseService, ServiceResponse, ValidationError, PermissionError } from './BaseService';

export interface CreateDocumentData {
  documentSoort: 'identiteit' | 'loonstrook' | 'arbeidscontract' | 'referentie';
  bestandsnaam: string;
  bestandspad: string;
  bestandsgrootte: number;
  mimeType: string;
}

export interface UpdateDocumentData {
  status?: 'in_behandeling' | 'goedgekeurd' | 'afgekeurd';
  afkeuringsreden?: string;
  goedgekeurdDoor?: string;
}

export interface DocumentFilters {
  gebruikerId?: string;
  documentSoort?: 'identiteit' | 'loonstrook' | 'arbeidscontract' | 'referentie';
  status?: 'in_behandeling' | 'goedgekeurd' | 'afgekeurd';
  zoekterm?: string;
}

export class DocumentService extends BaseService {
  constructor() {
    super('DocumentService');
  }
  /**
   * Upload and create document record
   */
  async uploadDocument(
    file: File,
    documentSoort: 'identiteit' | 'loonstrook' | 'arbeidscontract' | 'referentie'
  ): Promise<ServiceResponse<Tables<'documenten'>>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    try {
      // Map the document types to the storage folder structure
      const storageDocumentType = this.mapDocumentTypeForStorage(documentSoort);
      
      // Generate unique file path
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `documents/${storageDocumentType}/${currentUserId}/${timestamp}_${randomString}_${sanitizedName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return {
          data: null,
          error: new Error('Fout bij uploaden van bestand naar storage'),
          success: false,
        };
      }

      // Create document record in database
      const { data, error } = await supabase
        .from('documenten')
        .insert({
          gebruiker_id: currentUserId,
          document_soort: this.mapDocumentTypeForDatabase(documentSoort),
          bestandsnaam: file.name,
          bestandspad: filePath,
          bestandsgrootte: file.size,
          mime_type: file.type,
          status: 'in_behandeling',
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        // If database insert fails, clean up uploaded file
        await supabase.storage.from('documents').remove([filePath]);
        return {
          data: null,
          error: new Error('Fout bij opslaan van document gegevens'),
          success: false,
        };
      }

      await this.createAuditLog('CREATE', 'documenten', data?.id, null, data);
      
      return {
        data,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Upload mislukt'),
        success: false,
      };
    }
  }

  /**
   * Map frontend document types to database document types
   */
  private mapDocumentTypeForDatabase(documentSoort: 'identiteit' | 'loonstrook' | 'arbeidscontract' | 'referentie'): 'identiteit' | 'loonstrook' | 'arbeidscontract' | 'referentie' {
    // Return the exact type for database storage
    return documentSoort;
  }


  /**
   * Map frontend document types to storage folder structure
   */
  private mapDocumentTypeForStorage(documentSoort: 'identiteit' | 'loonstrook' | 'arbeidscontract' | 'referentie'): string {
    switch (documentSoort) {
      case 'identiteit':
        return 'identity';
      case 'loonstrook':
        return 'payslip';
      case 'arbeidscontract':
        return 'employment_contract';
      case 'referentie':
        return 'reference';
      default:
        return 'general';
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<ServiceResponse<Tables<'documenten'>>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('documenten')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        return { data: null, error };
      }

      // Check if user can access this document
      const hasPermission = await this.checkUserPermission(data.gebruiker_id, ['Beoordelaar', 'Beheerder']);
      if (!hasPermission) {
        throw new Error('Geen toegang tot dit document');
      }

      return { data, error: null };
    });
  }

  /**
   * Get documents by user
   */
  async getDocumentsByUser(
    userId: string,
    filters?: DocumentFilters
  ): Promise<ServiceResponse<Tables<'documenten'>[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check if user can access these documents
    const hasPermission = await this.checkUserPermission(userId, ['Beoordelaar', 'Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze documenten'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      let query = supabase
        .from('documenten')
        .select('*')
        .eq('gebruiker_id', userId);

      // Apply filters
      if (filters?.documentSoort) {
        const dbType = this.mapDocumentTypeForDatabase(filters.documentSoort);
        query = query.eq('document_soort', dbType);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      // Order by creation date (newest first)
      query = query.order('aangemaakt_op', { ascending: false });

      const { data, error } = await query;

      return { data, error };
    });
  }

  /**
   * Get pending documents for review (reviewers only)
   */
  async getPendingDocuments(
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<ServiceResponse<any[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check if user is a reviewer
    const hasPermission = await this.checkUserPermission(currentUserId, ['Beoordelaar', 'Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot documentbeoordeling'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get the pending documents without profile lookup
      let query = supabase
        .from('documenten')
        .select('*')
        .eq('status', 'in_behandeling');

      // Apply sorting
      query = this.applySorting(query, sort || { column: 'aangemaakt_op', ascending: true });

      // Apply pagination
      query = this.applyPagination(query, pagination);

      const { data: documents, error } = await query;

      if (error) {
        return { data: null, error };
      }

      // Add default profile info without database lookup
      const documentsWithProfiles = (documents || []).map((doc) => ({
        ...doc,
        profiles: { first_name: 'Huurder', last_name: `(${doc.gebruiker_id.substring(0, 8)})` }
      }));

      return { data: documentsWithProfiles, error: null };
    });
  }

  /**
   * Approve document (reviewers only)
   */
  async approveDocument(documentId: string): Promise<ServiceResponse<Tables<'documenten'>>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check if user is a reviewer
    const hasPermission = await this.checkUserPermission(currentUserId, ['Beoordelaar', 'Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot documentbeoordeling'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get current document data for audit log
      const { data: currentData } = await supabase
        .from('documenten')
        .select('*')
        .eq('id', documentId)
        .single();

      const { data, error } = await supabase
        .from('documenten')
        .update({
          status: 'goedgekeurd',
          goedgekeurd_door: currentUserId,
          goedgekeurd_op: new Date().toISOString(),
          afkeuringsreden: null,
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('APPROVE', 'documenten', documentId, currentData, data);

      return { data, error: null };
    });
  }

  /**
   * Reject document (reviewers only)
   */
  async rejectDocument(
    documentId: string,
    rejectionReason: string
  ): Promise<ServiceResponse<Tables<'documenten'>>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check if user is a reviewer
    const hasPermission = await this.checkUserPermission(currentUserId, ['Beoordelaar', 'Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot documentbeoordeling'),
        success: false,
      };
    }

    if (!rejectionReason.trim()) {
      return {
        data: null,
        error: new Error('Reden voor afwijzing is verplicht'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get current document data for audit log
      const { data: currentData } = await supabase
        .from('documenten')
        .select('*')
        .eq('id', documentId)
        .single();

      const { data, error } = await supabase
          .from('documenten')
          .update({
            status: 'afgekeurd',
            goedgekeurd_door: currentUserId,
            goedgekeurd_op: new Date().toISOString(),
            afkeuringsreden: rejectionReason
          })
          .eq('id', documentId)
          .select()
          .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('REJECT', 'documenten', documentId, currentData, data);

      return { data, error: null };
    });
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<ServiceResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get document data first
      const { data: document } = await supabase
        .from('documenten')
        .select('*')
        .eq('id', documentId)
        .single();

      if (!document) {
        throw new Error('Document niet gevonden');
      }

      // Check if user can delete this document
      const hasPermission = await this.checkUserPermission(document.gebruiker_id, ['Beoordelaar', 'Beheerder']);
      if (!hasPermission) {
        throw new Error('Geen toegang tot dit document');
      }

      // Delete from database first
      const { error: dbError } = await supabase
        .from('documenten')
        .delete()
        .eq('id', documentId);

      if (dbError) {
        throw this.handleDatabaseError(dbError);
      }

      // Delete file from storage
      await storageService.deleteFile(document.bestandspad);

      await this.createAuditLog('DELETE', 'documenten', documentId, document);

      return { data: true, error: null };
    });
  }

  /**
   * Get document download URL
   */
  async getDocumentUrl(documentId: string): Promise<{ url: string | null; error: Error | null }> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        url: null,
        error: new Error('Niet geautoriseerd')
      };
    }

    try {
      // Get document data
      const { data: document } = await supabase
        .from('documenten')
        .select('*')
        .eq('id', documentId)
        .single();

      if (!document) {
        return {
          url: null,
          error: new Error('Document niet gevonden')
        };
      }

      // Check if user can access this document
      const hasPermission = await this.checkUserPermission(document.gebruiker_id, ['Beoordelaar', 'Beheerder']);
      if (!hasPermission) {
        return {
          url: null,
          error: new Error('Geen toegang tot dit document')
        };
      }

      // Get signed URL for secure access
      const { url, error } = await storageService.getSignedUrl(document.bestandspad, 3600); // 1 hour

      return { url, error };
    } catch (error) {
      return {
        url: null,
        error: error as Error
      };
    }
  }

  /**
   * Get document statistics (reviewers only)
   */
  async getDocumentStatistics(): Promise<ServiceResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check if user is a reviewer
    const hasPermission = await this.checkUserPermission(currentUserId, ['Beoordelaar', 'Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot statistieken'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get all documents
      const { data: documents, error } = await supabase
        .from('documenten')
        .select('status, document_soort, aangemaakt_op, goedgekeurd_op');

      if (error) {
        throw this.handleDatabaseError(error);
      }

      // Calculate statistics
      const totalDocuments = documents?.length || 0;
      const pendingDocuments = documents?.filter(d => d.status === 'in_behandeling').length || 0;
      const approvedDocuments = documents?.filter(d => d.status === 'goedgekeurd').length || 0;
      const rejectedDocuments = documents?.filter(d => d.status === 'afgekeurd').length || 0;

      // Calculate average review time for approved documents
      const approvedWithTimes = documents?.filter(d => 
        d.status === 'goedgekeurd' && d.goedgekeurd_op && d.aangemaakt_op
      ) || [];

      const averageReviewTime = approvedWithTimes.length > 0
        ? approvedWithTimes.reduce((sum, doc) => {
            const created = new Date(doc.aangemaakt_op).getTime();
            const approved = new Date(doc.goedgekeurd_op!).getTime();
            return sum + (approved - created);
          }, 0) / approvedWithTimes.length / (1000 * 60 * 60) // Convert to hours
        : 0;

      // Documents by type
      const documentsByType = documents?.reduce((acc: any, doc: any) => {
        acc[doc.document_soort] = (acc[doc.document_soort] || 0) + 1;
        return acc;
      }, {}) || {};

      const statistics = {
        totalDocuments,
        pendingDocuments,
        approvedDocuments,
        rejectedDocuments,
        averageReviewTimeHours: Math.round(averageReviewTime * 100) / 100,
        documentsByType,
        approvalRate: totalDocuments > 0 ? (approvedDocuments / totalDocuments) * 100 : 0,
      };

      return { data: statistics, error: null };
    });
  }

  /**
   * Bulk approve documents (reviewers only)
   */
  async bulkApproveDocuments(documentIds: string[]): Promise<ServiceResponse<number>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check if user is a reviewer
    const hasPermission = await this.checkUserPermission(currentUserId, ['Beoordelaar', 'Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot documentbeoordeling'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('documenten')
        .update({
          status: 'goedgekeurd',
          goedgekeurd_door: currentUserId,
          goedgekeurd_op: new Date().toISOString(),
          afkeuringsreden: null,
        })
        .in('id', documentIds)
        .eq('status', 'in_behandeling') // Only approve pending documents
        .select('id');

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const approvedCount = data?.length || 0;

      await this.createAuditLog('BULK_APPROVE', 'documenten', null, null, { 
        documentIds, 
        approvedCount 
      });

      return { data: approvedCount, error: null };
    });
  }
}

// Export singleton instance
export const documentService = new DocumentService();
