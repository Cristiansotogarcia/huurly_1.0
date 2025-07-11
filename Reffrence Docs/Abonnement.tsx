import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Crown, Star, Zap, CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import { User } from '@/types';

// Mock user data
const mockUser: User = {
  id: '1',
  email: 'sotocrioyo@gmail.com',
  role: 'huurder',
  name: 'Cristian Soto Garcia',
  isActive: true,
  createdAt: '2025-01-01',
  hasPayment: true,
  subscriptionEndDate: '2025-08-09'
};

// Current subscription data
const currentSubscription = {
  plan: 'basis',
  status: 'actief',
  startDate: '2025-07-01',
  endDate: '2025-08-09',
  price: 9.99,
  autoRenewal: true,
  paymentMethod: 'iDEAL',
  nextBillingDate: '2025-08-09'
};

// Subscription plans (Dutch)
const subscriptionPlans = [
  {
    id: 'basis',
    name: 'Basis',
    price: 9.99,
    period: 'maand',
    description: 'Perfect voor starters',
    popular: false,
    features: [
      '5 woningaanvragen per maand',
      'Basis profiel',
      'E-mail ondersteuning',
      'Zoeken in alle woningen',
      'Basis matching algoritme'
    ],
    limitations: [
      'Beperkte zichtbaarheid',
      'Geen prioriteit bij bezichtigingen'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    period: 'maand',
    description: 'Meest populaire keuze',
    popular: true,
    features: [
      'Onbeperkte woningaanvragen',
      'Prioriteit profiel',
      'Telefoon ondersteuning',
      'Geavanceerde zoekfilters',
      'Document verificatie service',
      'Prioriteit bij bezichtigingen',
      'Uitgebreide matching',
      'Profiel boost functie'
    ],
    limitations: []
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 39.99,
    period: 'maand',
    description: 'Voor serieuze woningzoekers',
    popular: false,
    features: [
      'Alles van Premium',
      'Persoonlijke assistent',
      'Gegarandeerde reactie binnen 24u',
      'Exclusieve woningen',
      'Directe lijn naar verhuurders',
      'Professionele fotoshoot service',
      'Juridische ondersteuning',
      'VIP behandeling'
    ],
    limitations: []
  }
];

// Billing history
const billingHistory = [
  {
    id: '1',
    date: '2025-07-01',
    plan: 'Basis',
    amount: 9.99,
    status: 'betaald',
    paymentMethod: 'iDEAL'
  },
  {
    id: '2',
    date: '2025-06-01',
    plan: 'Basis',
    amount: 9.99,
    status: 'betaald',
    paymentMethod: 'iDEAL'
  },
  {
    id: '3',
    date: '2025-05-01',
    plan: 'Basis',
    amount: 9.99,
    status: 'betaald',
    paymentMethod: 'iDEAL'
  }
];

const Abonnement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [showBillingHistory, setShowBillingHistory] = useState(false);

  const handleUpgrade = (planId: string, planName: string, price: number) => {
    if (planId === currentSubscription.plan) {
      toast({
        title: "Huidig Abonnement",
        description: `Je hebt al het ${planName} abonnement.`,
        variant: "default",
      });
      return;
    }

    toast({
      title: "Doorsturen naar Betaling",
      description: `Je wordt doorgestuurd naar de betaalpagina voor het ${planName} abonnement (€${price}/maand). Gebruik iDEAL als betaalmethode voor testen.`,
    });
    
    // In real implementation, this would integrate with Stripe/Mollie
    setTimeout(() => {
      toast({
        title: "Abonnement Geüpgraded!",
        description: `Je ${planName} abonnement is nu actief. Welkom bij je nieuwe plan!`,
      });
    }, 3000);
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Abonnement Opzeggen",
      description: "Je abonnement wordt aan het einde van de huidige periode beëindigd.",
      variant: "destructive",
    });
  };

  const toggleAutoRenewal = () => {
    toast({
      title: currentSubscription.autoRenewal ? "Automatische Verlenging Uitgeschakeld" : "Automatische Verlenging Ingeschakeld",
      description: currentSubscription.autoRenewal 
        ? "Je abonnement wordt niet automatisch verlengd." 
        : "Je abonnement wordt automatisch verlengd.",
    });
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basis':
        return <Star className="h-6 w-6" />;
      case 'premium':
        return <Crown className="h-6 w-6" />;
      case 'pro':
        return <Zap className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/instellingen');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        user={mockUser}
        onSettings={handleSettings}
        onLogout={handleLogout}
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Abonnement Beheer</h1>
            <p className="text-gray-600">Beheer je abonnement en bekijk je factuurgeschiedenis</p>
          </div>

          {/* Current Subscription Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Huidig Abonnement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Plan</div>
                  <div className="text-lg font-semibold capitalize flex items-center">
                    {getPlanIcon(currentSubscription.plan)}
                    <span className="ml-2">{currentSubscription.plan}</span>
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      {currentSubscription.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Prijs</div>
                  <div className="text-lg font-semibold">€{currentSubscription.price}/maand</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Verloopt op</div>
                  <div className="text-lg font-semibold">{currentSubscription.endDate}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Automatische verlenging</div>
                  <div className="text-lg font-semibold">
                    {currentSubscription.autoRenewal ? 'Aan' : 'Uit'}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={toggleAutoRenewal} variant="outline">
                  {currentSubscription.autoRenewal ? 'Automatische Verlenging Uitschakelen' : 'Automatische Verlenging Inschakelen'}
                </Button>
                <Button onClick={handleCancelSubscription} variant="destructive">
                  Abonnement Opzeggen
                </Button>
                <Button onClick={() => navigate('/huurder-dashboard')} variant="outline">
                  ← Terug naar Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Plans */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Beschikbare Abonnementen</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {subscriptionPlans.map(plan => (
                <Card 
                  key={plan.id} 
                  className={`relative overflow-hidden ${
                    plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  } ${
                    currentSubscription.plan === plan.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
                      Populair
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                      {getPlanIcon(plan.id)}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="text-3xl font-bold text-gray-900 mt-2">
                      €{plan.price}
                      <span className="text-lg font-normal text-gray-600">/{plan.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                      
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-500">{limitation}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleUpgrade(plan.id, plan.name, plan.price)}
                      className={`w-full ${
                        currentSubscription.plan === plan.id
                          ? 'bg-gray-400 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                      disabled={currentSubscription.plan === plan.id}
                    >
                      {currentSubscription.plan === plan.id 
                        ? 'Huidig Plan' 
                        : `Upgrade naar ${plan.name}`
                      }
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Factuurgeschiedenis
                  </CardTitle>
                  <CardDescription>Overzicht van al je betalingen</CardDescription>
                </div>
                <Button 
                  onClick={() => setShowBillingHistory(!showBillingHistory)}
                  variant="outline"
                >
                  {showBillingHistory ? 'Verbergen' : 'Tonen'}
                </Button>
              </div>
            </CardHeader>
            
            {showBillingHistory && (
              <CardContent>
                <div className="space-y-3">
                  {billingHistory.map(bill => (
                    <div key={bill.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{bill.date}</div>
                        <div className="text-sm text-gray-600">{bill.plan} Abonnement</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">€{bill.amount}</div>
                        <div className="text-sm text-gray-600">{bill.paymentMethod}</div>
                      </div>
                      <Badge className={bill.status === 'betaald' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {bill.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                  <Button variant="outline">
                    Download Alle Facturen
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Payment Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Betaalinformatie</CardTitle>
              <CardDescription>Voor testen gebruik iDEAL als betaalmethode</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">Test Omgeving</div>
                    <div className="text-sm text-blue-700 mt-1">
                      Dit is een test omgeving. Voor echte betalingen gebruik iDEAL als voorkeursmethode.
                      Alle transacties zijn gesimuleerd en er worden geen echte betalingen verwerkt.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Abonnement;

