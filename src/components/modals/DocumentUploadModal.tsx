
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
  Trash2
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
  type: 'identity' | 'payslip' | 'employment_contract' | 'reference';
  status: 'ready' | 'uploading' | 'success' | 'error';
  uploadProgress: number;
  uploadedAt: string;
  error?: string;
  result?: any;
}

const DocumentUploadModal = ({ open, onOpenChange, onUploadComplete }: DocumentUploadModalProps) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

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
      type: 'employment_contract' as const,
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

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        error: `Bestand is te groot. Maximum grootte is 10MB.`
      };
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Alleen PDF, JPG en PNG bestanden zijn toegestaan.'
      };
    }

    return { isValid: true };
  };

  const handleFileSelect = async (file: File, documentType: 'identity' | 'payslip' | 'employment_contract' | 'reference') => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      toast({
        title: "Ongeldig bestand",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    // Check if this document type is already uploaded
    const existingDoc = documents.find(doc => doc.type === documentType && doc.status !== 'error');
    if (existingDoc) {
      toast({
        title: "Document al geüpload",
        description: `Je hebt al een ${documentTypes.find(t => t.type === documentType)?.label} geüpload.`,
        variant: "destructive"
      });
      return;
    }

    const documentId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newDocument: UploadedDocument = {
      id: documentId,
      file,
      fileName: file.name,
      fileSize: file.size,
      type: documentType,
      status: 'ready',
      uploadProgress: 0,
      uploadedAt: new Date().toISOString(),
    };

    setDocuments(prev => [...prev, newDocument]);
    
    toast({
      title: "Document toegevoegd",
      description: `${documentTypes.find(t => t.type === documentType)?.label} is klaar voor upload.`
    });
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
        return <Upload className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
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
      case 'success':
        return 'Geüpload';
      case 'error':
        return 'Fout';
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
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
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

  const uploadDocument = async (document: UploadedDocument) => {
    // Update status to uploading
    setDocuments(prev => prev.map(d => 
      d.id === document.id ? { ...d, status: 'uploading', uploadProgress: 10 } : d
    ));

    try {
      // Use the actual document type - our service now supports all 4 types
      const result = await documentService.uploadDocument(document.file, document.type);
      
      if (result.success && result.data) {
        setDocuments(prev => prev.map(d => 
          d.id === document.id ? { 
            ...d, 
            status: 'success', 
            uploadProgress: 100,
            result: result.data
          } : d
        ));
        return result.data;
      } else {
        throw result.error || new Error('Upload mislukt');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload mislukt';
      
      setDocuments(prev => prev.map(d => 
        d.id === document.id ? { 
          ...d, 
          status: 'error',
          error: errorMessage
        } : d
      ));
      
      throw error;
    }
  };

  const handleCompleteUpload = async () => {
    const documentsToUpload = documents.filter(doc => doc.status === 'ready');
    
    if (documentsToUpload.length === 0) {
      toast({
        title: "Geen documenten om te uploaden",
        description: "Voeg eerst documenten toe voordat je ze uploadt.",
        variant: "destructive"
      });
      return;
    }

    const uploadedDocuments: any[] = [];
    let hasErrors = false;

    // Upload documents one by one
    for (const doc of documentsToUpload) {
      try {
        const uploadedDoc = await uploadDocument(doc);
        uploadedDocuments.push(uploadedDoc);
      } catch (error) {
        hasErrors = true;
        const errorMessage = error instanceof Error ? error.message : 'Upload mislukt';
        toast({
          title: 'Upload mislukt',
          description: `${doc.fileName}: ${errorMessage}`,
          variant: 'destructive'
        });
      }
    }

    if (uploadedDocuments.length > 0) {
      onUploadComplete(uploadedDocuments);
      
      toast({
        title: 'Documenten geüpload',
        description: `${uploadedDocuments.length} document(en) zijn succesvol geüpload voor beoordeling.`
      });

      if (!hasErrors) {
        // Only close modal if no errors occurred
        onOpenChange(false);
        setDocuments([]);
      }
    }
  };

  const requiredDocuments = documentTypes.filter(type => type.required);
  const uploadedRequiredTypes = documents
    .filter(doc => doc.status !== 'error')
    .map(doc => doc.type);
  const hasAllRequired = requiredDocuments.every(type => 
    uploadedRequiredTypes.includes(type.type)
  );

  const readyDocuments = documents.filter(doc => doc.status === 'ready');

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
          {/* Document Types with Individual Upload */}
          <div className="grid md:grid-cols-2 gap-4">
            {documentTypes.map((docType) => {
              const Icon = docType.icon;
              const hasUploaded = documents.some(doc => 
                doc.type === docType.type && doc.status !== 'error'
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
                        
                        {/* Individual Upload Button */}
                        <div className="mt-3">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileSelect(file, docType.type);
                              }
                              // Reset input
                              e.target.value = '';
                            }}
                            className="hidden"
                            id={`file-upload-${docType.type}`}
                          />
                          <label htmlFor={`file-upload-${docType.type}`}>
                            <Button 
                              variant={hasUploaded ? "outline" : "default"} 
                              size="sm" 
                              className="cursor-pointer w-full"
                              disabled={hasUploaded}
                              asChild
                            >
                              <span>
                                <Upload className="w-4 h-4 mr-2" />
                                {hasUploaded ? 'Geüpload' : 'Upload'}
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Uploaded Documents */}
          {documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Geselecteerde Documenten ({documents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center space-x-4 p-3 border rounded-lg"
                    >
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
                          <span className="text-sm text-gray-500">
                            {documentTypes.find(t => t.type === document.type)?.label}
                          </span>
                        </div>
                        
                        {document.status === 'uploading' && (
                          <Progress value={document.uploadProgress} className="h-2 mt-2" />
                        )}
                        
                        {document.status === 'error' && document.error && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            {document.error}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {document.status !== 'uploading' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeDocument(document.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
                    {hasAllRequired ? 'Alle verplichte documenten geselecteerd' : 'Verplichte documenten ontbreken'}
                  </h4>
                </div>
                {!hasAllRequired && (
                  <p className="text-sm text-orange-700 mt-1">
                    Selecteer nog: {requiredDocuments
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
              Annuleren
            </Button>
            
            <Button 
              onClick={handleCompleteUpload}
              disabled={readyDocuments.length === 0 || !hasAllRequired}
              className="bg-green-600 hover:bg-green-700"
            >
              Documenten Uploaden ({readyDocuments.length})
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadModal;
