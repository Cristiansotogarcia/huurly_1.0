
import { FileText } from "lucide-react";

export const ImportantInfoSection = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Belangrijke Informatie</h3>
          <p className="text-sm text-gray-600">Lees meer over onze voorwaarden</p>
        </div>
      </div>
      <div className="space-y-3">
        <a href="/algemene-voorwaarden" className="block text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline transition-colors">
          📋 Algemene Voorwaarden
        </a>
        <a href="/privacybeleid" className="block text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline transition-colors">
          🔒 Privacybeleid
        </a>
      </div>
    </div>
  );
};
