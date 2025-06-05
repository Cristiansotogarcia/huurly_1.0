
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import HuurderDashboard from "./pages/HuurderDashboard";
import VerhuurderDashboard from "./pages/VerhuurderDashboard";
import BeoordelaarDashboard from "./pages/BeoordelaarDashboard";
import BeheerderDashboard from "./pages/BeheerderDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/huurder-dashboard" element={<HuurderDashboard />} />
          <Route path="/verhuurder-dashboard" element={<VerhuurderDashboard />} />
          <Route path="/beoordelaar-dashboard" element={<BeoordelaarDashboard />} />
          <Route path="/beheerder-dashboard" element={<BeheerderDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
