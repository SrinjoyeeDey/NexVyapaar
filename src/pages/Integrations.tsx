import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles,
  LogOut,
  Check,
  Zap,
  MessageCircle,
  MapPin,
  FileSpreadsheet,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Integrations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPremium] = useState(false);
  const [connectedServices, setConnectedServices] = useState<Record<string, boolean>>({
    whatsapp: false,
    googleMyBusiness: false,
    quickbooks: false
  });

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

  const handleConnect = (service: string) => {
    if (!isPremium && service !== "whatsapp") {
      toast({
        title: "Premium Required",
        description: "Upgrade to Premium to connect this integration",
        variant: "destructive"
      });
      navigate("/billing");
      return;
    }

    // Simulate OAuth connection
    toast({
      title: "Connecting...",
      description: `Opening ${service} authorization...`
    });

    setTimeout(() => {
      setConnectedServices(prev => ({ ...prev, [service]: true }));
      toast({
        title: "Connected! 🎉",
        description: `${service} is now integrated`
      });
    }, 2000);
  };

  const integrations = [
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "Auto-send promotional messages, order updates, and churn alerts",
      icon: MessageCircle,
      premium: false,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      features: ["Bulk messaging", "Templates", "Auto-replies"]
    },
    {
      id: "googleMyBusiness",
      name: "Google My Business",
      description: "Auto-import reviews for sentiment analysis and boost local SEO",
      icon: MapPin,
      premium: true,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      features: ["Review sync", "Auto-responses", "Analytics"]
    },
    {
      id: "quickbooks",
      name: "QuickBooks",
      description: "Sync invoices, expenses, and financial data automatically",
      icon: FileSpreadsheet,
      premium: true,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
      features: ["Invoice sync", "Expense tracking", "Reports"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">Integrations Hub</h1>
              <p className="text-xs text-muted-foreground">Connect Your Business Tools</p>
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Premium Banner */}
        {!isPremium && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-2">Unlock All Integrations</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with premium tools and automate your workflow
                  </p>
                </div>
                <Button onClick={() => navigate("/billing")} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Integrations */}
        <div className="space-y-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            const isConnected = connectedServices[integration.id];

            return (
              <Card 
                key={integration.id}
                className={`border-2 ${isConnected ? "border-green-500/50" : "border-border"}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg ${integration.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${integration.color}`} />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 mb-1">
                          {integration.name}
                          {integration.premium && (
                            <Badge variant="secondary" className="gap-1">
                              <Lock className="w-3 h-3" />
                              Premium
                            </Badge>
                          )}
                          {isConnected && (
                            <Badge className="gap-1 bg-green-500">
                              <Check className="w-3 h-3" />
                              Connected
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    
                    {isConnected ? (
                      <Switch 
                        checked={true}
                        onCheckedChange={() => {
                          setConnectedServices(prev => ({ ...prev, [integration.id]: false }));
                          toast({
                            title: "Disconnected",
                            description: `${integration.name} has been disconnected`
                          });
                        }}
                      />
                    ) : (
                      <Button 
                        onClick={() => handleConnect(integration.id)}
                        variant={integration.premium && !isPremium ? "outline" : "default"}
                        className="gap-2"
                      >
                        {integration.premium && !isPremium ? (
                          <>
                            <Lock className="w-4 h-4" />
                            Locked
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {isConnected && (
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {integration.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {integration.premium && isPremium && (
                        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-accent" />
                            <span className="font-semibold text-sm">Automation Zaps</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Set up automatic workflows triggered by AI insights
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Coming Soon */}
        <Card className="mt-8 border-dashed">
          <CardHeader>
            <CardTitle className="text-center text-muted-foreground">
              More Integrations Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4 flex-wrap">
              {["Shopify", "Mailchimp", "Razorpay", "Instagram"].map((name) => (
                <Badge key={name} variant="outline" className="py-2 px-4">
                  {name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Integrations;