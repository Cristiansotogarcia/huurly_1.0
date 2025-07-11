import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Search, Phone, Mail, MessageCircle, FileText, HelpCircle } from 'lucide-react';

const HelpSupport: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = [
    {
      category: 'Account & Profiel',
      questions: [
        {
          question: 'Hoe kan ik mijn profiel aanpassen?',
          answer: 'Ga naar uw dashboard en klik op "Profiel Bewerken". Hier kunt u al uw persoonlijke gegevens, voorkeuren en documenten bijwerken.'
        },
        {
          question: 'Hoe upload ik documenten?',
          answer: 'In uw dashboard vindt u de sectie "Documenten". Klik op "Document Toevoegen" en selecteer het juiste documenttype. Ondersteunde formaten zijn PDF, JPG en PNG.'
        },
        {
          question: 'Waarom is mijn profiel niet compleet?',
          answer: 'Een compleet profiel vereist alle persoonlijke gegevens, werkgegevens, inkomensgegevens en de benodigde documenten. Controleer de profielstatus op uw dashboard.'
        }
      ]
    },
    {
      category: 'Woningen Zoeken',
      questions: [
        {
          question: 'Hoe zoek ik naar woningen?',
          answer: 'Gebruik de zoekfunctie om woningen te filteren op locatie, prijs, aantal kamers en andere voorkeuren. U kunt woningen ook opslaan als favoriet.'
        },
        {
          question: 'Hoe reageer ik op een woning?',
          answer: 'Klik op een woning die u interesseert en gebruik de "Reageren" knop. Zorg ervoor dat uw profiel compleet is voor de beste kansen.'
        },
        {
          question: 'Waarom zie ik geen woningen?',
          answer: 'Dit kan komen door uw zoekfilters of omdat er momenteel geen woningen beschikbaar zijn die aan uw criteria voldoen. Probeer uw filters aan te passen.'
        }
      ]
    },
    {
      category: 'Abonnement & Betaling',
      questions: [
        {
          question: 'Welke abonnementen zijn er beschikbaar?',
          answer: 'We bieden verschillende abonnementen aan, van basis tot premium. Elk abonnement geeft toegang tot verschillende functies en aantal reacties per maand.'
        },
        {
          question: 'Hoe kan ik mijn abonnement opzeggen?',
          answer: 'Ga naar uw accountinstellingen en selecteer "Abonnement beheren". Hier kunt u uw abonnement wijzigen of opzeggen.'
        },
        {
          question: 'Wanneer wordt mijn abonnement verlengd?',
          answer: 'Abonnementen worden automatisch verlengd op de vervaldatum, tenzij u deze heeft opgezegd. U ontvangt vooraf een herinnering.'
        }
      ]
    },
    {
      category: 'Technische Problemen',
      questions: [
        {
          question: 'De website laadt niet goed',
          answer: 'Probeer uw browser cache te legen, cookies te verwijderen, of gebruik een andere browser. Controleer ook uw internetverbinding.'
        },
        {
          question: 'Ik kan niet inloggen',
          answer: 'Controleer uw e-mailadres en wachtwoord. Gebruik de "Wachtwoord vergeten" functie als u uw wachtwoord niet meer weet.'
        },
        {
          question: 'Upload van documenten mislukt',
          answer: 'Zorg ervoor dat uw bestand kleiner is dan 10MB en in een ondersteund formaat (PDF, JPG, PNG). Probeer het opnieuw met een stabiele internetverbinding.'
        }
      ]
    }
  ];

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600 mt-2">
            Vind antwoorden op veelgestelde vragen of neem contact met ons op voor persoonlijke hulp.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/issue-reporting')}>
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Probleem Melden</h3>
              <p className="text-sm text-gray-600 mt-1">Meld een technisch probleem of bug</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Phone className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">Bel Ons</h3>
              <p className="text-sm text-gray-600 mt-1">020-1234567 (ma-vr 9:00-17:00)</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Mail className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900">E-mail Support</h3>
              <p className="text-sm text-gray-600 mt-1">support@huurly.nl</p>
            </CardContent>
          </Card>
        </div>

        {/* Search FAQ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              Veelgestelde Vragen
            </CardTitle>
            <CardDescription>
              Zoek in onze kennisbank voor snelle antwoorden op uw vragen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Zoek in veelgestelde vragen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* FAQ Accordion */}
            {filteredFAQ.length > 0 ? (
              <div className="space-y-6">
                {filteredFAQ.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{category.category}</h3>
                    <Accordion type="single" collapsible className="space-y-2">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`} className="border rounded-lg px-4">
                          <AccordionTrigger className="text-left hover:no-underline">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 pb-4">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Geen resultaten gevonden</h3>
                <p className="text-gray-600">Probeer andere zoektermen of neem direct contact met ons op.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contactgegevens</CardTitle>
              <CardDescription>Verschillende manieren om ons te bereiken</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Telefoon</h4>
                  <p className="text-gray-600">020-1234567</p>
                  <p className="text-sm text-gray-500">Maandag t/m vrijdag: 9:00 - 17:00</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">E-mail</h4>
                  <p className="text-gray-600">support@huurly.nl</p>
                  <p className="text-sm text-gray-500">Responstijd: binnen 24 uur</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Live Chat</h4>
                  <p className="text-gray-600">Beschikbaar op werkdagen</p>
                  <p className="text-sm text-gray-500">9:00 - 17:00 (binnenkort beschikbaar)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Handige Links</CardTitle>
              <CardDescription>Snelle toegang tot belangrijke informatie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/algemene-voorwaarden')}>
                <FileText className="w-4 h-4 mr-2" />
                Algemene Voorwaarden
              </Button>
              
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/privacybeleid')}>
                <FileText className="w-4 h-4 mr-2" />
                Privacybeleid
              </Button>
              
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/dashboard')}>
                <FileText className="w-4 h-4 mr-2" />
                Gebruikershandleiding
              </Button>
              
              <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/subscription')}>
                <FileText className="w-4 h-4 mr-2" />
                Abonnement Informatie
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        <Card className="mt-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Urgente Problemen</CardTitle>
            <CardDescription className="text-red-600">
              Voor urgente technische problemen die uw gebruik van het platform blokkeren
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-800 font-medium">24/7 Noodlijn</p>
                <p className="text-red-600">085-1234567</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => navigate('/issue-reporting')}
                className="bg-red-600 hover:bg-red-700"
              >
                Urgent Probleem Melden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpSupport;