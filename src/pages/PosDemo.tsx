import React, { useState, useCallback } from 'react';
import { PosSimulatorPanel } from "@/components/pos-demo/PosSimulatorPanel";
import { AutoSyncVisualizer } from "@/components/pos-demo/AutoSyncVisualizer";
import { RushHourWidget } from "@/components/pos-demo/RushHourWidget";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Seeded Data
const DEMO_BILLS = {
    grocery: [
        { product: "Surf Excel", qty: 2, price: 10 },
        { product: "Sugar Packet", qty: 1, price: 10 }
    ],
    pharmacy: [
        { product: "Paracetamol", qty: 3, price: 10 },
        { product: "Cough Syrup", qty: 1, price: 10 }
    ],
    stationery: [
        { product: "Classmate Notebook", qty: 5, price: 10 },
        { product: "Pen Pack", qty: 2, price: 10 }
    ]
};

const PosDemo = () => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
    const [syncCount, setSyncCount] = useState(0);

    // Core Logic: Generate Bill -> Simulate Network -> Sync
    const handleGenerateBill = useCallback((type: 'grocery' | 'pharmacy' | 'stationery') => {
        // 1. Immediate Feedback: Bill Created locally
        const billData = DEMO_BILLS[type];
        const total = billData.reduce((acc, item) => acc + (item.price * item.qty), 0);

        toast.info(`Bill Generated: ₹${total}`, {
            description: `${billData.length} items added to local POS queue`,
            icon: '🧾'
        });

        // 2. Trigger Sync Animation
        setIsSyncing(true);

        // 3. Simulate Network Delay (1.5s) -> Sync to Cloud
        setTimeout(() => {
            setIsSyncing(false);
            setLastSyncTime(Date.now());
            setSyncCount(prev => prev + 1);

            toast.success("Sync Complete", {
                description: "Sales & Inventory updated in NexVyapaar Cloud",
                icon: '☁️'
            });
        }, 1500);

    }, []);

    // Randomizer for Rush Hour
    const handleRushAction = useCallback(() => {
        const types: ('grocery' | 'pharmacy' | 'stationery')[] = ['grocery', 'pharmacy', 'stationery'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        handleGenerateBill(randomType);
    }, [handleGenerateBill]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                        Point of Sale (POS) Integration
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-2xl text-lg">
                        Experience our "Hybrid Sync" technology. See how NexVyapaar connects with existing POS infrastructure to handle rush hours without data loss.
                    </p>
                </div>
                <div className="hidden md:block">
                    <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold text-sm border border-yellow-200">
                        DEMO MODE ACTIVE
                    </div>
                </div>
            </div>

            {/* Main Stage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">

                {/* Left: Input Panel (Simulator) */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-4 h-full"
                >
                    <PosSimulatorPanel onGenerateBill={handleGenerateBill} />
                </motion.div>

                {/* Center: Visualizer */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-8 h-full"
                >
                    <AutoSyncVisualizer
                        lastSyncTime={lastSyncTime}
                        isSyncing={isSyncing}
                        syncCount={syncCount}
                    />
                </motion.div>
            </div>

            {/* Bottom: Rush Hour Control */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <RushHourWidget onTriggerRushAction={handleRushAction} />
            </motion.div>

            {/* educational footer */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Why this matters?</h3>
                        <p className="text-slate-300 max-w-xl">
                            "This POS demo shows that NexVyapaar never forces extra work. In peak hours real shops already use digital billing apps. Our system simply listens to those POS bills and updates everything automatically."
                        </p>
                    </div>
                    {/* Placeholder for small chart or visual if needed */}
                </div>
            </div>

        </div>
    );
};

export default PosDemo;
