import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { RealtimeNotifications } from "@/components/RealtimeNotifications";
import { VendorProvider } from "@/contexts/VendorContext";
import { VerifiedVendorBadge } from "@/components/vendor/VerifiedVendorBadge";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Advisor from "./pages/Advisor";
import Community from "./pages/Community";
import Insights from "./pages/Insights";
import Integrations from "./pages/Integrations";
import Billing from "./pages/Billing";
import Transactions from "./pages/Transactions";
import VoiceCommands from "./pages/VoiceCommands";
import CompetitorAnalysis from "./pages/CompetitorAnalysis";
import ARPreview from "./pages/ARPreview";
import Marketing from "./pages/Marketing";
import Academy from "./pages/Academy";
import Referrals from "./pages/Referrals";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import PurchaseOrders from "./pages/PurchaseOrders";
import VendorOnboarding from "./pages/VendorOnboarding";
import CivicIntegration from "./pages/CivicIntegration";
import Broadcasts from "./pages/Broadcasts";
import CustomerConsents from "./pages/CustomerConsents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-4">
          <SidebarTrigger />
          <VerifiedVendorBadge size="sm" />
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <VendorProvider>
        <Toaster />
        <Sonner />
        <RealtimeNotifications />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/vendor-onboarding" element={<VendorOnboarding />} />
            
            {/* Protected routes with sidebar */}
            <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
            <Route path="/advisor" element={<ProtectedLayout><Advisor /></ProtectedLayout>} />
            <Route path="/community" element={<ProtectedLayout><Community /></ProtectedLayout>} />
            <Route path="/insights" element={<ProtectedLayout><Insights /></ProtectedLayout>} />
            <Route path="/integrations" element={<ProtectedLayout><Integrations /></ProtectedLayout>} />
            <Route path="/billing" element={<ProtectedLayout><Billing /></ProtectedLayout>} />
            <Route path="/transactions" element={<ProtectedLayout><Transactions /></ProtectedLayout>} />
            <Route path="/voice" element={<ProtectedLayout><VoiceCommands /></ProtectedLayout>} />
            <Route path="/competitor-analysis" element={<ProtectedLayout><CompetitorAnalysis /></ProtectedLayout>} />
            <Route path="/ar-preview" element={<ProtectedLayout><ARPreview /></ProtectedLayout>} />
            <Route path="/marketing" element={<ProtectedLayout><Marketing /></ProtectedLayout>} />
            <Route path="/academy" element={<ProtectedLayout><Academy /></ProtectedLayout>} />
            <Route path="/referrals" element={<ProtectedLayout><Referrals /></ProtectedLayout>} />
            <Route path="/inventory" element={<ProtectedLayout><Inventory /></ProtectedLayout>} />
            <Route path="/suppliers" element={<ProtectedLayout><Suppliers /></ProtectedLayout>} />
            <Route path="/purchase-orders" element={<ProtectedLayout><PurchaseOrders /></ProtectedLayout>} />
            <Route path="/broadcasts" element={<ProtectedLayout><Broadcasts /></ProtectedLayout>} />
            <Route path="/customer-consents" element={<ProtectedLayout><CustomerConsents /></ProtectedLayout>} />
            <Route path="/settings/civic-integration" element={<ProtectedLayout><CivicIntegration /></ProtectedLayout>} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </VendorProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
