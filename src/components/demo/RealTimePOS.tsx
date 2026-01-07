import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Smartphone, ArrowUpRight } from "lucide-react";
import { useSimulatedStore } from "@/hooks/useSimulatedStore";

export const RealTimePOS: React.FC = () => {
    const { inventory, updateStock } = useSimulatedStore();
    const [sales, setSales] = useState(3420);
    const [data, setData] = useState([
        { val: 400 }, { val: 600 }, { val: 550 }, { val: 900 }, { val: 700 }, { val: 850 }
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            const increment = Math.floor(Math.random() * 50) + 10;
            setSales(prev => prev + increment);
            setData(prev => [...prev.slice(1), { val: 600 + Math.random() * 400 }]);

            // Integration: Randomly reduce stock of a visible item
            if (inventory.length > 0) {
                const randomItem = inventory[Math.floor(Math.random() * inventory.length)];
                if (randomItem.stock > 0) {
                    updateStock(randomItem.id, randomItem.stock - 1);
                }
            }
        }, 8000);
        return () => clearInterval(interval);
    }, [inventory, updateStock]);

    return (
        <Card className="bg-white text-slate-900 border-none shadow-xl overflow-hidden group">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] font-semibold">UPI LIVE</Badge>
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] font-semibold">POS LINKED</Badge>
                        </div>
                        <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-widest">Today's Live Sales</h3>
                    </div>
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <Smartphone className="w-5 h-5 text-indigo-600" />
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold tabular-nums">₹{sales.toLocaleString()}</span>
                        <motion.span
                            key={sales}
                            initial={{ opacity: 1, y: 0 }}
                            animate={{ opacity: 0, y: -20 }}
                            className="text-green-600 text-sm font-semibold"
                        >
                            +₹{sales % 100}
                        </motion.span>
                    </div>
                    <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-indigo-600" />
                            <span className="text-xs text-slate-500 font-medium">UPI: 63%</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-xs text-slate-500 font-medium">Cash: 37%</span>
                        </div>
                    </div>
                </div>

                <div className="h-20 w-full mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Line
                                type="monotone"
                                dataKey="val"
                                stroke="#4f46e5"
                                strokeWidth={4}
                                dot={false}
                                isAnimationActive={true}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-400 text-center font-semibold tracking-tighter opacity-70 uppercase">Syncing with Bharat QR & POS Terminals</p>
            </CardContent>
        </Card>
    );
};
