
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { demoTenantProfiles } from '@/data/demoData';
import { FileText, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BeoordelaarDashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Get all documents from all tenant profiles
  const allDocuments = demoTenantProfiles.flatMap(tenant => 
    tenant.documents.map(doc => ({
      ...doc,
      tenantName: `${tenant.firstName} ${tenant.lastName}`,
      tenantEmail: tenant.email
    }))
  );

  const pendingDocuments = allDocuments.filter(doc => doc.status === 'pending');
  const recentlyReviewed = allDocuments.filter(doc => doc.status !== 'pending').slice(0, 5);

  const handleApprove = (documentId: string) => {
    toast({
      title: "Document goedgekeurd",
      description: "Het document is succesvol goedgekeurd en de huurder is op de hoogte gesteld."
    });
    // Update document status logic here
  };

  const handleReject = (documentId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Reden vereist",
        description: "Voer een reden in voor afwijzing van het document.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Document afgewezen",
      description: "Het document is afgewezen en de huurder is op de hoogte gesteld van de reden."
    });
    setRejectionReason('');
    setSelectedDocument(null);
    // Update document status logic here
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    window.location.href = '/';
  };

  if (!user || user.role !== 'beoordelaar') {
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
              <span className="ml-4 text-gray-500">| Beoordelaar Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welkom, {user.name}</span>
              <Button variant="outline" onClick={handleLogout}>
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{pendingDocuments.length}</p>
                  <p className="text-gray-600">Wachtende Verificaties</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-gray-600">Goedgekeurd Vandaag</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-gray-600">Afgewezen Vandaag</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-dutch-blue" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-gray-600">Openstaande Portfolio's</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending Documents */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Wachtende Verificaties
                  <Badge variant="secondary" className="ml-2">
                    {pendingDocuments.length} openstaand
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{doc.tenantName}</h3>
                            <Badge variant="outline">
                              {doc.type === 'id' ? 'Identiteitsbewijs' : 
                               doc.type === 'income' ? 'Inkomensverklaring' :
                               doc.type === 'employment' ? 'Arbeidscontract' : 'Referentie'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{doc.tenantEmail}</p>
                          <p className="text-sm text-gray-500">
                            Geüpload: {new Date(doc.uploadedAt).toLocaleDateString('nl-NL')}
                          </p>
                          <p className="text-sm font-medium mt-2">{doc.fileName}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                Bekijken
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Document: {doc.fileName}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
                                  <p className="text-gray-500">Document preview - {doc.fileName}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(doc.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Goedkeuren
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    className="flex-1"
                                    onClick={() => setSelectedDocument(doc)}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Afwijzen
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(doc.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => setSelectedDocument(doc)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingDocuments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Geen documenten wachtend op verificatie
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Beoordeeld</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentlyReviewed.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{doc.tenantName}</p>
                        <p className="text-xs text-gray-500">{doc.fileName}</p>
                      </div>
                      <Badge variant={doc.status === 'approved' ? 'default' : 'destructive'}>
                        {doc.status === 'approved' ? 'Goedgekeurd' : 'Afgewezen'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Status */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Emma Bakker</span>
                    <Badge variant="secondary">1/4 compleet</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Jan de Vries</span>
                    <Badge variant="default">Compleet</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Marie van Dam</span>
                    <Badge variant="secondary">2/4 compleet</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Snelle Acties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full text-sm">
                    Bulk Goedkeuring
                  </Button>
                  <Button variant="outline" className="w-full text-sm">
                    Rapport Genereren
                  </Button>
                  <Button variant="outline" className="w-full text-sm">
                    Probleem Melden
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Afwijzen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Je gaat het document "{selectedDocument?.fileName}" afwijzen.</p>
            <div>
              <label className="text-sm font-medium">Reden voor afwijzing:</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Geef een duidelijke reden waarom dit document wordt afgewezen..."
                className="mt-2"
                rows={4}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedDocument(null)}
                className="flex-1"
              >
                Annuleren
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleReject(selectedDocument?.id)}
                className="flex-1"
              >
                Document Afwijzen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BeoordelaarDashboard;
