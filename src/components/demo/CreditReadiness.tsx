import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Landmark, TrendingUp, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export const CreditReadiness: React.FC = () => {
    const { toast } = useToast();

    return (
        <Card className="bg-white border-none shadow-xl border-t-4 border-t-indigo-500 overflow-hidden">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 mb-2 font-semibold px-3">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            CREDIT READY
                        </Badge>
                        <h3 className="text-2xl font-bold text-slate-900">Capital Readiness</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                        <Landmark className="w-6 h-6 text-indigo-600" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Business Health Score</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold text-slate-900">78</span>
                                    <span className="text-slate-400 font-semibold">/100</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold px-2">Elite Tier</Badge>
                            </div>
                        </div>
                        <Progress value={78} className="h-3 bg-slate-100" />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm h-fit">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            </div>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                "Your score is high due to stable daily sales & 85% digital payment adoption. You are eligible for low-interest business loans."
                            </p>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-slate-900 hover:bg-black text-white font-semibold h-12 rounded-xl transition-all hover:scale-[1.02]"
                        onClick={() => toast({ title: "Connecting Partners", description: "Fetching available business loan offers..." })}
                    >
                        Explore Financing Options
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
