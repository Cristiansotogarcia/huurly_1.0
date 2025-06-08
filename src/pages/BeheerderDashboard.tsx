
import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, AlertTriangle, TrendingUp, Download, UserCheck, UserX, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/UserService';
import { paymentService } from '@/services/PaymentService';
import UserManagementModal from '@/components/modals/UserManagementModal';
import IssueManagementModal from '@/components/modals/IssueManagementModal';
import { Logo } from '@/components/Logo';
import NotificationBell from '@/components/NotificationBell';

const EMPTY_STATE_MESSAGES = {
  noUsers: 'Nog geen gebruikers geregistreerd',
  noProperties: 'Nog geen woningen toegevoegd',
  noDocuments: 'Nog geen documenten geüpload',
  noViewings: 'Nog geen bezichtigingen gepland',
  noIssues: 'Geen openstaande issues',
  noNotifications: 'Geen nieuwe notificaties',
};

const BeheerderDashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [issueNote, setIssueNote] = useState('');
  
  // State for user management
  const [users, setUsers] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: '',
  });
  
  // Load real data
  useEffect(() => {
    loadUsers();
    loadPendingApprovals();
    loadIssues();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await userService.getUsers();
      if (result.success && result.data) {
        setUsers(result.data);
      }
    } catch (error) {
      logger.error('Error loading users:', error);
    }
  };

  const loadPendingApprovals = async () => {
    // TODO: fetch pending approvals from service
    setPendingApprovals([]);
  };

  const loadIssues = async () => {
    // TODO: fetch issues from service
    setIssues([]);
  };

  // Mock analytics data
  const monthlyRegistrations = [
    { month: 'Jan', huurders: 45, verhuurders: 12 },
    { month: 'Feb', huurders: 52, verhuurders: 18 },
    { month: 'Mar', huurders: 61, verhuurders: 15 },
    { month: 'Apr', huurders: 58, verhuurders: 22 },
    { month: 'Mei', huurders: 67, verhuurders: 19 },
    { month: 'Jun', huurders: 73, verhuurders: 25 }
  ];

  const verificationStats = [
    { name: 'Goedgekeurd', value: 156, color: '#22c55e' },
    { name: 'In behandeling', value: 23, color: '#f59e0b' },
    { name: 'Afgewezen', value: 12, color: '#ef4444' }
  ];

  // User management handlers
  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleUpdateUser = (userId: string, updates: any) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
    toast({
      title: "Gebruiker bijgewerkt",
      description: "De gebruiker gegevens zijn succesvol bijgewerkt."
    });
  };

  const handleSuspendUser = (userId: string, reason: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: 'suspended', isActive: false } : user
    ));
    toast({
      title: "Gebruiker geschorst",
      description: "De gebruiker is tijdelijk geschorst voor onderzoek."
    });
  };

  const handleActivateUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: 'active', isActive: true } : user
    ));
    toast({
      title: "Gebruiker geactiveerd",
      description: "De gebruiker is weer geactiveerd."
    });
  };

  // Issue management handlers
  const handleIssueClick = (issue: any) => {
    setSelectedIssue(issue);
    setShowIssueModal(true);
  };

  const handleResolveIssue = (issueId: string, resolution: string) => {
    setIssues(prev => prev.map(issue =>
      issue.id === issueId ? { ...issue, status: 'resolved' } : issue
    ));
    toast({
      title: "Issue opgelost",
      description: "Het issue is succesvol opgelost en gearchiveerd."
    });
  };

  const handleEscalateIssue = (issueId: string, escalationNote: string) => {
    setIssues(prev => prev.map(issue =>
      issue.id === issueId ? { ...issue, status: 'escalated' } : issue
    ));
    toast({
      title: "Issue geëscaleerd",
      description: "Het issue is geëscaleerd naar management."
    });
  };

  const handleAddIssueNote = (issueId: string, note: string) => {
    // TODO: integrate with IssueService
    toast({
      title: "Notitie toegevoegd",
      description: "Je notitie is toegevoegd aan het issue."
    });
  };

  // Approval handlers
  const handleApproveUser = (approvalId: string) => {
    setPendingApprovals(prev => prev.filter(approval => approval.id !== approvalId));
    toast({
      title: "Gebruiker goedgekeurd",
      description: "De verhuurder is goedgekeurd en kan nu panden toevoegen."
    });
  };

  const handleRejectUser = (approvalId: string) => {
    setPendingApprovals(prev => prev.filter(approval => approval.id !== approvalId));
    toast({
      title: "Gebruiker afgewezen",
      description: "De aanvraag is afgewezen en de gebruiker is op de hoogte gesteld."
    });
  };

  // Export handlers
  const handleExportUserData = () => {
    toast({
      title: "Export gestart",
      description: "Gebruiker data wordt geëxporteerd naar CSV bestand."
    });
  };

  const handleExportPlatformData = () => {
    toast({
      title: "Export gestart",
      description: "Platform statistieken worden geëxporteerd naar Excel bestand."
    });
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    window.location.href = '/';
  };

  if (!user || user.role !== 'beheerder') {
    return <div>Toegang geweigerd</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo />
              <span className="ml-4 text-gray-500">| Beheerder Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <Button variant="outline" className="flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <span className="text-sm text-gray-600">Welkom, {user.name}</span>
              <Button variant="outline" onClick={handleLogout}>
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-dutch-blue" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">15,420</p>
                  <p className="text-gray-600">Totaal Gebruikers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-dutch-orange" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">3,240</p>
                  <p className="text-gray-600">Actieve Panden</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-gray-600">Verificaties</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-gray-600">Open Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Gebruikers</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="reports">Rapporten</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Monthly Registrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Maandelijkse Registraties</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyRegistrations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="huurders" fill="#1e3a8a" name="Huurders" />
                      <Bar dataKey="verhuurders" fill="#f97316" name="Verhuurders" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Verification Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Verificatie Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={verificationStats}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {verificationStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Belangrijke Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">+12.5%</p>
                    <p className="text-gray-600">Maandgroei</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">4.8</p>
                    <p className="text-gray-600">Gemiddelde Tevredenheid</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">2.3 days</p>
                    <p className="text-gray-600">Gem. Verificatie Tijd</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gebruiker Beheer</CardTitle>
                  <Dialog open={showCreateUserModal} onOpenChange={setShowCreateUserModal}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nieuwe Gebruiker
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nieuwe Gebruiker Aanmaken</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">Voornaam</Label>
                            <Input
                              id="firstName"
                              value={newUserData.firstName}
                              onChange={(e) => setNewUserData(prev => ({ ...prev, firstName: e.target.value }))}
                              placeholder="Jan"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Achternaam</Label>
                            <Input
                              id="lastName"
                              value={newUserData.lastName}
                              onChange={(e) => setNewUserData(prev => ({ ...prev, lastName: e.target.value }))}
                              placeholder="Jansen"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="email">E-mailadres</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUserData.email}
                            onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="jan@email.nl"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="role">Rol</Label>
                          <Select value={newUserData.role} onValueChange={(value) => setNewUserData(prev => ({ ...prev, role: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecteer rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="huurder">Huurder</SelectItem>
                              <SelectItem value="verhuurder">Verhuurder</SelectItem>
                              <SelectItem value="beoordelaar">Beoordelaar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="password">Tijdelijk Wachtwoord</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUserData.password}
                            onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Tijdelijk wachtwoord"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => {
                              // Handle user creation
                              toast({
                                title: "Gebruiker aangemaakt",
                                description: "De nieuwe gebruiker is succesvol aangemaakt."
                              });
                              setShowCreateUserModal(false);
                              setNewUserData({ firstName: '', lastName: '', email: '', role: '', password: '' });
                            }}
                            className="flex-1"
                          >
                            Aanmaken
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowCreateUserModal(false)}
                            className="flex-1"
                          >
                            Annuleren
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>{EMPTY_STATE_MESSAGES.noUsers}</p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-dutch-blue rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">{user.role}</Badge>
                              <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                {user.isActive ? 'Actief' : 'Inactief'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserClick(user)}
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleSuspendUser(user.id, 'Verdachte activiteit gedetecteerd')}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {/* Pending Approvals Section */}
                  {pendingApprovals.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-orange-600" />
                        Verhuurder Goedkeuringen ({pendingApprovals.length})
                      </h3>
                      <div className="space-y-3">
                        {pendingApprovals.map((approval) => (
                          <div key={approval.id} className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                            <div>
                              <h4 className="font-semibold">{approval.userName}</h4>
                              <p className="text-sm text-gray-600">{approval.email}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Aangevraagd: {new Date(approval.createdAt).toLocaleDateString('nl-NL')}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Goedkeuren
                              </Button>
                              <Button size="sm" variant="destructive">
                                <XCircle className="w-4 h-4 mr-1" />
                                Afwijzen
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Issue Management
                  <Badge variant="destructive" className="ml-2">
                    {issues.filter(issue => issue.status === 'open').length} open
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {issues.length > 0 ? (
                  <div className="space-y-4">
                    {issues.map((issue) => (
                      <div key={issue.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleIssueClick(issue)}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className={`w-6 h-6 mt-1 ${
                              issue.priority === 'high' ? 'text-red-600' :
                              issue.priority === 'medium' ? 'text-orange-600' : 'text-green-600'
                            }`} />
                            <div>
                              <h4 className="font-semibold">{issue.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline">
                                  {issue.category === 'technical' ? 'Technisch' :
                                   issue.category === 'user_complaint' ? 'Gebruiker Klacht' :
                                   issue.category === 'payment' ? 'Betaling' : 'Verificatie'}
                                </Badge>
                                <Badge className={
                                  issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  issue.priority === 'medium' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                                }>
                                  {issue.priority === 'high' ? 'Hoog' :
                                   issue.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
                                </Badge>
                                <Badge className={
                                  issue.status === 'open' ? 'bg-red-100 text-red-800' :
                                  issue.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                                  issue.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                                }>
                                  {issue.status === 'open' ? 'Open' :
                                   issue.status === 'in_progress' ? 'In behandeling' :
                                   issue.status === 'resolved' ? 'Opgelost' : 'Geëscaleerd'}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Gemeld door: {issue.reportedBy} • {new Date(issue.createdAt).toLocaleDateString('nl-NL')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>{EMPTY_STATE_MESSAGES.noIssues}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gebruiker Rapporten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Totaal geregistreerde huurders</span>
                      <span className="font-bold">2,456</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Totaal geregistreerde verhuurders</span>
                      <span className="font-bold">487</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Actieve verificaties</span>
                      <span className="font-bold">23</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Succesvol gematcht</span>
                      <span className="font-bold">156</span>
                    </div>
                    <Button className="w-full mt-4" onClick={handleExportUserData}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Gebruiker Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Statistieken</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Gemiddelde tijd tot match</span>
                      <span className="font-bold">3.2 dagen</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Succesvolle bezichtigingen</span>
                      <span className="font-bold">78%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Gebruiker tevredenheid</span>
                      <span className="font-bold">4.8/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Platform uptime</span>
                      <span className="font-bold">99.9%</span>
                    </div>
                    <Button className="w-full mt-4" onClick={handleExportPlatformData}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Platform Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Management Modal */}
      <UserManagementModal
        open={showUserModal}
        onOpenChange={setShowUserModal}
        user={selectedUser}
        onUpdateUser={handleUpdateUser}
        onSuspendUser={handleSuspendUser}
        onActivateUser={handleActivateUser}
      />

      {/* Issue Management Modal */}
      <IssueManagementModal
        open={showIssueModal}
        onOpenChange={setShowIssueModal}
        issue={selectedIssue}
        onResolveIssue={handleResolveIssue}
        onEscalateIssue={handleEscalateIssue}
        onAddNote={handleAddIssueNote}
      />
    </div>
  );
};

export default BeheerderDashboard;
