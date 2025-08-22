import { useState, useEffect } from 'react';
import { messageService, Message, MessageThread } from '@/services/MessageService';
import { useToast } from '@/hooks/use-toast';

export interface UseMessagingReturn {
  threads: MessageThread[];
  messages: Message[];
  selectedThread: MessageThread | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedThreadId: string | null;
  setSelectedThreadId: (id: string | null) => void;
  refreshThreads: () => Promise<void>;
  refreshMessages: (otherUserId: string, woningId?: string) => Promise<void>;
  sendMessage: (data: { ontvanger_id: string; woning_id?: string; onderwerp?: string; inhoud: string }) => Promise<boolean>;
  markAsRead: (otherUserId: string, woningId?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  getUnreadCount: () => Promise<number>;
}

export const useMessaging = (): UseMessagingReturn => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThread] = useState<MessageThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshThreads = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await messageService.getMessageThreads();
      if (result.success && result.data) {
        setThreads(result.data);
      } else {
        throw new Error(result.error?.message || 'Fout bij laden van berichten');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Onbekende fout';
      setError(errorMessage);
      toast({
        title: 'Fout bij laden',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshMessages = async (otherUserId: string, woningId?: string) => {
    try {
      const result = await messageService.getMessages(otherUserId, woningId);
      if (result.success && result.data) {
        setMessages(result.data);
      } else {
        throw new Error(result.error?.message || 'Fout bij laden van gesprek');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Onbekende fout';
      setError(errorMessage);
      toast({
        title: 'Fout bij laden',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async (data: { 
    ontvanger_id: string; 
    woning_id?: string; 
    onderwerp?: string; 
    inhoud: string 
  }): Promise<boolean> => {
    try {
      const result = await messageService.sendMessage(data);
      if (result.success) {
        toast({
          title: 'Bericht verzonden',
          description: 'Je bericht is succesvol verzonden.',
        });
        return true;
      } else {
        throw new Error(result.error?.message || 'Fout bij verzenden');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Onbekende fout';
      setError(errorMessage);
      toast({
        title: 'Fout bij verzenden',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const markAsRead = async (otherUserId: string, woningId?: string) => {
    try {
      const result = await messageService.markMessagesAsRead(otherUserId, woningId);
      if (!result.success) {
        throw new Error(result.error?.message || 'Fout bij markeren als gelezen');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Onbekende fout';
      setError(errorMessage);
      toast({
        title: 'Fout bij markeren',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const deleteMessage = async (messageId: string): Promise<boolean> => {
    try {
      const result = await messageService.deleteMessage(messageId);
      if (result.success) {
        toast({
          title: 'Bericht verwijderd',
          description: 'Het bericht is succesvol verwijderd.',
        });
        return true;
      } else {
        throw new Error(result.error?.message || 'Fout bij verwijderen');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Onbekende fout';
      setError(errorMessage);
      toast({
        title: 'Fout bij verwijderen',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const getUnreadCount = async (): Promise<number> => {
    try {
      const result = await messageService.getUnreadMessageCount();
      if (result.success && result.data !== null) {
        return result.data;
      }
      return 0;
    } catch (err) {
      return 0;
    }
  };

  useEffect(() => {
    refreshThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      refreshMessages(selectedThread.other_user_id, selectedThread.woning_id);
    }
  }, [selectedThread]);

  return {
    threads,
    messages,
    selectedThread,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedThreadId,
    setSelectedThreadId,
    refreshThreads,
    refreshMessages,
    sendMessage,
    markAsRead,
    deleteMessage,
    getUnreadCount
  };
};
