import React, { useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import {
    Mic,
    Camera,
    TrendingUp,
    CircleDollarSign,
    Bell,
    Globe,
    ChevronDown,
    UserPlus,
    PlayCircle,
    LogIn,
    Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        mouseX.set(clientX);
        mouseY.set(clientY);
    };

    // Logic for orbital icons
    const orbitIcons = [
        { icon: Mic, label: 'Voice', color: 'text-blue-500' },
        { icon: Camera, label: 'Scanning', color: 'text-purple-500' },
        { icon: TrendingUp, label: 'Analytics', color: 'text-green-500' },
        { icon: CircleDollarSign, label: 'Money', color: 'text-amber-500' },
        { icon: Bell, label: 'Notifications', color: 'text-red-500' },
        { icon: Globe, label: 'Multi-language', color: 'text-indigo-500' },
    ];

    return (
        <section
            className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-white"
            onMouseMove={handleMouseMove}
        >
            {/* Background Orbs & Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <motion.div
                    className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-50/60 blur-[120px]"
                    style={{
                        x: useTransform(mouseX, [0, window.innerWidth], [-40, 40]),
                        y: useTransform(mouseY, [0, window.innerHeight], [-40, 40])
                    }}
                />
                <motion.div
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-saffron-50/40 blur-[120px]"
                    style={{
                        x: useTransform(mouseX, [0, window.innerWidth], [40, -40]),
                        y: useTransform(mouseY, [0, window.innerHeight], [40, -40])
                    }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(67,56,202,0.03)_0%,transparent_80%)]" />
            </div>

            {/* Top Navigation Overlay */}
            <nav className="absolute top-0 w-full flex justify-between items-center p-8 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white italic shadow-lg shadow-indigo-200">NV</div>
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">NexVyapaar</span>
                </div>
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="group flex items-center gap-2 text-slate-600 font-bold hover:text-indigo-600 transition-colors"
                >
                    <span className="w-8 h-[2px] bg-slate-400 group-hover:bg-indigo-600 transition-colors" />
                    Menu
                </button>
            </nav>

            {/* Hero Content */}
            <div className="container mx-auto px-4 z-10 flex flex-col items-center text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white shadow-xl shadow-slate-100 border border-slate-50 text-slate-700 font-bold text-sm mb-12 animate-float pr-8 relative"
                >
                    <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-[10px] text-white rounded-full">🇮🇳</span>
                    Bharat's #1 AI Vyapaar Core
                    <div className="absolute right-0 top-0 -mr-2 -mt-2 bg-saffron-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">PRO</div>
                </motion.div>

                {/* Unique Indian Relatable Tagline */}
                <div className="relative mb-12">
                    <h1 className="text-[110px] md:text-[140px] leading-[0.9] font-black tracking-tighter text-slate-900">
                        <motion.span
                            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="block"
                        >
                            Ab Vyapaar
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
                            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="block font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
                        >
                            Karega AI.
                        </motion.span>
                    </h1>

                    {/* Secondary Highlight */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="absolute -right-8 top-1/2 -translate-y-1/2 rotate-12 hidden md:block"
                    >
                        <div className="bg-saffron-500 text-white px-6 py-3 rounded-2xl font-black text-2xl shadow-2xl shadow-saffron-200 flex items-center gap-2">
                            <Sparkles size={24} />
                            Success!
                        </div>
                    </motion.div>
                </div>

                {/* Relatable Sub-headline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="text-2xl md:text-3xl text-slate-600 max-w-4xl leading-[1.4] mb-16 font-medium"
                >
                    "Ghar-Ghar AI, Har Shop Smart." <br />
                    <span className="text-indigo-600 font-bold italic">Speak to sell, scan to grow.</span> The power of a multi-million dollar tech stack, now in the palm of your hand.
                </motion.p>

                {/* Action Center - Unique Placement & Animations */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-48 relative group z-50">
                    {/* Register Button - The Massive Popping CTA */}
                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative z-30 px-12 py-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(67,56,202,0.5)] flex flex-col items-center transition-shadow hover:shadow-[0_40px_80px_-20px_rgba(67,56,202,0.6)]"
                        onClick={() => navigate('/vendor-onboarding')}
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <UserPlus size={28} className="animate-pulse" />
                            <span className="text-3xl font-black">Register Shop</span>
                        </div>
                        <span className="text-sm opacity-80 font-bold uppercase tracking-widest">Free for Bharat 🇮🇳</span>
                    </motion.button>

                    {/* Login & Demo - Floating Action Pill */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="bg-slate-900/5 backdrop-blur-xl border border-white/40 p-3 rounded-[2.5rem] flex items-center gap-4 shadow-2xl flex-shrink-0 relative z-30"
                    >
                        <button
                            onClick={() => navigate('/auth')}
                            className="flex items-center gap-3 px-8 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xl hover:bg-indigo-50 transition-colors shadow-lg"
                        >
                            <LogIn size={20} />
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-3 px-8 py-5 text-slate-700 rounded-[2rem] font-black text-xl hover:text-indigo-600 transition-all hover:bg-white/50"
                        >
                            <PlayCircle size={20} />
                            Demo
                        </button>
                    </motion.div>

                    {/* Decorative background for buttons */}
                    <div className="absolute inset-x-[-100px] inset-y-[-50px] bg-indigo-50/20 rounded-[4rem] -z-10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>

                {/* Hero Visual - Enhanced 3D Isometric Illustration */}
                <div className="relative w-full max-w-5xl h-[600px] mt-20 flex items-center justify-center pointer-events-none z-10">
                    {/* Main Character Area */}
                    <div className="relative w-full h-full flex items-center justify-center">

                        {/* The Shopkeeper Character */}
                        <motion.div
                            animate={{
                                y: [0, -15, 0],
                                rotateZ: [-1, 1, -1]
                            }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="absolute z-20 flex flex-col items-center"
                        >
                            <div className="text-[180px] drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] relative">
                                👨🏽‍💼
                                {/* Floating tooltips */}
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], rotate: [5, 15, 5] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="absolute -top-4 -right-8 bg-white px-4 py-2 rounded-2xl shadow-xl border-2 border-slate-50 text-2xl"
                                >
                                    📈
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Orbital Command Center */}
                        <div className="absolute inset-0 flex items-center justify-center scale-110">
                            <div className="relative w-[700px] h-[700px] rounded-full border border-indigo-100/40">
                                {/* Orbital Path Highlight */}
                                <div className="absolute inset-[15%] rounded-full border border-slate-100/50" />

                                {orbitIcons.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        animate={{
                                            rotate: [idx * 60, idx * 60 + 360],
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 40,
                                            ease: "linear"
                                        }}
                                        className="absolute inset-0"
                                    >
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.15, 1],
                                                rotate: [-(idx * 60), -(idx * 60 + 360)],
                                                y: [0, -10, 0]
                                            }}
                                            transition={{
                                                scale: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: idx * 0.7 },
                                                rotate: { repeat: Infinity, duration: 40, ease: "linear" },
                                                y: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: idx * 0.3 }
                                            }}
                                            className="absolute left-1/2 -ml-10 -mt-10 w-20 h-20 rounded-3xl bg-white shadow-2xl flex flex-col items-center justify-center border border-slate-50 group pointer-events-auto cursor-pointer"
                                            style={{
                                                top: '0%',
                                                transform: 'translateX(0%)'
                                            }}
                                        >
                                            <item.icon className={`w-10 h-10 ${item.color} group-hover:scale-110 transition-transform`} />
                                            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap">
                                                {item.label}
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Glowing Data Flow Rings */}
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{
                                    scale: 1.5 + (i * 0.5),
                                    opacity: [0, 0.2, 0],
                                    rotateZ: i % 2 === 0 ? 360 : -360
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 8 + (i * 2),
                                    delay: i * 2,
                                    ease: "linear"
                                }}
                                className="absolute w-64 h-64 rounded-full border-t-2 border-indigo-200/40"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll Hint */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-sm text-slate-400 uppercase tracking-widest font-black">Scroll to experience the future</span>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <ChevronDown className="w-8 h-8 text-indigo-400" />
                </motion.div>
            </motion.div>

            {/* Full Screen Menu Overlay */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '100%' }}
                    className="fixed inset-0 z-[100] bg-indigo-600 flex flex-col items-center justify-center gap-12"
                >
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute top-10 right-10 text-white text-4xl font-black"
                    >
                        ✕
                    </button>
                    {['Features', 'Pricing', 'Success Stories', 'Try Demo', 'Register Shop'].map((item, idx) => (
                        <motion.a
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={item}
                            href="#"
                            className="text-6xl md:text-8xl font-black text-indigo-100 hover:text-white hover:scale-110 transition-all tracking-tighter"
                        >
                            {item}
                        </motion.a>
                    ))}

                    <div className="absolute bottom-10 text-indigo-200 font-bold tracking-widest uppercase">
                        Empowering local businesses since 2024
                    </div>
                </motion.div>
            )}
        </section>
    );
};

export default Hero;
