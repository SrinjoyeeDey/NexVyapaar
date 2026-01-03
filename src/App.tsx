import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavBar } from "@/components/TopNavBar";
import { RealtimeNotifications } from "@/components/RealtimeNotifications";
import { VendorProvider } from "@/contexts/VendorContext";
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
import VoiceHistory from "./pages/VoiceHistory";
import VoiceSettings from "./pages/VoiceSettings";
import Sales from "./pages/Sales";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { VoiceCommandBridge } from "@/components/voice/VoiceCommandBridge";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      {/* Tier 2: Compact Icon Sidebar (Left) */}
      <AppSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Tier 1: Top Navigation Bar */}
        <TopNavBar />

        {/* Main content with proper margins for navigation */}
        <main className="flex-1 mt-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
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
              <Route path="/voice-history" element={<ProtectedLayout><VoiceHistory /></ProtectedLayout>} />
              <Route path="/settings/voice" element={<ProtectedLayout><VoiceSettings /></ProtectedLayout>} />
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
              <Route path="/sales" element={<ProtectedLayout><Sales /></ProtectedLayout>} />
              <Route path="/settings/civic-integration" element={<ProtectedLayout><CivicIntegration /></ProtectedLayout>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <VoiceCommandBridge />
          </BrowserRouter>
        </VendorProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
