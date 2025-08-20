import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Send, 
  User, 
  Home, 
  Check, 
  Clock, 
  Search,
  Filter,
  Archive,
  MoreHorizontal
} from 'lucide-react';
import { messageService } from '@/services/MessageService';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  verzender_id: string;
  ontvanger_id: string;
  woning_id?: string;
  onderwerp?: string;
  inhoud: string;
  gelezen: boolean;
  aangemaakt_op: string;
}

interface MessageThread {
  other_user_id: string;
  other_user_name: string;
  other_user_email: string;
  latest_message: string;
  latest_message_date: string;
  unread_count: number;
  woning_id?: string;
  woning_titel?: string;
}

const MessageInbox: React.FC = () => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadMessageThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.other_user_id, selectedThread.woning_id);
    }
  }, [selectedThread]);

  const loadMessageThreads = async () => {
    setLoading(true);
    try {
      const result = await messageService.getMessageThreads();
      if (result.success && result.data) {
        setThreads(result.data);
      }
    } catch (error) {
      toast({
        title: 'Fout bij laden',
        description: 'Er is een fout opgetreden bij het laden van je berichten.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string, woningId?: string) => {
    try {
      const result = await messageService.getMessages(otherUserId, woningId);
      if (result.success && result.data) {
        setMessages(result.data);
      }
    } catch (error) {
      toast({
        title: 'Fout bij laden',
        description: 'Er is een fout opgetreden bij het laden van het gesprek.',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedThread || !newMessage.trim()) return;

    try {
      const result = await messageService.sendMessage({
        ontvanger_id: selectedThread.other_user_id,
        woning_id: selectedThread.woning_id,
        onderwerp: selectedThread.woning_titel ? `Over ${selectedThread.woning_titel}` : undefined,
        inhoud: newMessage.trim()
      });

      if (result.success) {
        setNewMessage('');
        // Refresh messages and threads
        await loadMessages(selectedThread.other_user_id, selectedThread.woning_id);
        await loadMessageThreads();
        toast({
          title: 'Bericht verzonden',
          description: 'Je bericht is succesvol verzonden.',
        });
      } else {
        throw new Error(result.error?.message || 'Fout bij verzenden');
      }
    } catch (error) {
      toast({
        title: 'Fout bij verzenden',
        description: 'Er is een fout opgetreden bij het verzenden van je bericht.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('nl-NL', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' });
    }
  };

  const filteredThreads = threads.filter(thread => 
    thread.other_user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.latest_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (thread.woning_titel && thread.woning_titel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Berichten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Berichten
          {threads.some(t => t.unread_count > 0) && (
            <Badge variant="destructive" className="ml-2">
              {threads.reduce((sum, t) => sum + t.unread_count, 0)}
            </Badge>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col">
        {threads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Geen berichten</h3>
            <p className="text-gray-500 mb-4">
              Je hebt nog geen berichten ontvangen. Hier verschijnen je gesprekken met verhuurders.
            </p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Zoek in berichten..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Thread List */}
              <div className="w-full md:w-80 border-r flex flex-col">
                <ScrollArea className="flex-1">
                  <div className="divide-y">
                    {filteredThreads.map((thread) => (
                      <div
                        key={`${thread.other_user_id}-${thread.woning_id || 'general'}`}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          selectedThread?.other_user_id === thread.other_user_id && 
                          selectedThread?.woning_id === thread.woning_id
                            ? 'bg-blue-50 border-r-2 border-blue-500'
                            : ''
                        }`}
                        onClick={() => setSelectedThread(thread)}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={``} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">
                                {thread.other_user_name}
                              </p>
                              <span className="text-xs text-gray-500">
                                {formatDate(thread.latest_message_date)}
                              </span>
                            </div>
                            {thread.woning_titel && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Home className="h-3 w-3 mr-1" />
                                <span className="truncate">{thread.woning_titel}</span>
                              </div>
                            )}
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {thread.latest_message}
                            </p>
                          </div>
                          {thread.unread_count > 0 && (
                            <Badge variant="destructive" className="h-5">
                              {thread.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Message View */}
              <div className="flex-1 hidden md:flex flex-col border-l">
                {selectedThread ? (
                  <>
                    {/* Message Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={``} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{selectedThread.other_user_name}</p>
                          {selectedThread.woning_titel && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Home className="h-3 w-3 mr-1" />
                              <span>{selectedThread.woning_titel}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.verzender_id === selectedThread.other_user_id
                                ? 'justify-start'
                                : 'justify-end'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.verzender_id === selectedThread.other_user_id
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'bg-blue-500 text-white'
                              }`}
                            >
                              <p className="text-sm">{message.inhoud}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.verzender_id === selectedThread.other_user_id
                                    ? 'text-gray-500'
                                    : 'text-blue-100'
                                }`}
                              >
                                {formatDate(message.aangemaakt_op)}
                                {message.verzender_id !== selectedThread.other_user_id && (
                                  <span className="ml-1">
                                    {message.gelezen ? (
                                      <Check className="inline h-3 w-3" />
                                    ) : (
                                      <Clock className="inline h-3 w-3" />
                                    )}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="Typ je bericht..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1 resize-none"
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="self-end"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Selecteer een gesprek om te beginnen</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageInbox;
