import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Sparkles, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GoalSetterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GoalSetterModal = ({ open, onOpenChange }: GoalSetterModalProps) => {
  const { toast } = useToast();
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);

  const handleSetGoal = async () => {
    if (!goal.trim()) {
      toast({
        title: "Empty goal",
        description: "Please enter a business goal",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('set-goal', {
        body: { 
          goal,
          currentMetrics: {
            revenue: "₹25,000/month",
            customers: 158
          }
        }
      });

      if (error) throw error;

      setRoadmap(data.roadmap);
      toast({
        title: "Goal Set! 🎯",
        description: "AI has created your personalized roadmap"
      });
    } catch (error) {
      console.error('Error setting goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal roadmap",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Target className="w-6 h-6 text-primary" />
            AI Goal Setter
          </DialogTitle>
          <DialogDescription>
            Set your business target and let AI create a step-by-step roadmap
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Goal Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">What's your goal?</label>
            <Input
              placeholder="e.g., Increase monthly revenue to ₹50,000"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="text-lg"
              disabled={loading || roadmap !== null}
            />
            {!roadmap && (
              <Button 
                onClick={handleSetGoal} 
                disabled={loading}
                className="w-full gap-2 mt-3"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? "Creating Roadmap..." : "Generate AI Roadmap"}
              </Button>
            )}
          </div>

          {/* Roadmap Display */}
          {roadmap && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Timeframe: {roadmap.timeframe} weeks</span>
                  </div>
                  <Badge className="gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {roadmap.estimatedImpact}% Impact
                  </Badge>
                </div>
                <Progress value={(roadmap.estimatedImpact / 100) * 100} className="h-2" />
              </div>

              <div>
                <h4 className="font-semibold mb-3">Action Steps</h4>
                <div className="space-y-3">
                  {roadmap.steps.map((step: any, idx: number) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-lg border bg-card hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">Week {step.week}</Badge>
                            <span className="font-medium">{step.action}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Target: {step.metric}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Key Tips
                </h4>
                <ul className="space-y-1">
                  {roadmap.keyTips.map((tip: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setRoadmap(null);
                  setGoal("");
                }}
              >
                Set Another Goal
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalSetterModal;