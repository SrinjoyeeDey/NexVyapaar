import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Lock,
  LogOut,
  ThumbsUp,
  ThumbsDown,
  Award,
  Loader2
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Insights = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPremium] = useState(false); // Check from profiles.subscription_tier
  const [reviewText, setReviewText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [sentiment, setSentiment] = useState<any>(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");

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

  const analyzeSentiment = async () => {
    if (!reviewText.trim()) {
      toast({
        title: "Empty review",
        description: "Please enter some customer feedback to analyze",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: { text: reviewText }
      });

      if (error) throw error;

      setSentiment(data.sentiment);
      toast({
        title: "Analysis Complete! 🎯",
        description: `Sentiment: ${data.sentiment.overall}`
      });
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      toast({
        title: "Error",
        description: "Failed to analyze sentiment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const sentimentData = [
    { name: "Positive", value: 65, color: "hsl(173 80% 40%)" },
    { name: "Neutral", value: 20, color: "hsl(38 92% 50%)" },
    { name: "Negative", value: 15, color: "hsl(0 84% 60%)" }
  ];

  const churnRiskData = [
    { metric: "Purchase Frequency", value: 75 },
    { metric: "Engagement", value: 60 },
    { metric: "Satisfaction", value: 80 },
    { metric: "Loyalty", value: 70 },
    { metric: "Responsiveness", value: 65 }
  ];

  const generateContent = async (type: string) => {
    if (!isPremium) {
      toast({
        title: "Premium Required",
        description: "Upgrade to generate AI content",
        variant: "destructive"
      });
      navigate("/billing");
      return;
    }

    setGeneratingContent(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          type,
          businessInfo: "My Awesome Cafe - serving premium coffee and pastries",
          tone: "friendly and exciting"
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      toast({
        title: "Content Generated! ✨",
        description: `Your ${type} content is ready`
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive"
      });
    } finally {
      setGeneratingContent(false);
    }
  };

  const PremiumGate = ({ children, feature }: { children: React.ReactNode, feature: string }) => {
    if (isPremium) return <>{children}</>;
    
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <Card className="max-w-md border-2 border-primary">
            <CardContent className="pt-6 text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-bold text-lg mb-2">Premium Feature</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Unlock {feature} with Premium at ₹299/month
              </p>
              <Button onClick={() => navigate("/billing")} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">AI Insights</h1>
              <p className="text-xs text-muted-foreground">Predict, Analyze, Optimize</p>
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

      <main className="container mx-auto px-4 py-8">
        {/* Sentiment Analysis */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Customer Sentiment Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Analyze customer reviews and feedback to understand emotions
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Textarea
                placeholder="Paste customer reviews or feedback here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="mb-4"
              />
              <Button 
                onClick={analyzeSentiment} 
                disabled={analyzing}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {analyzing ? "Analyzing..." : "Analyze Sentiment"}
              </Button>
            </div>

            {sentiment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div>
                  <h4 className="font-semibold mb-4">Overall Sentiment</h4>
                  <div className="flex items-center gap-4">
                    {sentiment.overall === "positive" ? (
                      <ThumbsUp className="w-12 h-12 text-green-500" />
                    ) : (
                      <ThumbsDown className="w-12 h-12 text-red-500" />
                    )}
                    <div>
                      <p className="text-2xl font-bold capitalize">{sentiment.overall}</p>
                      <p className="text-sm text-muted-foreground">
                        Confidence: {Math.round(sentiment.score * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Emotion Breakdown</h4>
                  {sentiment.emotions.map((emotion: any, idx: number) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{emotion.name}</span>
                        <span className="text-muted-foreground">{emotion.value}%</span>
                      </div>
                      <Progress value={emotion.value} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t">
              <h4 className="font-semibold mb-4">Sample Data: Last Month Sentiment</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Churn Prediction */}
        <PremiumGate feature="Churn Prediction">
          <Card className="mb-8 border-2 border-accent/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-accent" />
                    Customer Churn Prediction
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    AI-powered prediction of customers at risk of leaving
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  Premium
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">High Risk Customers</h4>
                  <div className="space-y-3">
                    {["Customer #1234", "Customer #5678", "Customer #9012"].map((customer, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{customer}</span>
                          <Badge variant="destructive">85% Risk</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          No purchase in 45 days
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Churn Risk Factors</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={churnRiskData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis 
                        dataKey="metric" 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      />
                      <Radar 
                        dataKey="value" 
                        stroke="hsl(38 92% 50%)" 
                        fill="hsl(38 92% 50%)" 
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </PremiumGate>

        {/* AI Content Generator */}
        <PremiumGate feature="AI Content Generation">
          <Card className="border-2 border-secondary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-secondary" />
                    AI Content Generator
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Generate marketing copy, social posts, and promotional content
                  </p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  Premium
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Button 
                  variant="outline" 
                  className="h-auto py-6 flex-col gap-2"
                  onClick={() => generateContent("social")}
                  disabled={generatingContent}
                >
                  {generatingContent ? <Loader2 className="w-6 h-6 animate-spin" /> : <MessageSquare className="w-6 h-6 text-primary" />}
                  <span className="font-semibold">Social Posts</span>
                  <span className="text-xs text-muted-foreground">Instagram, Facebook captions</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-6 flex-col gap-2"
                  onClick={() => generateContent("email")}
                  disabled={generatingContent}
                >
                  {generatingContent ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6 text-accent" />}
                  <span className="font-semibold">Email Campaigns</span>
                  <span className="text-xs text-muted-foreground">Newsletters, promotions</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-6 flex-col gap-2"
                  onClick={() => generateContent("ad")}
                  disabled={generatingContent}
                >
                  {generatingContent ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6 text-secondary" />}
                  <span className="font-semibold">Ad Copy</span>
                  <span className="text-xs text-muted-foreground">Google, Meta ads</span>
                </Button>
              </div>

              {generatedContent && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Generated Content
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedContent);
                      toast({ title: "Copied to clipboard!" });
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </div>
              )}

              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">A/B Testing Simulator</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate multiple variants and see predicted performance before posting
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PremiumGate>
      </main>
    </div>
  );
};

export default Insights;