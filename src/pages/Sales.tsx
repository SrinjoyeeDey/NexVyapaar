import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Search,
    Filter,
    Download,
    Calendar as CalendarIcon,
    Wifi,
    Sparkles,
    Scan,
} from "lucide-react";
import { toast } from "sonner";
import { KhataScanner } from "@/components/KhataScanner";
import { KhataItem } from "@/services/VisionService";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Legend
} from "recharts";

interface SaleRecord {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    sale_date: string;
    category: string | null;
    cost_per_unit: number | null;
    waste_quantity: number | null;
}

const SalesPage = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [filterTime, setFilterTime] = useState<"today" | "week" | "month" | "all">("today");
    const [searchTerm, setSearchTerm] = useState("");
    const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
    const [khataScannerOpen, setKhataScannerOpen] = useState(false);

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('sales-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sales_data' },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['sales-data'] });
                    toast.info('Sales data updated in real-time');
                }
            )
            .subscribe((status) => {
                setIsRealtimeConnected(status === 'SUBSCRIBED');
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    // Fetch sales records
    const { data: sales, isLoading } = useQuery({
        queryKey: ['sales-data', filterTime],
        queryFn: async () => {
            let { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                const { data: { session } } = await supabase.auth.getSession();
                user = session?.user ?? null;
            }
            if (!user) throw new Error("Not authenticated");

            let query = supabase
                .from('sales_data')
                .select('*')
                .eq('user_id', user.id)
                .order('sale_date', { ascending: false });

            const now = new Date();
            if (filterTime === 'today') {
                const todayStr = now.toISOString().split('T')[0];
                query = query.gte('sale_date', todayStr);
            } else if (filterTime === 'week') {
                const lastWeek = new Date(now.setDate(now.getDate() - 7));
                const weekStr = lastWeek.toISOString().split('T')[0];
                query = query.gte('sale_date', weekStr);
            } else if (filterTime === 'month') {
                const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
                const monthStr = lastMonth.toISOString().split('T')[0];
                query = query.gte('sale_date', monthStr);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as SaleRecord[];
        }
    });

    const handleKhataData = async (items: KhataItem[]) => {
        let { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const { data: { session } } = await supabase.auth.getSession();
            user = session?.user ?? null;
        }
        if (!user) return;

        let processedCount = 0;

        for (const item of items) {
            let supplierId = null;

            // Handle Supplier
            if (item.supplier) {
                const { data: existingSupplier } = await supabase
                    .from('suppliers')
                    .select('id')
                    .eq('user_id', user.id)
                    .ilike('name', `%${item.supplier}%`)
                    .maybeSingle();

                if (existingSupplier) {
                    supplierId = existingSupplier.id;
                } else {
                    const { data: newSupplier, error: sError } = await supabase
                        .from('suppliers')
                        .insert({
                            user_id: user.id,
                            name: item.supplier,
                            notes: 'Auto-created from Khata Scan'
                        })
                        .select('id')
                        .single();
                    if (!sError) supplierId = newSupplier.id;
                }
            }

            if (item.type === 'sale') {
                const { error } = await supabase
                    .from('sales_data')
                    .insert({
                        user_id: user.id,
                        product_name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        sale_date: item.date,
                        category: 'Khata Import',
                        expiry_date: item.expiry_date || null
                    });

                if (!error) processedCount++;
            }

            // Sync with Inventory
            const { data: existingMaterials } = await supabase
                .from('raw_materials')
                .select('*')
                .eq('user_id', user.id)
                .eq('name', item.name)
                .maybeSingle();

            if (existingMaterials) {
                const stockChange = item.type === 'sale' ? -item.quantity : item.quantity;
                const newStock = Math.max(0, (existingMaterials.current_stock || 0) + stockChange);

                await supabase
                    .from('raw_materials')
                    .update({
                        current_stock: newStock,
                        cost_per_unit: item.type === 'inventory' ? item.price : existingMaterials.cost_per_unit,
                        expiry_date: item.expiry_date || existingMaterials.expiry_date,
                        supplier_id: supplierId || existingMaterials.supplier_id
                    })
                    .eq('id', existingMaterials.id);
            } else if (item.type === 'inventory') {
                await supabase
                    .from('raw_materials')
                    .insert({
                        user_id: user.id,
                        name: item.name,
                        current_stock: item.quantity,
                        unit: item.unit,
                        cost_per_unit: item.price,
                        category: 'Khata Import',
                        expiry_date: item.expiry_date || null,
                        supplier_id: supplierId
                    });
            }

            if (item.type === 'inventory') processedCount++;
        }

        queryClient.invalidateQueries();
        setKhataScannerOpen(false);
        toast.success(`Khata Sync Complete: ${processedCount} transactions logged!`);
    };

    const filteredSales = sales?.filter(sale =>
        sale.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.price, 0);
    const totalQuantity = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
    const averageSale = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

    // Prepare chart data
    const chartData = filteredSales.reduce((acc: any[], sale) => {
        const date = sale.sale_date;
        const existing = acc.find(d => d.date === date);
        if (existing) {
            existing.revenue += sale.price;
            existing.sales += 1;
        } else {
            acc.push({ date, revenue: sale.price, sales: 1 });
        }
        return acc;
    }, []).sort((a, b) => a.date.localeCompare(b.date));

    const exportToCSV = () => {
        if (filteredSales.length === 0) return;
        const headers = ["Date", "Product", "Quantity", "Revenue"];
        const rows = filteredSales.map(s => [s.sale_date, s.product_name, s.quantity, s.price]);
        const csvContent = "data:text/csv;charset=utf-8," +
            [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales-report-${filterTime}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ShoppingCart className="h-8 w-8 text-primary" />
                        Sales Dashboard
                        {isRealtimeConnected && (
                            <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                                <Wifi className="h-3 w-3 mr-1" />
                                Live
                            </Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track your performance and analyze customer demand in real-time
                    </p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={khataScannerOpen} onOpenChange={setKhataScannerOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200">
                                <Scan className="h-4 w-4 mr-2" />
                                Khata Scanner
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
                            <KhataScanner
                                context="sales"
                                onDataExtracted={handleKhataData}
                            />
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={exportToCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-primary/10 to-transparent">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                        <div className="flex items-center text-xs text-green-600 mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +12.5% vs prev. period
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Items Sold
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalQuantity}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Across {filteredSales.length} transactions
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Average Order Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{averageSale.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Per single checkout
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Growth Potential
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                            87%
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            AI Insight: High demand for Bakery
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Revenue Trends</CardTitle>
                            <CardDescription>Sales performance over time</CardDescription>
                        </div>
                        <Tabs value={filterTime} onValueChange={(v) => setFilterTime(v as any)}>
                            <TabsList>
                                <TabsTrigger value="today">Today</TabsTrigger>
                                <TabsTrigger value="week">Week</TabsTrigger>
                                <TabsTrigger value="month">Month</TabsTrigger>
                                <TabsTrigger value="all">All</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickFormatter={(val) => `₹${val}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '0.5rem'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="hsl(var(--primary))"
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Selling Categories</CardTitle>
                        <CardDescription>By volume</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Dummy categories distribution for visual appeal */}
                            {[
                                { name: "Bakery", value: 45, color: "bg-amber-500" },
                                { name: "Dairy", value: 30, color: "bg-blue-500" },
                                { name: "Beverages", value: 15, color: "bg-teal-500" },
                                { name: "Others", value: 10, color: "bg-slate-400" }
                            ].map((c) => (
                                <div key={c.name} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>{c.name}</span>
                                        <span className="font-semibold">{c.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className={`${c.color} h-full`} style={{ width: `${c.value}%` }} />
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 mt-4 border-t border-dashed">
                                <Button variant="ghost" className="w-full text-xs text-primary" onClick={() => toast.info("Comprehensive category analysis coming soon!")}>
                                    <BarChart3 className="h-3 w-3 mr-2" />
                                    View Full breakdown
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction List */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Live feed of sales records</CardDescription>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredSales.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            No transactions found for this period.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSales.map((sale) => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {sale.sale_date}
                                            </TableCell>
                                            <TableCell className="font-medium">{sale.product_name}</TableCell>
                                            <TableCell className="text-right">{sale.quantity}</TableCell>
                                            <TableCell className="text-right font-semibold">₹{sale.price.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                                    Completed
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SalesPage;
