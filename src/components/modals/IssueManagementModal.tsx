import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  User, 
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Flag,
  Calendar,
  ArrowRight,
  FileText,
  Mail
} from 'lucide-react';
import { BaseModal, BaseModalActions, useModalState } from './BaseModal';

interface IssueManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: any;
  onResolveIssue: (issueId: string, resolution: string) => void;
  onEscalateIssue: (issueId: string, escalationNote: string) => void;
  onAddNote: (issueId: string, note: string) => void;
}

const IssueManagementModal = ({ 
  open, 
  onOpenChange, 
  issue,
  onResolveIssue,
  onEscalateIssue,
  onAddNote
}: IssueManagementModalProps) => {
  const { toast } = useToast();
  const { isSubmitting, setIsSubmitting } = useModalState();
  const [resolution, setResolution] = useState('');
  const [escalationNote, setEscalationNote] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [showEscalationForm, setShowEscalationForm] = useState(false);

  const handleResolveIssue = () => {
    if (!resolution.trim()) {
      toast({
        title: "Oplossing vereist",
        description: "Voer een oplossing in voor dit issue.",
        variant: "destructive"
      });
      return;
    }

    onResolveIssue(issue.id, resolution);
    setShowResolutionForm(false);
    setResolution('');
    onOpenChange(false);
  };

  const handleEscalateIssue = () => {
    if (!escalationNote.trim()) {
      toast({
        title: "Escalatie notitie vereist",
        description: "Voer een reden in voor escalatie van dit issue.",
        variant: "destructive"
      });
      return;
    }

    onEscalateIssue(issue.id, escalationNote);
    setShowEscalationForm(false);
    setEscalationNote('');
    onOpenChange(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast({
        title: "Notitie vereist",
        description: "Voer een notitie in om toe te voegen.",
        variant: "destructive"
      });
      return;
    }

    onAddNote(issue.id, newNote);
    setNewNote('');
    toast({
      title: "Notitie toegevoegd",
      description: "Je notitie is toegevoegd aan het issue."
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'escalated':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'user_complaint':
        return <User className="w-4 h-4" />;
      case 'payment':
        return <FileText className="w-4 h-4" />;
      case 'verification':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  // Mock issue notes/timeline
  const issueNotes = [
    {
      id: 1,
      author: 'Beheerder',
      content: 'Issue ontvangen en toegewezen voor onderzoek.',
      timestamp: '2024-01-20T14:30:00Z',
      type: 'system'
    },
    {
      id: 2,
      author: 'Support Team',
      content: 'Eerste contact gemaakt met gebruiker. Meer informatie opgevraagd.',
      timestamp: '2024-01-20T15:45:00Z',
      type: 'note'
    },
    {
      id: 3,
      author: 'Gebruiker',
      content: 'Aanvullende screenshots toegevoegd via e-mail.',
      timestamp: '2024-01-20T16:20:00Z',
      type: 'user_response'
    }
  ];

  if (!issue) {
    return null;
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Issue Beheer - #${issue.id}`}
      icon={AlertTriangle}
      size="4xl"
    >
      <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="actions">Acties</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Issue Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {getCategoryIcon(issue.category)}
                    <span className="ml-2">Issue Informatie</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Titel:</span>
                      <span className="font-medium">{issue.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Categorie:</span>
                      <Badge variant="outline">
                        {issue.category === 'technical' ? 'Technisch' :
                         issue.category === 'user_complaint' ? 'Gebruiker Klacht' :
                         issue.category === 'payment' ? 'Betaling' :
                         issue.category === 'verification' ? 'Verificatie' : 'Overig'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prioriteit:</span>
                      <Badge className={getPriorityColor(issue.priority)}>
                        {issue.priority === 'high' ? 'Hoog' :
                         issue.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status === 'open' ? 'Open' :
                         issue.status === 'in_progress' ? 'In behandeling' :
                         issue.status === 'resolved' ? 'Opgelost' : 'Geëscaleerd'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gemeld door:</span>
                      <span className="font-medium">{issue.reportedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gemeld op:</span>
                      <span className="font-medium">
                        {new Date(issue.createdAt).toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toegewezen aan:</span>
                      <span className="font-medium">{issue.assignedTo || 'Niet toegewezen'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Issue Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Beschrijving
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Probleem beschrijving:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {issue.description}
                      </p>
                    </div>
                    
                    {issue.steps && (
                      <div>
                        <h4 className="font-medium mb-2">Stappen om te reproduceren:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-gray-700">
                          {issue.steps.map((step: string, index: number) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    
                    {issue.expectedBehavior && (
                      <div>
                        <h4 className="font-medium mb-2">Verwacht gedrag:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {issue.expectedBehavior}
                        </p>
                      </div>
                    )}
                    
                    {issue.actualBehavior && (
                      <div>
                        <h4 className="font-medium mb-2">Werkelijk gedrag:</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {issue.actualBehavior}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Gebruiker Informatie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-600">Naam:</span>
                    <p className="font-medium">{issue.userInfo?.name || 'Onbekend'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">E-mail:</span>
                    <p className="font-medium">{issue.userInfo?.email || 'Onbekend'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Rol:</span>
                    <p className="font-medium">{issue.userInfo?.role || 'Onbekend'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Browser:</span>
                    <p className="font-medium">{issue.userInfo?.browser || 'Onbekend'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">OS:</span>
                    <p className="font-medium">{issue.userInfo?.os || 'Onbekend'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Laatste activiteit:</span>
                    <p className="font-medium">
                      {issue.userInfo?.lastActivity ? 
                        new Date(issue.userInfo.lastActivity).toLocaleDateString('nl-NL') : 
                        'Onbekend'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Issue Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {issueNotes.map((note, index) => (
                    <div key={note.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        note.type === 'system' ? 'bg-blue-100' :
                        note.type === 'note' ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {note.type === 'system' ? <AlertTriangle className="w-4 h-4 text-blue-600" /> :
                         note.type === 'note' ? <MessageSquare className="w-4 h-4 text-green-600" /> :
                         <User className="w-4 h-4 text-orange-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{note.author}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(note.timestamp).toLocaleString('nl-NL')}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{note.content}</p>
                      </div>
                      {index < issueNotes.length - 1 && (
                        <div className="absolute left-4 mt-8 w-px h-6 bg-gray-200"></div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Add Note Form */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Notitie toevoegen</h4>
                  <div className="space-y-3">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Voeg een notitie toe aan dit issue..."
                      rows={3}
                    />
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Notitie Toevoegen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Resolution Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Issue Oplossen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!showResolutionForm ? (
                    <Button 
                      onClick={() => setShowResolutionForm(true)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={issue.status === 'resolved'}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Issue Markeren als Opgelost
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Label htmlFor="resolution">Oplossing beschrijving</Label>
                      <Textarea
                        id="resolution"
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Beschrijf hoe dit issue is opgelost..."
                        rows={4}
                      />
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleResolveIssue}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          Bevestig Oplossing
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowResolutionForm(false)}
                          className="flex-1"
                        >
                          Annuleren
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Escalation Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Flag className="w-4 h-4 mr-2" />
                    Issue Escaleren
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!showEscalationForm ? (
                    <Button 
                      variant="destructive"
                      onClick={() => setShowEscalationForm(true)}
                      className="w-full"
                      disabled={issue.status === 'escalated'}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Escaleren naar Management
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Label htmlFor="escalation">Reden voor escalatie</Label>
                      <Textarea
                        id="escalation"
                        value={escalationNote}
                        onChange={(e) => setEscalationNote(e.target.value)}
                        placeholder="Waarom moet dit issue geëscaleerd worden..."
                        rows={4}
                      />
                      <div className="flex space-x-2">
                        <Button 
                          variant="destructive"
                          onClick={handleEscalateIssue}
                          className="flex-1"
                        >
                          Bevestig Escalatie
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowEscalationForm(false)}
                          className="flex-1"
                        >
                          Annuleren
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Other Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Andere Acties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    E-mail naar Gebruiker
                  </Button>
                  <Button variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Gebruiker Profiel Bekijken
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Toewijzen aan Specialist
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Issue Rapport Genereren
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <BaseModalActions
          cancelAction={{
            label: "Sluiten",
            onClick: () => onOpenChange(false)
          }}
        />
      </BaseModal>
  );
};

export default IssueManagementModal;
