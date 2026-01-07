import { toast } from "sonner";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  ShoppingCart,
  Megaphone,
  Mic,
  Camera,
  FileText,
  Settings,
  HelpCircle,
  Crown,
  Truck,
  ClipboardList,
  Radio,
  Lightbulb,
  Users,
  Plug,
  BrainCircuit,
  Building2,
  Sparkles,
  Languages,
  Shield
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

export function AppSidebar() {
  const { open } = useSidebar();
  const { t } = useLanguage();

  // CORE BUSINESS - Primary business operations
  const coreBusinessItems = [
    { title: t.nav.dashboard, url: "/dashboard", icon: LayoutDashboard },
    { title: "Intelligence Hub", url: "/intelligence-hub", icon: BrainCircuit, badge: "AI" },
    { title: t.nav.sales, url: "/sales", icon: ShoppingCart },
    { title: t.nav.inventory, url: "/inventory", icon: Package, badge: "5" },
    { title: t.nav.analytics, url: "/analytics", icon: BarChart3 },
  ];

  // OPERATIONS - Supply chain & logistics
  const operationsItems = [
    { title: t.nav.suppliers, url: "/suppliers", icon: Truck },
    { title: t.nav.purchaseOrders, url: "/purchase-orders", icon: ClipboardList },
    { title: "Pharmacy Compliance", url: "/compliance", icon: Shield, badge: "NEW" },
    { title: "Transactions", url: "/transactions", icon: FileText },
  ];

  // GROWTH - Marketing & insights
  const growthItems = [
    { title: t.nav.marketingCampaigns, url: "/marketing", icon: Megaphone },
    { title: t.nav.insights, url: "/insights", icon: Lightbulb },
    { title: "Marketplace Map", url: "/marketplace-map", icon: Building2 },
  ];

  // TOOLS - Integrations & AR
  const toolsItems = [
    { title: t.nav.integrations, url: "/integrations", icon: Plug },
    { title: t.nav.arPreview, url: "/ar-preview", icon: Camera },
    { title: "Help", url: "/community", icon: HelpCircle },
  ];

  const aiInputItems = [
    { title: "Voice Assistant", url: "/voice", icon: Mic, badge: "LIVE" },
    { title: "POS Integration", url: "/pos-demo", icon: Plug, badge: "DEMO" },
    { title: "Scan Records", url: "/scan-records", icon: Camera },
    { title: "Vernacular Link", url: "/vernacular-link", icon: Languages, badge: "Hi" },
  ];

  const MenuItem = ({ item, isUpgrade = false }: { item: any; isUpgrade?: boolean }) => {
    const content = (
      <NavLink
        to={item.url}
        className={`
          flex items-center justify-center w-full h-14 relative
          transition-all duration-300
          ${isUpgrade
            ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60"
            : "text-slate-600 hover:bg-slate-50"
          }
          group
        `}
        activeClassName={isUpgrade
          ? ""
          : "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
        }
      >
        <div className="flex items-center gap-3 w-full px-3">
          <item.icon className={`
            h-6 w-6 flex-shrink-0
            transition-transform duration-300 group-hover:scale-110
            ${isUpgrade ? "text-white" : ""}
          `} />
          {open && (
            <span className={`
              text-sm font-medium truncate
              ${isUpgrade ? "text-white font-semibold" : ""}
            `}>
              {item.title}
            </span>
          )}
          {item.badge && !open && (
            <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-saffron-500 text-white text-xs font-bold flex items-center justify-center">
              {item.badge}
            </span>
          )}
        </div>
      </NavLink>
    );

    if (!open) {
      return (
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-900 text-white text-sm font-medium">
            <p>{item.title}</p>
            {item.badge && <p className="text-xs text-slate-300 mt-1">{item.badge} items</p>}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider>
      <Sidebar
        collapsible="icon"
        className="border-r border-slate-200 transition-all duration-300"
        style={{
          width: open ? "240px" : "72px",
        }}
      >
        <SidebarContent className="flex flex-col h-full py-4">
          {/* CORE BUSINESS */}
          <SidebarGroup className="px-0">
            {open && (
              <div className="px-3 mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Business</p>
              </div>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {coreBusinessItems.map((item) => (
                  <SidebarMenuItem key={item.url} className="list-none">
                    <MenuItem item={item} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="my-4" />

          {/* OPERATIONS */}
          <SidebarGroup className="px-0">
            {open && (
              <div className="px-3 mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Operations</p>
              </div>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {operationsItems.map((item) => (
                  <SidebarMenuItem key={item.url} className="list-none">
                    <MenuItem item={item} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="my-4" />

          {/* GROWTH */}
          <SidebarGroup className="px-0">
            {open && (
              <div className="px-3 mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Growth</p>
              </div>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {growthItems.map((item) => (
                  <SidebarMenuItem key={item.url} className="list-none">
                    <MenuItem item={item} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="my-4" />

          {/* TOOLS */}
          <SidebarGroup className="px-0">
            {open && (
              <div className="px-3 mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tools</p>
              </div>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {toolsItems.map((item) => (
                  <SidebarMenuItem key={item.url} className="list-none">
                    <MenuItem item={item} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <Separator className="my-4" />

          {/* AI INPUT & ADAPTATION */}
          <SidebarGroup className="px-0">
            {open && (
              <div className="px-3 mb-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Input & Adaptation</p>
              </div>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {aiInputItems.map((item) => (
                  <SidebarMenuItem key={item.title} className="list-none">
                    <MenuItem item={item} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Spacer to push upgrade button to bottom */}
          <div className="flex-1" />

          {/* Upgrade Button - Special Styling */}
          <SidebarGroup className="px-0 mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="list-none">
                  <div className={open ? "px-3" : ""}>
                    <div onClick={(e) => {
                      if (localStorage.getItem("demo_mode") === "true") {
                        e.preventDefault();
                        e.stopPropagation(); // Stop NavLink from triggering
                        toast.info("Billing is simulated in Demo Mode");
                      }
                    }}>
                      <MenuItem
                        item={{
                          title: t.nav.upgradeToPremium || "Upgrade Pro",
                          url: localStorage.getItem("demo_mode") === "true" ? "#" : "/billing",
                          icon: Crown
                        }}
                        isUpgrade={true}
                      />
                    </div>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  );
}