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

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isAuthPage = window.location.pathname === "/" || window.location.pathname === "/auth";
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
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
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RealtimeNotifications />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/advisor" element={<Advisor />} />
            <Route path="/community" element={<Community />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/voice" element={<VoiceCommands />} />
            <Route path="/competitor-analysis" element={<CompetitorAnalysis />} />
            <Route path="/ar-preview" element={<ARPreview />} />
            <Route path="/marketing" element={<Marketing />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
