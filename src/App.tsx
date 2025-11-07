import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { RealtimeNotifications } from "@/components/RealtimeNotifications";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center px-4">
          <SidebarTrigger />
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
      <Toaster />
      <Sonner />
      <RealtimeNotifications />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
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
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
