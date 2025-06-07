
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HuurderRoute, VerhuurderRoute, BeoordelaarRoute, BeheerderRoute } from "@/components/auth/ProtectedRoute";
import { config } from "@/lib/config";
import { Skeleton } from "@/components/ui/skeleton";
import CookieConsent from "@/components/CookieConsent";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const HuurderDashboard = lazy(() => import("./pages/HuurderDashboard"));
const VerhuurderDashboard = lazy(() => import("./pages/VerhuurderDashboard"));
const BeoordelaarDashboard = lazy(() => import("./pages/BeoordelaarDashboard"));
const BeheerderDashboard = lazy(() => import("./pages/BeheerderDashboard"));
const AlgemeneVoorwaarden = lazy(() => import("./pages/AlgemeneVoorwaarden"));
const Privacybeleid = lazy(() => import("./pages/Privacybeleid"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const PaymentRequired = lazy(() => import("./pages/PaymentRequired"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
                <HuurderRoute>
                  <HuurderDashboard />
                </HuurderRoute>
              } 
            />
            <Route 
              path="/verhuurder-dashboard" 
              element={
                <VerhuurderRoute>
                  <VerhuurderDashboard />
                </VerhuurderRoute>
              } 
            />
            <Route 
              path="/beoordelaar-dashboard" 
              element={
                <BeoordelaarRoute>
                  <BeoordelaarDashboard />
                </BeoordelaarRoute>
              } 
            />
            <Route 
              path="/beheerder-dashboard" 
              element={
                <BeheerderRoute>
                  <BeheerderDashboard />
                </BeheerderRoute>
              } 
            />
            <Route path="/algemene-voorwaarden" element={<AlgemeneVoorwaarden />} />
            <Route path="/privacybeleid" element={<Privacybeleid />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/payment-required" element={<PaymentRequired />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
