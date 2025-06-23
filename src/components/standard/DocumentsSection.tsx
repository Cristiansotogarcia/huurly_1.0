
import { FileText, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentsSectionProps {
  userDocuments: any[];
  onShowDocumentModal: () => void;
  title: string;
  emptyStateTitle: string;
  emptyStateDescription: string;
}

export const DocumentsSection = ({ 
  userDocuments = [], // Default to empty array
  onShowDocumentModal,
  title,
  emptyStateTitle,
  emptyStateDescription
}: DocumentsSectionProps) => {
  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'identiteitsbewijs':
        return 'Identiteitsbewijs';
      case 'loonstrook':
        return 'Loonstrook';
      case 'arbeidscontract':
        return 'Arbeidscontract';
      case 'referentie':
        return 'Referentie';
      default:
        return 'Document';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'goedgekeurd':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'wachtend':
      case 'in_behandeling':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'afgewezen':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'goedgekeurd':
        return 'Goedgekeurd';
      case 'wachtend':
      case 'in_behandeling':
        return 'In behandeling';
      case 'afgewezen':
        return 'Afgewezen';
      default:
        return 'Onbekend';
    }
  };

  // Ensure userDocuments is an array
  const documents = Array.isArray(userDocuments) ? userDocuments : [];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">Beheer je geüploade documenten</p>
          </div>
        </div>
        <Button onClick={onShowDocumentModal} className="flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{emptyStateTitle}</p>
          <p className="text-sm text-gray-500 mt-1">{emptyStateDescription}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((document, index) => (
            <div key={document.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(document.status)}
                <div>
                  <p className="font-medium text-gray-900">{getDocumentTypeLabel(document.type)}</p>
                  <p className="text-sm text-gray-600">{document.bestandsnaam}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                document.status === 'goedgekeurd' ? 'bg-green-100 text-green-800' :
                document.status === 'wachtend' || document.status === 'in_behandeling' ? 'bg-yellow-100 text-yellow-800' :
                document.status === 'afgewezen' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getStatusLabel(document.status)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
