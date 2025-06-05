
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { demoUsers, demoIssues, demoTenantProfiles } from '@/data/demoData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, AlertTriangle, TrendingUp, Download, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BeheerderDashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [issueNote, setIssueNote] = useState('');

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

  const handleSuspendUser = (userId: string) => {
    toast({
      title: "Gebruiker geschorst",
      description: "De gebruiker is tijdelijk geschorst voor onderzoek."
    });
  };

  const handleCloseIssue = (issueId: string) => {
    toast({
      title: "Issue gesloten",
      description: "Het issue is succesvol gesloten en gearchiveerd."
    });
    setSelectedIssue(null);
  };

  const addIssueNote = () => {
    if (!issueNote.trim()) return;
    
    toast({
      title: "Notitie toegevoegd",
      description: "Je notitie is toegevoegd aan het issue."
    });
    setIssueNote('');
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
              <div className="w-8 h-8 bg-gradient-to-r from-dutch-blue to-dutch-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="ml-2 text-xl font-bold text-dutch-blue">Huurly</span>
              <span className="ml-4 text-gray-500">| Beheerder Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
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
                <CardTitle>Gebruiker Beheer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'} 
                          alt={user.name}
                          className="w-12 h-12 rounded-full"
                        />
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
                        <Button size="sm" variant="outline">
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleSuspendUser(user.id)}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                    {demoIssues.filter(issue => issue.status === 'open').length} open
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demoIssues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{issue.title}</h3>
                            <Badge variant={
                              issue.status === 'open' ? 'destructive' :
                              issue.status === 'in_progress' ? 'default' : 'secondary'
                            }>
                              {issue.status === 'open' ? 'Open' :
                               issue.status === 'in_progress' ? 'In behandeling' : 'Gesloten'}
                            </Badge>
                            <Badge variant="outline">
                              {issue.priority === 'high' ? 'Hoog' :
                               issue.priority === 'medium' ? 'Middel' : 'Laag'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                          <p className="text-xs text-gray-500">
                            Gemeld door: {issue.reporterRole} • {new Date(issue.createdAt).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedIssue(issue)}>
                              Beheren
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{issue.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Beschrijving:</h4>
                                <p className="text-gray-600">{issue.description}</p>
                              </div>
                              
                              {issue.notes.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Notities:</h4>
                                  <div className="space-y-2">
                                    {issue.notes.map((note) => (
                                      <div key={note.id} className="bg-gray-50 p-3 rounded">
                                        <p className="text-sm">{note.content}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {new Date(note.createdAt).toLocaleDateString('nl-NL')}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <h4 className="font-semibold mb-2">Notitie toevoegen:</h4>
                                <Textarea
                                  value={issueNote}
                                  onChange={(e) => setIssueNote(e.target.value)}
                                  placeholder="Voeg een notitie toe..."
                                  rows={3}
                                />
                                <Button onClick={addIssueNote} className="mt-2" size="sm">
                                  Notitie toevoegen
                                </Button>
                              </div>

                              <div className="flex space-x-2">
                                <Button 
                                  onClick={() => handleCloseIssue(issue.id)}
                                  className="flex-1"
                                >
                                  Issue sluiten
                                </Button>
                                <Button variant="outline" className="flex-1">
                                  Status wijzigen
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
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
                    <Button className="w-full mt-4">
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
                    <Button className="w-full mt-4">
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
    </div>
  );
};

export default BeheerderDashboard;
