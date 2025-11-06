import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  LogOut, 
  Volume2,
  Sparkles,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VoiceCommands = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/auth");
    }

    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        processCommand(speechResult);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Error",
          description: "Voice recognition failed. Please try again.",
          variant: "destructive"
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [navigate]);

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    let responseText = "";

    if (lowerCommand.includes("sales") || lowerCommand.includes("revenue")) {
      responseText = "Your total revenue this month is ₹25,000, which is 12.5% higher than last month.";
      speak(responseText);
    } else if (lowerCommand.includes("orders")) {
      responseText = "You have 342 orders this month, up 8.2% from last month.";
      speak(responseText);
    } else if (lowerCommand.includes("customers")) {
      responseText = "You have 158 customers, showing a 15.3% increase.";
      speak(responseText);
    } else if (lowerCommand.includes("dashboard") || lowerCommand.includes("home")) {
      responseText = "Navigating to dashboard...";
      speak(responseText);
      setTimeout(() => navigate("/dashboard"), 1500);
    } else if (lowerCommand.includes("analytics")) {
      responseText = "Opening analytics page...";
      speak(responseText);
      setTimeout(() => navigate("/analytics"), 1500);
    } else if (lowerCommand.includes("community")) {
      responseText = "Taking you to the community hub...";
      speak(responseText);
      setTimeout(() => navigate("/community"), 1500);
    } else if (lowerCommand.includes("help") || lowerCommand.includes("what can you do")) {
      responseText = "I can show you sales, orders, customers, navigate to different pages, and answer business questions. Try saying 'show me sales' or 'go to analytics'.";
      speak(responseText);
    } else {
      responseText = "I didn't understand that command. Try asking about sales, orders, or saying 'go to dashboard'.";
      speak(responseText);
    }

    setResponse(responseText);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in this browser",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setResponse("");
      recognition.start();
      setIsListening(true);
      toast({
        title: "Listening... 🎤",
        description: "Speak your command now"
      });
    }
  };

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
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">Voice Commands</h1>
              <p className="text-xs text-muted-foreground">Hands-free business control</p>
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
        {/* Voice Control Center */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Voice Assistant</CardTitle>
            <p className="text-muted-foreground">Click the microphone and speak your command</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <Button
              size="lg"
              onClick={toggleListening}
              className={`w-32 h-32 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary hover:bg-primary/90'}`}
            >
              {isListening ? (
                <MicOff className="w-16 h-16" />
              ) : (
                <Mic className="w-16 h-16" />
              )}
            </Button>

            {isListening && (
              <Badge variant="secondary" className="text-lg px-6 py-2 animate-pulse">
                Listening...
              </Badge>
            )}

            {transcript && (
              <Card className="w-full bg-accent/5 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    You said:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">{transcript}</p>
                </CardContent>
              </Card>
            )}

            {response && (
              <Card className="w-full bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Response:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">{response}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Available Commands */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Available Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: TrendingUp, command: "Show me sales", description: "Get your sales data" },
                { icon: Users, command: "How many customers", description: "View customer count" },
                { icon: Calendar, command: "Show orders", description: "See order statistics" },
                { icon: Sparkles, command: "Go to dashboard", description: "Navigate to dashboard" },
                { icon: Sparkles, command: "Open analytics", description: "View analytics page" },
                { icon: Sparkles, command: "What can you do", description: "Get help with commands" }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-border hover:bg-accent/5 transition-all">
                  <div className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold text-sm">{item.command}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Premium Feature Notice */}
        <Card className="mt-6 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-bold text-lg mb-2">Premium Feature</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Voice commands are available to all users. Upgrade for advanced AI features!
            </p>
            <Button onClick={() => navigate("/billing")}>
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VoiceCommands;