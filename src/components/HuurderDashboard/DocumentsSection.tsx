
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload } from "lucide-react";

interface DocumentsSectionProps {
  userDocuments: any[];
  onShowDocumentModal: () => void;
}

export const DocumentsSection = ({ userDocuments, onShowDocumentModal }: DocumentsSectionProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mijn Documenten</h3>
            <p className="text-sm text-gray-600">Upload en beheer belangrijke documenten</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onShowDocumentModal}>
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>
      {userDocuments.length > 0 ? (
        <div className="space-y-3">
          {userDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-900">{doc.file_name}</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                {doc.status}
              </Badge>
            </div>
          ))}
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
