import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

interface InventoryHealthScoreProps {
  productName: string;
  healthScore: number;
  burnRate: number;
  seasonality: string;
}

export const InventoryHealthScore = ({
  productName,
  healthScore,
  burnRate,
  seasonality
}: InventoryHealthScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 75) return "from-green-500/20 to-green-500/5";
    if (score >= 50) return "from-amber-500/20 to-amber-500/5";
    return "from-red-500/20 to-red-500/5";
  };

  const getSeasonalAlert = (seasonality: string) => {
    const currentMonth = new Date().getMonth();
    const isWinter = currentMonth >= 11 || currentMonth <= 1;
    const isSummer = currentMonth >= 4 && currentMonth <= 8;

    if (seasonality === 'winter_spike' && isWinter) {
      return { show: true, message: "High demand season!", icon: TrendingUp };
    }
    if (seasonality === 'summer_peak' && isSummer) {
      return { show: true, message: "Peak season now!", icon: TrendingUp };
    }
    if (seasonality === 'winter_spike' && !isWinter) {
      return { show: true, message: "Seasonal dip expected", icon: TrendingDown };
    }
    return { show: false, message: "", icon: AlertCircle };
  };

  const alert = getSeasonalAlert(seasonality);

  return (
    <Card className={`relative overflow-hidden border-2 transition-all hover:shadow-lg bg-gradient-to-br ${getScoreGradient(healthScore)}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="truncate flex-1 mr-2">{productName}</span>
          <div className="flex items-center gap-2">
            {/* Health Score Orb */}
            <div className={`relative w-10 h-10 rounded-full border-4 ${getScoreColor(healthScore)} border-current flex items-center justify-center bg-background`}>
              <span className={`text-xs font-bold ${getScoreColor(healthScore)}`}>
                {healthScore}
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Burn Rate:</span>
          <span className="font-semibold">{burnRate} units/week</span>
        </div>
        
        {alert.show && (
          <div className="flex items-center gap-2 p-2 bg-background/80 rounded-md">
            <alert.icon className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">{alert.message}</span>
          </div>
        )}

        <div className="flex gap-2">
          {seasonality === 'winter_spike' && (
            <Badge variant="secondary" className="text-xs">❄️ Winter</Badge>
          )}
          {seasonality === 'summer_peak' && (
            <Badge variant="secondary" className="text-xs">☀️ Summer</Badge>
          )}
          {seasonality === 'year_round' && (
            <Badge variant="secondary" className="text-xs">📅 Stable</Badge>
          )}
        </div>

        {healthScore < 50 && (
          <div className="text-xs text-muted-foreground bg-red-500/10 p-2 rounded border border-red-500/20">
            ⚠️ Action needed: High waste or low profitability detected
          </div>
        )}
      </CardContent>
    </Card>
  );
};
