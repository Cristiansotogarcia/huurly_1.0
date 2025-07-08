import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Trash2,
  FileText,
  Clock,
  Users
} from 'lucide-react';

interface DatabaseIssue {
  id: string;
  type: 'warning' | 'error' | 'info';
  table: string;
  description: string;
  count: number;
  action?: string;
}

const DatabaseCleanupAnalysis: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [issues, setIssues] = useState<DatabaseIssue[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  const mockIssues: DatabaseIssue[] = [
    {
      id: '1',
      type: 'warning',
      table: 'gebruikers',
      description: 'Gebruikers zonder profiel informatie',
      count: 12,
      action: 'Verwijder of voltooi profielen'
    },
    {
      id: '2',
      type: 'error',
      table: 'abonnementen',
      description: 'Verlopen abonnementen niet opgeschoond',
      count: 8,
      action: 'Verwijder verlopen records'
    },
    {
      id: '3',
      type: 'info',
      table: 'documenten',
      description: 'Oude documenten (ouder dan 2 jaar)',
      count: 45,
      action: 'Archiveer of verwijder'
    },
    {
      id: '4',
      type: 'warning',
      table: 'berichten',
      description: 'Ongelezen berichten ouder dan 6 maanden',
      count: 23,
      action: 'Markeer als verouderd'
    }
  ];

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIssues(mockIssues);
      setLastAnalysis(new Date());
      toast({
        title: 'Analyse voltooid',
        description: `${mockIssues.length} potentiële problemen gevonden.`,
      });
    } catch (error) {
      toast({
        title: 'Analyse mislukt',
        description: 'Er is een fout opgetreden tijdens de database analyse.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const fixIssue = async (issueId: string) => {
    setLoading(true);
    try {
      // Simulate fix
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIssues(prev => prev.filter(issue => issue.id !== issueId));
      toast({
        title: 'Probleem opgelost',
        description: 'Het database probleem is succesvol opgelost.',
      });
    } catch (error) {
      toast({
        title: 'Fout bij oplossen',
        description: 'Er is een fout opgetreden bij het oplossen van het probleem.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getIssueBadgeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const totalIssues = issues.length;
  const criticalIssues = issues.filter(i => i.type === 'error').length;
  const warnings = issues.filter(i => i.type === 'warning').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Database Opschoning</h1>
            <p className="text-gray-600">Analyseer en optimaliseer je database prestaties</p>
          </div>
          <Button onClick={runAnalysis} disabled={analyzing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Analyseren...' : 'Analyse Starten'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Problemen</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIssues}</div>
              {lastAnalysis && (
                <p className="text-xs text-gray-500">
                  Laatste analyse: {lastAnalysis.toLocaleString('nl-NL')}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kritieke Problemen</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalIssues}</div>
              <p className="text-xs text-gray-500">Directe actie vereist</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waarschuwingen</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{warnings}</div>
              <p className="text-xs text-gray-500">Monitoren aanbevolen</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalIssues === 0 ? 'Gezond' : 'Optimalisatie Nodig'}
              </div>
              <p className="text-xs text-gray-500">Algemene status</p>
            </CardContent>
          </Card>
        </div>

        {/* Issues List */}
        {issues.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Gedetecteerde Problemen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{issue.description}</h3>
                          <Badge className={getIssueBadgeColor(issue.type)}>
                            {issue.type === 'error' ? 'Kritiek' : 
                             issue.type === 'warning' ? 'Waarschuwing' : 'Info'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Tabel: <span className="font-mono">{issue.table}</span> • 
                          Aantal records: <span className="font-semibold">{issue.count}</span>
                        </p>
                        {issue.action && (
                          <p className="text-sm text-blue-600 mt-1">
                            Aanbevolen actie: {issue.action}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fixIssue(issue.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Oplossen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : lastAnalysis ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Database is Gezond</h3>
              <p className="text-gray-600 text-center">
                Geen problemen gedetecteerd tijdens de laatste analyse.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Laatste controle: {lastAnalysis.toLocaleString('nl-NL')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Database className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Database Analyse</h3>
              <p className="text-gray-600 text-center mb-6">
                Start een analyse om de database status te controleren en potentiële problemen te identificeren.
              </p>
              <Button onClick={runAnalysis} disabled={analyzing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
                Analyse Starten
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Aanbevelingen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Reguliere Opschoning</h4>
                  <p className="text-sm text-gray-600">
                    Voer wekelijks een database analyse uit om prestaties te optimaliseren.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Archivering</h4>
                  <p className="text-sm text-gray-600">
                    Archiveer oude documenten en berichten om database grootte te beperken.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Monitoring</h4>
                  <p className="text-sm text-gray-600">
                    Monitor database prestaties en stel waarschuwingen in voor kritieke problemen.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseCleanupAnalysis;