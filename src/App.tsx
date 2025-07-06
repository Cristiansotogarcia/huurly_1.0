
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import CookieConsent from "@/components/CookieConsent";
import PaymentSuccess from "./pages/PaymentSuccess";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const HuurderDashboard = lazy(() => import("./pages/HuurderDashboard"));
const VerhuurderDashboard = lazy(() => import("./pages/VerhuurderDashboard"));
const BeoordelaarDashboard = lazy(() => import('./pages/BeoordelaarDashboard'));
const BeheerderDashboard = lazy(() => import('./pages/BeheerderDashboard'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ManageSubscription = lazy(() => import('./pages/Subscription/ManageSubscription'));

const ZoekHuurders = lazy(() => import('./pages/ZoekHuurders'));

const Privacybeleid = lazy(() => import('./pages/Privacybeleid'));
const AlgemeneVoorwaarden = lazy(() => import('./pages/AlgemeneVoorwaarden'));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center p-8">
            <div className="space-y-4 w-full max-w-md">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route 
              path="/huurder-dashboard" 
              element={
                <ProtectedRoute roles={['huurder']}>
                  <HuurderDashboard />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/verhuurder-dashboard"
              element={
                <ProtectedRoute roles={['verhuurder']}>
                  <VerhuurderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/huurders-zoeken"
              element={
                <ProtectedRoute roles={['verhuurder']}>
                  <ZoekHuurders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/beoordelaar-dashboard"
              element={
                <ProtectedRoute roles={['beoordelaar']}>
                  <BeoordelaarDashboard />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/beheerder-dashboard"
              element={
                <ProtectedRoute roles={['beheerder']}>
                  <BeheerderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <ProtectedRoute roles={['huurder']}>
                  <ManageSubscription />
                </ProtectedRoute>
              }
            />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/wachtwoord-herstellen" element={<ResetPassword />} />
            <Route path="/privacybeleid" element={<Privacybeleid />} />
            <Route path="/algemene-voorwaarden" element={<AlgemeneVoorwaarden />} />
            {/* Catch-all route for 404s */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Pagina niet gevonden</h1>
                <p className="text-gray-600 mb-4">De pagina die je zoekt bestaat niet.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="bg-dutch-blue text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Terug naar home
                </button>
                <div className="mt-4 text-sm text-gray-500">
                  Current path: {window.location.pathname}
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
