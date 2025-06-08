
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { documentService } from "@/services/DocumentService";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye,
  Trash2,
  Download,
  Clock
} from 'lucide-react';

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (documents: any[]) => void;
}

interface UploadedDocument {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  type: 'identity' | 'payslip' | 'employment' | 'reference';
  status: 'ready' | 'uploading' | 'pending' | 'approved' | 'rejected';
  uploadProgress: number;
  uploadedAt: string;
  rejectionReason?: string;
}

const DocumentUploadModal = ({ open, onOpenChange, onUploadComplete }: DocumentUploadModalProps) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const documentTypes = [
    {
      type: 'identity' as const,
      label: 'Identiteitsbewijs',
      description: 'Paspoort, ID-kaart of rijbewijs',
      icon: FileText,
      required: true,
    },
    {
      type: 'payslip' as const,
      label: 'Loonstrook',
      description: 'Laatste 3 maanden loonstroken',
      icon: FileText,
      required: true,
    },
    {
      type: 'employment' as const,
      label: 'Arbeidscontract',
      description: 'Huidig arbeidscontract',
      icon: FileText,
      required: false,
    },
    {
      type: 'reference' as const,
      label: 'Referentie',
      description: 'Referentie van vorige verhuurder',
      icon: FileText,
      required: false,
    },
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Bestand te groot",
          description: `${file.name} is groter dan 10MB. Kies een kleiner bestand.`,
          variant: "destructive"
        });
        continue;
      }

      if (!file.type.includes('pdf') && !file.type.includes('image')) {
        toast({
          title: "Ongeldig bestandstype",
          description: `${file.name} is geen PDF of afbeelding. Upload alleen PDF of afbeeldingsbestanden.`,
          variant: "destructive"
        });
        continue;
      }

      const documentId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newDocument: UploadedDocument = {
        id: documentId,
        file,
        fileName: file.name,
        fileSize: file.size,
        type: 'identity',
        status: 'ready',
        uploadProgress: 0,
        uploadedAt: new Date().toISOString(),
      };

      setDocuments(prev => [...prev, newDocument]);
    }
  };


  const updateDocumentType = (documentId: string, type: UploadedDocument['type']) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId ? { ...doc, type } : doc
      )
    );
  };

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast({
      title: "Document verwijderd",
      description: "Het document is verwijderd uit je upload."
    });
  };

  const getStatusIcon = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'ready':
        return <FileText className="w-4 h-4 text-gray-500" />;
      case 'uploading':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'ready':
        return 'Klaar voor upload';
      case 'uploading':
        return 'Uploaden...';
      case 'pending':
        return 'In behandeling';
      case 'approved':
        return 'Goedgekeurd';
      case 'rejected':
        return 'Afgewezen';
      default:
        return 'Onbekend';
    }
  };

  const getStatusColor = (status: UploadedDocument['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-gray-100 text-gray-800';
      case 'uploading':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleComplete = async () => {
    const uploaded: any[] = [];
    for (const doc of documents) {
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'uploading' } : d));
      const result = await documentService.uploadDocument(doc.file, doc.type === 'identity' ? 'identity' : 'payslip');
      if (result.success && result.data) {
        uploaded.push(result.data);
        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'pending', uploadProgress: 100 } : d));
      } else {
        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'rejected' } : d));
        toast({ title: 'Upload mislukt', description: result.error?.message || 'Er is iets misgegaan', variant: 'destructive' });
      }
    }

    if (uploaded.length > 0) {
      onUploadComplete(uploaded);
      onOpenChange(false);
      toast({
        title: 'Documenten geüpload',
        description: `${uploaded.length} document(en) zijn geüpload voor beoordeling.`
      });
      setDocuments([]);
    }
  };

  const requiredDocuments = documentTypes.filter(type => type.required);
  const uploadedRequiredTypes = documents
    .filter(doc => doc.status !== 'rejected')
    .map(doc => doc.type);
  const hasAllRequired = requiredDocuments.every(type => 
    uploadedRequiredTypes.includes(type.type)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Documenten Uploaden
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Document Types Info */}
          <div className="grid md:grid-cols-2 gap-4">
            {documentTypes.map((docType) => {
              const Icon = docType.icon;
              const hasUploaded = documents.some(doc => 
                doc.type === docType.type && doc.status !== 'rejected'
              );
              
              return (
                <Card key={docType.type} className={`${hasUploaded ? 'border-green-200 bg-green-50' : ''}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Icon className="w-5 h-5 mt-1 text-dutch-blue" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{docType.label}</h4>
                          {docType.required && (
                            <Badge variant="destructive" className="text-xs">Verplicht</Badge>
                          )}
                          {hasUploaded && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{docType.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Upload Area */}
          <Card>
            <CardContent className="pt-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-dutch-blue bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Sleep bestanden hierheen</h3>
                <p className="text-gray-600 mb-4">
                  Of klik om bestanden te selecteren
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Bestanden Selecteren
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PDF, JPG, PNG bestanden tot 10MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Documents */}
          {documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Geüploade Documenten ({documents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((document) => (
                    <div key={document.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <FileText className="w-8 h-8 text-dutch-blue" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium truncate">{document.fileName}</h4>
                          {getStatusIcon(document.status)}
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            {formatFileSize(document.fileSize)}
                          </span>
                          <Badge className={`text-xs ${getStatusColor(document.status)}`}>
                            {getStatusText(document.status)}
                          </Badge>
                        </div>
                        
                        {document.status === 'uploading' && (
                          <Progress value={document.uploadProgress} className="h-2 mt-2" />
                        )}
                        
                        {document.status === 'rejected' && document.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            {document.rejectionReason}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {document.status !== 'uploading' && (
                          <>
                            <select
                              value={document.type}
                              onChange={(e) => updateDocumentType(document.id, e.target.value as UploadedDocument['type'])}
                              className="text-sm border rounded px-2 py-1"
                            >
                              {documentTypes.map((type) => (
                                <option key={type.type} value={type.type}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                            
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeDocument(document.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements Check */}
          {documents.length > 0 && (
            <Card className={hasAllRequired ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  {hasAllRequired ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  )}
                  <h4 className="font-semibold">
                    {hasAllRequired ? 'Alle verplichte documenten geüpload' : 'Verplichte documenten ontbreken'}
                  </h4>
                </div>
                {!hasAllRequired && (
                  <p className="text-sm text-orange-700 mt-1">
                    Upload nog: {requiredDocuments
                      .filter(type => !uploadedRequiredTypes.includes(type.type))
                      .map(type => type.label)
                      .join(', ')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Later Voltooien
            </Button>
            
            <Button 
              onClick={handleComplete}
              disabled={documents.length === 0 || !hasAllRequired}
              className="bg-green-600 hover:bg-green-700"
            >
              Documenten Indienen
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadModal;
