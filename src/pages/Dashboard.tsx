import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfitActionWidget } from "@/components/dashboard/ProfitActionWidget";
import { OfflineActivityWidget } from "@/components/offline/OfflineActivityWidget";
import { PostSyncReportWidget } from "@/components/offline/PostSyncReportWidget";
import { useSmartInventory } from "@/hooks/useSmartInventory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import GoalSetterModal from "@/components/GoalSetterModal";
import BroadcastComposer from "@/components/broadcast/BroadcastComposer";
import { ShelfHealthWidget } from "@/components/dashboard/ShelfHealthWidget";
import { SupplyIntelligenceEntry } from "@/components/demo/SupplyIntelligenceEntry";
import { IntelligenceHubEntry } from "@/components/demo/IntelligenceHubEntry";
import { MarketplaceEntry } from "@/components/demo/MarketplaceEntry";
import { InnovationShowcase } from "@/components/demo/InnovationShowcase";
import { Sparkles } from "lucide-react";
import { DollarSign, ShoppingCart, Users, Target } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { complianceCheckService } from "@/services/ComplianceCheckService";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useEffect } from "react";

// Sample data
// Demo data matching Analytics.tsx
const salesData = [
  { month: "Jan", sales: 45000, profit: 12000 },
  { month: "Feb", sales: 52000, profit: 15000 },
  { month: "Mar", sales: 48000, profit: 13000 },
  { month: "Apr", sales: 61000, profit: 22000 },
  { month: "May", sales: 55000, profit: 18000 },
  { month: "Jun", sales: 67000, profit: 24000 },
  { month: "Jul", sales: 72000, profit: 28000 },
];

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [showBroadcastComposer, setShowBroadcastComposer] = useState(false);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("month");

  const [complianceStats, setComplianceStats] = useState(complianceCheckService.getComplianceStats());

  useEffect(() => {
    const unsubscribe = complianceCheckService.subscribe(() => {
      setComplianceStats(complianceCheckService.getComplianceStats());
    });
    return unsubscribe;
  }, []);

  const { data: rawMaterials } = useQuery({
    queryKey: ['raw-materials-smart'],
    queryFn: async () => {
      const { data } = await supabase.from('raw_materials').select('*');
      return data || [];
    }
  });

  const { profitActions } = useSmartInventory(rawMaterials as any[]);

  return (
    <>
      {/* Broadcast Composer Modal */}
      <BroadcastComposer
        open={showBroadcastComposer}
        onOpenChange={setShowBroadcastComposer}
      />

      {/* Offline Queue Widget - Visible ONLY when Offline */}
      <OfflineActivityWidget />

      {/* Post-Sync Report - Visible ONLY after successful sync */}
      <PostSyncReportWidget />

      {/* Profit Actions Widget (Smart Inventory) */}
      <div className="mb-6">
        <ProfitActionWidget
          actions={profitActions}
          onActionClick={(action) => navigate('/inventory')}
        />
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Compliance Critical Alert - Dynamic Injection from CSV/Data */}
      {complianceStats.totalBanned > 0 && (
        <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
          <Card className="bg-red-50 border-l-4 border-l-red-600 border-y-0 border-r-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <ShieldAlert className="h-6 w-6 text-red-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-red-900">Regulatory Compliance Actions Required</h3>
                  <p className="text-sm text-red-700">
                    {complianceStats.totalBanned} medicines in your inventory effectively banned/recalled.
                    {complianceStats.source === 'UPLOADED' && " (Source: Recent CSV Upload)"}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => navigate('/compliance')}
                className="animate-bounce"
              >
                Review & Block
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Innovation Showcase - Key Pitch Points */}
      <InnovationShowcase />

      {/* Main Metrics Cards - 4-card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title={t.dashboard.revenue}
          value={400000}
          isCurrency={true}
          trend={{ value: 12.5, isPositive: true, label: "from last month" }}
          progress={{ current: 400000, goal: 500000, label: "of yearly goal" }}
          icon={DollarSign}
          accentColor="indigo"
          delay={0}
        />

        <MetricCard
          title={t.dashboard.orders}
          value={1240}
          trend={{ value: 8.2, isPositive: true, label: "from last month" }}
          progress={{ current: 1240, goal: 1500, label: "of monthly goal" }}
          icon={ShoppingCart}
          accentColor="saffron"
          delay={0.1}
        />

        <MetricCard
          title={t.dashboard.customers}
          value={850}
          trend={{ value: 15.3, isPositive: true, label: "from last month" }}
          progress={{ current: 850, goal: 1000, label: "of monthly goal" }}
          icon={Users}
          accentColor="blue"
          delay={0.2}
        />

        <MetricCard
          title={t.dashboard.profitMargin}
          value={32}
          isPercentage={true}
          trend={{ value: 2.1, isPositive: true, label: "from last month" }}
          progress={{ current: 32, goal: 40, label: "of target margin" }}
          icon={Target}
          accentColor="purple"
          delay={0.3}
        />
      </div>

      {/* Insights & Chart Section - 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend Chart - 2/3 width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:col-span-2">
          {/* 1. Revenue Area Chart */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Revenue Trend</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Business performance over time
                  </p>
                </div>
                <Tabs value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                  <TabsList>
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4338CA" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4338CA" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} />
                    <Area type="monotone" dataKey="sales" stroke="#4338CA" strokeWidth={3} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 2. Category Share (Pie Chart) - NEW */}
          <Card>
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
              <CardDescription>Sales distribution by product type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Dairy", value: 45, color: "#4F46E5" },
                        { name: "Groceries", value: 30, color: "#10B981" },
                        { name: "Snacks", value: 15, color: "#F59E0B" },
                        { name: "Bevs", value: 10, color: "#EC4899" }
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: "Dairy", value: 45, color: "#4F46E5" },
                        { name: "Groceries", value: 30, color: "#10B981" },
                        { name: "Snacks", value: 15, color: "#F59E0B" },
                        { name: "Bevs", value: 10, color: "#EC4899" }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 3. Profit vs Revenue (Bar Chart) - NEW */}
          <Card>
            <CardHeader>
              <CardTitle>Profit Analysis</CardTitle>
              <CardDescription>Net Profit vs Total Revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="sales" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* AI Monitoring Stack - 1/3 width */}
        <div className="lg:col-span-1 space-y-6">
          <ShelfHealthWidget />
          <SupplyIntelligenceEntry />
          <InsightsPanel />
        </div>
      </div>

      {/* Existing features preserved - Quick Actions & More */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-indigo-500"
          onClick={() => navigate("/analytics")}
        >
          <CardHeader>
            <CardTitle className="text-indigo-600">Analytics & Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Deep dive into your sales patterns and inventory health
            </p>
            <Button variant="outline" className="w-full">
              View Analytics →
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-saffron-500"
          onClick={() => navigate("/advisor")}
        >
          <CardHeader>
            <CardTitle className="text-saffron-600">AI Advisor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Get personalized business recommendations powered by AI
            </p>
            <Button variant="outline" className="w-full">
              Talk to AI →
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-500"
          onClick={() => navigate("/insights")}
        >
          <CardHeader>
            <CardTitle className="text-blue-600">Business Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Discover actionable insights to grow your business
            </p>
            <Button variant="outline" className="w-full">
              View Insights →
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 space-y-8 mb-20">
        <IntelligenceHubEntry />
        <MarketplaceEntry />
      </div>
      <GoalSetterModal open={goalModalOpen} onOpenChange={setGoalModalOpen} />
    </>
  );
};

export default Dashboard;
