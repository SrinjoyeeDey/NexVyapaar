import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowRight, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const MarketplaceEntry: React.FC = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="group relative"
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-amber-500 rounded-[2rem] blur opacity-10 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <Card className="relative bg-white border-none shadow-xl rounded-[2rem] overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-6 items-start">
                            <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-100 shrink-0">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Marketplace</h3>
                                    <Badge className="bg-orange-50 text-orange-700 border-orange-100 font-bold text-[10px] px-3 py-1">
                                        COMMUNITY ACTIVE
                                    </Badge>
                                </div>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl">
                                    Discover nearby business partners, join collective buying groups, and unlock ecosystem-wide discounts for your shop.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 min-w-[200px]">
                            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Groups</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-semibold text-slate-900">14 Shops</span>
                                </div>
                            </div>
                            <Button
                                onClick={() => navigate('/marketplace')}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold h-12 rounded-2xl transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
                            >
                                Explore Marketplace
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
