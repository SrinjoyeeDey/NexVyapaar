import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Mic, Send, LogOut, TrendingUp, AlertCircle } from "lucide-react";
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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI business advisor. How can I help grow your business today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    setTimeout(() => {
      const responses = [
        "Based on your sales data, I recommend promoting your top-selling items during peak hours. This could increase revenue by 15-20%.",
        "Consider implementing a loyalty program. Customers who feel valued are 3x more likely to return.",
        "Your weekday sales are lower. Try offering a mid-week special to boost traffic during slower periods.",
        "Social media engagement can drive foot traffic. Post your daily specials on Instagram and Facebook.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { role: "assistant", content: randomResponse }]);
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
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
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* AI Tips Carousel */}
        <Card className="mb-8">
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
                  <Card className={`bg-gradient-to-br ${tip.color} text-primary-foreground border-0`}>
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
        <Card className="h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle>Chat with AI Advisor</CardTitle>
            <CardDescription>Ask questions about your business</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
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
        <div className="mt-8 flex gap-4">
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
