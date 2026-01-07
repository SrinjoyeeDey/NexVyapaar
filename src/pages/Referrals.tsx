import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Gift,
  Users,
  TrendingUp,
  Copy,
  Share2,
  Award,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isDemoMode } from "@/hooks/useDemoMode";
import { supabase } from "@/integrations/supabase/client";

const Referrals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState("");
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [rewardsEarned, setRewardsEarned] = useState(0);
  const [referredUsers, setReferredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token && !isDemoMode()) {
      navigate("/auth");
    } else {
      initializeReferral();
    }
  }, [navigate]);

  const generateReferralCode = (userId: string) => {
    return `SBG${userId.slice(0, 8).toUpperCase()}`;
  };

  const initializeReferral = async () => {
    try {
      if (isDemoMode()) {
        setReferralCode("SBG8872X");
        setTotalReferrals(12);
        setRewardsEarned(8);
        setReferredUsers([
          { id: "1", created_at: new Date().toISOString(), reward_claimed: true },
          { id: "2", created_at: new Date(Date.now() - 86400000).toISOString(), reward_claimed: false }
        ]);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const code = generateReferralCode(user.id);

      // Check if referral exists
      let { data: referralData } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .single();

      // Create if doesn't exist
      if (!referralData) {
        const { data: newReferral, error } = await supabase
          .from("referrals")
          .insert({
            referrer_id: user.id,
            referral_code: code
          })
          .select()
          .single();

        if (error) throw error;
        referralData = newReferral;
      }

      setReferralCode(referralData.referral_code);
      setTotalReferrals(referralData.total_referrals);
      setRewardsEarned(referralData.rewards_earned);

      // Load referred users
      const { data: usersData } = await supabase
        .from("user_referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      setReferredUsers(usersData || []);
    } catch (error) {
      console.error("Error initializing referral:", error);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied! 📋",
      description: "Referral link copied to clipboard"
    });
  };

  const shareReferral = async () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    const text = `Join NexVyapaar and get premium features! Use my referral code: ${referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join NexVyapaar",
          text: text,
          url: link
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      copyReferralLink();
    }
  };

  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Referral Program</h1>
              <p className="text-muted-foreground">Earn rewards by inviting businesses</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-3xl font-bold">{totalReferrals}</p>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-3xl font-bold">{rewardsEarned}</p>
                  <p className="text-sm text-muted-foreground">Rewards Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-3xl font-bold">{Math.round(totalReferrals * 1.5)}</p>
                  <p className="text-sm text-muted-foreground">Free Months</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>Share this link with other businesses to earn rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="font-mono text-sm" />
              <Button onClick={copyReferralLink} variant="outline" className="gap-2">
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button onClick={shareReferral} className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            <div className="p-4 bg-background/50 rounded-lg border">
              <p className="text-sm font-semibold mb-2">Your Referral Code:</p>
              <p className="text-2xl font-display font-bold text-primary">{referralCode}</p>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Share your link", description: "Invite other businesses using your unique referral link", icon: Share2, color: "text-blue-500" },
                { title: "They sign up", description: "When they create an account using your link, you both get credited", icon: Users, color: "text-green-500" },
                { title: "Earn rewards", description: "Get 1 free premium month for each successful referral", icon: Award, color: "text-amber-500" },
                { title: "Stack rewards", description: "No limit! Refer 10 businesses, get 10 free months", icon: TrendingUp, color: "text-purple-500" }
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/5 transition-all">
                  <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center ${step.color}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referred Users */}
        {referredUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Referrals</CardTitle>
              <CardDescription>Businesses you've successfully referred</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {referredUsers.map((ref, idx) => (
                  <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Referral #{idx + 1}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ref.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={ref.reward_claimed ? "default" : "secondary"}>
                      {ref.reward_claimed ? "Reward Claimed" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Referrals;
