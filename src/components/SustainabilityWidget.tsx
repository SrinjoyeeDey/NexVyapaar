import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplet, Recycle, Award } from "lucide-react";

const SustainabilityWidget = () => {
  // In production, this would be calculated from real data
  const greenScore = 68; // out of 100
  const metrics = [
    { icon: Leaf, label: "Carbon Footprint", value: 72, unit: "kg CO₂" },
    { icon: Droplet, label: "Water Usage", value: 45, unit: "L/day" },
    { icon: Recycle, label: "Waste Recycled", value: 85, unit: "%" },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 40) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return { text: "Eco Hero 🌿", color: "bg-green-500" };
    if (score >= 40) return { text: "Eco Friendly 🌱", color: "bg-amber-500" };
    return { text: "Getting Started 🌾", color: "bg-gray-500" };
  };

  const badge = getScoreBadge(greenScore);

  return (
    <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-500" />
            Green Score
          </CardTitle>
          <Badge className={`${badge.color} text-white`}>
            {badge.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="text-center py-4">
          <div className={`text-5xl font-bold ${getScoreColor(greenScore)} mb-2`}>
            {greenScore}
          </div>
          <p className="text-sm text-muted-foreground">out of 100</p>
          <Progress value={greenScore} className="mt-3 h-2" />
        </div>

        {/* Metrics */}
        <div className="space-y-3 pt-4 border-t">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{metric.label}</span>
                </div>
                <span className="text-sm font-semibold">
                  {metric.value} {metric.unit}
                </span>
              </div>
            );
          })}
        </div>

        {/* Eco Tip */}
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-start gap-2">
            <Award className="w-4 h-4 text-green-600 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
                Eco Tip
              </p>
              <p className="text-xs text-muted-foreground">
                Switch to biodegradable packaging to boost your Green Score by 15 points!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SustainabilityWidget;