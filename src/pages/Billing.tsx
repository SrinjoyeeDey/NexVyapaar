import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  LogOut,
  Check,
  Zap,
  Crown,
  CreditCard,
  Smartphone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Confetti from "react-confetti";

const Billing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [gateway, setGateway] = useState<"stripe" | "razorpay">("stripe");
  const [processing, setProcessing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/auth");
    }

    // Check for payment success
    if (searchParams.get("success") === "true") {
      setShowConfetti(true);
      toast({
        title: "Welcome to Premium! 🎉",
        description: "Your subscription is now active"
      });
      
      setTimeout(() => {
        setShowConfetti(false);
        navigate("/dashboard");
      }, 5000);
    }

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate, searchParams, toast]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/");
  };

  const handleCheckout = async () => {
    setProcessing(true);
    
    toast({
      title: "Processing payment...",
      description: `Redirecting to ${gateway === "stripe" ? "Stripe" : "Razorpay"} checkout`
    });

    // Simulate payment and create transaction record
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          amount: 299,
          currency: "INR",
          payment_gateway: gateway,
          transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: "completed",
          subscription_type: "monthly",
          metadata: {
            plan: "premium",
            features: features.premium
          }
        });

      if (error) {
        console.error("Transaction creation error:", error);
      }
    }

    setTimeout(() => {
      setProcessing(false);
      navigate("/billing?success=true");
    }, 2000);
  };

  const features = {
    free: [
      "Basic dashboard analytics",
      "CSV data upload",
      "Standard charts & trends",
      "Community access (5 posts/week)",
      "Email support"
    ],
    premium: [
      "Everything in Free",
      "AI-powered forecasts",
      "Sentiment analysis",
      "Churn prediction",
      "AI content generator (unlimited)",
      "Premium integrations (QuickBooks, GMB)",
      "Community boost (unlimited)",
      "Priority support",
      "Goal setter & roadmaps",
      "Sustainability tracker",
      "Badge system & gamification"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">Upgrade to Premium</h1>
              <p className="text-xs text-muted-foreground">Unlock AI-powered growth</p>
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

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Pricing Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">Free</CardTitle>
                <Badge variant="outline">Current Plan</Badge>
              </div>
              <div className="text-3xl font-bold">₹0</div>
              <p className="text-sm text-muted-foreground">Forever free basics</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.free.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-primary shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-secondary text-white px-4 py-1 text-xs font-bold">
              POPULAR
            </div>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Crown className="w-6 h-6 text-primary" />
                  Premium
                </CardTitle>
              </div>
              <div className="text-4xl font-bold text-primary">₹299</div>
              <p className="text-sm text-muted-foreground">per month</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {features.premium.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Payment Gateway Selection */}
              <div className="pt-6 border-t">
                <h4 className="font-semibold mb-4">Choose Payment Method</h4>
                <RadioGroup value={gateway} onValueChange={(val) => setGateway(val as "stripe" | "razorpay")}>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/5 cursor-pointer">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="w-4 h-4" />
                      Stripe (Cards: Visa, Mastercard, Amex)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent/5 cursor-pointer">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Smartphone className="w-4 h-4" />
                      Razorpay (UPI, Cards, Net Banking)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                className="w-full gap-2 text-lg py-6" 
                size="lg"
                onClick={handleCheckout}
                disabled={processing}
              >
                <Sparkles className="w-5 h-5" />
                {processing ? "Processing..." : "Upgrade to Premium"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime • Secure payment • 7-day money-back guarantee
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Success Stories */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">Premium Members Love It! 🌟</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Priya's Boutique", result: "+45% sales in 2 months", quote: "AI predictions helped me stock perfectly!" },
                { name: "Raj's Cafe", result: "Saved ₹25K/month", quote: "Churn alerts saved my best customers" },
                { name: "Maya's Salon", result: "+200 Instagram followers", quote: "AI content generator is a game-changer" }
              ].map((story, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{story.result}</div>
                  <div className="font-semibold text-sm mb-2">{story.name}</div>
                  <p className="text-xs text-muted-foreground italic">"{story.quote}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Billing;