import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Camera,
    ArrowLeft,
    FileSearch,
    CheckCircle2,
    Scan,
    RefreshCcw,
    Plus,
    ArrowRight,
    Database,
    Smartphone
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// Seeded Handwritten Khata Image URLs (Mocking with placeholders that look like paper)
const SEEDED_RECORDS = [
    {
        id: 1,
        title: "Monday Ledger - 05 Jan",
        thumbnail: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=200",
        status: "Processed",
        date: "2026-01-05",
        items: [
            { name: "Sugar 5kg", qty: 2, price: 100 },
            { name: "Tea 250g", qty: 4, price: 240 }
        ],
        total: 340
    },
    {
        id: 2,
        title: "Supplier Receipt #402",
        thumbnail: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200",
        status: "Processed",
        date: "2026-01-04",
        items: [
            { name: "Flour (Bulk)", qty: 10, price: 5000 }
        ],
        total: 5000
    }
];

const ScanRecords: React.FC = () => {
    const navigate = useNavigate();
    const [isScanning, setIsScanning] = useState(false);
    const [scanStep, setScanStep] = useState(0); // 0: Idle, 1: Scanning, 2: Mapping, 3: Syncing
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    const startDemoScan = () => {
        setIsScanning(true);
        setScanStep(1);

        // Simulate OCR Flow
        setTimeout(() => setScanStep(2), 2000); // Visual mapping
        setTimeout(() => setScanStep(3), 4000); // DB sync

        setTimeout(() => {
            setIsScanning(false);
            setScanStep(0);
            toast.success("AI Logic synced handwritten khata to Digital Inventory! 🧠⚡", {
                description: "Added 3 entries to Monday's sales.",
                duration: 5000
            });
        }, 6000);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* Animated Header */}
            <div className="bg-white border-b border-slate-100 pb-16 pt-10 px-6 rounded-b-[3rem] shadow-sm relative overflow-hidden">
                <div className="max-w-5xl mx-auto relative">
                    <Button
                        variant="ghost"
                        className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 mb-6 -ml-2 font-semibold"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Command Center
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100 rotate-3">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Scan Records</h1>
                                    <p className="text-indigo-600 font-bold tracking-[0.1em] uppercase text-[10px] mt-0.5">Vision AI Intelligence</p>
                                </div>
                            </div>
                            <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xl">
                                NexVyapaar AI reads your handwritten khatas, bills, and ledgers. Simply point, scan, and let the software learn your business.
                            </p>
                        </div>

                        <Button
                            onClick={startDemoScan}
                            disabled={isScanning}
                            className="h-20 px-8 rounded-[2.5rem] bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-100 group transition-all"
                        >
                            {isScanning ? (
                                <div className="flex items-center gap-4">
                                    <RefreshCcw className="w-7 h-7 animate-spin" />
                                    <span className="text-xl font-black">AI Processing...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/20 p-2 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <span className="text-xl font-black">New Vision Scan</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Seeded Gallery */}
                <div className="lg:col-span-7 space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Recent Vision Captures</h3>
                    {SEEDED_RECORDS.map((record) => (
                        <motion.div
                            key={record.id}
                            whileHover={{ scale: 1.02, x: 5 }}
                            onClick={() => setSelectedRecord(record)}
                            className="cursor-pointer group"
                        >
                            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden hover:shadow-xl transition-all">
                                <CardContent className="p-0 flex h-32">
                                    <div className="w-32 h-full relative">
                                        <img src={record.thumbnail} alt={record.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        <div className="absolute inset-0 bg-indigo-600/10 mix-blend-multiply" />
                                    </div>
                                    <div className="flex-1 p-5 flex flex-col justify-center">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-slate-900">{record.title}</h4>
                                            <Badge className="bg-green-50 text-green-700 border-none px-2 py-0.5 text-[10px] font-bold">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Processed
                                            </Badge>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 border border-slate-100">
                                                <Database className="w-3 h-3 text-slate-400" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">{record.items.length} Items</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-50 border border-slate-100">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Val: ₹{record.total}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-12 flex items-center justify-center bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Right Column: AI Viewport / Active Scan */}
                <div className="lg:col-span-5">
                    <AnimatePresence mode="wait">
                        {isScanning ? (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="sticky top-24"
                            >
                                <Card className="border-none shadow-2xl bg-slate-900 aspect-[3/4] rounded-[2.5rem] overflow-hidden relative">
                                    {/* Realistic Camera Viewportal */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-900" />

                                    {/* Animated Scanning Bar */}
                                    <motion.div
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-1 bg-indigo-500 shadow-[0_0_20px_#6366f1] z-20"
                                    />

                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-6 text-center">
                                        {scanStep === 1 && (
                                            <>
                                                <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                                                <h3 className="text-xl font-bold text-white">Reading Handwritten Text...</h3>
                                                <p className="text-slate-400 text-sm">NexVyapaar OCR Engine extracting patterns</p>
                                            </>
                                        )}
                                        {scanStep === 2 && (
                                            <>
                                                <FileSearch className="w-20 h-20 text-indigo-400 animate-pulse" />
                                                <h3 className="text-xl font-bold text-white">Mapping to Inventory</h3>
                                                <div className="space-y-2 w-full max-w-[200px]">
                                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1 }} className="h-full bg-indigo-500" />
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-mono">ID_ITEM_MAP_SUGAR {"->"} SKU_042</p>
                                                </div>
                                            </>
                                        )}
                                        {scanStep === 3 && (
                                            <>
                                                <Smartphone className="w-20 h-20 text-green-400" />
                                                <h3 className="text-xl font-bold text-white">Syncing Business Data</h3>
                                                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">ENCRYPTED UPLOAD</Badge>
                                            </>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="sticky top-24"
                            >
                                <div className="bg-indigo-50/50 border-2 border-dashed border-indigo-100 rounded-[2.5rem] aspect-[3/4] flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:bg-indigo-50 transition-all" onClick={startDemoScan}>
                                    <div className="p-6 bg-white rounded-3xl shadow-xl shadow-indigo-100 mb-6 group-hover:scale-110 transition-transform">
                                        <Scan className="w-12 h-12 text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Live Vision View</h3>
                                    <p className="text-slate-500 text-sm font-medium">Capture a new image to see AI digitize your business records in real-time.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>

            {/* Floating Action Tip */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl"
                >
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">NexVyapaar Vision AI is active • Global Sync Enabled</span>
                </motion.div>
            </div>
        </div>
    );
};

export default ScanRecords;
