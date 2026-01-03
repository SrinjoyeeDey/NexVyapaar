import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

const ProblemSection = () => {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.3 });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        }
    }, [isInView, controls]);

    const painPoints = [
        {
            emoji: '📝',
            title: 'Drowning in Paperwork',
            text: 'Hours spent updating khata books, losing receipts, tracking inventory manually.'
        },
        {
            emoji: '⏰',
            title: 'No Time to Grow',
            text: 'So busy with daily tasks that planning and expansion feel impossible.'
        },
        {
            emoji: '😓',
            title: 'Missing Opportunities',
            text: 'Products expire before you notice. Best-sellers run out. Revenue lost.'
        },
        {
            emoji: '🤷',
            title: 'Decisions by Guesswork',
            text: 'What to stock? When to reorder? Which products sell best? All guessing.'
        }
    ];

    const variants = {
        hidden: { opacity: 0, x: -50 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: 0.2 + i * 0.15,
                duration: 0.8,
                ease: "easeOut" as const
            }
        })
    };

    return (
        <section
            id="problem-section"
            ref={containerRef}
            className="min-h-screen w-full bg-white py-32 flex items-center overflow-hidden"
        >
            <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">

                {/* Left Side - Text Content */}
                <div className="w-full lg:w-[40%] text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-6"
                    >
                        The Reality for Most Businesses
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-6xl font-bold leading-tight text-slate-900 mb-12"
                    >
                        Your Day Shouldn't<br />
                        Look Like This...
                    </motion.h2>

                    <div className="space-y-8">
                        {painPoints.map((point, idx) => (
                            <motion.div
                                key={idx}
                                custom={idx}
                                initial="hidden"
                                animate={controls}
                                variants={variants}
                                className="flex items-start gap-6 group"
                            >
                                <span className="text-5xl">{point.emoji}</span>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                                        {point.title}
                                    </h3>
                                    <p className="text-lg text-slate-600 leading-relaxed">
                                        {point.text}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="mt-12 text-indigo-600 font-semibold text-xl"
                    >
                        There's a smarter way...
                    </motion.div>
                </div>

                {/* Right Side - Animated Visual Narrative */}
                <div className="w-full lg:w-[60%] relative h-[600px] flex items-center justify-center">
                    <div className="relative w-full max-w-2xl aspect-square">
                        {/* Chaotic Elements Background */}
                        <div className="absolute inset-0 bg-slate-50/50 rounded-3xl -z-10 overflow-hidden">
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                        </div>

                        {/* Main Visual Elements */}
                        <div className="absolute inset-0 flex items-center justify-center">

                            {/* Desk / Base */}
                            <motion.div
                                animate={isInView ? { scale: [0.9, 1] } : {}}
                                className="w-[80%] h-[40%] bg-slate-100 rounded-xl shadow-inner transform -skew-x-12 rotate-[-5deg]"
                            />

                            {/* Scattered Papers Visual */}
                            {[...Array(8)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
                                    animate={isInView ? {
                                        opacity: 1,
                                        x: (Math.random() - 0.5) * 300,
                                        y: (Math.random() - 0.5) * 200,
                                        rotate: (Math.random() - 0.5) * 90
                                    } : {}}
                                    transition={{ delay: 0.5 + i * 0.1, duration: 1, type: "spring" }}
                                    className="absolute w-24 h-32 bg-white shadow-sm border border-slate-200 rounded-sm flex flex-col p-2 gap-1"
                                >
                                    <div className="w-full h-1 bg-slate-100 rounded" />
                                    <div className="w-[80%] h-1 bg-slate-100 rounded" />
                                    <div className="w-[60%] h-1 bg-slate-100 rounded" />
                                </motion.div>
                            ))}

                            {/* Other Items */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={isInView ? { opacity: 1, scale: 1, x: -100, y: -50 } : {}}
                                transition={{ delay: 1.2, duration: 0.5 }}
                                className="absolute w-20 h-24 bg-amber-100 border-2 border-amber-200 rounded flex flex-col items-center justify-center text-2xl shadow-lg"
                            >
                                📟
                                <span className="text-[8px] font-bold text-amber-800 mt-1">999+ ERR</span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={isInView ? { opacity: 1, scale: 1, x: 120, y: 80 } : {}}
                                transition={{ delay: 1.4, duration: 0.5 }}
                                className="absolute w-24 h-24 bg-slate-900 rounded-lg flex items-center justify-center text-3xl shadow-2xl"
                            >
                                📅
                                <div className="absolute top-0 right-0 -mr-2 -mt-2 bg-red-500 text-white text-[10px] px-1 rounded-full font-bold">EXPIRED</div>
                            </motion.div>

                            {/* The Stressed Figure */}
                            <motion.div
                                initial={{ opacity: 0, y: 100 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 1.6, duration: 0.8 }}
                                className="absolute z-10 flex flex-col items-center"
                            >
                                <div className="text-[120px] filter grayscale brightness-75">😓</div>
                                {/* Stress Lines */}
                                <motion.div
                                    animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="absolute top-0 flex gap-12"
                                >
                                    <span className="text-red-500 font-bold text-2xl">⚡</span>
                                    <span className="text-red-500 font-bold text-2xl">⚡</span>
                                </motion.div>
                                <div className="text-slate-400 font-bold text-sm bg-white/80 px-4 py-1 rounded-full border border-slate-200 shadow-sm mt-[-10px]">
                                    Where is my profit?
                                </div>
                            </motion.div>

                            {/* Ticking Clock */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="absolute top-10 right-10 w-16 h-16 rounded-full border-2 border-slate-300 flex items-center justify-center"
                            >
                                <div className="w-0.5 h-6 bg-slate-400 origin-bottom" />
                            </motion.div>

                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default ProblemSection;
