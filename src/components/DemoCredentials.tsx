import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, User, Briefcase, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const DEMO_CREDENTIALS = [
  {
    role: 'huurder',
    email: 'emma.bakker@email.nl',
    password: 'demo123',
    name: 'Emma Bakker',
    icon: User,
    color: 'bg-blue-500',
    description: 'Zoekt een woning om te huren'
  },
  {
    role: 'verhuurder',
    email: 'bas.verhuur@email.nl',
    password: 'demo123',
    name: 'Bas van der Berg',
    icon: Briefcase,
    color: 'bg-orange-500',
    description: 'Verhuurt woningen'
  },
  {
    role: 'beoordelaar',
    email: 'lisa.reviewer@huurly.nl',
    password: 'demo123',
    name: 'Lisa de Vries',
    icon: Shield,
    color: 'bg-green-500',
    description: 'Beoordeelt documenten en profielen'
  },
  {
    role: 'beheerder',
    email: 'admin@huurly.nl',
    password: 'demo123',
    name: 'Admin Huurly',
    icon: Users,
    color: 'bg-purple-500',
    description: 'Beheert het platform'
  }
];

export const DemoCredentials = () => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Gekopieerd!",
      description: `${type} is gekopieerd naar het klembord.`,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Demo Inloggegevens</CardTitle>
        <p className="text-center text-gray-600">
          Gebruik deze accounts om de verschillende dashboards te testen
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {DEMO_CREDENTIALS.map((cred) => {
            const IconComponent = cred.icon;
            return (
              <div key={cred.role} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${cred.color} rounded-full flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold capitalize">{cred.role}</h3>
                    <p className="text-sm text-gray-600">{cred.name}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    Demo
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-500">{cred.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email:</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {cred.email}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(cred.email, 'Email')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Wachtwoord:</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {cred.password}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(cred.password, 'Wachtwoord')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Testinstructies:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Alle accounts gebruiken het wachtwoord: <code className="bg-blue-100 px-1 rounded">demo123</code></li>
            <li>• Huurder account heeft betaald abonnement (€59.99/jaar + BTW)</li>
            <li>• Verhuurder account is gratis maar vereist goedkeuring</li>
            <li>• Beoordelaar en Beheerder hebben volledige toegang</li>
            <li>• Dashboard data is leeg voor real-world testing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
