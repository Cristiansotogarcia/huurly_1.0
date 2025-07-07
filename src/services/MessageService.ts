import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '@/lib/database';
import { ErrorHandler } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { notificationService } from './NotificationService';

export interface Message {
  id: string;
  verzender_id: string;
  ontvanger_id: string;
  woning_id?: string;
  onderwerp?: string;
  inhoud: string;
  gelezen: boolean;
  aangemaakt_op: string;
}

export interface CreateMessageData {
  ontvanger_id: string;
  woning_id?: string;
  onderwerp?: string;
  inhoud: string;
}

export interface MessageThread {
  other_user_id: string;
  other_user_name: string;
  other_user_email: string;
  latest_message: string;
  latest_message_date: string;
  unread_count: number;
  woning_id?: string;
  woning_titel?: string;
}

export class MessageService extends DatabaseService {
  async sendMessage(data: CreateMessageData): Promise<DatabaseResponse<Message>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data: message, error } = await supabase
        .from('berichten')
        .insert({
          verzender_id: currentUserId,
          ontvanger_id: data.ontvanger_id,
          woning_id: data.woning_id,
          onderwerp: data.onderwerp,
          inhoud: data.inhoud,
          gelezen: false,
        })
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Get sender name for notification
      const { data: sender } = await supabase
        .from('gebruikers')
        .select('naam')
        .eq('id', currentUserId)
        .single();

      // Send notification to recipient
      await notificationService.notifyNewMessage(
        data.ontvanger_id,
        sender?.naam || 'Onbekende gebruiker',
        data.onderwerp
      );

      await this.createAuditLog('CREATE', 'berichten', message.id, currentUserId, message);

      return { data: message, error: null };
    });
  }

  async getMessages(otherUserId: string, woningId?: string): Promise<DatabaseResponse<Message[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      let query = supabase
        .from('berichten')
        .select('*')
        .or(`and(verzender_id.eq.${currentUserId},ontvanger_id.eq.${otherUserId}),and(verzender_id.eq.${otherUserId},ontvanger_id.eq.${currentUserId})`)
        .order('aangemaakt_op', { ascending: true });

      if (woningId) {
        query = query.eq('woning_id', woningId);
      }

      const { data, error } = await query;

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Mark messages from other user as read
      await supabase
        .from('berichten')
        .update({ gelezen: true })
        .eq('verzender_id', otherUserId)
        .eq('ontvanger_id', currentUserId)
        .eq('gelezen', false);

      return { data: data || [], error: null };
    });
  }

  async getMessageThreads(): Promise<DatabaseResponse<MessageThread[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get all messages where current user is sender or receiver
      const { data: messages, error } = await supabase
        .from('berichten')
        .select(`
          *,
          verzender:gebruikers!berichten_verzender_id_fkey(naam, email),
          ontvanger:gebruikers!berichten_ontvanger_id_fkey(naam, email),
          woning:woningen(titel)
        `)
        .or(`verzender_id.eq.${currentUserId},ontvanger_id.eq.${currentUserId}`)
        .order('aangemaakt_op', { ascending: false });

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Group messages by conversation partner
      const threadMap = new Map();

      messages?.forEach((message: any) => {
        const isCurrentUserSender = message.verzender_id === currentUserId;
        const otherUserId = isCurrentUserSender ? message.ontvanger_id : message.verzender_id;
        const otherUser = isCurrentUserSender ? message.ontvanger : message.verzender;

        const threadKey = `${otherUserId}-${message.woning_id || 'general'}`;

        if (!threadMap.has(threadKey)) {
          threadMap.set(threadKey, {
            other_user_id: otherUserId,
            other_user_name: otherUser?.naam || 'Onbekend',
            other_user_email: otherUser?.email || '',
            latest_message: message.inhoud,
            latest_message_date: message.aangemaakt_op,
            unread_count: 0,
            woning_id: message.woning_id,
            woning_titel: message.woning?.titel,
            messages: []
          });
        }

        const thread = threadMap.get(threadKey);
        thread.messages.push(message);

        // Count unread messages (messages from other user that are unread)
        if (!isCurrentUserSender && !message.gelezen) {
          thread.unread_count++;
        }

        // Update latest message if this one is newer
        if (new Date(message.aangemaakt_op) > new Date(thread.latest_message_date)) {
          thread.latest_message = message.inhoud;
          thread.latest_message_date = message.aangemaakt_op;
        }
      });

      const threads = Array.from(threadMap.values()).map(thread => {
        const { messages, ...threadWithoutMessages } = thread;
        return threadWithoutMessages;
      });

      return { data: threads, error: null };
    });
  }

  async markMessagesAsRead(otherUserId: string, woningId?: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      let query = supabase
        .from('berichten')
        .update({ gelezen: true })
        .eq('verzender_id', otherUserId)
        .eq('ontvanger_id', currentUserId)
        .eq('gelezen', false);

      if (woningId) {
        query = query.eq('woning_id', woningId);
      }

      const { error } = await query;

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: true, error: null };
    });
  }

  async getUnreadMessageCount(): Promise<DatabaseResponse<number>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { count, error } = await supabase
        .from('berichten')
        .select('*', { count: 'exact', head: true })
        .eq('ontvanger_id', currentUserId)
        .eq('gelezen', false);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: count || 0, error: null };
    });
  }

  async deleteMessage(messageId: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { error } = await supabase
        .from('berichten')
        .delete()
        .eq('id', messageId)
        .eq('verzender_id', currentUserId);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      await this.createAuditLog('DELETE', 'berichten', messageId, currentUserId, null);

      return { data: true, error: null };
    });
  }
}

export const messageService = new MessageService();