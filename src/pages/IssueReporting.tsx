import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send } from 'lucide-react';
import { enhancedLogger as logger } from '@/lib/logger';

interface IssueForm {
  category: string;
  subject: string;
  description: string;
  priority: string;
  contactEmail: string;
}

const IssueReporting: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<IssueForm>({
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
    contactEmail: ''
  });

  const handleInputChange = (field: keyof IssueForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.subject || !formData.description || !formData.contactEmail) {
      toast({
        title: 'Ontbrekende gegevens',
        description: 'Vul alle verplichte velden in.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call - in real implementation, this would send to support system
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      logger.log('Issue report submitted:', formData);
      
      toast({
        title: 'Probleem gemeld',
        description: 'Uw probleem is succesvol gemeld. We nemen binnen 24 uur contact met u op.'
      });
      
      // Reset form
      setFormData({
        category: '',
        subject: '',
        description: '',
        priority: 'medium',
        contactEmail: ''
      });
      
    } catch (error) {
      logger.error('Failed to submit issue report:', error);
      toast({
        title: 'Fout bij verzenden',
        description: 'Er is een fout opgetreden. Probeer het opnieuw.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Probleem Melden</h1>
          <p className="text-gray-600 mt-2">
            Heeft u een probleem of vraag? Laat het ons weten en we helpen u zo snel mogelijk.
          </p>
        </div>

        {/* Issue Report Form */}
        <Card>
          <CardHeader>
            <CardTitle>Beschrijf uw probleem</CardTitle>
            <CardDescription>
              Vul onderstaand formulier zo volledig mogelijk in zodat we u optimaal kunnen helpen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Categorie *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technisch probleem</SelectItem>
                    <SelectItem value="account">Account & Profiel</SelectItem>
                    <SelectItem value="payment">Betaling & Abonnement</SelectItem>
                    <SelectItem value="property">Woning & Zoeken</SelectItem>
                    <SelectItem value="application">Aanvraag & Documenten</SelectItem>
                    <SelectItem value="other">Overig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Prioriteit</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Laag - Algemene vraag</SelectItem>
                    <SelectItem value="medium">Gemiddeld - Standaard probleem</SelectItem>
                    <SelectItem value="high">Hoog - Urgent probleem</SelectItem>
                    <SelectItem value="critical">Kritiek - Blokkerende fout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Onderwerp *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Korte beschrijving van het probleem"
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Beschrijf uw probleem zo gedetailleerd mogelijk. Vermeld eventuele foutmeldingen, stappen die u heeft ondernomen, en wanneer het probleem optreedt."
                  rows={6}
                  maxLength={1000}
                />
                <p className="text-sm text-gray-500">
                  {formData.description.length}/1000 karakters
                </p>
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact e-mail *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="uw.email@voorbeeld.nl"
                />
                <p className="text-sm text-gray-500">
                  We gebruiken dit e-mailadres om contact met u op te nemen over uw probleem.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verzenden...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Probleem Melden
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Andere manieren om contact op te nemen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">E-mail Support</h4>
                <p className="text-gray-600">support@huurly.nl</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Telefonische Support</h4>
                <p className="text-gray-600">020-1234567 (ma-vr 9:00-17:00)</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Responstijd</h4>
                <p className="text-gray-600">We streven ernaar om binnen 24 uur te reageren op uw melding.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IssueReporting;