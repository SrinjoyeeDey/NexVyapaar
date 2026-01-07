import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Pill, PenTool, Plus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PosSimulatorPanelProps {
    onGenerateBill: (type: 'grocery' | 'pharmacy' | 'stationery') => void;
}

export const PosSimulatorPanel: React.FC<PosSimulatorPanelProps> = ({ onGenerateBill }) => {

    // Seeded data logic is handled by the parent or context, but visually triggered here
    const handleAddBill = (type: 'grocery' | 'pharmacy' | 'stationery') => {
        onGenerateBill(type);
        // Visual feedback logic is handled by the onGenerateBill callback usually, 
        // but we can add immediate button feedback here if needed.
    };

    return (
        <Card className="h-full border-slate-200 shadow-sm bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 mb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Demo POS Machine
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-slate-500 mb-2">Select a transaction type to simulate a bill generation:</p>

                <div className="grid grid-cols-1 gap-3">
                    <SimulatorButton
                        icon={ShoppingBag}
                        label="Add Grocery Bill"
                        subtext="Salt, Sugar, Atta"
                        color="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                        onClick={() => handleAddBill('grocery')}
                    />

                    <SimulatorButton
                        icon={Pill}
                        label="Add Pharmacy Bill"
                        subtext="Paracetamol, Syllabus"
                        color="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                        onClick={() => handleAddBill('pharmacy')}
                    />

                    <SimulatorButton
                        icon={PenTool}
                        label="Add Stationery Bill"
                        subtext="Notebooks, Pens"
                        color="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                        onClick={() => handleAddBill('stationery')}
                    />
                </div>

                <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-500">
                    <p className="font-semibold mb-1">Terminal Status:</p>
                    <div className="flex justify-between font-mono">
                        <span>ID: POS-001</span>
                        <span className="text-green-600">ONLINE</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const SimulatorButton: React.FC<{
    icon: any,
    label: string,
    subtext: string,
    color: string,
    onClick: () => void
}> = ({ icon: Icon, label, subtext, color, onClick }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${color}`}
        >
            <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="font-bold">{label}</div>
                    <div className="text-xs opacity-70">{subtext}</div>
                </div>
            </div>
            <Plus className="w-5 h-5 opacity-50 group-hover:opacity-100" />
        </motion.button>
    );
}
