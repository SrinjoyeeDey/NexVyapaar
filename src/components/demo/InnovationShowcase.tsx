import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Camera, BrainCircuit, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const INNOVATIONS = [
    {
        title: "AI Adapts to You",
        description: "Voice & Camera input for handwritten khatas.",
        icon: <Mic className="w-5 h-5 text-indigo-600" />,
        badge: "Voice Enabled"
    },
    {
        title: "Decision Intelligence",
        description: "Proactive restock & expiry management.",
        icon: <BrainCircuit className="w-5 h-5 text-purple-600" />,
        badge: "AI Predictive"
    },
    {
        title: "End-to-End Sync",
        description: "One entry updates Sales & Inventory.",
        icon: <Zap className="w-5 h-5 text-amber-600" />,
        badge: "Integrated"
    }
];

export const InnovationShowcase: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {INNOVATIONS.map((item, idx) => (
                <motion.div
                    key={item.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <Card className="bg-white border-2 border-slate-50 hover:border-indigo-100 transition-all shadow-sm h-full overflow-hidden group">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                                    <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                        {item.badge}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                                    {item.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
};
