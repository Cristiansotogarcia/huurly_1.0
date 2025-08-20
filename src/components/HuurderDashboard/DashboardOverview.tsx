import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  FileText, 
  Home, 
  Star, 
  MessageSquare, 
  Bell,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardOverviewProps {
  stats: {
    profileViews: number;
    invitations: number;
    applications: number;
    acceptedApplications: number;
  };
  subscription: {
    status: string;
    endDate?: string;
  } | null;
  unreadMessages: number;
  unreadNotifications: number;
  profileCompleteness: number;
  onShowProfileModal: () => void;
  onShowDocumentModal: () => void;
  onNavigateSearch: () => void;
  onNavigateMessages: () => void;
  onNavigateNotifications: () => void;
  onNavigateMatches: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  subscription,
  unreadMessages,
  unreadNotifications,
  profileCompleteness,
  onShowProfileModal,
  onShowDocumentModal,
  onNavigateSearch,
  onNavigateMessages,
  onNavigateNotifications,
  onNavigateMatches
}) => {
  const isSubscribed = subscription?.status === 'active';
  
  const getSubscriptionBadge = () => {
    if (!subscription) return null;
    
    switch (subscription.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Actief</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactief</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Geannuleerd</Badge>;
      default:
        return <Badge variant="secondary">Onbekend</Badge>;
    }
  };

  const getProfileCompletenessColor = () => {
    if (profileCompleteness >= 80) return 'text-green-600';
    if (profileCompleteness >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfileCompletenessText = () => {
    if (profileCompleteness >= 90) return 'Uitstekend';
    if (profileCompleteness >= 70) return 'Goed';
    if (profileCompleteness >= 50) return 'Redelijk';
    return 'Noodzakelijk';
  };

  return (
    <div className="space-y-6">
      {/* Subscription Status Banner */}
      {subscription && (
        <div className={`rounded-lg p-4 ${
          isSubscribed 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className={`h-5 w-5 ${isSubscribed ? 'text-green-600' : 'text-yellow-600'}`} />
              <div>
                <p className="font-medium text-sm sm:text-base">
                  {isSubscribed ? 'Premium Abonnement Actief' : 'Abonnement Nodig'}
                </p>
                {subscription.endDate && (
                  <p className="text-xs text-gray-600">
                    Verloopt op {new Date(subscription.endDate).toLocaleDateString('nl-NL')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getSubscriptionBadge()}
              {!isSubscribed && (
                <Button size="sm" variant="default" onClick={() => window.location.href = '/abonnement'}>
                  Abonnement activeren
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onNavigateMatches}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Matches</p>
                <p className="text-2xl font-bold text-blue-600">{stats.invitations}</p>
              </div>
              <Star className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onNavigateMessages}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Berichten</p>
                <p className="text-2xl font-bold text-green-600">{stats.applications}</p>
              </div>
              <div className="relative">
                <MessageSquare className="h-8 w-8 text-green-500" />
                {unreadMessages > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadMessages}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onNavigateNotifications}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notificaties</p>
                <p className="text-2xl font-bold text-purple-600">{unreadNotifications}</p>
              </div>
              <div className="relative">
                <Bell className="h-8 w-8 text-purple-500" />
                {unreadNotifications > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profiel</p>
                <p className={`text-2xl font-bold ${getProfileCompletenessColor()}`}>
                  {profileCompleteness}%
                </p>
              </div>
              <User className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{getProfileCompletenessText()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Snelle Acties
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20"
            onClick={onShowProfileModal}
          >
            <User className="h-6 w-6 mb-2" />
            <span className="text-xs">Profiel</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20"
            onClick={onShowDocumentModal}
          >
            <FileText className="h-6 w-6 mb-2" />
            <span className="text-xs">Documenten</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20"
            onClick={onNavigateSearch}
          >
            <Home className="h-6 w-6 mb-2" />
            <span className="text-xs">Zoeken</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center justify-center h-20"
            onClick={onNavigateMatches}
          >
            <Star className="h-6 w-6 mb-2" />
            <span className="text-xs">Matches</span>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Recente Activiteit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Profiel bijgewerkt</p>
                <p className="text-xs text-gray-500">2 uur geleden</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Nieuw bericht ontvangen</p>
                <p className="text-xs text-gray-500">5 uur geleden</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Nieuwe match gevonden</p>
                <p className="text-xs text-gray-500">1 dag geleden</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
