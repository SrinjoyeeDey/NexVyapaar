import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, History, Award } from "lucide-react";
import { format } from "date-fns";

interface SupplierPriceHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId?: string;
  materialName?: string;
}

export const SupplierPriceHistory = ({
  open,
  onOpenChange,
  materialId,
  materialName,
}: SupplierPriceHistoryProps) => {
  // Fetch price history with supplier names
  const { data: priceHistory, isLoading } = useQuery({
    queryKey: ["supplier-price-history", materialId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get current prices
      let query = supabase
        .from("supplier_prices")
        .select(`
          id,
          price_per_unit,
          minimum_order_quantity,
          valid_from,
          valid_until,
          created_at,
          supplier_id,
          suppliers!inner (
            name,
            delivery_time_days,
            rating
          )
        `)
        .eq("suppliers.user_id", user.id);

      if (materialId) {
        query = query.eq("material_id", materialId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Fetch historical prices
  const { data: historicalPrices } = useQuery({
    queryKey: ["historical-prices", materialId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("supplier_price_history")
        .select(`
          id,
          price_per_unit,
          recorded_at,
          supplier_id,
          suppliers!inner (
            name
          )
        `)
        .eq("user_id", user.id);

      if (materialId) {
        query = query.eq("material_id", materialId);
      }

      const { data, error } = await query
        .order("recorded_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Prepare chart data grouped by supplier
  const chartData = historicalPrices?.reduce((acc: any[], item) => {
    const date = format(new Date(item.recorded_at), "MMM dd");
    const existing = acc.find(d => d.date === date);
    const supplierName = (item.suppliers as any)?.name || "Unknown";

    if (existing) {
      existing[supplierName] = item.price_per_unit;
    } else {
      acc.push({
        date,
        [supplierName]: item.price_per_unit,
      });
    }
    return acc;
  }, []) || [];

  // Get unique supplier names for chart lines
  const supplierNames = [...new Set(historicalPrices?.map(p => (p.suppliers as any)?.name))].filter(Boolean);

  // Colors for different suppliers
  const supplierColors = [
    "hsl(173, 80%, 40%)",
    "hsl(38, 92%, 50%)",
    "hsl(199, 89%, 48%)",
    "hsl(142, 76%, 36%)",
    "hsl(280, 80%, 50%)",
  ];

  // Find best deal
  const bestDeal = priceHistory?.reduce((best, current) => {
    if (!best || current.price_per_unit < best.price_per_unit) {
      return current;
    }
    return best;
  }, null as any);

  // Calculate price trends
  const getPriceTrend = (supplierId: string) => {
    const supplierHistory = historicalPrices?.filter(p => p.supplier_id === supplierId);
    if (!supplierHistory || supplierHistory.length < 2) return { trend: "stable", change: 0 };

    const latest = supplierHistory[supplierHistory.length - 1]?.price_per_unit || 0;
    const previous = supplierHistory[supplierHistory.length - 2]?.price_per_unit || 0;
    const change = ((latest - previous) / previous) * 100;

    return {
      trend: change > 2 ? "up" : change < -2 ? "down" : "stable",
      change: Math.abs(change).toFixed(1),
    };
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Price History & Comparison
          </SheetTitle>
          <SheetDescription>
            {materialName ? `Pricing trends for ${materialName}` : "Compare supplier prices over time"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Best Deal Highlight */}
          {bestDeal && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Best Current Price</p>
                    <p className="text-xl font-bold">
                      ₹{bestDeal.price_per_unit}/unit from {(bestDeal.suppliers as any)?.name}
                    </p>
                    {bestDeal.minimum_order_quantity && (
                      <p className="text-xs text-muted-foreground">
                        Min order: {bestDeal.minimum_order_quantity} units
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price Trend Chart */}
          {chartData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Price Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    {supplierNames.map((name, index) => (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name as string}
                        stroke={supplierColors[index % supplierColors.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Current Prices Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Current Supplier Prices</CardTitle>
              <CardDescription>Compare prices across all suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : priceHistory && priceHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right">Price/Unit</TableHead>
                      <TableHead className="text-right">Min Order</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceHistory.map((price) => {
                      const supplier = price.suppliers as any;
                      const trend = getPriceTrend(price.supplier_id);
                      const isBestDeal = bestDeal?.id === price.id;

                      return (
                        <TableRow key={price.id} className={isBestDeal ? "bg-primary/5" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{supplier?.name}</span>
                              {isBestDeal && (
                                <Badge className="bg-primary text-xs">Best</Badge>
                              )}
                            </div>
                            {supplier?.rating && (
                              <div className="text-xs text-muted-foreground">
                                ⭐ {supplier.rating.toFixed(1)} rating
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{price.price_per_unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {price.minimum_order_quantity || "-"}
                          </TableCell>
                          <TableCell>
                            {supplier?.delivery_time_days ? `${supplier.delivery_time_days} days` : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {trend.trend === "up" && (
                                <>
                                  <TrendingUp className="h-4 w-4 text-red-500" />
                                  <span className="text-xs text-red-500">+{trend.change}%</span>
                                </>
                              )}
                              {trend.trend === "down" && (
                                <>
                                  <TrendingDown className="h-4 w-4 text-green-500" />
                                  <span className="text-xs text-green-500">-{trend.change}%</span>
                                </>
                              )}
                              {trend.trend === "stable" && (
                                <>
                                  <Minus className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">Stable</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No price history available</p>
                  <p className="text-sm text-muted-foreground">
                    Add supplier prices to start tracking
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-muted/50">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Pro Tip:</strong> Set up multiple suppliers for key materials to compare prices
                and ensure supply chain resilience. Price history helps identify seasonal pricing patterns.
              </p>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};