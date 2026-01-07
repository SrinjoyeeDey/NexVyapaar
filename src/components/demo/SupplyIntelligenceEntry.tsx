import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Boxes, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const SupplyIntelligenceEntry: React.FC = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
        >
            <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-xl relative overflow-hidden group cursor-pointer" onClick={() => navigate('/supply-intelligence')}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-500" />

                <CardContent className="p-6 relative">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Boxes className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black">Supply Intelligence</h3>
                            <p className="text-sm text-indigo-100 font-medium">Auto-pilot for your inventory</p>
                        </div>
                    </div>

                    <p className="text-sm text-indigo-50 text-slate-100/80 mb-6 italic">
                        "Your stock levels are being monitored by NexVyapaar AI. Click to view smart reordering options."
                    </p>

                    <Button
                        className="w-full bg-white text-indigo-700 hover:bg-slate-100 font-bold rounded-xl h-12 flex items-center justify-center gap-2"
                    >
                        Launch Supply Center
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};
