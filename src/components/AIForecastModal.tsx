import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Package, AlertTriangle, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AIForecastModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  inventoryData?: any;
}

export const AIForecastModal = ({
  open,
  onOpenChange,
  productName,
  inventoryData
}: AIForecastModalProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<any>(null);

  const handleForecast = async () => {
    setLoading(true);
    try {
      // DEMO MODE: Bypass Cloud Function
      await new Promise(r => setTimeout(r, 1800)); // Simulate thinking

      const mockForecast = {
        summary: "Demand is expected to rise by 25% due to upcoming festival season.",
        stockRecommendation: "Order 50 more units by next week to avoid stockout.",
        profitEstimate: "₹12,500",
        tips: [
          "Bundle with complementary items to increase basket size.",
          "Run a weekend flash sale to clear older stock.",
          "Negotiate bulk discount with supplier for next order."
        ]
      };

      setForecast(mockForecast);

      /*
      // Call the edge function for AI forecasting
      const { data, error } = await supabase.functions.invoke('inventory-forecast', {
        body: { 
          productName,
          inventoryData: {
            total_sales: inventoryData?.total_sales || 0,
            burn_rate: inventoryData?.burn_rate || 0,
            seasonality_tag: inventoryData?.seasonality_tag || 'year_round',
            waste_quantity: inventoryData?.waste_quantity || 0,
            total_quantity: inventoryData?.total_quantity || 0
          }
        }
      });

      if (error) {
           // ... handle error
      }
      setForecast(data);
      */

      toast.success("AI forecast generated!");
    } catch (error) {
      console.error('Forecast error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Forecast: {productName}
            <Badge variant="secondary" className="ml-2">Premium</Badge>
          </DialogTitle>
          <DialogDescription>
            Get AI-powered seasonal predictions and stock recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!forecast ? (
            <div className="text-center py-8">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Lock className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Unlock AI forecasting to predict demand patterns, optimize stock levels,
                and maximize profits with seasonal intelligence.
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/billing');
                  }}
                >
                  Upgrade to Premium
                </Button>
                <Button
                  onClick={handleForecast}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Try Demo Forecast
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Forecast Summary */}
              <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Next Quarter Prediction
                </h4>
                <p className="text-sm">{forecast.summary}</p>
              </div>

              {/* Stock Recommendation */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Stock Recommendation
                </h4>
                <p className="text-sm">{forecast.stockRecommendation}</p>
              </div>

              {/* Profit Estimate */}
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                  Estimated Profit Impact
                </h4>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {forecast.profitEstimate}
                </p>
              </div>

              {/* Seasonal Tips */}
              {forecast.tips && forecast.tips.length > 0 && (
                <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Seasonal Tips
                  </h4>
                  <ul className="text-sm space-y-1">
                    {forecast.tips.map((tip: string, idx: number) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
