import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  LogOut, 
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Crown,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

const CompetitorAnalysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [competitor, setCompetitor] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/auth");
    }
  }, [navigate]);

  const handleAnalyze = () => {
    if (!competitor.trim()) {
      toast({
        title: "Missing input",
        description: "Please enter a competitor name or URL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    toast({
      title: "Analyzing... 🔍",
      description: "AI is gathering competitive intelligence"
    });

    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
      toast({
        title: "Analysis Complete! ✅",
        description: "Found key insights about your competitor"
      });
    }, 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/");
  };

  const comparisonData = [
    { metric: 'Pricing', you: 85, competitor: 70 },
    { metric: 'Reviews', you: 78, competitor: 85 },
    { metric: 'Social Media', you: 65, competitor: 80 },
    { metric: 'Location', you: 90, competitor: 75 },
    { metric: 'Menu Variety', you: 70, competitor: 60 }
  ];

  const radarData = [
    { subject: 'Quality', A: 85, B: 75, fullMark: 100 },
    { subject: 'Price', A: 70, B: 80, fullMark: 100 },
    { subject: 'Service', A: 90, B: 70, fullMark: 100 },
    { subject: 'Ambience', A: 80, B: 85, fullMark: 100 },
    { subject: 'Online Presence', A: 65, B: 90, fullMark: 100 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">Competitor Analysis</h1>
              <p className="text-xs text-muted-foreground">AI-powered competitive intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Section */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Analyze a Competitor
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter competitor's name or website to get AI-powered insights
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter competitor name or URL (e.g., Starbucks, cafe.com)"
                value={competitor}
                onChange={(e) => setCompetitor(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {showResults && (
          <>
            {/* Overall Competitive Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Your Competitive Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-primary">78/100</div>
                  <p className="text-xs text-muted-foreground mt-2">Strong position</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Competitor Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-accent">72/100</div>
                  <p className="text-xs text-muted-foreground mt-2">Moderate competition</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Your Advantage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-600">+6 pts</div>
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    You're ahead!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="border-2 border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="w-5 h-5" />
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { strength: "Better pricing strategy", score: 85 },
                    { strength: "Prime location", score: 90 },
                    { strength: "Excellent service quality", score: 90 }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.strength}</span>
                        <span className="text-sm text-green-600">{item.score}%</span>
                      </div>
                      <Progress value={item.score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2 border-red-500/20 bg-red-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { weakness: "Social media presence", score: 65 },
                    { weakness: "Online reviews", score: 78 },
                    { weakness: "Menu innovation", score: 70 }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.weakness}</span>
                        <span className="text-sm text-red-600">{item.score}%</span>
                      </div>
                      <Progress value={item.score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Head-to-Head Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="you" fill="hsl(173 80% 40%)" name="You" />
                      <Bar dataKey="competitor" fill="hsl(38 92% 50%)" name="Competitor" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      <Radar name="You" dataKey="A" stroke="hsl(173 80% 40%)" fill="hsl(173 80% 40%)" fillOpacity={0.6} />
                      <Radar name="Competitor" dataKey="B" stroke="hsl(38 92% 50%)" fill="hsl(38 92% 50%)" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* AI Recommendations */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Boost Social Media Presence",
                      description: "Your competitor has 35% more followers. Start posting daily behind-the-scenes content and customer testimonials.",
                      priority: "High"
                    },
                    {
                      title: "Expand Menu Variety",
                      description: "Add 3-4 seasonal items. Competitor offers 20% more variety which attracts diverse customers.",
                      priority: "Medium"
                    },
                    {
                      title: "Leverage Your Location Advantage",
                      description: "You have better foot traffic. Run location-based ads and partner with nearby businesses.",
                      priority: "High"
                    }
                  ].map((rec, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge variant={rec.priority === "High" ? "destructive" : "secondary"}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Premium CTA */}
        {!showResults && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20">
            <CardContent className="p-8 text-center">
              <Crown className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Premium Feature</h3>
              <p className="text-muted-foreground mb-6">
                Get unlimited competitor analyses, real-time monitoring, and advanced AI insights
              </p>
              <Button size="lg" onClick={() => navigate("/billing")}>
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CompetitorAnalysis;