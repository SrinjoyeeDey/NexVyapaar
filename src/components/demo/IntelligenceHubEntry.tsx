import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, BrainCircuit, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const IntelligenceHubEntry: React.FC = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="group relative"
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <Card className="relative bg-white border-none shadow-xl rounded-[2rem] overflow-hidden">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-6 items-start">
                            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                                <BrainCircuit className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Intelligence Hub</h3>
                                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-semibold px-3 py-1">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        AI POWERED
                                    </Badge>
                                </div>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl">
                                    Analyze real-time POS sync, evaluate credit readiness, and join community group buying to optimize your business margins.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 min-w-[200px]">
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth Forecast</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-semibold text-slate-900">+12.5%</span>
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                            </div>
                            <Button
                                onClick={() => navigate('/intelligence-hub')}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                            >
                                Access Intelligence Hub
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
