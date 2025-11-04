import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FeatureCard } from "@/components/FeatureCard";
import { 
  BarChart3, 
  Brain, 
  MessageSquare, 
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lightbulb
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Transform sales data into actionable insights with beautiful visualizations and trend analysis",
      gradient: "from-primary to-secondary",
      link: "/analytics"
    },
    {
      icon: Brain,
      title: "AI Business Advisor",
      description: "Get personalized recommendations to boost revenue, reduce costs, and optimize operations",
      gradient: "from-accent to-orange-500",
      link: "/advisor"
    },
    {
      icon: Lightbulb,
      title: "Customer Insights",
      description: "Understand sentiment, predict churn, and create winning marketing campaigns powered by AI",
      gradient: "from-purple-500 to-pink-500",
      link: "/insights"
    }
  ];

  const benefits = [
    "No technical skills required",
    "Mobile-first design for on-the-go management",
    "Free tier to get started",
    "AI-powered growth recommendations",
    "Real-time analytics dashboard",
    "Secure data with privacy controls"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Business Growth Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
              Empowering every{" "}
              <span className="gradient-text">small business</span>{" "}
              with AI
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Turn your data into actionable insights. SmartBizGrow helps local cafes, salons, shops, and service businesses grow with simple, smart, scalable AI tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg"
                className="btn-hero pulse-glow gap-2 text-lg px-8"
                onClick={() => navigate("/auth")}
              >
                Start Free
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="gap-2 text-lg"
                onClick={() => navigate("/dashboard")}
              >
                View Demo
                <TrendingUp className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Free to start
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Setup in 5 minutes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything you need to grow
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful AI tools designed specifically for small business owners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} onClick={() => navigate(feature.link)} className="cursor-pointer">
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Built for busy business owners
              </h2>
              <p className="text-lg text-muted-foreground">
                No tech expertise required. Just upload your data and let AI do the heavy lifting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg bg-card border border-card-border hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              Ready to grow smarter?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of small businesses using AI to drive growth
            </p>
            <Button 
              size="lg"
              className="btn-hero pulse-glow gap-2 text-lg px-10"
              onClick={() => navigate("/auth")}
            >
              Get Started Free
              <Sparkles className="w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-6">
              ✨ Upgrade to premium for advanced AI features starting at ₹299/month
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              "Every small business is a hero building something amazing. We're here to help you shine." ✨
            </p>
            <p>© 2024 SmartBizGrow. Empowering local businesses with AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
