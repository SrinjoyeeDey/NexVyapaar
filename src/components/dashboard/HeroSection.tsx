import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fadeInUp } from "@/utils/animations";
import { Button } from "@/components/ui/button";
import { Scan, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { KhataScanner } from "@/components/KhataScanner";
import { KhataItem } from "@/services/VisionService";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function HeroSection() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Mock quick stats data
    const quickStats = [
        {
            period: "TODAY",
            revenue: "₹2,450",
            orders: 12,
            trend: "+8%",
            isPositive: true,
        },
        {
            period: "THIS WEEK",
            revenue: "₹18,500",
            orders: 87,
            trend: "+15%",
            isPositive: true,
        },
        {
            period: "THIS MONTH",
            revenue: "₹75,200",
            orders: 342,
            trend: "+12%",
            isPositive: true,
        },
    ];

    const queryClient = useQueryClient();

    const handleKhataData = async (items: KhataItem[]) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let processedCount = 0;
        for (const item of items) {
            if (item.type === 'sale') {
                await supabase.from('sales_data').insert({
                    user_id: user.id,
                    product_name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    sale_date: item.date,
                    category: 'Hero Scan'
                });
            } else {
                const { data: existing } = await supabase
                    .from('raw_materials')
                    .select('id, current_stock')
                    .eq('user_id', user.id)
                    .eq('name', item.name)
                    .maybeSingle();

                if (existing) {
                    await supabase
                        .from('raw_materials')
                        .update({
                            current_stock: (existing.current_stock || 0) + item.quantity,
                            cost_per_unit: item.price
                        })
                        .eq('id', existing.id);
                } else {
                    await supabase.from('raw_materials').insert({
                        user_id: user.id,
                        name: item.name,
                        current_stock: item.quantity,
                        unit: item.unit,
                        cost_per_unit: item.price,
                        category: 'Hero Scan'
                    });
                }
            }
            processedCount++;
        }
        queryClient.invalidateQueries();
        toast.success(`Hero Scan: ${processedCount} items synced!`);
    };

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-gradient-to-r from-indigo-50/50 to-transparent rounded-3xl p-8 md:p-12 mb-8"
        >
            {/* Top Row */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
                {/* Welcome Message */}
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                        Welcome back, Rajesh!
                        <motion.span
                            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatDelay: 3,
                                ease: "easeInOut"
                            }}
                            className="inline-block origin-[70%_70%]"
                        >
                            👋
                        </motion.span>
                    </h1>
                    <p className="text-lg text-slate-600">
                        Here's your business pulse for today
                    </p>
                    <div className="mt-4 flex gap-3">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-indigo-200 rounded-full px-6 py-6 h-auto font-bold text-lg">
                                    <Scan className="h-6 w-6 mr-3" />
                                    Quick Scan Khata
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
                                <KhataScanner
                                    context="general"
                                    onDataExtracted={handleKhataData}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Date/Time */}
                <div className="mt-4 md:mt-0 text-right">
                    <div className="text-sm text-slate-500">{formatDate(currentTime)}</div>
                    <div className="text-3xl font-bold text-slate-900 tabular-nums">
                        {formatTime(currentTime)}
                    </div>
                </div>
            </div>

            {/* Bottom Row - Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickStats.map((stat, index) => (
                    <motion.div
                        key={stat.period}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ y: -2 }}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                            {stat.period}
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1 tabular-nums">
                            {stat.revenue}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">{stat.orders} orders</span>
                            <span className={`
                text-sm font-semibold
                ${stat.isPositive ? "text-green-600" : "text-red-600"}
              `}>
                                {stat.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
