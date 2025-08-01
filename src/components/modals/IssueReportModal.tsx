import React, { useState } from 'react';
import UnifiedModal from '@/components/modals/UnifiedModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Bug, Zap, Shield, HelpCircle } from 'lucide-react';

interface IssueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IssueReportModal({ isOpen, onClose }: IssueReportModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [issueData, setIssueData] = useState({
    category: '',
    priority: 'normal',
    subject: '',
    description: '',
    steps: '',
    browser: '',
    device: ''
  });

  const issueCategories = [
    { value: 'bug', label: 'Bug/Fout in systeem', icon: Bug },
    { value: 'performance', label: 'Prestatie problemen', icon: Zap },
    { value: 'security', label: 'Beveiligingsprobleem', icon: Shield },
    { value: 'feature', label: 'Feature verzoek', icon: HelpCircle },
    { value: 'account', label: 'Account problemen', icon: AlertTriangle },
    { value: 'payment', label: 'Betalingsproblemen', icon: AlertTriangle },
    { value: 'other', label: 'Anders', icon: HelpCircle }
  ];

  const handleSubmit = async () => {
    if (!issueData.category || !issueData.subject || !issueData.description) {
      toast({
        title: 'Velden ontbreken',
        description: 'Vul alle verplichte velden in om door te gaan.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual issue submission
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast({
        title: 'Issue gemeld',
        description: 'Je probleem is gemeld. We gaan er zo snel mogelijk mee aan de slag.',
      });
      
      // Reset form
      setIssueData({
        category: '',
        priority: 'normal',
        subject: '',
        description: '',
        steps: '',
        browser: '',
        device: ''
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Fout bij verzenden',
        description: 'Er is een fout opgetreden bij het melden van je probleem.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const detectBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    const browser = userAgent.includes('Chrome') ? 'Chrome' :
                   userAgent.includes('Firefox') ? 'Firefox' :
                   userAgent.includes('Safari') ? 'Safari' :
                   userAgent.includes('Edge') ? 'Edge' : 'Onbekend';
    
    const device = /Mobi|Android/i.test(userAgent) ? 'Mobiel' : 'Desktop';
    
    setIssueData(prev => ({
      ...prev,
      browser: `${browser} - ${navigator.appVersion}`,
      device: `${device} - ${screen.width}x${screen.height}`
    }));
  };

  React.useEffect(() => {
    if (isOpen) {
      detectBrowserInfo();
    }
  }, [isOpen]);

  return (
    <UnifiedModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <span>Probleem melden</span>
        </div>
      }
      size="lg"
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">
            Annuleren
          </Button>
          <Button onClick={handleSubmit} variant="default" disabled={loading}>
            {loading ? 'Bezig met melden...' : 'Probleem melden'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Tip:</strong> Beschrijf je probleem zo gedetailleerd mogelijk. 
            Hoe meer informatie je geeft, hoe sneller we het kunnen oplossen.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categorie *</Label>
            <Select 
              value={issueData.category} 
              onValueChange={(value) => setIssueData({ ...issueData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecteer de categorie van je probleem" />
              </SelectTrigger>
              <SelectContent>
                {issueCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center space-x-2">
                      <category.icon className="w-4 h-4" />
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Prioriteit</Label>
            <Select 
              value={issueData.priority} 
              onValueChange={(value) => setIssueData({ ...issueData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Laag - Kan wachten</SelectItem>
                <SelectItem value="normal">Normaal - Standaard</SelectItem>
                <SelectItem value="high">Hoog - Belangrijk</SelectItem>
                <SelectItem value="urgent">Urgent - Blokkerend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Onderwerp *</Label>
            <Input
              id="subject"
              value={issueData.subject}
              onChange={(e) => setIssueData({ ...issueData, subject: e.target.value })}
              placeholder="Korte beschrijving van het probleem"
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{issueData.subject.length}/100 karakters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Gedetailleerde beschrijving *</Label>
            <Textarea
              id="description"
              value={issueData.description}
              onChange={(e) => setIssueData({ ...issueData, description: e.target.value })}
              placeholder="Beschrijf wat er gebeurde, wat je verwachtte en wat er fout ging..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">{issueData.description.length}/1000 karakters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="steps">Stappen om te reproduceren</Label>
            <Textarea
              id="steps"
              value={issueData.steps}
              onChange={(e) => setIssueData({ ...issueData, steps: e.target.value })}
              placeholder="1. Ga naar pagina X&#10;2. Klik op knop Y&#10;3. Zie fout Z"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              Optioneel - Help ons het probleem na te bootsen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="browser">Browser informatie</Label>
              <Input
                id="browser"
                value={issueData.browser}
                onChange={(e) => setIssueData({ ...issueData, browser: e.target.value })}
                placeholder="Automatisch gedetecteerd"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="device">Apparaat informatie</Label>
              <Input
                id="device"
                value={issueData.device}
                onChange={(e) => setIssueData({ ...issueData, device: e.target.value })}
                placeholder="Automatisch gedetecteerd"
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Wat gebeurt er hierna?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Je ontvangt een bevestiging per e-mail</li>
            <li>• Ons team beoordeelt je melding binnen 1 werkdag</li>
            <li>• Bij urgente problemen nemen we binnen 4 uur contact op</li>
            <li>• Je wordt op de hoogte gehouden van de voortgang</li>
          </ul>
        </div>
      </div>
    </UnifiedModal>
  );
};