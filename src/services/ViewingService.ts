
import { DatabaseResponse } from '@/lib/database';
import { supabase } from '@/integrations/supabase/client';
import { BaseService } from './BaseService';

export interface ViewingInvitation {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  viewing_date: string;
  viewing_time: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateViewingInvitationData {
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  viewing_date: string;
  viewing_time: string;
  message?: string;
}

export class ViewingService extends BaseService {
  async createViewingInvitation(data: CreateViewingInvitationData): Promise<DatabaseResponse<ViewingInvitation>> {
    try {
      console.log('Creating viewing invitation:', data);

      // For now, we'll store this in the messages table as a workaround
      // since the viewing_invitations table doesn't exist in the current schema
      const { data: messageData, error } = await supabase
        .from('messages')
        .insert({
          sender_id: data.landlord_id,
          recipient_id: data.tenant_id,
          subject: 'Uitnodiging voor bezichtiging',
          content: data.message || `Uitnodiging voor bezichtiging op ${data.viewing_date} om ${data.viewing_time}`,
          message_type: 'viewing_invitation',
          related_data: {
            property_id: data.property_id,
            viewing_date: data.viewing_date,
            viewing_time: data.viewing_time
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating viewing invitation:', error);
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code
          }
        };
      }

      // Transform message data to viewing invitation format
      const viewingInvitation: ViewingInvitation = {
        id: messageData.id,
        property_id: data.property_id,
        tenant_id: data.tenant_id,
        landlord_id: data.landlord_id,
        viewing_date: data.viewing_date,
        viewing_time: data.viewing_time,
        status: 'pending',
        message: data.message,
        created_at: messageData.created_at,
        updated_at: messageData.created_at
      };

      return {
        success: true,
        data: viewingInvitation
      };
    } catch (error) {
      console.error('Unexpected error creating viewing invitation:', error);
      return this.handleError(error, 'Failed to create viewing invitation');
    }
  }

  async getViewingInvitations(userId: string, userType: 'tenant' | 'landlord'): Promise<DatabaseResponse<ViewingInvitation[]>> {
    try {
      console.log('Getting viewing invitations for user:', userId, 'type:', userType);

      const recipientField = userType === 'tenant' ? 'recipient_id' : 'sender_id';
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq(recipientField, userId)
        .eq('message_type', 'viewing_invitation')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting viewing invitations:', error);
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code
          }
        };
      }

      // Transform messages to viewing invitations
      const viewingInvitations: ViewingInvitation[] = data.map(message => ({
        id: message.id,
        property_id: message.related_data?.property_id || '',
        tenant_id: userType === 'tenant' ? userId : message.related_data?.tenant_id || '',
        landlord_id: userType === 'landlord' ? userId : message.sender_id || '',
        viewing_date: message.related_data?.viewing_date || '',
        viewing_time: message.related_data?.viewing_time || '',
        status: 'pending', // Default status since we don't track this in messages
        message: message.content,
        created_at: message.created_at,
        updated_at: message.created_at
      }));

      return {
        success: true,
        data: viewingInvitations
      };
    } catch (error) {
      console.error('Unexpected error getting viewing invitations:', error);
      return this.handleError(error, 'Failed to get viewing invitations');
    }
  }

  async respondToViewingInvitation(
    invitationId: string, 
    response: 'accepted' | 'declined',
    message?: string
  ): Promise<DatabaseResponse<boolean>> {
    try {
      console.log('Responding to viewing invitation:', invitationId, 'response:', response);

      // Update the original message to mark it as read
      const { error } = await supabase
        .from('messages')
        .update({ 
          read_at: new Date().toISOString(),
          related_data: {
            status: response,
            response_message: message
          }
        })
        .eq('id', invitationId);

      if (error) {
        console.error('Error responding to viewing invitation:', error);
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code
          }
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Unexpected error responding to viewing invitation:', error);
      return this.handleError(error, 'Failed to respond to viewing invitation');
    }
  }
}

export const viewingService = new ViewingService();
