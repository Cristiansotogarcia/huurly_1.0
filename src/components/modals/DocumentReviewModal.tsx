import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  CheckCircle, 
import { documentService } from "@/services/DocumentService";
  XCircle, 
  User, 
  Calendar,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface DocumentReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: any;
  onApprove: (documentId: string, notes?: string) => void;
  onReject: (documentId: string, reason: string) => void;
}

const DocumentReviewModal = ({ 
  open, 
  onOpenChange, 
  document,
  onApprove,
  onReject 
}: DocumentReviewModalProps) => {
  const { toast } = useToast();
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);

    try {
      const result = await documentService.approveDocument(document.id);
      if (result.success) {
        onApprove(document.id, reviewNotes);
        onOpenChange(false);

        toast({
          title: "Document goedgekeurd",
          description: `Het document van ${document.tenantName} is goedgekeurd.`
        });
      } else {
        throw result.error;
      }
      
      // Reset form
      setReviewNotes('');
      setRejectionReason('');
      setShowRejectionForm(false);
      
    } catch (error) {
      toast({
        title: "Fout bij goedkeuring",
        description: (error as Error).message || "Er is iets misgegaan.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Reden vereist",
        description: "Voer een reden in voor afwijzing van het document.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await documentService.rejectDocument(document.id, rejectionReason);
      if (result.success) {
        onReject(document.id, rejectionReason);
        onOpenChange(false);

        toast({
          title: "Document afgewezen",
          description: `Het document van ${document.tenantName} is afgewezen.`
        });
      } else {
        throw result.error;
      }
      
      // Reset form
      setReviewNotes('');
      setRejectionReason('');
      setShowRejectionForm(false);
      
    } catch (error) {
      toast({
        title: "Fout bij afwijzing",
        description: (error as Error).message || "Er is iets misgegaan.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'identity':
        return 'Identiteitsbewijs';
      case 'payslip':
        return 'Loonstrook';
      case 'employment':
        return 'Arbeidscontract';
      case 'reference':
        return 'Referentie';
      default:
        return 'Document';
    }
  };

  const getDocumentIcon = (type: string) => {
    return <FileText className="w-5 h-5" />;
  };

  if (!document) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Document Beoordelen
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Document Viewer */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    {getDocumentIcon(document.type)}
                    <span className="ml-2">{document.fileName}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">{zoom}%</span>
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[500px] flex items-center justify-center">
                  {document.type === 'identity' ? (
                    <div className="text-center">
                      <FileText className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">Nederlandse Identiteitskaart</h3>
                      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md mx-auto">
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Naam:</span>
                            <span className="font-medium">{document.tenantName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Geboortedatum:</span>
                            <span className="font-medium">15-03-1995</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nationaliteit:</span>
                            <span className="font-medium">Nederlandse</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Document nr:</span>
                            <span className="font-medium">SPECI2014</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Geldig tot:</span>
                            <span className="font-medium">15-03-2029</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-4">
                        Simulatie van identiteitsdocument voor demo doeleinden
                      </p>
                    </div>
                  ) : document.type === 'payslip' ? (
                    <div className="text-center">
                      <FileText className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">Loonstrook December 2023</h3>
                      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md mx-auto">
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Werkgever:</span>
                            <span className="font-medium">TechCorp B.V.</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Periode:</span>
                            <span className="font-medium">December 2023</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bruto salaris:</span>
                            <span className="font-medium">€4,500.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Netto salaris:</span>
                            <span className="font-medium">€3,247.50</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Functie:</span>
                            <span className="font-medium">Software Developer</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-4">
                        Simulatie van loonstrook voor demo doeleinden
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileText className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">{getDocumentTypeLabel(document.type)}</h3>
                      <p className="text-gray-600">Document preview wordt geladen...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Review Panel */}
          <div className="space-y-6">
            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Document Informatie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{getDocumentTypeLabel(document.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Huurder:</span>
                  <span className="font-medium">{document.tenantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Geüpload:</span>
                  <span className="font-medium">
                    {new Date(document.uploadedAt).toLocaleDateString('nl-NL')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bestandsgrootte:</span>
                  <span className="font-medium">{(document.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    <Clock className="w-3 h-3 mr-1" />
                    In behandeling
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Verification Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Verificatie Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {document.type === 'identity' && (
                    <div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Document is leesbaar</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Naam komt overeen</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Document is geldig</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Geen tekenen van vervalsing</span>
                      </div>
                    </div>
                  )}
                  {document.type === 'payslip' && (
                    <div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Recente loonstrook (minder dan 3 maanden)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Inkomen voldoende (3x huur)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Werkgever informatie compleet</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Geen onregelmatigheden</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Review Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Beoordeling Notities</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="notes">Interne notities (optioneel)</Label>
                  <Textarea
                    id="notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Voeg eventuele opmerkingen toe voor intern gebruik..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rejection Form */}
            {showRejectionForm && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-800">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Document Afwijzen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="rejection">Reden voor afwijzing *</Label>
                    <Textarea
                      id="rejection"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Geef een duidelijke reden waarom dit document wordt afgewezen..."
                      rows={3}
                    />
                    <p className="text-sm text-red-600 mt-1">
                      Deze reden wordt gedeeld met de huurder.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!showRejectionForm ? (
                <div>
                  <Button 
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Goedkeuren...' : 'Document Goedkeuren'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowRejectionForm(true)}
                    className="w-full mt-2"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Document Afwijzen
                  </Button>
                </div>
              ) : (
                <div>
                  <Button 
                    variant="destructive" 
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || isSubmitting}
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Afwijzen...' : 'Bevestig Afwijzing'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRejectionForm(false)}
                    className="w-full mt-2"
                  >
                    Annuleren
                  </Button>
                </div>
              )}
              
              <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                Sluiten
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentReviewModal;
