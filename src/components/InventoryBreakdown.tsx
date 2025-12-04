import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  Sparkles,
  Calendar,
  Download,
  BarChart3
} from "lucide-react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { toast } from "sonner";
import { InventoryHealthScore } from "./InventoryHealthScore";
import { SeasonalHeatmap } from "./SeasonalHeatmap";
import { AIForecastModal } from "./AIForecastModal";

interface InventoryItem {
  product_name: string;
  category: string;
  total_sales: number;
  total_profit: number;
  total_loss: number;
  total_quantity: number;
  burn_rate: number;
  waste_quantity: number;
  seasonality_tag: string;
  health_score: number;
}

export const InventoryBreakdown = () => {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [forecastModalOpen, setForecastModalOpen] = useState(false);

  // Fetch inventory data
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory-breakdown', filterCategory],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from('sales_data')
        .select('*')
        .eq('user_id', user.id);

      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate data by product
      const aggregated = data.reduce((acc: any[], item: any) => {
        const existing = acc.find(i => i.product_name === item.product_name);
        
        const profit = (item.price - (item.cost_per_unit || 0) * item.quantity);
        const loss = (item.waste_quantity || 0) * (item.cost_per_unit || 0);
        
        if (existing) {
          existing.total_sales += item.price;
          existing.total_profit += profit;
          existing.total_loss += loss;
          existing.total_quantity += item.quantity;
          existing.waste_quantity += item.waste_quantity || 0;
        } else {
          acc.push({
            product_name: item.product_name,
            category: item.category,
            total_sales: item.price,
            total_profit: profit,
            total_loss: loss,
            total_quantity: item.quantity,
            burn_rate: item.burn_rate || 0,
            waste_quantity: item.waste_quantity || 0,
            seasonality_tag: item.seasonality_tag || 'year_round',
            health_score: calculateHealthScore(
              profit, 
              loss, 
              item.waste_quantity || 0, 
              item.quantity
            )
          });
        }
        return acc;
      }, []);

      return aggregated;
    },
  });

  // Calculate health score (0-100)
  const calculateHealthScore = (profit: number, loss: number, waste: number, quantity: number) => {
    const profitRatio = profit / (profit + loss + 1);
    const wasteRatio = 1 - (waste / (quantity + 1));
    return Math.round((profitRatio * 0.7 + wasteRatio * 0.3) * 100);
  };

  // Get unique categories
  const categories = inventoryData 
    ? ['all', ...new Set(inventoryData.map(item => item.category))]
    : ['all'];

  // Prepare chart data for waste analysis
  const wasteChartData = inventoryData?.map(item => ({
    name: item.product_name.substring(0, 15) + (item.product_name.length > 15 ? '...' : ''),
    sales: item.total_quantity,
    waste: item.waste_quantity,
    wasteValue: item.total_loss
  })).slice(0, 10) || [];

  // Prepare pie chart for category distribution
  const categoryDistribution = inventoryData?.reduce((acc: any[], item) => {
    const existing = acc.find(i => i.name === item.category);
    if (existing) {
      existing.value += item.total_sales;
    } else {
      acc.push({ 
        name: item.category, 
        value: item.total_sales,
        color: getColorForCategory(item.category)
      });
    }
    return acc;
  }, []) || [];

  function getColorForCategory(category: string) {
    const colors: Record<string, string> = {
      'raw_materials': 'hsl(173 80% 40%)',
      'bakery': 'hsl(38 92% 50%)',
      'beverages': 'hsl(199 89% 48%)',
      'food': 'hsl(142 76% 36%)',
      'default': 'hsl(215 16% 47%)'
    };
    return colors[category] || colors.default;
  }

  // Export to CSV
  const handleExport = () => {
    if (!inventoryData) return;
    
    const csv = [
      ['Product', 'Category', 'Sales (₹)', 'Profit (₹)', 'Loss (₹)', 'Burn Rate', 'Health Score'].join(','),
      ...inventoryData.map(item => 
        [
          item.product_name,
          item.category,
          item.total_sales,
          item.total_profit.toFixed(2),
          item.total_loss.toFixed(2),
          item.burn_rate,
          item.health_score
        ].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-breakdown-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Inventory data exported!");
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!inventoryData || inventoryData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No inventory data yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload sales data with product details to see your inventory breakdown
            </p>
            <p className="text-xs text-muted-foreground">
              💡 Tip: Make sure your sales data includes product names and categories
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* How It Works Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                How Inventory Intelligence Works
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our AI analyzes your sales data to provide actionable insights on every product.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">1</div>
                  <div>
                    <p className="font-medium">Track Sales & Waste</p>
                    <p className="text-muted-foreground text-xs">Monitor per-product performance</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">2</div>
                  <div>
                    <p className="font-medium">Health Score Analysis</p>
                    <p className="text-muted-foreground text-xs">AI calculates profit vs. waste ratio</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">3</div>
                  <div>
                    <p className="font-medium">Seasonal Forecasting</p>
                    <p className="text-muted-foreground text-xs">Predict demand based on trends</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Badge variant="outline" className="text-xs">
                💡 Click any product row for AI forecast
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Inventory Intelligence Hub
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Per-product breakdown with AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Health Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {inventoryData.slice(0, 3).map((item) => (
          <InventoryHealthScore
            key={item.product_name}
            productName={item.product_name}
            healthScore={item.health_score}
            burnRate={item.burn_rate}
            seasonality={item.seasonality_tag}
          />
        ))}
      </div>

      {/* Main Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Product Breakdown
          </CardTitle>
          <CardDescription>
            Sales, profits, losses, and burn rates per item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Loss</TableHead>
                  <TableHead className="text-right">Burn Rate</TableHead>
                  <TableHead className="text-right">Health</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryData.map((item) => (
                  <TableRow 
                    key={item.product_name}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedProduct(item.product_name)}
                  >
                    <TableCell className="font-medium">
                      {item.product_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.category.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{item.total_sales.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      +₹{item.total_profit.toFixed(0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      -₹{item.total_loss.toFixed(0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.burn_rate} units/week
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{
                            backgroundColor: item.health_score > 70 ? '#10b981' : 
                                           item.health_score > 40 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                        {item.health_score}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.seasonality_tag === 'winter_spike' && (
                        <Badge className="bg-blue-500">❄️ Winter</Badge>
                      )}
                      {item.seasonality_tag === 'summer_peak' && (
                        <Badge className="bg-amber-500">☀️ Summer</Badge>
                      )}
                      {item.seasonality_tag === 'year_round' && (
                        <Badge variant="secondary">📅 Year-round</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(item.product_name);
                          setForecastModalOpen(true);
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Seasonal Heatmap */}
      <SeasonalHeatmap inventoryData={inventoryData} />

      {/* Waste/Loss Tracker Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Waste & Loss Analysis
          </CardTitle>
          <CardDescription>
            Compare sold quantity vs. waste per product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={wasteChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar dataKey="sales" fill="hsl(173 80% 40%)" name="Sold Units" />
              <Bar dataKey="waste" fill="hsl(0 84% 60%)" name="Waste Units" />
              <Line 
                type="monotone" 
                dataKey="wasteValue" 
                stroke="hsl(38 92% 50%)"
                strokeWidth={2}
                name="Loss Value (₹)"
                yAxisId="right"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>AI Tip:</strong> Products with high waste ratios (red bars) should be ordered in smaller batches. 
              Consider freezing extras for items like flour or implementing a FIFO system.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Distribution by Category</CardTitle>
          <CardDescription>Total revenue breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  `${name.replace('_', ' ')} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                dataKey="value"
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Forecast Modal */}
      {selectedProduct && (
        <AIForecastModal
          open={forecastModalOpen}
          onOpenChange={setForecastModalOpen}
          productName={selectedProduct}
          inventoryData={inventoryData.find(i => i.product_name === selectedProduct)}
        />
      )}
    </div>
  );
};
