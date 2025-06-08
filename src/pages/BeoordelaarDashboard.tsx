import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { documentService } from '@/services/DocumentService';
import { FileText, CheckCircle, XCircle, Clock, Eye, ArrowLeft, Bell, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DocumentReviewModal from '@/components/modals/DocumentReviewModal';
import NotificationBell from '@/components/NotificationBell';
import { notifyDocumentApproved, notifyDocumentRejected } from '@/hooks/useNotifications';
import { Logo } from '@/components/Logo';

const EMPTY_STATE_MESSAGES = {
  noUsers: 'Nog geen gebruikers geregistreerd',
  noProperties: 'Nog geen woningen toegevoegd',
  noDocuments: 'Nog geen documenten ge\u00fpload',
  noViewings: 'Nog geen bezichtigingen gepland',
  noIssues: 'Geen openstaande issues',
  noNotifications: 'Geen nieuwe notificaties',
};

const BeoordelaarDashboard = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingDocuments, setPendingDocuments] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const result = await documentService.getPendingDocuments();
      if (result.success && result.data) {
        setPendingDocuments(result.data);
      }
    })();
  }, []);

  const handleReviewDocument = (document: any) => {
    setSelectedDocument(document);
    setShowReviewModal(true);
  };

  const handleApprove = async (documentId: string, notes?: string) => {
    await documentService.approveDocument(documentId);
    const document = pendingDocuments.find(doc => doc.id === documentId);
    if (document) {
      notifyDocumentApproved(
        document.tenantName,
        document.type === 'identity' ? 'identiteitsbewijs' :
        document.type === 'payslip' ? 'loonstrook' :
        document.type === 'employment' ? 'arbeidscontract' : 'document',
        document.tenantId || 'unknown'
      );
    }

    setPendingDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast({
      title: "Document goedgekeurd",
      description: "Het document is succesvol goedgekeurd en de huurder is op de hoogte gesteld."
    });
  };

  const handleReject = async (documentId: string, reason: string) => {
    await documentService.rejectDocument(documentId, reason);
    const document = pendingDocuments.find(doc => doc.id === documentId);
    if (document) {
      notifyDocumentRejected(
        document.tenantName,
        document.type === 'identity' ? 'identiteitsbewijs' :
        document.type === 'payslip' ? 'loonstrook' :
        document.type === 'employment' ? 'arbeidscontract' : 'document',
        reason,
        document.tenantId || 'unknown'
      );
    }

    setPendingDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast({
      title: "Document afgewezen",
      description: "Het document is afgewezen en de huurder is op de hoogte gesteld van de reden."
    });
  };

  const handleBulkApproval = async () => {
    const selectedDocs = pendingDocuments.slice(0, 2);
    for (const doc of selectedDocs) {
      await documentService.approveDocument(doc.id);
    }
    setPendingDocuments(prev => prev.slice(selectedDocs.length));
    toast({
      title: "Bulk goedkeuring voltooid",
      description: `${selectedDocs.length} documenten zijn goedgekeurd.`
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Rapport gegenereerd",
      description: "Het verificatie rapport is gegenereerd en gedownload."
    });
  };

  const handleReportIssue = () => {
    // TODO: connect with IssueService
    toast({
      title: "Issue gerapporteerd",
      description: "Je probleem is gerapporteerd en wordt onderzocht door ons team."
    });
  };

  const handleLogout = () => {
    useAuthStore.getState().logout();
    window.location.href = '/';
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (!user || user.role !== 'beoordelaar') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Toegang geweigerd</h2>
              <p className="text-gray-600 mb-4">Je hebt geen toegang tot het beoordelaar dashboard.</p>
              <Button onClick={handleGoHome}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={handleGoHome}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
                <Logo />
                <span className="ml-4 text-gray-500">| Beoordelaar Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
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
        {/* Stats Cards - Clean for real testing */}
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
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0</p>
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
                {pendingDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {pendingDocuments.map((document) => (
                      <div key={document.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <FileText className="w-8 h-8 text-dutch-blue mt-1" />
                            <div>
                              <h4 className="font-semibold">{document.fileName}</h4>
                              <p className="text-sm text-gray-600">Van: {document.tenantName}</p>
                              <p className="text-sm text-gray-500">
                                Geüpload: {new Date(document.uploadedAt).toLocaleDateString('nl-NL')}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline">
                                  {document.type === 'identity' ? 'Identiteitsbewijs' :
                                   document.type === 'payslip' ? 'Loonstrook' :
                                   document.type === 'employment' ? 'Arbeidscontract' : 'Referentie'}
                                </Badge>
                                <Badge className="bg-orange-100 text-orange-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  In behandeling
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleReviewDocument(document)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Beoordelen
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">Geen documenten te beoordelen</h3>
                    <p className="text-sm">{EMPTY_STATE_MESSAGES.noDocuments}</p>
                    <p className="text-sm mt-2">
                      Wanneer huurders documenten uploaden, verschijnen ze hier voor beoordeling.
                    </p>
                  </div>
                )}
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
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Nog geen documenten beoordeeld</p>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Status */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Geen portfolio's in behandeling</p>
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
                  <Button 
                    variant="outline" 
                    className="w-full text-sm"
                    onClick={handleBulkApproval}
                    disabled={pendingDocuments.length === 0}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Bulk Goedkeuring
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-sm"
                    onClick={handleGenerateReport}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Rapport Genereren
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-sm"
                    onClick={handleReportIssue}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Probleem Melden
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card>
              <CardHeader>
                <CardTitle>Hulp nodig?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-600">
                    Als beoordelaar kun je:
                  </p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Documenten van huurders beoordelen</li>
                    <li>• Identiteitsbewijzen verifiëren</li>
                    <li>• Inkomensverklaringen controleren</li>
                    <li>• Portfolio's goedkeuren of afwijzen</li>
                    <li>• Feedback geven aan huurders</li>
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => toast({ title: "Functie komt binnenkort", description: "Help & Support wordt nog ontwikkeld." })}
                  >
                    Help & Support
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
                onClick={() => handleReject(selectedDocument?.id, rejectionReason)}
                className="flex-1"
              >
                Document Afwijzen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Review Modal */}
      <DocumentReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        document={selectedDocument}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default BeoordelaarDashboard;
