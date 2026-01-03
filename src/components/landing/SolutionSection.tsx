import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    Camera,
    FileText,
    Sparkles,
    CheckCircle2,
    BarChart3,
    Package,
    Lightbulb,
    Target
} from 'lucide-react';

const SolutionSection = () => {
    const [phase, setPhase] = useState(1);

    useEffect(() => {
        const timer = setInterval(() => {
            setPhase((prev) => (prev % 4) + 1);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const resultBubbles = [
        { id: 1, icon: BarChart3, title: 'Sales Updated', value: '₹1,250', pos: 'top-[-50px] left-1/2 -ml-24' },
        { id: 2, icon: Package, title: 'Inventory Synced', value: '15 items', pos: 'right-[-80px] top-1/2 -mt-16' },
        { id: 3, icon: Lightbulb, title: 'Insights Generated', value: '3 new ready', pos: 'bottom-[-50px] left-1/2 -ml-24' },
        { id: 4, icon: Target, title: 'Actions Suggested', value: 'Restock milk', pos: 'left-[-80px] top-1/2 -mt-16' },
    ];

    return (
        <section className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white py-32 flex flex-col items-center">
            <div className="container mx-auto px-4 text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-7xl font-bold text-slate-900 mb-6"
                >
                    Meet NexVyapaar
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl text-slate-600 max-w-2xl mx-auto"
                >
                    One app. Complete transformation. Zero complexity.
                </motion.p>
            </div>

            {/* Main Visual Animation Area */}
            <div className="relative w-full max-w-5xl h-[600px] flex items-center justify-center">

                {/* Phase 1: Inputs */}
                <AnimatePresence mode='wait'>
                    {phase === 1 && (
                        <motion.div
                            key="phase1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex gap-12"
                        >
                            {[
                                { icon: Mic, label: 'Voice Input', color: 'bg-blue-500' },
                                { icon: Camera, label: 'Visual Scan', color: 'bg-purple-500' },
                                { icon: FileText, label: 'Photo Upload', color: 'bg-indigo-500' }
                            ].map((input, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    transition={{ delay: i * 0.2, type: 'spring' }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <div className={`w-24 h-24 rounded-3xl ${input.color} flex items-center justify-center text-white shadow-xl shadow-indigo-200`}>
                                        <input.icon size={40} />
                                    </div>
                                    <span className="font-semibold text-slate-600">{input.label}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Phase 2: AI Processing */}
                    {phase === 2 && (
                        <motion.div
                            key="phase2"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative w-64 h-64 flex items-center justify-center"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                className="absolute inset-0 border-4 border-dashed border-indigo-400 rounded-full"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl"
                            />
                            <div className="flex flex-col items-center gap-2">
                                <Sparkles className="text-indigo-600" size={48} />
                                <span className="font-bold text-slate-900">AI Understanding...</span>
                                <motion.div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '100%' }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                        className="w-full h-full bg-indigo-600"
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* Phase 3 & 4: Results and Connections */}
                    {(phase === 3 || phase === 4) && (
                        <motion.div
                            key="phase3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative w-64 h-64 flex items-center justify-center"
                        >
                            {/* Central Core */}
                            <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-2xl relative z-10">
                                <Sparkles size={32} />
                            </div>

                            {/* Expansion Lines (Phase 4 only) */}
                            {phase === 4 && (
                                <div className="absolute inset-[-100px] flex items-center justify-center pointer-events-none">
                                    {[...Array(4)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.2 }}
                                            className="absolute w-full h-[1px] bg-indigo-600"
                                            style={{ rotate: i * 45 }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Result Bubbles */}
                            {resultBubbles.map((bubble, idx) => (
                                <motion.div
                                    key={bubble.id}
                                    initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        // Phase 4 adds subtle drift
                                        y: phase === 4 ? [0, -5, 0] : 0
                                    }}
                                    transition={{
                                        delay: idx * 0.15,
                                        type: 'spring',
                                        y: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: idx * 0.5 }
                                    }}
                                    className={`absolute ${bubble.pos} w-48 bg-white border border-slate-100 rounded-2xl p-4 shadow-xl flex items-center gap-3 z-20`}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <bubble.icon size={20} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{bubble.title}</div>
                                        <div className="text-sm font-bold text-slate-900">{bubble.value}</div>
                                    </div>
                                    <CheckCircle2 className="text-green-500" size={16} />
                                </motion.div>
                            ))}

                            {/* Final Text (Phase 4 only) */}
                            {phase === 4 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-[-140px] w-full text-center"
                                >
                                    <p className="text-xl font-bold text-indigo-600">Your business, always up to date</p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Comparison Text */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-20 flex items-center gap-12 px-12 py-6 bg-slate-900 rounded-3xl text-white shadow-2xl"
            >
                <div className="text-slate-400 text-lg">Old Way: <span className="text-red-400 font-bold line-through">2-3 hours daily</span></div>
                <div className="text-indigo-400">→</div>
                <div className="text-white text-3xl font-black">NexVyapaar: <span className="text-green-400">2-3 minutes</span></div>
            </motion.div>
        </section>
    );
};

export default SolutionSection;
