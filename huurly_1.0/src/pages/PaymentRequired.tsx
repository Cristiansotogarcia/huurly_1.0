import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Check } from 'lucide-react';

const PaymentRequired = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Huurder Premium',
      price: '€19,99',
      period: 'per maand',
      features: [
        'Onbeperkt zoeken naar woningen',
        'Direct contact met verhuurders',
        'Prioriteit bij bezichtigingen',
        'Geavanceerde filters',
        'Persoonlijke matching'
      ]
    },
    {
      name: 'Verhuurder Premium',
      price: '€29,99',
      period: 'per maand',
      features: [
        'Onbeperkt advertenties plaatsen',
        'Geavanceerde huurder screening',
        'Automatische matching',
        'Analytics en rapportages',
        'Prioriteit ondersteuning'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <CreditCard className="w-16 h-16 text-dutch-orange mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Premium abonnement vereist</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Om toegang te krijgen tot alle functies van Huurly, heb je een premium abonnement nodig. 
            Kies het plan dat bij jou past.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {plans.map((plan, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-dutch-blue">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full">
                  Kies {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mr-4"
          >
            Terug naar home
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
          >
            Ga terug
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequired;
