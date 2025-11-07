import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GoalSetterModal from "@/components/GoalSetterModal";
import SustainabilityWidget from "@/components/SustainabilityWidget";
import { NotificationSettings } from "@/components/NotificationSettings";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users,
  ArrowUpRight,
  Sparkles,
  LogOut,
  BarChart3,
  Brain,
  Lightbulb,
  Zap,
  Award,
  Target
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const salesData = [
  { month: 'Jan', sales: 12000, profit: 4800 },
  { month: 'Feb', sales: 15000, profit: 6000 },
  { month: 'Mar', sales: 11000, profit: 4400 },
  { month: 'Apr', sales: 18000, profit: 7200 },
  { month: 'May', sales: 22000, profit: 8800 },
  { month: 'Jun', sales: 25000, profit: 10000 },
];

const categoryData = [
  { name: 'Coffee', value: 35, color: 'hsl(173 80% 40%)' },
  { name: 'Pastries', value: 25, color: 'hsl(38 92% 50%)' },
  { name: 'Sandwiches', value: 20, color: 'hsl(199 89% 48%)' },
  { name: 'Others', value: 20, color: 'hsl(215 16% 47%)' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/auth");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">SmartBizGrow</h1>
              <p className="text-xs text-muted-foreground">My Awesome Cafe</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your business today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="stat-card border-l-4 border-l-primary cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setGoalModalOpen(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹25,000</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3" />
                +12.5% from last month
              </p>
              <p className="text-xs text-primary mt-2 font-semibold">
                Click to set goal →
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Orders
              </CardTitle>
              <ShoppingCart className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">342</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3" />
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card border-l-4 border-l-secondary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Customers
              </CardTitle>
              <Users className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">158</div>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3" />
                +15.3% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Profit Margin
              </CardTitle>
              <ArrowUpRight className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">40%</div>
              <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                <TrendingDown className="w-3 h-3" />
                -2.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Success Stories Carousel */}
        <Card className="mb-8 border-2 border-accent/20 bg-gradient-to-r from-accent/5 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Success Spotlight 🌟
            </CardTitle>
            <p className="text-sm text-muted-foreground">Real wins from business owners like you</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: "Priya's Boutique",
                  metric: "+35% Sales",
                  story: "AI suggested Instagram reels during festival season—sales skyrocketed!",
                  image: "success-retail-1.jpg"
                },
                {
                  name: "Raj's Cafe",
                  metric: "+28% Repeat Visits",
                  story: "Loyalty program from AI advisor brought customers back 3x more",
                  image: "success-cafe-1.jpg"
                },
                {
                  name: "Maya's Salon",
                  metric: "₹45K Saved",
                  story: "Inventory insights prevented overstocking—huge cost savings!",
                  image: "success-restaurant-1.jpg"
                }
              ].map((story, idx) => (
                <div 
                  key={idx}
                  className="relative overflow-hidden rounded-lg bg-card border border-border hover:shadow-md transition-all group"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={`/src/assets/${story.image}`}
                      alt={story.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <h4 className="font-semibold text-sm text-white">{story.name}</h4>
                      <p className="text-xs text-accent font-bold">{story.metric}</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground">{story.story}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Sales & Profit Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="hsl(173 80% 40%)" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(173 80% 40%)', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="hsl(38 92% 50%)" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(38 92% 50%)', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-accent" />
                Sales by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-primary/20"
            onClick={() => navigate("/analytics")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <BarChart3 className="w-5 h-5" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upload CSV files, visualize trends, and get AI-powered forecasts
              </p>
              <Button variant="outline" className="w-full gap-2">
                View Analytics
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-accent/20"
            onClick={() => navigate("/advisor")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Brain className="w-5 h-5" />
                AI Advisor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with AI, get smart tips, and voice-enabled business coaching
              </p>
              <Button variant="outline" className="w-full gap-2">
                Talk to AI
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-secondary/20"
            onClick={() => navigate("/insights")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary">
                <Lightbulb className="w-5 h-5" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Sentiment analysis, churn prediction, and AI-generated content
              </p>
              <Button variant="outline" className="w-full gap-2">
                View Insights
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-purple-500/20"
            onClick={() => navigate("/transactions")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Zap className="w-5 h-5" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Track all your payments, subscriptions, and transaction history
              </p>
              <Button variant="outline" className="w-full gap-2">
                View Payments
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-blue-500/20"
            onClick={() => navigate("/voice")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Sparkles className="w-5 h-5" />
                Voice Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Control your business with voice commands and AI assistant
              </p>
              <Button variant="outline" className="w-full gap-2">
                Try Voice
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-red-500/20"
            onClick={() => navigate("/competitor-analysis")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Target className="w-5 h-5" />
                Competitor Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered competitive intelligence and market insights
              </p>
              <Button variant="outline" className="w-full gap-2">
                Analyze Market
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Integrations & Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 border-accent/20"
            onClick={() => navigate("/integrations")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Zap className="w-5 h-5" />
                Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Connect WhatsApp, QuickBooks, Google My Business, and more
              </p>
              <Button variant="outline" className="w-full gap-2">
                Connect Tools
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-accent" />
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center opacity-50">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                2 badges earned • 3 challenges available
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Community Pulse */}
        <Card className="mb-8 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Community Pulse 💬
            </CardTitle>
            <p className="text-sm text-muted-foreground">Latest from your fellow business owners</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-card border border-border hover:shadow-md transition-all cursor-pointer">
              <p className="text-sm font-semibold mb-1">Top Tip: Bundle deals work!</p>
              <p className="text-xs text-muted-foreground">
                "Offering combo meals increased my lunch sales by 40%" - Raj's Cafe
              </p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border hover:shadow-md transition-all cursor-pointer">
              <p className="text-sm font-semibold mb-1">🔥 Hot Offer: Festival discount</p>
              <p className="text-xs text-muted-foreground">
                "30% off on all services this Diwali - Limited time!" - Maya's Salon
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full gap-2 mt-4"
              onClick={() => navigate("/community")}
            >
              Join Community
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Green Score + Goal Modal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SustainabilityWidget />
            <NotificationSettings />
          </div>
          
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Quick Goal Setting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Let AI create a personalized roadmap to achieve your business targets
              </p>
              <Button 
                onClick={() => setGoalModalOpen(true)}
                className="w-full gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Set a Goal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Business Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-card border border-card-border">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <h4 className="font-semibold mb-1">Coffee sales trending up 📈</h4>
                  <p className="text-sm text-muted-foreground">
                    Your coffee category is performing exceptionally well. Consider promoting specialty coffee drinks to maximize revenue.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-card border border-card-border">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
                <div>
                  <h4 className="font-semibold mb-1">Inventory alert ⚠️</h4>
                  <p className="text-sm text-muted-foreground">
                    Pastry supplies running low. Restock within 3 days to avoid stockouts during peak hours.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-card border border-card-border">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <h4 className="font-semibold mb-1">Customer retention insight 💡</h4>
                  <p className="text-sm text-muted-foreground">
                    15% of customers visited 3+ times this month. Launch a loyalty program to boost repeat visits.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <GoalSetterModal open={goalModalOpen} onOpenChange={setGoalModalOpen} />
      </main>
    </div>
  );
};

export default Dashboard;
