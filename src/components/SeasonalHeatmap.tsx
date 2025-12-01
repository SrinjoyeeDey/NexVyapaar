import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SeasonalHeatmapProps {
  inventoryData: any[];
}

export const SeasonalHeatmap = ({ inventoryData }: SeasonalHeatmapProps) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Group products by seasonality
  const winterProducts = inventoryData.filter(i => i.seasonality_tag === 'winter_spike');
  const summerProducts = inventoryData.filter(i => i.seasonality_tag === 'summer_peak');
  const yearRoundProducts = inventoryData.filter(i => i.seasonality_tag === 'year_round');

  const getHeatColor = (month: number, seasonality: string) => {
    const isWinter = month >= 11 || month <= 1;
    const isSummer = month >= 4 && month <= 8;
    
    if (seasonality === 'winter_spike' && isWinter) {
      return 'bg-blue-500/80 text-white';
    }
    if (seasonality === 'summer_peak' && isSummer) {
      return 'bg-amber-500/80 text-white';
    }
    if (seasonality === 'year_round') {
      return 'bg-primary/40 text-foreground';
    }
    return 'bg-muted text-muted-foreground';
  };

  const currentMonth = new Date().getMonth();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Seasonal Trend Analyzer
              <Badge variant="secondary" className="ml-2">Premium</Badge>
            </CardTitle>
            <CardDescription>
              Monthly demand patterns and AI-powered forecasts
            </CardDescription>
          </div>
          <Button 
            size="sm"
            onClick={() => {
              toast.info("Upgrade to Premium to unlock AI seasonal forecasting");
            }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Forecast Next Quarter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Winter Products Heatmap */}
        {winterProducts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              ❄️ Winter Products
              <span className="text-xs text-muted-foreground font-normal">
                ({winterProducts.length} items)
              </span>
            </h4>
            <div className="grid grid-cols-12 gap-1">
              {months.map((month, idx) => (
                <div
                  key={month}
                  className={`rounded p-2 text-center text-xs font-medium transition-all ${getHeatColor(idx, 'winter_spike')} ${
                    idx === currentMonth ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {month}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {winterProducts.map(p => p.product_name).join(', ')}
            </p>
          </div>
        )}

        {/* Summer Products Heatmap */}
        {summerProducts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              ☀️ Summer Products
              <span className="text-xs text-muted-foreground font-normal">
                ({summerProducts.length} items)
              </span>
            </h4>
            <div className="grid grid-cols-12 gap-1">
              {months.map((month, idx) => (
                <div
                  key={month}
                  className={`rounded p-2 text-center text-xs font-medium transition-all ${getHeatColor(idx, 'summer_peak')} ${
                    idx === currentMonth ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {month}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {summerProducts.map(p => p.product_name).join(', ')}
            </p>
          </div>
        )}

        {/* Year-Round Products */}
        {yearRoundProducts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              📅 Year-Round Products
              <span className="text-xs text-muted-foreground font-normal">
                ({yearRoundProducts.length} items)
              </span>
            </h4>
            <div className="grid grid-cols-12 gap-1">
              {months.map((month, idx) => (
                <div
                  key={month}
                  className={`rounded p-2 text-center text-xs font-medium transition-all ${getHeatColor(idx, 'year_round')} ${
                    idx === currentMonth ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {month}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {yearRoundProducts.map(p => p.product_name).join(', ')}
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded bg-blue-500/80" />
            <span>High Demand (Winter)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded bg-amber-500/80" />
            <span>High Demand (Summer)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded bg-primary/40" />
            <span>Steady Demand</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded bg-muted" />
            <span>Low Demand</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded ring-2 ring-primary" />
            <span>Current Month</span>
          </div>
        </div>

        {/* AI Insights Teaser */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h5 className="font-semibold text-sm mb-1">AI Seasonal Forecast (Premium)</h5>
              <p className="text-xs text-muted-foreground">
                Get precise predictions like: "December: +25% coffee sales—stock 50kg, est. ₹3K profit" 
                or "Flour burns 20% faster in winter—order 30kg extra by Nov 15th"
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
