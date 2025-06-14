
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome Card */}
          <StandardCard
            title={`Welkom, ${userName}`}
            description="Dit is je persoonlijke dashboard. Hier kun je je profiel beheren, documenten uploaden en woningen zoeken."
            icon={Home}
          >
            <div className="flex flex-wrap gap-4">
              {!hasProfile && (
                <Button onClick={onShowProfileModal}>
                  <User className="mr-2 h-4 w-4" /> Maak Profiel Aan
                </Button>
              )}
              <Button variant="outline" onClick={onShowDocumentModal}>
                <Upload className="mr-2 h-4 w-4" /> Documenten Uploaden
              </Button>
              <Button onClick={onStartSearch}>
                <Search className="mr-2 h-4 w-4" /> Zoek Woningen
              </Button>
            </div>
          </StandardCard>

          {/* Profile Status */}
          <StandardCard
            title="Profiel Status"
            description="Beheer de zichtbaarheid van je profiel voor verhuurders."
            icon={User}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="looking-status"
                  checked={isLookingForPlace}
                  onCheckedChange={onToggleLookingStatus}
                  disabled={isUpdatingStatus}
                />
                <label htmlFor="looking-status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {isLookingForPlace ? "Ik zoek actief een woning" : "Ik zoek momenteel geen woning"}
                </label>
              </div>
              {isUpdatingStatus && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
          </StandardCard>

          {/* Documents Section */}
          <StandardCard
            title="Mijn Documenten"
            description="Upload en beheer belangrijke documenten zoals loonstroken en identiteitsbewijzen."
            icon={FileText}
          >
            {userDocuments.length > 0 ? (
              <ul className="space-y-2">
                {userDocuments.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <span className="text-sm font-medium">{doc.file_name}</span>
                    <Badge variant="secondary">{doc.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={FileText}
                title="Geen documenten geüpload"
                description="Upload je documenten om je profiel compleet te maken."
                action={{
                  label: "Documenten Uploaden",
                  onClick: onShowDocumentModal
                }}
              />
            )}
          </StandardCard>

          {/* Statistics Section */}
          <StandardCard
            title="Statistieken"
            description="Overzicht van je activiteit op Huurly"
            icon={TrendingUp}
          >
            <div className="grid grid-cols-2 gap-4">
              <StatsWidget
                title="Profiel weergaven"
                value={stats.profileViews}
                icon={Eye}
                loading={isLoadingStats}
              />
              <StatsWidget
                title="Uitnodigingen"
                value={stats.invitations}
                icon={Calendar}
                loading={isLoadingStats}
              />
              <StatsWidget
                title="Aanvragen"
                value={stats.applications}
                icon={FileText}
                loading={isLoadingStats}
              />
              <StatsWidget
                title="Geaccepteerd"
                value={stats.acceptedApplications}
                icon={CheckCircle}
                loading={isLoadingStats}
              />
            </div>
          </StandardCard>
        </div>

        {/* Sidebar / Quick Actions */}
        <div className="lg:col-span-1 space-y-8">
          <StandardCard
            title="Snelle Acties"
            description="Handige links voor snelle toegang."
            icon={Calendar}
          >
            <div className="space-y-4">
              <Button variant="outline" className="w-full" onClick={onShowProfileModal}>
                <User className="mr-2 h-4 w-4" /> Profiel Bewerken
              </Button>
              <Button variant="outline" className="w-full" onClick={onShowDocumentModal}>
                <Upload className="mr-2 h-4 w-4" /> Documenten Beheren
              </Button>
              <Button variant="outline" className="w-full" onClick={onStartSearch}>
                <Search className="mr-2 h-4 w-4" /> Woningen Zoeken
              </Button>
              <Button variant="outline" className="w-full" onClick={onReportIssue}>
                <Bell className="mr-2 h-4 w-4" /> Probleem Melden
              </Button>
              <Button variant="outline" className="w-full" onClick={onHelpSupport}>
                <Settings className="mr-2 h-4 w-4" /> Help & Support
              </Button>
            </div>
          </StandardCard>

          <StandardCard
            title="Belangrijke Informatie"
            description="Lees meer over onze voorwaarden en privacybeleid."
            icon={FileText}
          >
            <div className="space-y-2">
              <a href="/algemene-voorwaarden" className="text-blue-600 hover:underline block">Algemene Voorwaarden</a>
              <a href="/privacybeleid" className="text-blue-600 hover:underline block">Privacybeleid</a>
            </div>
          </StandardCard>
        </div>
      </div>
    </div>
  );
};
