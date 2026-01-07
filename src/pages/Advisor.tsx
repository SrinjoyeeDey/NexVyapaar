import { useState, useRef, useEffect } from "react";
import { isDemoMode } from "@/hooks/useDemoMode";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Mic, Send, LogOut, TrendingUp, AlertCircle, Scan } from "lucide-react";
import { KhataScanner } from "@/components/KhataScanner";
import { KhataItem } from "@/services/VisionService";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Advisor = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(() => {
    if (isDemoMode()) {
      return [
        {
          role: "assistant",
          content: "Hello! I'm your AI business advisor. How can I help grow your business today?",
        },
        {
          role: "user",
          content: "How can I increase my sales this weekend?",
        },
        {
          role: "assistant",
          content: "Based on your sales data, you usually have a dip on Sunday evenings. I recommend running a 'Sunday Special' flash sale on snacks and beverages between 5 PM and 8 PM. Historically, this boosts your revenue by 18%. Shall I draft a WhatsApp message for this?",
        }
      ];
    }
    return [
      {
        role: "assistant",
        content: "Hello! I'm your AI business advisor. How can I help grow your business today?",
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [khataScannerOpen, setKhataScannerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Khata Import stats for insights
  const { data: khataStats } = useQuery({
    queryKey: ['khata-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: sales } = await supabase
        .from('sales_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'Khata Import');

      const { data: expiring } = await supabase
        .from('raw_materials')
        .select('name, expiry_date')
        .eq('user_id', user.id)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      return {
        count: sales?.length || 0,
        recent: sales?.[0]?.product_name,
        expiringCount: expiring?.length || 0,
        expiringItem: expiring?.[0]?.name
      };
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response (will be replaced with actual Lovable AI call)
    // Simulate AI response (will be replaced with actual Lovable AI call)
    setTimeout(() => {
      let responseContent = "";
      const lowerInput = input.toLowerCase();

      // Keyword matching logic
      if (lowerInput.includes("top selling") || lowerInput.includes("categories") || lowerInput.includes("analysis")) {
        responseContent = "Here is your Top Selling Categories Analysis for this month:\n\n1. **Snacks & Beverages** (45% of revenue) - driven by the new 'Summer Coolers' campaign.\n2. **Groceries & Staples** (30%) - steady demand for Aashirvaad Atta and Dal.\n3. **Personal Care** (15%) - slight dip, consider a bundle offer.\n4. **Household Items** (10%) - stable.\n\n**Recommendation:** Stock up on cold beverages for the upcoming weekend heatwave!";
      } else if (lowerInput.includes("sale") || lowerInput.includes("revenue") || lowerInput.includes("profit")) {
        responseContent = "Based on your sales data, I recommend promoting your top-selling items during peak hours (5 PM - 8 PM). This could increase revenue by 15-20%. specifically, try a 'Happy Hour' for snacks.";
      } else if (lowerInput.includes("customer") || lowerInput.includes("loyalty")) {
        responseContent = "Consider implementing a loyalty program. Customers who feel valued are 3x more likely to return. You currently have 3 customers at risk of churning - would you like to send them a special offer?";
      } else if (lowerInput.includes("inventory") || lowerInput.includes("stock")) {
        responseContent = "Your inventory health is good, but 'Kissan Jam' is running low (5 jars left). Also, you have excess stock of 'Harvest Bread' which expires in 5 days. Suggested action: Bundle bread with jam for a 10% discount.";
      } else if (lowerInput.includes("marketing") || lowerInput.includes("promote") || lowerInput.includes("ad")) {
        responseContent = "Social media engagement can drive foot traffic. I've drafted a post for your 'Summer Coolers' campaign. Shall I post it to Instagram and Facebook for you?";
      } else {
        // Generative fallback for unmatched queries
        responseContent = `I see you're asking about "${input}". As an AI Advisor, I'm analyzing your business data... \n\nFor now, I recommend focusing on your weekend sales strategy. Try offering a mid-week special to boost traffic during slower periods.`;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: responseContent }]);
    }, 1000);
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Voice input not supported in your browser");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice input failed");
    };

    recognition.start();
  };

  const aiTips = [
    {
      title: "Boost Weekend Sales",
      description: "Promote Product X this weekend - predicted +20% increase",
      impact: "High",
      color: "from-primary to-primary/60",
    },
    {
      title: "Optimize Inventory",
      description: "Reduce stock on slow-moving items by 30%",
      impact: "Medium",
      color: "from-accent to-accent/60",
    },
    {
      title: "Customer Retention",
      description: "3 customers at risk of churning - send personalized offers",
      impact: "High",
      color: "from-destructive to-destructive/60",
    },
    {
      title: "Pricing Strategy",
      description: "Adjust pricing on Item Y for better margins",
      impact: "Medium",
      color: "from-primary to-accent",
    },
    ...(khataStats?.count ? [{
      impact: "Very High",
      color: "from-purple-600 to-indigo-600",
    }] : []),
    ...(khataStats?.expiringCount ? [{
      title: "Expiry Alert!",
      description: `${khataStats.expiringItem} is expiring within 7 days. Consider a clearance sale.`,
      impact: "Critical",
      color: "from-red-600 to-orange-600",
    }] : []),
  ];

  const handleKhataData = async (items: KhataItem[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (const item of items) {
      if (item.type === 'sale') {
        await supabase
          .from('sales_data')
          .insert({
            user_id: user.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price,
            sale_date: item.date,
            category: 'Khata Import',
            expiry_date: item.expiry_date || null
          });
      } else {
        const { data: existing } = await supabase
          .from('raw_materials')
          .select('id, current_stock')
          .eq('user_id', user.id)
          .eq('name', item.name)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('raw_materials')
            .update({
              current_stock: (existing.current_stock || 0) + item.quantity,
              cost_per_unit: item.price,
              expiry_date: item.expiry_date || null
            })
            .eq('id', existing.id);
        } else {
          await supabase.from('raw_materials').insert({
            user_id: user.id,
            name: item.name,
            current_stock: item.quantity,
            unit: item.unit,
            cost_per_unit: item.price,
            category: 'Khata Import',
            expiry_date: item.expiry_date || null
          });
        }
      }
    }

    setKhataScannerOpen(false);
    toast.success("Khata insights generated!");
    navigate('/advisor'); // Refresh state
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted pb-8">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold font-heading">AI Advisor</h1>
              <p className="text-xs text-muted-foreground">Your AI Business Coach</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={khataScannerOpen} onOpenChange={setKhataScannerOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                  <Scan className="h-4 w-4 mr-2" />
                  Quick Khata Scan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
                <KhataScanner
                  context="general"
                  onDataExtracted={handleKhataData}
                />
              </DialogContent>
            </Dialog>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* AI Tips Carousel */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
            <CardDescription>AI-powered insights based on your business data</CardDescription>
          </CardHeader>
          <CardContent>
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              autoplay={{ delay: 4000 }}
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className="pb-12"
            >
              {aiTips.map((tip, index) => (
                <SwiperSlide key={index}>
                  <Card className={`bg-gradient-to-br ${tip.color} text-primary-foreground border-0 h-full`}>
                    <CardHeader>
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        Impact: {tip.impact}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm opacity-90">{tip.description}</p>
                    </CardContent>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Chat with AI Advisor</CardTitle>
            <CardDescription>Ask questions about your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages Container with fixed height */}
            <div className="h-[400px] overflow-y-auto pr-2 space-y-4 scroll-smooth">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                      }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Fixed at bottom */}
            <div className="flex gap-2 pt-4 border-t">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about your business..."
                className="flex-1"
              />
              <Button
                onClick={handleVoiceInput}
                variant="outline"
                size="icon"
                className={isListening ? "bg-destructive text-destructive-foreground" : ""}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button onClick={() => navigate("/analytics")} variant="outline">
            ← Analytics
          </Button>
          <Button onClick={() => navigate("/insights")} variant="default">
            Insights →
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Advisor;
