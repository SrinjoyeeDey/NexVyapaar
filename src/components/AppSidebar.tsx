import { 
  LayoutDashboard, 
  BarChart3, 
  Lightbulb, 
  Users, 
  Plug, 
  CreditCard,
  Receipt,
  Mic,
  Target,
  Camera,
  Megaphone,
  Crown,
  GraduationCap,
  Gift,
  Package,
  Truck,
  ClipboardList,
  Radio,
  UserCheck,
  Shield,
  History,
  Settings
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/contexts/LanguageContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { open } = useSidebar();
  const { t } = useLanguage();

  const mainItems = [
    { title: t.nav.dashboard, url: "/dashboard", icon: LayoutDashboard },
    { title: t.nav.analytics, url: "/analytics", icon: BarChart3 },
    { title: t.nav.inventory, url: "/inventory", icon: Package },
    { title: t.nav.suppliers, url: "/suppliers", icon: Truck },
    { title: t.nav.purchaseOrders, url: "/purchase-orders", icon: ClipboardList },
    { title: t.nav.broadcasts, url: "/broadcasts", icon: Radio },
    { title: t.nav.insights, url: "/insights", icon: Lightbulb },
    { title: t.nav.community, url: "/community", icon: Users },
  ];

  const toolsItems = [
    { title: t.nav.integrations, url: "/integrations", icon: Plug },
    { title: t.nav.transactions, url: "/transactions", icon: Receipt },
    { title: t.nav.customerConsents, url: "/customer-consents", icon: UserCheck },
    { title: t.nav.civicIntegration, url: "/settings/civic-integration", icon: Shield },
    { title: t.nav.voiceControl, url: "/voice", icon: Mic },
    { title: t.voiceHistory?.title || "Voice History", url: "/voice-history", icon: History },
    { title: t.voiceSettings?.title || "Voice Settings", url: "/settings/voice", icon: Settings },
    { title: t.nav.competitorAnalysis, url: "/competitor-analysis", icon: Target },
    { title: t.nav.arPreview, url: "/ar-preview", icon: Camera },
    { title: t.nav.marketingCampaigns, url: "/marketing", icon: Megaphone },
    { title: t.nav.academy, url: "/academy", icon: GraduationCap },
    { title: t.nav.referrals, url: "/referrals", icon: Gift },
  ];

  const premiumItems = [
    { title: t.nav.upgradeToPremium, url: "/billing", icon: Crown },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end activeClassName="bg-accent text-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end activeClassName="bg-accent text-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {premiumItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className="text-primary" activeClassName="bg-primary/10 font-medium">
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}