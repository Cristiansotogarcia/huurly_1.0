
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/NotificationService';
import { Bell, Send, Users, FileText, Calendar, AlertTriangle } from 'lucide-react';

export const NotificationTester = () => {
  const [recipientId, setRecipientId] = useState('');
  const [notificationType, setNotificationType] = useState('document_uploaded');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const notificationTypes = [
    { value: 'document_uploaded', label: 'Document Geüpload', icon: FileText },
    { value: 'document_approved', label: 'Document Goedgekeurd', icon: FileText },
    { value: 'document_rejected', label: 'Document Afgewezen', icon: FileText },
    { value: 'viewing_invitation', label: 'Bezichtiging Uitnodiging', icon: Calendar },
    { value: 'property_application', label: 'Eigendom Aanvraag', icon: Users },
    { value: 'system_announcement', label: 'Systeem Mededeling', icon: AlertTriangle }
  ];

  const demoRecipients = [
    { id: 'beoordelaar-demo-id', label: 'Beoordelaar (Demo)', role: 'beoordelaar' },
    { id: 'verhuurder-demo-id', label: 'Verhuurder (Demo)', role: 'verhuurder' },
    { id: 'huurder-demo-id', label: 'Huurder (Demo)', role: 'huurder' }
  ];

  const handleSendNotification = async () => {
    if (!recipientId || !title || !message) {
      toast({
        title: 'Fout',
        description: 'Vul alle velden in',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending test notification:', {
        recipientId,
        notificationType,
        title,
        message
      });

      const result = await notificationService.createNotification({
        userId: recipientId,
        type: notificationType,
        title,
        message,
        relatedType: 'test'
      });

      if (result.success) {
        toast({
          title: 'Notificatie verzonden!',
          description: `Test notificatie is verzonden naar ${recipientId}`,
        });
        
        // Reset form
        setTitle('');
        setMessage('');
        console.log('Test notification sent successfully');
      } else {
        toast({
          title: 'Fout bij verzenden',
          description: result.error?.message || 'Er is iets misgegaan',
          variant: 'destructive'
        });
        console.error('Failed to send test notification:', result.error);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: 'Fout bij verzenden',
        description: 'Er is een onverwachte fout opgetreden',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTest = (type: string) => {
    const recipient = demoRecipients[0]; // Default to beoordelaar
    setRecipientId(recipient.id);
    
    switch (type) {
      case 'document_upload':
        setNotificationType('document_uploaded');
        setTitle('Nieuw document te beoordelen');
        setMessage('Een huurder heeft een identiteitsbewijs geüpload voor beoordeling.');
        break;
      case 'document_approval':
        setNotificationType('document_approved');
        setTitle('Document goedgekeurd!');
        setMessage('Je identiteitsbewijs is goedgekeurd en geverifieerd.');
        break;
      case 'viewing_invitation':
        setNotificationType('viewing_invitation');
        setTitle('Uitnodiging voor bezichtiging');
        setMessage('Je bent uitgenodigd voor een bezichtiging van Straatweg 123, Amsterdam op 20 juni 2025.');
        break;
      case 'application_received':
        setNotificationType('property_application');
        setTitle('Nieuwe huuranvraag');
        setMessage('Jan Jansen heeft een aanvraag ingediend voor je woning aan de Straatweg 123.');
        break;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificatie Tester - Real-time Cross-Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Test Buttons */}
        <div className="space-y-2">
          <Label>Snelle Tests</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTest('document_upload')}
            >
              Document Upload Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTest('document_approval')}
            >
              Document Goedkeuring
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTest('viewing_invitation')}
            >
              Bezichtiging Uitnodiging
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickTest('application_received')}
            >
              Aanvraag Ontvangen
            </Button>
          </div>
        </div>

        {/* Manual Configuration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Ontvanger</Label>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer ontvanger" />
              </SelectTrigger>
              <SelectContent>
                {demoRecipients.map((recipient) => (
                  <SelectItem key={recipient.id} value={recipient.id}>
                    {recipient.label} ({recipient.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Notificatie Type</Label>
            <Select value={notificationType} onValueChange={setNotificationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notificatie titel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Bericht</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notificatie bericht"
              rows={3}
            />
          </div>

          <Button
            onClick={handleSendNotification}
            disabled={isLoading || !recipientId || !title || !message}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Verzenden...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Verzend Test Notificatie
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Test Instructies:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Gebruik de snelle test knoppen of configureer handmatig</li>
            <li>2. Open meerdere dashboard tabs om real-time updates te zien</li>
            <li>3. Notificaties verschijnen direct in de notificatie bell</li>
            <li>4. Cross-dashboard functionaliteit werkt tussen alle rollen</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
