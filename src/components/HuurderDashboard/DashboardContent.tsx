
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Home, User, Upload, Search, FileText, TrendingUp, Eye, Calendar, CheckCircle, Bell, Settings } from "lucide-react";

// Standardized components
import { StatsWidget } from "@/components/standard/StatsWidget";
import { EmptyState } from "@/components/standard/EmptyState";
import { StandardCard } from "@/components/standard/StandardCard";

interface DashboardContentProps {
  userName: string;
  hasProfile: boolean;
  userDocuments: any[];
  stats: {
    profileViews: number;
    invitations: number;
    applications: number;
    acceptedApplications: number;
  };
  isLoadingStats: boolean;
  isLookingForPlace: boolean;
  isUpdatingStatus: boolean;
  onShowProfileModal: () => void;
  onShowDocumentModal: () => void;
  onStartSearch: () => void;
  onToggleLookingStatus: () => void;
  onReportIssue: () => void;
  onHelpSupport: () => void;
}

export const DashboardContent = ({
  userName,
  hasProfile,
  userDocuments,
  stats,
  isLoadingStats,
  isLookingForPlace,
  isUpdatingStatus,
  onShowProfileModal,
  onShowDocumentModal,
  onStartSearch,
  onToggleLookingStatus,
  onReportIssue,
  onHelpSupport
}: DashboardContentProps) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="space-y-6">
        {/* Snelle Acties - Replacing Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Snelle Acties</h1>
              <p className="text-blue-100">Handige links voor snelle toegang</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {!hasProfile && (
              <Button className="bg-white text-blue-600 hover:bg-gray-100 font-medium" onClick={onShowProfileModal}>
                <User className="mr-2 h-4 w-4" /> Maak Profiel Aan
              </Button>
            )}
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={onShowDocumentModal}>
              <Upload className="mr-2 h-4 w-4" /> Documenten Uploaden
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={onStartSearch}>
              <Search className="mr-2 h-4 w-4" /> Zoek Woningen
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={onShowProfileModal}>
              <User className="mr-2 h-4 w-4" /> Profiel Bewerken
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={onReportIssue}>
              <Bell className="mr-2 h-4 w-4" /> Probleem Melden
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={onHelpSupport}>
              <Settings className="mr-2 h-4 w-4" /> Help & Support
            </Button>
          </div>
        </div>

        {/* Statistics Grid - Modern Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profiel weergaven</p>
                <p className="text-2xl font-bold text-gray-900">{isLoadingStats ? '...' : stats.profileViews}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uitnodigingen</p>
                <p className="text-2xl font-bold text-gray-900">{isLoadingStats ? '...' : stats.invitations}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aanvragen</p>
                <p className="text-2xl font-bold text-gray-900">{isLoadingStats ? '...' : stats.applications}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Geaccepteerd</p>
                <p className="text-2xl font-bold text-gray-900">{isLoadingStats ? '...' : stats.acceptedApplications}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Status Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Profiel Status</h3>
                <p className="text-sm text-gray-600">Beheer de zichtbaarheid van je profiel</p>
              </div>
            </div>
            {isUpdatingStatus && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Switch
              id="looking-status"
              checked={isLookingForPlace}
              onCheckedChange={onToggleLookingStatus}
              disabled={isUpdatingStatus}
            />
            <label htmlFor="looking-status" className="text-sm font-medium text-gray-700 cursor-pointer">
              {isLookingForPlace ? "Ik zoek actief een woning" : "Ik zoek momenteel geen woning"}
            </label>
          </div>
        </div>

        {/* Documents Section */}
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

        {/* Belangrijke Informatie - Moved to bottom */}
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
      </div>
    </div>
  );
};
