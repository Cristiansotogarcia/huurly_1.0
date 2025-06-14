
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { documentService } from "@/services/DocumentService";
import { useAuthStore } from "@/store/authStore";

interface DocumentsSectionProps {
  userDocuments: any[];
  onShowDocumentModal: () => void;
}

interface DocumentStatusCounts {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export const DocumentsSection = ({ userDocuments, onShowDocumentModal }: DocumentsSectionProps) => {
  const { user } = useAuthStore();
  const [statusCounts, setStatusCounts] = useState<DocumentStatusCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Calculate document status counts
  useEffect(() => {
    if (userDocuments && userDocuments.length > 0) {
      const counts = userDocuments.reduce(
        (acc, doc) => {
          acc.total += 1;
          if (doc.status === 'pending') acc.pending += 1;
          else if (doc.status === 'approved') acc.approved += 1;
          else if (doc.status === 'rejected') acc.rejected += 1;
          return acc;
        },
        { pending: 0, approved: 0, rejected: 0, total: 0 }
      );
      setStatusCounts(counts);
    } else {
      setStatusCounts({ pending: 0, approved: 0, rejected: 0, total: 0 });
    }
  }, [userDocuments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In behandeling';
      case 'approved':
        return 'Goedgekeurd';
      case 'rejected':
        return 'Afgekeurd';
      default:
        return 'Onbekend';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mijn Documenten</h3>
            <p className="text-sm text-gray-600">Status van je geüploade documenten</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onShowDocumentModal}>
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      {statusCounts.total > 0 ? (
        <div className="space-y-4">
          {/* Document Status Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-orange-900">{statusCounts.pending}</p>
                  <p className="text-sm text-orange-700">In behandeling</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{statusCounts.approved}</p>
                  <p className="text-sm text-green-700">Goedgekeurd</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <XCircle className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-900">{statusCounts.rejected}</p>
                  <p className="text-sm text-red-700">Afgekeurd</p>
                </div>
              </div>
            </div>
          </div>

          {/* Document List */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
              Alle documenten ({statusCounts.total})
            </h4>
            {userDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{doc.file_name}</span>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(doc.status)}
                      <span className="text-xs text-gray-600">
                        Geüpload op {new Date(doc.created_at).toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                    {getStatusText(doc.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Action Suggestions */}
          {statusCounts.rejected > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900">Actie vereist</h4>
                  <p className="text-xs text-red-700 mt-1">
                    Je hebt {statusCounts.rejected} afgekeurde document(en). Upload nieuwe versies om je profiel compleet te maken.
                  </p>
                  <Button 
                    size="sm" 
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                    onClick={onShowDocumentModal}
                  >
                    Documenten vervangen
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Geen documenten geüpload</h4>
          <p className="text-gray-600 mb-4">Upload je documenten om je profiel compleet te maken</p>
          <Button onClick={onShowDocumentModal}>
            <Upload className="w-4 h-4 mr-2" />
            Documenten Uploaden
          </Button>
        </div>
      )}
    </div>
  );
};
