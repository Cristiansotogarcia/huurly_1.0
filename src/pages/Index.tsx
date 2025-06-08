
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { CTA } from '@/components/CTA';
import { Logo } from '@/components/Logo';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'huurder':
          navigate('/huurder-dashboard');
          break;
        case 'verhuurder':
          navigate('/verhuurder-dashboard');
          break;
        case 'beoordelaar':
          navigate('/beoordelaar-dashboard');
          break;
        case 'beheerder':
          navigate('/beheerder-dashboard');
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <CTA />
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo className="mb-4" />
              <p className="text-gray-400">
                Het Nederlandse platform waar verhuurders huurders vinden.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Voor Huurders</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Profiel aanmaken</li>
                <li>Document verificatie</li>
                <li>Matches ontvangen</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Voor Verhuurders</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Huurders zoeken</li>
                <li>Geverifieerde profielen</li>
                <li>Direct contact</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help centrum</li>
                <li>Contact</li>
                <li>Veelgestelde vragen</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Huurly. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
