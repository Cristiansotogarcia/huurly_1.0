import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse, PaginationOptions, SortOptions } from '@/lib/database';

export interface CreateViewingInvitationData {
  propertyId: string;
  tenantId: string;
  scheduledDate: string;
  deadline: string;
  message?: string;
}

export interface UpdateViewingInvitationData {
  status?: 'pending' | 'accepted' | 'rejected' | 'expired';
  message?: string;
  actualDate?: string;
}

export interface ViewingFilters {
  propertyId?: string;
  tenantId?: string;
  landlordId?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'expired';
  dateFrom?: string;
  dateTo?: string;
}

export class ViewingService extends DatabaseService {
  /**
   * Create viewing invitation
   */
  async createViewingInvitation(
    data: CreateViewingInvitationData
  ): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // Get property to check ownership
    const { data: property } = await supabase
      .from('properties')
      .select('landlord_id')
      .eq('id', data.propertyId)
      .single();

    if (!property) {
      return {
        data: null,
        error: new Error('Woning niet gevonden'),
        success: false,
      };
    }

    // Check if user owns this property
    const hasPermission = await this.checkUserPermission(property.landlord_id, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Alleen de verhuurder kan bezichtigingen plannen'),
        success: false,
      };
    }

    const sanitizedData = this.sanitizeInput(data);
    
    const validation = this.validateRequiredFields(sanitizedData, [
      'propertyId', 'tenantId', 'scheduledDate', 'deadline'
    ]);
    if (!validation.isValid) {
      return {
        data: null,
        error: new Error(`Verplichte velden ontbreken: ${validation.missingFields.join(', ')}`),
        success: false,
      };
    }

    // Validate dates
    const scheduledDate = new Date(sanitizedData.scheduledDate);
    const deadline = new Date(sanitizedData.deadline);
    const now = new Date();

    if (scheduledDate <= now) {
      return {
        data: null,
        error: new Error('Bezichtigingsdatum moet in de toekomst liggen'),
        success: false,
      };
    }

    if (deadline <= now) {
      return {
        data: null,
        error: new Error('Deadline moet in de toekomst liggen'),
        success: false,
      };
    }

    if (deadline >= scheduledDate) {
      return {
        data: null,
        error: new Error('Deadline moet voor de bezichtigingsdatum liggen'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // @ts-ignore - Suppress Supabase type recursion error
      const { data, error } = await supabase
        .from('viewing_invitations')
        .insert({
          tenant_id: sanitizedData.tenantId,
          landlord_id: currentUserId,
          property_address: sanitizedData.propertyId, // Using property_address as per schema
          proposed_date: sanitizedData.scheduledDate, // Using proposed_date as per schema
          message_id: sanitizedData.message,
          status: 'pending',
        })
        .select(`
          *,
          properties(title, address, city),
          tenant_profiles!viewing_invitations_tenant_id_fkey(
            profiles!tenant_profiles_user_id_fkey(first_name, last_name)
          )
        `)
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      // Create notification for tenant
      await supabase.from('notifications').insert({
        user_id: sanitizedData.tenantId,
        type: 'viewing_invitation',
        title: 'Nieuwe bezichtigingsuitnodiging',
        message: `Je bent uitgenodigd voor een bezichtiging op ${new Date(sanitizedData.scheduledDate).toLocaleDateString('nl-NL')}.`,
        related_id: data.id,
        is_read: false,
      });

      await this.createAuditLog('CREATE', 'viewing_invitations', data?.id, null, data);
      
      return { data, error: null };
    });
  }

  /**
   * Get viewing invitation by ID
   */
  async getViewingInvitation(invitationId: string): Promise<DatabaseResponse<any>> {
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
        .from('viewing_invitations')
        .select(`
          *,
          properties(title, address, city, rent_amount),
          tenant_profiles!viewing_invitations_tenant_id_fkey(
            profiles!tenant_profiles_user_id_fkey(first_name, last_name)
          ),
          landlord_profiles:profiles!viewing_invitations_landlord_id_fkey(first_name, last_name)
        `)
        .eq('id', invitationId)
        .single();

      if (error) {
        return { data: null, error };
      }

      // Check if user can access this invitation
      const hasPermission = await this.checkUserPermission(data.tenant_id, ['Beheerder']) ||
                           await this.checkUserPermission(data.landlord_id, ['Beheerder']);
      
      if (!hasPermission) {
        throw new Error('Geen toegang tot deze uitnodiging');
      }

      return { data, error: null };
    });
  }

  /**
   * Get viewing invitations with filters
   */
  async getViewingInvitations(
    filters?: ViewingFilters,
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

    return this.executeQuery(async () => {
      let query = supabase
        .from('viewing_invitations')
        .select(`
          *,
          properties(title, address, city, rent_amount),
          tenant_profiles!viewing_invitations_tenant_id_fkey(
            profiles!tenant_profiles_user_id_fkey(first_name, last_name)
          ),
          landlord_profiles:profiles!viewing_invitations_landlord_id_fkey(first_name, last_name)
        `);

      // Apply filters
      if (filters?.propertyId) {
        query = query.eq('property_address', filters.propertyId); // Using property_address as per schema
      }

      if (filters?.tenantId) {
        query = query.eq('tenant_id', filters.tenantId);
      }

      if (filters?.landlordId) {
        query = query.eq('landlord_id', filters.landlordId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.dateFrom) {
        query = query.gte('proposed_date', filters.dateFrom); // Using proposed_date as per schema
      }

      if (filters?.dateTo) {
        query = query.lte('proposed_date', filters.dateTo); // Using proposed_date as per schema
      }

      // Filter by user access (only show invitations user is involved in)
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUserId)
        .single();

      if (userRole?.role !== 'Manager') {
        query = query.or(`tenant_id.eq.${currentUserId},landlord_id.eq.${currentUserId}`);
      }

      // Apply sorting
      query = this.applySorting(query, sort || { column: 'proposed_date', ascending: true });

      // Apply pagination
      query = this.applyPagination(query, pagination);

      const { data, error } = await query;

      return { data, error };
    });
  }

  /**
   * Respond to viewing invitation (tenant only)
   */
  async respondToInvitation(
    invitationId: string,
    response: 'accepted' | 'rejected',
    message?: string
  ): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get invitation to check tenant
      const { data: invitation } = await supabase
        .from('viewing_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (!invitation) {
        throw new Error('Uitnodiging niet gevonden');
      }

      // Check if user is the tenant
      if (invitation.tenant_id !== currentUserId) {
        throw new Error('Alleen de uitgenodigde huurder kan reageren');
      }

      // Check if invitation is still pending
      if (invitation.status !== 'pending') {
        throw new Error('Deze uitnodiging is al beantwoord');
      }

      // Check if deadline has passed (using proposed_date as fallback since deadline doesn't exist in schema)
      const deadline = new Date(invitation.proposed_date);
      const now = new Date();
      
      if (now > deadline) {
        // Auto-expire the invitation
        await supabase
          .from('viewing_invitations')
          .update({ status: 'expired' })
          .eq('id', invitationId);
        
        throw new Error('De deadline voor deze uitnodiging is verstreken');
      }

      // Update invitation
      const { data, error } = await supabase
        .from('viewing_invitations')
        .update({
          status: response,
          response_message: message,
          responded_at: new Date().toISOString(),
        })
        .eq('id', invitationId)
        .select(`
          *,
          properties(title, address, city),
          tenant_profiles!viewing_invitations_tenant_id_fkey(
            profiles!tenant_profiles_user_id_fkey(first_name, last_name)
          )
        `)
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      // Create notification for landlord
      await supabase.from('notifications').insert({
        user_id: invitation.landlord_id,
        type: 'viewing_invitation',
        title: `Bezichtiging ${response === 'accepted' ? 'geaccepteerd' : 'afgewezen'}`,
        message: `De huurder heeft je bezichtigingsuitnodiging ${response === 'accepted' ? 'geaccepteerd' : 'afgewezen'}.`,
        related_id: invitationId,
        is_read: false,
      });

      await this.createAuditLog('UPDATE', 'viewing_invitations', invitationId, invitation, data);

      return { data, error: null };
    });
  }

  /**
   * Cancel viewing invitation (landlord only)
   */
  async cancelInvitation(
    invitationId: string,
    reason?: string
  ): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get invitation to check landlord
      const { data: invitation } = await supabase
        .from('viewing_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (!invitation) {
        throw new Error('Uitnodiging niet gevonden');
      }

      // Check if user is the landlord
      const hasPermission = await this.checkUserPermission(invitation.landlord_id, ['Beheerder']);
      if (!hasPermission) {
        throw new Error('Alleen de verhuurder kan uitnodigingen annuleren');
      }

      // Update invitation to cancelled
      const { data, error } = await supabase
        .from('viewing_invitations')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      // Create notification for tenant
      await supabase.from('notifications').insert({
        user_id: invitation.tenant_id,
        type: 'viewing_invitation',
        title: 'Bezichtiging geannuleerd',
        message: `De verhuurder heeft de bezichtiging geannuleerd. ${reason ? `Reden: ${reason}` : ''}`,
        related_id: invitationId,
        is_read: false,
      });

      await this.createAuditLog('CANCEL', 'viewing_invitations', invitationId, invitation, data);

      return { data, error: null };
    });
  }

  /**
   * Mark viewing as completed
   */
  async markViewingCompleted(
    invitationId: string,
    notes?: string
  ): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get invitation
      const { data: invitation } = await supabase
        .from('viewing_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (!invitation) {
        throw new Error('Uitnodiging niet gevonden');
      }

      // Check if user is involved in this viewing
      const hasPermission = await this.checkUserPermission(invitation.tenant_id, ['Beheerder']) ||
                           await this.checkUserPermission(invitation.landlord_id, ['Beheerder']);
      
      if (!hasPermission) {
        throw new Error('Geen toegang tot deze bezichtiging');
      }

      // Check if viewing was accepted
      if (invitation.status !== 'accepted') {
        throw new Error('Alleen geaccepteerde bezichtigingen kunnen als voltooid worden gemarkeerd');
      }

      // Update invitation
      const { data, error } = await supabase
        .from('viewing_invitations')
        .update({
          status: 'completed',
          completion_notes: notes,
          completed_at: new Date().toISOString(),
        })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('COMPLETE', 'viewing_invitations', invitationId, invitation, data);

      return { data, error: null };
    });
  }

  /**
   * Get viewing statistics
   */
  async getViewingStatistics(userId?: string): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // If userId is provided, check permissions
    if (userId) {
      const hasPermission = await this.checkUserPermission(userId, ['Beheerder']);
      if (!hasPermission) {
        return {
          data: null,
          error: new Error('Geen toegang tot deze statistieken'),
          success: false,
        };
      }
    }

    return this.executeQuery(async () => {
      // @ts-ignore - Suppress Supabase type recursion error
      let query = supabase.from('viewing_invitations').select('status, proposed_date, created_at');

      if (userId) {
        query = query.or(`tenant_id.eq.${userId},landlord_id.eq.${userId}`);
      }

      // @ts-ignore - Suppress Supabase type recursion error
      const { data: invitations, error } = await query;

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const totalInvitations = invitations?.length || 0;
      const pendingInvitations = invitations?.filter(i => i.status === 'pending').length || 0;
      const acceptedInvitations = invitations?.filter(i => i.status === 'accepted').length || 0;
      const rejectedInvitations = invitations?.filter(i => i.status === 'rejected').length || 0;
      const completedInvitations = invitations?.filter(i => i.status === 'completed').length || 0;
      const expiredInvitations = invitations?.filter(i => i.status === 'expired').length || 0;

      const statistics = {
        totalInvitations,
        pendingInvitations,
        acceptedInvitations,
        rejectedInvitations,
        completedInvitations,
        expiredInvitations,
        acceptanceRate: totalInvitations > 0 ? (acceptedInvitations / totalInvitations) * 100 : 0,
        completionRate: acceptedInvitations > 0 ? (completedInvitations / acceptedInvitations) * 100 : 0,
      };

      return { data: statistics, error: null };
    });
  }

  /**
   * Auto-expire overdue invitations
   */
  async expireOverdueInvitations(): Promise<DatabaseResponse<number>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze functie'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const now = new Date().toISOString();

      // @ts-ignore - Suppress Supabase type recursion error
      const { data, error } = await supabase
        .from('viewing_invitations')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lt('proposed_date', now) // Using proposed_date as per schema
        .select('id');

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const expiredCount = data?.length || 0;

      await this.createAuditLog('EXPIRE_BATCH', 'viewing_invitations', null, null, {
        expiredCount,
        expiredAt: now
      });

      return { data: expiredCount, error: null };
    });
  }
}

// Export singleton instance
export const viewingService = new ViewingService();
