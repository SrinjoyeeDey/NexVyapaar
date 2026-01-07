import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Megaphone,
  Calendar,
  Send,
  Sparkles,
  Mail,
  MessageSquare,
  Instagram,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { isDemoMode } from "@/hooks/useDemoMode";

const DEMO_CAMPAIGNS = [
  { id: "mc1", campaign_name: "Diwali Dhamaka Sale", content_type: "social", status: "scheduled", schedule_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), generated_content: "🪔 Lighting up your Diwali! Special discounts on Gift Packs. Visit us for exclusive offers! #DiwaliSale #FestiveVibes" },
  { id: "mc2", campaign_name: "Monthly Grocery Restock", content_type: "whatsapp", status: "sent", schedule_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), generated_content: "Hello! Time to restock your kitchen? 🏠 Get 5% off on orders above ₹2000. Free delivery! 🚚" },
  { id: "mc3", campaign_name: "New Arrivals: Organic Range", content_type: "email", status: "sent", schedule_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), generated_content: "Subject: Go Green with Our New Organic Range! 🌱\n\nHi there,\n\nWe are excited to introduce our new range of organic pulses and spices. Healthier choice for your family!" },
  { id: "mc4", campaign_name: "Flash Sale Alert", content_type: "social", status: "failed", schedule_time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), generated_content: "⚡ FLASH SALE! ⚡ Flat 20% off on all beverages for the next 2 hours only! Rush now! 🥤" },
];

const Marketing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Form state
  const [campaignName, setCampaignName] = useState("");
  const [contentType, setContentType] = useState<"social" | "email" | "whatsapp">("social");
  const [scheduleTime, setScheduleTime] = useState("");
  const [businessInfo, setBusinessInfo] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");

  useEffect(() => {
    // Demo mode compatibility: Removed manual auth_token check
    loadCampaigns();
  }, [navigate]);

  const loadCampaigns = async () => {
    // Demo Mode Logic
    if (isDemoMode()) {
      setCampaigns(DEMO_CAMPAIGNS);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("marketing_campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading campaigns:", error);
    } else {
      setCampaigns(data || []);
    }
  };

  const generateContent = async () => {
    if (!businessInfo) {
      toast({
        title: "Missing information",
        description: "Please provide business details",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      // DEMO MODE: Bypass Cloud Function for reliability in video
      await new Promise(r => setTimeout(r, 1500)); // Simulate AI thinking time

      const mockResult = `📢 **${campaignName}** \n\n🚀 Exciting news from ${businessInfo}! \nWe are launching something special just for you. Don't miss out on our limited-time offers. \n\n👉 Visit us today! #NexVyapaar #Growth`;

      setGeneratedContent(mockResult);

      /* 
      // REAL PRODUCTION CODE (Requires LOVABLE_API_KEY in Edge Function)
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: contentType,
          businessInfo,
          tone: "professional"
        }
      });
      if (error) throw error;
      setGeneratedContent(data.content);
      */

      toast({
        title: "Content Generated! ✨",
        description: "AI-powered marketing content is ready"
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const scheduleCampaign = async () => {
    if (!campaignName || !generatedContent || !scheduleTime) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create marketing campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("marketing_campaigns")
        .insert({
          user_id: user.id,
          campaign_name: campaignName,
          content_type: contentType,
          generated_content: generatedContent,
          schedule_time: scheduleTime,
          status: "scheduled",
          metadata: { businessInfo }
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Auto-create a broadcast for this campaign
      const channelMap: Record<string, string[]> = {
        social: ['push'],
        email: ['email'],
        whatsapp: ['whatsapp', 'sms']
      };

      const { error: broadcastError } = await supabase
        .from("broadcasts")
        .insert({
          user_id: user.id,
          subject: campaignName,
          content: generatedContent,
          message_type: 'announcement',
          channels: channelMap[contentType] || ['push'],
          audience_type: 'all',
          scheduled_at: scheduleTime,
          status: 'scheduled',
          recipients_count: 150, // Mock count
          estimated_cost: channelMap[contentType]?.includes('sms') ? 37.5 : 0,
        });

      if (broadcastError) {
        console.error("Error creating auto-broadcast:", broadcastError);
      }

      toast({
        title: "Campaign Scheduled! 🎯",
        description: `${campaignName} will be sent on ${format(new Date(scheduleTime), "PPp")}. A broadcast has been auto-created.`
      });

      // Reset form
      setCampaignName("");
      setGeneratedContent("");
      setScheduleTime("");
      setBusinessInfo("");
      loadCampaigns();
    } catch (error) {
      console.error("Error scheduling campaign:", error);
      toast({
        title: "Failed to schedule",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "sent":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "social":
        return <Instagram className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "whatsapp":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Premium Feature
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-6 h-6" />
              Marketing Campaign Scheduler
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Create AI-powered marketing campaigns for social media, email, and WhatsApp
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Campaign Name</label>
                <Input
                  placeholder="e.g., Summer Sale 2024"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content Type</label>
                <Select value={contentType} onValueChange={(v: any) => setContentType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Schedule Time</label>
                <Input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Business Information</label>
                <Textarea
                  placeholder="Describe your business, target audience, and campaign goal..."
                  value={businessInfo}
                  onChange={(e) => setBusinessInfo(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Button
                  onClick={generateContent}
                  disabled={generating}
                  className="w-full gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {generating ? "Generating..." : "Generate AI Content"}
                </Button>
              </div>

              {generatedContent && (
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Generated Content</label>
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              )}

              {generatedContent && (
                <div className="md:col-span-2">
                  <Button
                    onClick={scheduleCampaign}
                    disabled={loading}
                    className="w-full gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    {loading ? "Scheduling..." : "Schedule Campaign"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Campaigns List */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No campaigns scheduled yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="bg-accent/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{campaign.campaign_name}</h4>
                            <Badge variant="outline" className="gap-1">
                              {getContentTypeIcon(campaign.content_type)}
                              {campaign.content_type}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(campaign.status)}
                              <span className="text-xs">{campaign.status}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {campaign.generated_content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Scheduled for: {format(new Date(campaign.schedule_time), "PPp")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Marketing;
