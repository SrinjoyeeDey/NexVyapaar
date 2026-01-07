import React, { useEffect, useState } from 'react';
import { useSimulatedStore } from "@/hooks/useSimulatedStore";
import { InventoryCard } from "@/components/demo/InventoryCard";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const SupplyIntelligence: React.FC = () => {
    const { inventory, placeOrder } = useSimulatedStore();
    const navigate = useNavigate();
    const [lastAudit, setLastAudit] = useState(new Date());
    const [isAuditing, setIsAuditing] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAuditing(true);
            setTimeout(() => {
                setLastAudit(new Date());
                setIsAuditing(false);
            }, 1500);
        }, 10000); // Audit every 10 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Premium Header - Light Theme */}
            <div className="bg-gradient-to-br from-white via-slate-50 to-indigo-50/50 text-slate-900 pb-20 pt-10 px-6 rounded-b-[3rem] shadow-sm border-b border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                    <div className="absolute top-10 left-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-60 h-60 bg-blue-100 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto relative">
                    <Button
                        variant="ghost"
                        className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 mb-6 -ml-2"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Overview
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black tracking-tight text-slate-900">Supply Intelligence</h1>
                                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-3 py-1">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse" />
                                    Real-time AI Audit
                                </Badge>
                            </div>
                            <p className="text-slate-600 text-lg font-medium max-w-xl">
                                AI-powered stock monitoring and automated reordering system for your business.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-4 shadow-sm">
                            <div className={`p-3 rounded-xl ${isAuditing ? 'bg-indigo-600 text-white animate-spin' : 'bg-slate-100 text-indigo-600'}`}>
                                <RefreshCcw className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Latest Intelligence Scan</p>
                                <p className="text-xl font-mono font-bold text-slate-900">
                                    {lastAudit.toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Grid */}
            <div className="max-w-7xl mx-auto px-6 -mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inventory.map((item) => (
                        <InventoryCard
                            key={item.id}
                            item={item}
                            onPlaceOrder={placeOrder}
                        />
                    ))}
                </div>
            </div>

            {/* Demo Footer */}
            <div className="fixed bottom-6 right-6 z-50">
                <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-2xl rounded-full px-4 py-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-600">Demo Mode — Real logic, simulated actions</span>
                </div>
            </div>
        </div>
    );
};

export default SupplyIntelligence;
