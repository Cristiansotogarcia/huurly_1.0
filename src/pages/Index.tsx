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
import { useEffect, useState, useRef } from 'react';
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
    handleEmailVerificationSuccess
  } = useAuth();
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const hasHandledEmailVerification = useRef(false);

  useEffect(() => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);

    // Check for email verification success - only handle once
    if ((hash.includes('type=signup') || searchParams.get('type') === 'signup')) {
      if (!hasHandledEmailVerification.current) {
        hasHandledEmailVerification.current = true;
        handleEmailVerificationSuccess();
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      return; // Don't do any redirects when showing email verification modal
    }

    // Legacy support: redirect old payment success URLs to the new route
    if (searchParams.get('payment') === 'success') {
      const sessionId = searchParams.get('session_id');
      navigate(`/payment-success${sessionId ? `?session_id=${sessionId}` : ''}`);
      return;
    }

    // Only redirect authenticated users if:
    // 1. They don't have special URL parameters
    // 2. No modals are currently shown
    // 3. We haven't just handled email verification
    const hasActiveModal = showPaymentSuccessModal || showEmailVerificationSuccessModal || showEmailConfirmationModal;
    
    if (isAuthenticated && user && !hasActiveModal && !hasHandledEmailVerification.current) {
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
  }, [isAuthenticated, user, navigate, handleEmailVerificationSuccess, showPaymentSuccessModal, showEmailVerificationSuccessModal, showEmailConfirmationModal]);

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
        onClose={() => {
          setShowEmailVerificationSuccessModal(false);
          // Don't redirect immediately, let user decide
        }}
        onGoToDashboard={() => {
          setShowEmailVerificationSuccessModal(false);
          // Navigate to dashboard based on user role
          if (user && isAuthenticated) {
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
              default:
            }
          } else {
            // If user is not authenticated yet, wait a bit and try again
            setTimeout(() => {
              window.location.reload();
            }, 1000);
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
