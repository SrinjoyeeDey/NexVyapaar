import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Package, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { InventoryItem } from "@/hooks/useSimulatedStore";

interface InventoryCardProps {
    item: InventoryItem;
    onPlaceOrder: (id: string) => Promise<void>;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({ item, onPlaceOrder }) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const getStatusColor = (status: InventoryItem['status']) => {
        switch (status) {
            case 'Critical': return 'bg-red-500';
            case 'Low': return 'bg-orange-500';
            case 'Healthy': return 'bg-green-500';
            case 'Optimal': return 'bg-blue-500';
            default: return 'bg-slate-500';
        }
    };

    const getProgressValue = (item: InventoryItem) => {
        return Math.min((item.stock / (item.threshold * 2)) * 100, 100);
    };

    const handleOrder = async () => {
        setLoading(true);
        try {
            await onPlaceOrder(item.id);
            toast({
                title: "Order Placed Successfully",
                description: `Restock for ${item.name} has been scheduled.`,
                variant: "default",
            });
        } catch (error) {
            toast({
                title: "Order Failed",
                description: "Communication error with supplier system. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shadow-inner">
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{item.category}</p>
                            </div>
                        </div>
                        <AnimatePresence>
                            {(item.status === 'Critical' || item.status === 'Low') && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <Badge
                                        variant="destructive"
                                        className="animate-pulse bg-red-100 text-red-600 border-red-200 py-1 px-3 rounded-full flex gap-1 items-center"
                                    >
                                        <AlertCircle className="w-3 h-3" />
                                        Reorder Suggested
                                    </Badge>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-3xl font-bold text-slate-900 leading-none">
                                    <motion.span
                                        key={item.stock}
                                        initial={{ scale: 1.5, color: '#4F46E5' }}
                                        animate={{ scale: 1, color: '#0F172A' }}
                                    >
                                        {item.stock}
                                    </motion.span>
                                    <span className="text-sm font-medium text-slate-400 ml-1">units left</span>
                                </p>
                                <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                                    <Package className="w-3 h-3" />
                                    Est. {item.daysRemaining} days remaining
                                </p>
                            </div>
                            <div className="text-right">
                                <Badge variant="outline" className="border-slate-200 text-slate-600 font-semibold">
                                    {item.usage} Usage
                                </Badge>
                            </div>
                        </div>

                        <div className="relative pt-2">
                            <Progress value={getProgressValue(item)} className={`h-2.5 ${getStatusColor(item.status)} bg-slate-100 transition-all duration-1000`} />
                        </div>

                        <AnimatePresence>
                            {(item.status === 'Critical' || item.status === 'Low') && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic"
                                >
                                    "Sales for this item have increased recently. AI estimates current stock will only last {item.daysRemaining} days."
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <Button
                            className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${item.status === 'Critical' || item.status === 'Low'
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-1 text-white'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            disabled={loading || (item.status !== 'Critical' && item.status !== 'Low')}
                            onClick={handleOrder}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Placing Order...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Place Smart Order
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
