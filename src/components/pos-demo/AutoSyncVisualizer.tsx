import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Smartphone, ArrowRight, CheckCircle2, Server, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AutoSyncVisualizerProps {
    lastSyncTime: number | null;
    isSyncing: boolean;
    syncCount: number;
}

export const AutoSyncVisualizer: React.FC<AutoSyncVisualizerProps> = ({ lastSyncTime, isSyncing, syncCount }) => {

    return (
        <Card className="h-full border-slate-200 shadow-sm overflow-hidden bg-gradient-to-br from-indigo-50 to-white">
            <CardHeader className="border-b border-indigo-100/50">
                <CardTitle className="text-indigo-900 flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-indigo-500" />
                    Real-time Auto-Sync
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative h-[300px] flex items-center justify-center">

                {/* Background Grid Animation */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

                {/* Flow Container */}
                <div className="relative z-10 flex items-center gap-8 md:gap-16 w-full max-w-lg px-8">

                    {/* Source: POS */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-100 relative z-20">
                            <Smartphone className="w-10 h-10 text-slate-600" />
                            {/* Pulse effect when triggering */}
                            {isSyncing && (
                                <span className="absolute -inset-2 rounded-3xl bg-indigo-400/20 animate-ping" />
                            )}
                        </div>
                        <span className="font-semibold text-slate-600 text-sm">POS / Handheld</span>
                    </div>

                    {/* Path & Animation */}
                    <div className="flex-1 h-2 bg-indigo-100 rounded-full relative overflow-visible">
                        {/* Animated traveling packets */}
                        <AnimatePresence>
                            {isSyncing && (
                                <motion.div
                                    initial={{ left: "0%", opacity: 0, scale: 0.5 }}
                                    animate={{ left: "100%", opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50 z-30"
                                >
                                    <div className="absolute inset-0 bg-white opacity-50 rounded-full animate-ping" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Static connection line dots */}
                        <div className="absolute inset-0 flex items-center justify-between px-2">
                            <div className="w-1 h-1 bg-indigo-300 rounded-full" />
                            <div className="w-1 h-1 bg-indigo-300 rounded-full" />
                            <div className="w-1 h-1 bg-indigo-300 rounded-full" />
                        </div>
                    </div>

                    {/* Destination: NexVyapaar Cloud */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center text-white relative z-20">
                            <Database className="w-10 h-10" />
                            {syncCount > 0 && (
                                <motion.div
                                    key={syncCount}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1.2, opacity: 1 }}
                                    exit={{ scale: 0 }}
                                    className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white"
                                >
                                    {syncCount}
                                </motion.div>
                            )}
                        </div>
                        <div className="text-center">
                            <span className="font-bold text-indigo-900 text-sm block">NexVyapaar Cloud</span>
                            {lastSyncTime && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                    Last: {new Date(lastSyncTime).toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>

                </div>

                {/* Status Overlay */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <AnimatePresence mode="wait">
                        {isSyncing ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold"
                            >
                                <ArrowRight className="w-3 h-3 animate-pulse" />
                                Syncing Invoice Data...
                            </motion.div>
                        ) : lastSyncTime ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold"
                            >
                                <CheckCircle2 className="w-3 h-3" />
                                All Systems Synced
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>

            </CardContent>
        </Card>
    );
};
