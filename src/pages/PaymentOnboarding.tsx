import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { paymentService } from "@/services/PaymentService";
import { PAYMENT_PLANS, formatPrice } from "@/lib/stripe-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, CreditCard, Shield, Users, FileText, Eye, Star } from "lucide-react";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { getFacebookClickId, getFacebookBrowserId } from "@/lib/analytics/events";

const PaymentOnboarding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const { user, setPaymentFlow } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Pricing information for huurders
  const plan = PAYMENT_PLANS.huurder.onetime;
  const pricingInfo = {
    displayPrice: formatPrice(plan.price),
    actualPrice: formatPrice(plan.priceWithTax),
    features: plan.features,
  };

  useEffect(() => {
    // Redirect if no user
    if (!user) {
      navigate('/');
      return;
    }

    // Check if user already has an active subscription
    const checkExistingSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('abonnementen')
          .select('status')
          .eq('huurder_id', user.id)
          .eq('status', 'actief')
          .maybeSingle();

        if (error) {
          logger.error(`Error checking subscription status: ${error.message}`);
          setIsCheckingSubscription(false);
          return;
        }

        // If user has an active subscription, show a message and set state
        if (data) {
          logger.info('User already has active subscription');
          setHasActiveSubscription(true);
          toast({
            title: "Account reeds geactiveerd",
            description: "Je account is al geactiveerd. Je kunt doorgaan naar je dashboard.",
            variant: "default",
          });
          // Don't auto-redirect, let user decide
          setIsCheckingSubscription(false);
          return;
        }

        // For new users without subscriptions, the payment flow should proceed normally
        logger.info('User does not have active subscription, proceeding with payment flow');
        setIsCheckingSubscription(false);
      } catch (error) {
        logger.error(`Unexpected error checking subscription: ${error instanceof Error ? error.message : String(error)}`);
        setIsCheckingSubscription(false);
      }
    };

    // Small delay to ensure user data is fully loaded, then check subscription
    const timer = setTimeout(() => {
      checkExistingSubscription();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Fout",
        description: "Je moet ingelogd zijn om een betaling te voltooien.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Set payment flow state BEFORE starting the payment process
      setPaymentFlow(true);
      logger.info(`Payment flow started for user: ${user.id}`);

      // Capture Facebook tracking parameters for Event Match Quality
      const fbc = getFacebookClickId();
      const fbp = getFacebookBrowserId();
      
      logger.info(`📍 Captured tracking parameters: fbc=${fbc ? 'found' : 'not found'}, fbp=${fbp ? 'found' : 'not found'}`);

      const baseUrl = window.location.origin;
      const result = await paymentService.createCheckoutSession(user.id, baseUrl, { fbc, fbp });

      if (result.error) {
        // Clear payment flow state on error
        setPaymentFlow(false);

        logger.error(`Payment checkout session creation failed: ${result.error?.message || 'Unknown error'}`);
        toast({
          title: "Fout",
          description: result.error.message || "Er is een fout opgetreden bij het starten van de betaling.",
          variant: "destructive",
        });
        return;
      }

      if (result.data?.url) {
        // Use direct URL redirect for simplicity and reliability
        logger.info(`Redirecting to Stripe checkout: ${result.data.url}`);
        window.location.href = result.data.url;
      } else {
        // Clear payment flow state if no URL received
        setPaymentFlow(false);
        toast({
          title: "Fout",
          description: "Geen betaallink ontvangen. Probeer het opnieuw.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Clear payment flow state on any error
      setPaymentFlow(false);
      logger.error(`Payment initiation error: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden. Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle payment cancellation redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("payment_canceled")) {
      // Clear payment flow state when payment is cancelled
      setPaymentFlow(false);
      toast({
        title: "Betaling Geannuleerd",
        description: "Je betaling is niet voltooid. Je kunt het opnieuw proberen.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, setPaymentFlow]);

  // Handle payment success - show success screen instead of auto-redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("payment_success")) {
      // Clear payment flow state
      setPaymentFlow(false);
      // Set payment success state to show success screen
      setPaymentSuccess(true);
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setPaymentFlow]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-dutch-blue" />
      </div>
    );
  }

  // Show loading screen while checking subscription status
  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dutch-blue to-dutch-orange">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Account controleren...</p>
        </div>
      </div>
    );
  }

  // Show payment success screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Success Header */}
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Betaling Gelukt!
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Welkom bij Huurly! Je account is nu geactiveerd.
            </p>
          </div>

          {/* Success Card */}
          <Card className="shadow-2xl border-0">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Betaling succesvol verwerkt</span>
                </div>
                <p className="text-gray-600">
                  Je hebt nu volledige toegang tot alle functies van Huurly.
                </p>
                <Button
                  onClick={() => navigate(`/${user?.role}-dashboard`)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                  size="lg"
                >
                  Naar Dashboard Gaan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dutch-blue to-dutch-orange flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CreditCard className="h-10 w-10 text-dutch-blue" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Welkom bij Huurly, {user.name?.split(' ')[0]}!
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Activeer je account om te beginnen met zoeken naar je ideale woning
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl text-dutch-blue mb-2">
              Account Activering
            </CardTitle>
            <CardDescription className="text-lg">
              Eenmalige betaling voor volledige toegang tot Huurly
            </CardDescription>
            <div className="mt-6">
              <div className="text-5xl font-bold text-dutch-orange mb-2">
                {pricingInfo.actualPrice}
              </div>
              <p className="text-gray-600">BTW inbegrepen</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {pricingInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Benefits Section */}
            <div className="bg-gradient-to-r from-dutch-blue/10 to-dutch-orange/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Star className="h-5 w-5 text-dutch-orange mr-2" />
                Waarom betalen?
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <Users className="h-4 w-4 text-dutch-blue mt-0.5 flex-shrink-0" />
                  <span>Vindbaar worden door verhuurders in je regio</span>
                </div>
                <div className="flex items-start space-x-2">
                  <FileText className="h-4 w-4 text-dutch-blue mt-0.5 flex-shrink-0" />
                </div>
                <div className="flex items-start space-x-2">
                  <Eye className="h-4 w-4 text-dutch-blue mt-0.5 flex-shrink-0" />
                  <span>Krijg woningaanbiedingen die bij je passen</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-dutch-blue mt-0.5 flex-shrink-0" />
                  <span>Premium ondersteuning en hulp bij vragen</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="pt-6">
              <Button
                onClick={handlePayment}
                className="w-full bg-dutch-blue hover:bg-blue-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Betaling verwerken...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-3 h-5 w-5" />
                    Account Activeren - {pricingInfo.actualPrice}
                  </>
                )}
              </Button>
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              Door je betaling te voltooien ga je akkoord met onze{" "}
              <a href="/algemene-voorwaarden" className="text-dutch-blue hover:underline">
                algemene voorwaarden
              </a>{" "}
              en{" "}
              <a href="/privacybeleid" className="text-dutch-blue hover:underline">
                privacybeleid
              </a>
              .
            </p>
          </CardContent>
        </Card>

        {/* Show dashboard button for users with active subscriptions */}
        {hasActiveSubscription && (
          <div className="text-center">
            <Button
              onClick={() => navigate(`/${user?.role}-dashboard`)}
              variant="outline"
              className="bg-white text-dutch-blue border-white hover:bg-gray-100"
            >
              Naar Dashboard Gaan
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-white/80">
          <p className="text-sm">
            Veilig betalen via Stripe • SSL versleuteld • 100% veilig
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentOnboarding;
