import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse, PaginationOptions, SortOptions } from '@/lib/database';
import { storageService } from '@/lib/storage';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface CreateDocumentData {
  documentType: 'identity' | 'payslip' | 'employment_contract' | 'reference';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

export interface UpdateDocumentData {
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedBy?: string;
}

export interface DocumentFilters {
  userId?: string;
  documentType?: 'identity' | 'payslip' | 'employment_contract' | 'reference';
  status?: 'pending' | 'approved' | 'rejected';
  searchTerm?: string;
}

export class DocumentService extends DatabaseService {
  /**
   * Upload and create document record
   */
  async uploadDocument(
    file: File,
    documentType: 'identity' | 'payslip' | 'employment_contract' | 'reference'
  ): Promise<DatabaseResponse<Tables<'user_documents'>>> {
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
      const storageDocumentType = this.mapDocumentTypeForStorage(documentType);
      
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
        .from('user_documents')
        .insert({
          user_id: currentUserId,
          document_type: this.mapDocumentTypeForDatabase(documentType) as any,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          status: 'pending',
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

      await this.createAuditLog('CREATE', 'user_documents', data?.id, null, data);
      
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
  private mapDocumentTypeForDatabase(documentType: 'identity' | 'payslip' | 'employment_contract' | 'reference'): 'identity' | 'payslip' | 'employment_contract' | 'reference' {
    // Return the exact type for database storage
    return documentType;
  }

  /**
   * Map frontend document types to storage folder structure
   */
  private mapDocumentTypeForStorage(documentType: 'identity' | 'payslip' | 'employment_contract' | 'reference'): string {
    switch (documentType) {
      case 'identity':
        return 'identity';
      case 'payslip':
        return 'payslip';
      case 'employment_contract':
        return 'employment_contract';
      case 'reference':
        return 'reference';
      default:
        return 'general';
    }
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<DatabaseResponse<Tables<'user_documents'>>> {
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
        .from('user_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        return { data: null, error };
      }

      // Check if user can access this document
      const hasPermission = await this.checkUserPermission(data.user_id, ['Beoordelaar', 'Beheerder']);
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
  ): Promise<DatabaseResponse<Tables<'user_documents'>[]>> {
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
        .from('user_documents')
        .select('*')
        .eq('user_id', userId);

      // Apply filters
      if (filters?.documentType) {
        const storageType = this.mapDocumentTypeForStorage(filters.documentType);
        query = query.eq('document_type', storageType as any);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      // Order by creation date (newest first)
      query = query.order('created_at', { ascending: false });

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
  ): Promise<DatabaseResponse<any[]>> {
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
        .from('user_documents')
        .select('*')
        .eq('status', 'pending');

      // Apply sorting
      query = this.applySorting(query, sort || { column: 'created_at', ascending: true });

      // Apply pagination
      query = this.applyPagination(query, pagination);

      const { data: documents, error } = await query;

      if (error) {
        return { data: null, error };
      }

      // Add default profile info without database lookup
      const documentsWithProfiles = (documents || []).map((doc) => ({
        ...doc,
        profiles: { first_name: 'Huurder', last_name: `(${doc.user_id.substring(0, 8)})` }
      }));

      return { data: documentsWithProfiles, error: null };
    });
  }

  /**
   * Approve document (reviewers only)
   */
  async approveDocument(documentId: string): Promise<DatabaseResponse<Tables<'user_documents'>>> {
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
        .from('user_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      const { data, error } = await supabase
        .from('user_documents')
        .update({
          status: 'approved',
          approved_by: currentUserId,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('APPROVE', 'user_documents', documentId, currentData, data);

      return { data, error: null };
    });
  }

  /**
   * Reject document (reviewers only)
   */
  async rejectDocument(
    documentId: string,
    rejectionReason: string
  ): Promise<DatabaseResponse<Tables<'user_documents'>>> {
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
        .from('user_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      const { data, error } = await supabase
        .from('user_documents')
        .update({
          status: 'rejected',
          approved_by: currentUserId,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason.trim(),
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('REJECT', 'user_documents', documentId, currentData, data);

      return { data, error: null };
    });
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<DatabaseResponse<boolean>> {
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
        .from('user_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (!document) {
        throw new Error('Document niet gevonden');
      }

      // Check if user can delete this document
      const hasPermission = await this.checkUserPermission(document.user_id, ['Beoordelaar', 'Beheerder']);
      if (!hasPermission) {
        throw new Error('Geen toegang tot dit document');
      }

      // Delete from database first
      const { error: dbError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) {
        throw this.handleDatabaseError(dbError);
      }

      // Delete file from storage
      await storageService.deleteFile(document.file_path);

      await this.createAuditLog('DELETE', 'user_documents', documentId, document);

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
        .from('user_documents')
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
      const hasPermission = await this.checkUserPermission(document.user_id, ['Beoordelaar', 'Beheerder']);
      if (!hasPermission) {
        return {
          url: null,
          error: new Error('Geen toegang tot dit document')
        };
      }

      // Get signed URL for secure access
      const { url, error } = await storageService.getSignedUrl(document.file_path, 3600); // 1 hour

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
  async getDocumentStatistics(): Promise<DatabaseResponse<any>> {
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
        .from('user_documents')
        .select('status, document_type, created_at, approved_at');

      if (error) {
        throw this.handleDatabaseError(error);
      }

      // Calculate statistics
      const totalDocuments = documents?.length || 0;
      const pendingDocuments = documents?.filter(d => d.status === 'pending').length || 0;
      const approvedDocuments = documents?.filter(d => d.status === 'approved').length || 0;
      const rejectedDocuments = documents?.filter(d => d.status === 'rejected').length || 0;

      // Calculate average review time for approved documents
      const approvedWithTimes = documents?.filter(d => 
        d.status === 'approved' && d.approved_at && d.created_at
      ) || [];

      const averageReviewTime = approvedWithTimes.length > 0
        ? approvedWithTimes.reduce((sum, doc) => {
            const created = new Date(doc.created_at).getTime();
            const approved = new Date(doc.approved_at!).getTime();
            return sum + (approved - created);
          }, 0) / approvedWithTimes.length / (1000 * 60 * 60) // Convert to hours
        : 0;

      // Documents by type
      const documentsByType = documents?.reduce((acc: any, doc: any) => {
        acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
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
  async bulkApproveDocuments(documentIds: string[]): Promise<DatabaseResponse<number>> {
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
        .from('user_documents')
        .update({
          status: 'approved',
          approved_by: currentUserId,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .in('id', documentIds)
        .eq('status', 'pending') // Only approve pending documents
        .select('id');

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const approvedCount = data?.length || 0;

      await this.createAuditLog('BULK_APPROVE', 'user_documents', null, null, { 
        documentIds, 
        approvedCount 
      });

      return { data: approvedCount, error: null };
    });
  }
}

// Export singleton instance
export const documentService = new DocumentService();
