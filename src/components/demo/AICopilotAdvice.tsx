import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, BrainCircuit, Lightbulb, ArrowRight, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const DECISION_INSIGHTS = [
    {
        id: 'restock',
        question: "What should I restock?",
        answer: "Stock up on Ashirvaad Flour (5kg). Current velocity is 4.2x higher than last week due to local festive season. 3 units left.",
        action: "Order Now",
        icon: <Zap className="w-5 h-5 text-indigo-600" />,
        color: "indigo"
    },
    {
        id: 'expire',
        question: "What will expire soon?",
        answer: "12 units of Harvest Bread Batch #B2 expire in 48 hours. Suggesting a 'Bundle with Milk' offer to clear stock today.",
        action: "Launch Offer",
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        color: "amber"
    },
    {
        id: 'growth',
        question: "How can I grow sales?",
        answer: "Customers who buy 'Tea Powder' also frequent the 'Biscuits' section. Move them closer to increase basket size by 15%.",
        action: "View Heatmap",
        icon: <TrendingUp className="w-5 h-5 text-green-600" />,
        color: "green"
    }
];

export const AICopilotAdvice: React.FC = () => {
    const { toast } = useToast();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % DECISION_INSIGHTS.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const current = DECISION_INSIGHTS[currentIndex];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
        >
            <Card className="bg-white text-slate-900 border-none shadow-xl relative overflow-hidden h-full">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-30" />
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-30" />

                <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-lg shadow-indigo-100">
                            <BrainCircuit className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold tracking-tight text-slate-900">Decision Intelligence</h3>
                            <p className="text-indigo-600 text-[10px] font-bold uppercase tracking-[0.2em]">Operating System Active</p>
                        </div>
                    </div>

                    <div className="min-h-[160px] relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className={`flex gap-4 p-5 bg-${current.color}-50/50 rounded-2xl border border-${current.color}-100`}>
                                    <div className={`w-10 h-10 rounded-full bg-${current.color}-100 flex items-center justify-center shrink-0`}>
                                        {current.icon}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-${current.color}-900 text-sm mb-1`}>{current.question}</h4>
                                        <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                            "{current.answer}"
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    className={`w-full bg-${current.color === 'indigo' ? 'indigo' : current.color === 'amber' ? 'orange' : 'green'}-600 hover:opacity-90 text-white font-bold h-12 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2`}
                                    onClick={() => toast({ title: "AI Action Triggered", description: `Executing: ${current.action}` })}
                                >
                                    {current.action}
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <p className="mt-8 text-[10px] text-slate-400 text-center font-bold tracking-widest uppercase opacity-60">Real-time Decision Flow</p>
                </CardContent>
            </Card>
        </motion.div>
    );
};
