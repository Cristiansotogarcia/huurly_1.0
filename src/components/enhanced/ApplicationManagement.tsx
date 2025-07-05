import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { applicationService, Application } from '@/services/ApplicationService';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Eye, MessageSquare, Clock, Home, User, Euro, CalendarDays } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ApplicationWithDetails extends Application {
  woningen?: {
    titel: string;
    adres: string;
    stad: string;
    huurprijs?: number;
  };
  huurders?: {
    naam: string;
    email: string;
    profielfoto_url?: string;
  };
}

interface ApplicationManagementProps {
  userRole?: 'verhuurder' | 'huurder';
}

export const ApplicationManagement: React.FC<ApplicationManagementProps> = ({
  userRole = 'verhuurder'
}) => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const result = await applicationService.getApplications();
      if (result.success && result.data) {
        setApplications(result.data as ApplicationWithDetails[]);
      }
    } catch (error) {
      toast({
        title: 'Fout bij laden aanvragen',
        description: 'Er kon geen verbinding worden gemaakt met de database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'geaccepteerd' | 'afgewezen') => {
    setProcessingId(applicationId);
    try {
      const result = await applicationService.updateApplicationStatus(applicationId, action);
      if (result.success) {
        toast({
          title: action === 'geaccepteerd' ? 'Aanvraag geaccepteerd' : 'Aanvraag afgewezen',
          description: `De aanvraag is ${action === 'geaccepteerd' ? 'geaccepteerd' : 'afgewezen'}.`,
        });
        await loadApplications();
      } else {
        throw new Error(result.error?.message || 'Fout bij verwerken aanvraag');
      }
    } catch (error) {
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Er is een onverwachte fout opgetreden.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    setProcessingId(applicationId);
    try {
      const result = await applicationService.withdrawApplication(applicationId);
      if (result.success) {
        toast({
          title: 'Aanvraag ingetrokken',
          description: 'Je aanvraag is succesvol ingetrokken.',
        });
        await loadApplications();
      }
    } catch (error) {
      toast({
        title: 'Fout',
        description: 'Er is een fout opgetreden bij het intrekken van de aanvraag.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'wachtend':
        return 'bg-yellow-100 text-yellow-800';
      case 'geaccepteerd':
        return 'bg-green-100 text-green-800';
      case 'afgewezen':
        return 'bg-red-100 text-red-800';
      case 'ingetrokken':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'wachtend':
        return 'In behandeling';
      case 'geaccepteerd':
        return 'Geaccepteerd';
      case 'afgewezen':
        return 'Afgewezen';
      case 'ingetrokken':
        return 'Ingetrokken';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'wachtend':
        return <Clock className="w-4 h-4" />;
      case 'geaccepteerd':
        return <Check className="w-4 h-4" />;
      case 'afgewezen':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filterApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  const ApplicationCard: React.FC<{ application: ApplicationWithDetails }> = ({ application }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {userRole === 'verhuurder' && application.huurders && (
              <>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={application.huurders.profielfoto_url} />
                  <AvatarFallback>
                    {application.huurders.naam.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{application.huurders.naam}</h4>
                  <p className="text-sm text-muted-foreground">{application.huurders.email}</p>
                </div>
              </>
            )}
            
            {userRole === 'huurder' && application.woningen && (
              <>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Home className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{application.woningen.titel}</h4>
                  <p className="text-sm text-muted-foreground">
                    {application.woningen.adres}, {application.woningen.stad}
                  </p>
                </div>
              </>
            )}
          </div>
          
          <Badge className={getStatusColor(application.status)} variant="secondary">
            <div className="flex items-center gap-1">
              {getStatusIcon(application.status)}
              {getStatusText(application.status)}
            </div>
          </Badge>
        </div>

        {application.woningen?.huurprijs && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Euro className="w-4 h-4 mr-1" />
            €{application.woningen.huurprijs.toLocaleString()} per maand
          </div>
        )}

        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <CalendarDays className="w-4 h-4 mr-1" />
          {formatDistanceToNow(new Date(application.aangemaakt_op), { 
            addSuffix: true, 
            locale: nl 
          })}
        </div>

        {application.bericht && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            "{application.bericht}"
          </p>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedApplication(application);
              setShowDetailModal(true);
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            Details
          </Button>

          {userRole === 'verhuurder' && application.status === 'wachtend' && (
            <>
              <Button
                size="sm"
                onClick={() => handleApplicationAction(application.id, 'geaccepteerd')}
                disabled={processingId === application.id}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Accepteren
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleApplicationAction(application.id, 'afgewezen')}
                disabled={processingId === application.id}
              >
                <X className="w-4 h-4 mr-1" />
                Afwijzen
              </Button>
            </>
          )}

          {userRole === 'huurder' && application.status === 'wachtend' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleWithdrawApplication(application.id)}
              disabled={processingId === application.id}
            >
              Intrekken
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {userRole === 'verhuurder' ? 'Verhuur Aanvragen' : 'Mijn Aanvragen'}
        </h2>
      </div>

      <Tabs defaultValue="wachtend" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wachtend" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            In behandeling ({filterApplicationsByStatus('wachtend').length})
          </TabsTrigger>
          <TabsTrigger value="geaccepteerd" className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Geaccepteerd ({filterApplicationsByStatus('geaccepteerd').length})
          </TabsTrigger>
          <TabsTrigger value="afgewezen" className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Afgewezen ({filterApplicationsByStatus('afgewezen').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wachtend" className="space-y-4">
          {filterApplicationsByStatus('wachtend').map(application => (
            <ApplicationCard key={application.id} application={application} />
          ))}
          {filterApplicationsByStatus('wachtend').length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Geen aanvragen in behandeling
                </h3>
                <p className="text-gray-600">
                  Er zijn momenteel geen aanvragen die wachten op behandeling.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="geaccepteerd" className="space-y-4">
          {filterApplicationsByStatus('geaccepteerd').map(application => (
            <ApplicationCard key={application.id} application={application} />
          ))}
          {filterApplicationsByStatus('geaccepteerd').length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Check className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Geen geaccepteerde aanvragen
                </h3>
                <p className="text-gray-600">
                  Er zijn nog geen aanvragen geaccepteerd.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="afgewezen" className="space-y-4">
          {filterApplicationsByStatus('afgewezen').map(application => (
            <ApplicationCard key={application.id} application={application} />
          ))}
          {filterApplicationsByStatus('afgewezen').length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <X className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Geen afgewezen aanvragen
                </h3>
                <p className="text-gray-600">
                  Er zijn geen afgewezen aanvragen.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Application Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aanvraag Details</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedApplication.status)} variant="secondary">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedApplication.status)}
                    {getStatusText(selectedApplication.status)}
                  </div>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(selectedApplication.aangemaakt_op), { 
                    addSuffix: true, 
                    locale: nl 
                  })}
                </span>
              </div>

              {userRole === 'verhuurder' && selectedApplication.huurders && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Huurder Informatie
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={selectedApplication.huurders.profielfoto_url} />
                        <AvatarFallback>
                          {selectedApplication.huurders.naam.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{selectedApplication.huurders.naam}</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplication.huurders.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {userRole === 'huurder' && selectedApplication.woningen && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      Woning Informatie
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium mb-2">{selectedApplication.woningen.titel}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {selectedApplication.woningen.adres}, {selectedApplication.woningen.stad}
                    </p>
                    {selectedApplication.woningen.huurprijs && (
                      <div className="flex items-center text-sm">
                        <Euro className="w-4 h-4 mr-1" />
                        €{selectedApplication.woningen.huurprijs.toLocaleString()} per maand
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {selectedApplication.bericht && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Bericht
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedApplication.bericht}</p>
                  </CardContent>
                </Card>
              )}

              {userRole === 'verhuurder' && selectedApplication.status === 'wachtend' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      handleApplicationAction(selectedApplication.id, 'geaccepteerd');
                      setShowDetailModal(false);
                    }}
                    disabled={processingId === selectedApplication.id}
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accepteren
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleApplicationAction(selectedApplication.id, 'afgewezen');
                      setShowDetailModal(false);
                    }}
                    disabled={processingId === selectedApplication.id}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Afwijzen
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};