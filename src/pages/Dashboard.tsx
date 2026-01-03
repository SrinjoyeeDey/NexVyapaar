import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import GoalSetterModal from "@/components/GoalSetterModal";
import BroadcastComposer from "@/components/broadcast/BroadcastComposer";
import { ShelfHealthWidget } from "@/components/dashboard/ShelfHealthWidget";
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
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data
const salesData = [
  { month: "Jan", sales: 12000, profit: 4800 },
  { month: "Feb", sales: 15000, profit: 6000 },
  { month: "Mar", sales: 11000, profit: 4400 },
  { month: "Apr", sales: 18000, profit: 7200 },
  { month: "May", sales: 22000, profit: 8800 },
  { month: "Jun", sales: 25000, profit: 10000 },
];

const Dashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [showBroadcastComposer, setShowBroadcastComposer] = useState(false);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("month");

  return (
    <>
      {/* Broadcast Composer Modal */}
      <BroadcastComposer
        open={showBroadcastComposer}
        onOpenChange={setShowBroadcastComposer}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Metrics Cards - 4-card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title={t.dashboard.revenue}
          value={25000}
          isCurrency={true}
          trend={{ value: 12.5, isPositive: true, label: "from last month" }}
          progress={{ current: 25000, goal: 40000, label: "of monthly goal" }}
          icon={DollarSign}
          accentColor="indigo"
          delay={0}
        />

        <MetricCard
          title={t.dashboard.orders}
          value={342}
          trend={{ value: 8.2, isPositive: true, label: "from last month" }}
          progress={{ current: 342, goal: 500, label: "of monthly goal" }}
          icon={ShoppingCart}
          accentColor="saffron"
          delay={0.1}
        />

        <MetricCard
          title={t.dashboard.customers}
          value={158}
          trend={{ value: 15.3, isPositive: true, label: "from last month" }}
          progress={{ current: 158, goal: 200, label: "of monthly goal" }}
          icon={Users}
          accentColor="blue"
          delay={0.2}
        />

        <MetricCard
          title={t.dashboard.profitMargin}
          value={40}
          isPercentage={true}
          trend={{ value: -2.1, isPositive: false, label: "from last month" }}
          progress={{ current: 40, goal: 50, label: "of target margin" }}
          icon={Target}
          accentColor="purple"
          delay={0.3}
        />
      </div>

      {/* Insights & Chart Section - 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend Chart - 2/3 width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Revenue Trend</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Track your business performance
                </p>
              </div>

              {/* Time Period Tabs */}
              <Tabs value={selectedTimePeriod} onValueChange={setSelectedTimePeriod}>
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4338CA" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4338CA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="month"
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#4338CA"
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Monitoring Stack - 1/3 width */}
        <div className="lg:col-span-1 space-y-6">
          <ShelfHealthWidget />
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

      {/* Goal Setter Modal */}
      <GoalSetterModal open={goalModalOpen} onOpenChange={setGoalModalOpen} />
    </>
  );
};

export default Dashboard;
