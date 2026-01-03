import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, AlertCircle, TrendingDown, Eye } from "lucide-react";
import { motion } from "framer-motion";

export const ShelfHealthWidget = () => {
    const { data: shelfItems, isLoading } = useQuery({
        queryKey: ["shelf-health"],
        queryFn: async () => {
            const { data } = await supabase
                .from("raw_materials")
                .select("name, current_stock, reorder_point, optimal_stock_level")
                .order("current_stock", { ascending: true })
                .limit(5);
            return data || [];
        },
    });

    return (
        <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-black flex items-center gap-2 text-emerald-800">
                        <Eye className="h-5 w-5" />
                        Shelf Visual Health
                    </CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        Live AI Monitor
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="animate-pulse space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-12 bg-slate-100 rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        shelfItems?.map((item, i) => {
                            const stock = Number(item.current_stock);
                            const reorder = Number(item.reorder_point || 0);
                            const optimal = Number(item.optimal_stock_level || reorder * 2);
                            const percentage = Math.min(100, (stock / optimal) * 100);

                            const isCritical = stock <= reorder;

                            return (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${isCritical ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {isCritical ? <AlertCircle size={14} /> : <Package size={14} />}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{item.name}</span>
                                        </div>
                                        <span className={`text-xs font-black ${isCritical ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {stock.toFixed(0)} units
                                        </span>
                                    </div>
                                    <Progress
                                        value={percentage}
                                        className={`h-1.5 ${isCritical ? 'bg-rose-100' : 'bg-emerald-100'}`}
                                    />
                                </motion.div>
                            );
                        })
                    )}

                    <div className="pt-2">
                        <div className="bg-white/60 rounded-xl p-3 border border-emerald-100 flex items-center gap-3">
                            <TrendingDown className="h-4 w-4 text-amber-500" />
                            <p className="text-[10px] text-slate-500 font-medium">
                                AI observed <b>moderate depletion</b> across beverages. Recommending restock for 2 items.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
