
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { CTA } from '@/components/CTA';
import { Logo } from '@/components/Logo';
import { MultiStepSignupModal } from '@/components/auth/MultiStepSignupModal';
import { EmailConfirmationModal } from '@/components/modals/EmailConfirmationModal';
import { EmailVerificationSuccessModal } from '@/components/modals/EmailVerificationSuccessModal';
import { PaymentSuccessModal } from '@/components/modals/PaymentSuccessModal';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { 
    user, 
    isAuthenticated, 
    showEmailConfirmationModal,
    showEmailVerificationSuccessModal,
    showPaymentSuccessModal,
    signupEmail,
    setShowEmailConfirmationModal,
    setShowEmailVerificationSuccessModal,
    setShowPaymentSuccessModal,
    handleEmailVerificationSuccess,
    handlePaymentSuccess
  } = useAuth();
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    // Debug: Log all URL parts to understand the structure
    console.log('Homepage - Full URL:', window.location.href);
    console.log('Homepage - Hash:', window.location.hash);
    console.log('Homepage - Search:', window.location.search);
    console.log('Homepage - Pathname:', window.location.pathname);
    
    // Check for password recovery token in hash or search params
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    
    // If we have a recovery token, redirect to password reset page and don't do any other redirects
    if ((hash && hash.includes('type=recovery')) || searchParams.get('type') === 'recovery') {
      console.log('Recovery token detected, redirecting to /wachtwoord-herstellen');
      navigate('/wachtwoord-herstellen');
      return;
    }

    // Check for email verification success
    if (hash.includes('type=signup') || searchParams.get('type') === 'signup') {
      console.log('Email verification success detected');
      handleEmailVerificationSuccess();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Check for payment success
    if (searchParams.get('payment') === 'success') {
      console.log('Payment success detected');
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        // Handle payment success with session ID if needed
        console.log('Processing payment success for session:', sessionId);
      }
      handlePaymentSuccess();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Only redirect authenticated users if they don't have special URL parameters and no modals are shown
    if (isAuthenticated && user && !showPaymentSuccessModal && !showEmailVerificationSuccessModal) {
      console.log('User authenticated, redirecting to dashboard:', user.role);
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
  }, [isAuthenticated, user, navigate, handleEmailVerificationSuccess, handlePaymentSuccess]);

  return (
    <div className="min-h-screen">
      <Header onShowSignup={() => setShowSignup(true)} />
      <Hero onShowSignup={() => setShowSignup(true)} />
      <Features />
      <CTA />
      
      <MultiStepSignupModal 
        isOpen={showSignup} 
        onClose={() => setShowSignup(false)} 
      />
      
      <EmailConfirmationModal
        isOpen={showEmailConfirmationModal}
        onClose={() => setShowEmailConfirmationModal(false)}
        email={signupEmail}
      />
      
      <EmailVerificationSuccessModal
        isOpen={showEmailVerificationSuccessModal}
        onClose={() => setShowEmailVerificationSuccessModal(false)}
        onGoToDashboard={() => {
          setShowEmailVerificationSuccessModal(false);
          if (user) {
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
        }}
        userName={user?.name}
      />
      
      <PaymentSuccessModal
        isOpen={showPaymentSuccessModal}
        onClose={() => setShowPaymentSuccessModal(false)}
        onGoToDashboard={() => {
          setShowPaymentSuccessModal(false);
          if (user) {
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
        }}
        userName={user?.name}
      />
      
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
                <li>
                  <Link to="/privacybeleid" className="hover:underline">
                    Privacybeleid
                  </Link>
                </li>
                <li>
                  <Link to="/algemene-voorwaarden" className="hover:underline">
                    Algemene Voorwaarden
                  </Link>
                </li>
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
