import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageSquare, 
  Book, 
  FileText,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal = ({ isOpen, onClose }: HelpSupportModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  });

  const handleContactSubmit = async () => {
    if (!contactForm.subject || !contactForm.message) {
      toast({
        title: 'Velden verplicht',
        description: 'Vul zowel onderwerp als bericht in.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual contact form submission
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: 'Bericht verzonden',
        description: 'Je bericht is verstuurd. We nemen binnen 24 uur contact met je op.',
      });
      
      setContactForm({ subject: '', message: '', priority: 'normal' });
    } catch (error) {
      toast({
        title: 'Fout bij verzenden',
        description: 'Er is een fout opgetreden. Probeer het later opnieuw.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const faqItems = [
    {
      question: 'Hoe maak ik een sterk profiel?',
      answer: 'Een compleet profiel met alle documenten, een professionele foto en een uitgebreide motivatie verhoogt je kansen aanzienlijk. Zorg ervoor dat je inkomen en werkgever duidelijk vermeld staan.'
    },
    {
      question: 'Wanneer wordt mijn abonnement verlengd?',
      answer: 'Je abonnement wordt automatisch verlengd op de vervaldatum. Je ontvangt 14 dagen van tevoren een herinnering per e-mail.'
    },
    {
      question: 'Hoe lang duurt documentverificatie?',
      answer: 'Documentverificatie duurt meestal 1-3 werkdagen. Je ontvangt een melding zodra je documenten zijn beoordeeld.'
    },
    {
      question: 'Kan ik mijn abonnement opzeggen?',
      answer: 'Ja, je kunt je abonnement op elk moment opzeggen via de abonnement-pagina. Het blijft actief tot de vervaldatum.'
    },
    {
      question: 'Waarom zie ik geen reacties van verhuurders?',
      answer: 'Zorg ervoor dat je profiel compleet is, alle documenten zijn geverifieerd en je binnen het budget van de verhuurder valt.'
    },
    {
      question: 'Hoe werkt de matching?',
      answer: 'Ons algoritme koppelt je op basis van locatie, budget, voorkeuren en geschiktheid. Een hogere match-score betekent betere kansen.'
    }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: 'E-mail support',
      description: 'Voor algemene vragen en ondersteuning',
      action: 'support@huurly.nl',
      link: 'mailto:support@huurly.nl'
    },
    {
      icon: Phone,
      title: 'Telefonische support',
      description: 'Ma-Vr 9:00-17:00',
      action: '+31 20 123 4567',
      link: 'tel:+31201234567'
    },
    {
      icon: MessageSquare,
      title: 'Live chat',
      description: 'Directe hulp tijdens kantooruren',
      action: 'Start chat',
      link: '#'
    }
  ];

  const resources = [
    {
      icon: Book,
      title: 'Gebruikershandleiding',
      description: 'Stap-voor-stap instructies voor het platform',
      link: '/docs/handleiding'
    },
    {
      icon: FileText,
      title: 'Veelgestelde vragen',
      description: 'Antwoorden op de meest voorkomende vragen',
      link: '/docs/faq'
    },
    {
      icon: FileText,
      title: 'Tips voor huurders',
      description: 'Hoe vergroot je je kansen op de woningmarkt',
      link: '/docs/tips'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5" />
            <span>Help & Ondersteuning</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">
              <Book className="w-4 h-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="resources">
              <FileText className="w-4 h-4 mr-2" />
              Bronnen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Veelgestelde vragen</h3>
              
              <div className="space-y-3">
                {faqItems.map((item, index) => (
                  <details 
                    key={index}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  >
                    <summary className="font-medium flex items-center justify-between">
                      {item.question}
                      <ChevronRight className="w-4 h-4" />
                    </summary>
                    <div className="mt-3 text-gray-600 text-sm">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Nog steeds hulp nodig?</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Kun je je vraag niet vinden? Neem contact met ons op voor persoonlijke ondersteuning.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const tabsList = document.querySelector('[role="tablist"]');
                    const contactTab = tabsList?.querySelector('[value="contact"]') as HTMLElement;
                    contactTab?.click();
                  }}
                >
                  Contact opnemen
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Neem contact met ons op</h3>
              
              {/* Contact Methods */}
              <div className="grid gap-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                    <method.icon className="w-6 h-6 text-blue-600 mr-4" />
                    <div className="flex-1">
                      <h4 className="font-medium">{method.title}</h4>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (method.link.startsWith('#')) {
                          toast({
                            title: 'Live chat',
                            description: 'Live chat is momenteel niet beschikbaar. Gebruik e-mail of telefoon.',
                          });
                        } else {
                          window.open(method.link, '_blank');
                        }
                      }}
                    >
                      {method.action}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Contact Form */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Of stuur ons een bericht</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Onderwerp</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="Waar kunnen we je mee helpen?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Bericht</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Beschrijf je vraag of probleem zo gedetailleerd mogelijk..."
                      rows={5}
                    />
                  </div>

                  <Button onClick={handleContactSubmit} disabled={loading} className="w-full">
                    {loading ? 'Bezig met verzenden...' : 'Bericht verzenden'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Nuttige bronnen</h3>
              
              <div className="grid gap-4">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center p-4 border rounded-lg hover:bg-gray-50">
                    <resource.icon className="w-6 h-6 text-green-600 mr-4" />
                    <div className="flex-1">
                      <h4 className="font-medium">{resource.title}</h4>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: 'Documentatie',
                          description: 'Documentatie wordt binnenkort beschikbaar gesteld.',
                        });
                      }}
                    >
                      Bekijken
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">💡 Pro tip</h4>
                <p className="text-sm text-green-800">
                  Check regelmatig onze FAQ en documentatie - we voegen constant nieuwe tips 
                  en handleidingen toe om je te helpen slagen op de woningmarkt.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};