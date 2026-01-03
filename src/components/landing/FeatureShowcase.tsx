import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    Camera,
    Brain,
    ChevronRight,
    CheckCircle2,
    Sparkles
} from 'lucide-react';

const FeatureShowcase = () => {
    const [activeTab, setActiveTab] = useState('voice');

    const tabs = [
        { id: 'voice', icon: Mic, label: 'Voice Control' },
        { id: 'scan', icon: Camera, label: 'Smart Scanner' },
        { id: 'insights', icon: Brain, label: 'AI Insights' },
    ];

    return (
        <section className="min-h-screen w-full bg-white py-32 flex flex-col items-center">
            <div className="container mx-auto px-4 text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-6xl font-bold text-slate-900 mb-6"
                >
                    How NexVyapaar Works
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl text-slate-600 max-w-2xl mx-auto"
                >
                    Three powerful features. One seamless experience.
                </motion.p>
            </div>

            {/* Feature Tabs */}
            <div className="flex gap-4 mb-20">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                            }`}
                    >
                        <tab.icon size={24} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="container mx-auto px-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'voice' && <VoiceFeature key="voice" />}
                    {activeTab === 'scan' && <ScanFeature key="scan" />}
                    {activeTab === 'insights' && <InsightsFeature key="insights" />}
                </AnimatePresence>
            </div>
        </section>
    );
};

const VoiceFeature = () => {
    const languages = ['हिंदी', 'বাংলা', 'English', 'தமிழ்', 'తెలుగు', 'मराठी', 'ગુજરાતી', 'ಕನ್ನಡ', 'മലയാളം', 'ਪੰਜਾਬੀ'];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col lg:flex-row items-center gap-16 min-h-[600px]"
        >
            {/* Left Visual */}
            <div className="w-full lg:w-1/2 relative h-[500px] flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-square bg-indigo-50/50 rounded-3xl flex items-center justify-center overflow-hidden">
                    {/* Animated Scene */}
                    <div className="relative flex flex-col items-center">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="text-9xl mb-8"
                        >
                            👨🏽‍💼
                        </motion.div>

                        {/* Speech Bubble */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1 }}
                            className="absolute -top-12 -right-12 bg-white border border-slate-100 p-4 rounded-3xl shadow-xl font-bold text-xl text-indigo-600"
                        >
                            "बेचा 10 पार्ले जी"
                            <div className="absolute bottom-[-10px] left-8 w-4 h-4 bg-white border-b border-r border-slate-100 rotate-45" />
                        </motion.div>

                        {/* Waveform */}
                        <div className="flex gap-1 h-12 items-center">
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ height: [10, 40 * Math.random() + 10, 10] }}
                                    transition={{ repeat: Infinity, duration: 0.5 + Math.random(), ease: "easeInOut" }}
                                    className="w-1.5 bg-indigo-500 rounded-full"
                                />
                            ))}
                        </div>

                        {/* Structured Data Result */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 3 }}
                            className="mt-12 bg-white p-4 rounded-2xl shadow-lg border border-indigo-100 flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 font-bold">✓</div>
                            <div>
                                <div className="text-xs text-slate-500">Recorded Sale</div>
                                <div className="font-bold">10x Parle-G • ₹50</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Right Content */}
            <div className="w-full lg:w-1/2 text-left">
                <h3 className="text-5xl font-bold text-slate-900 mb-8">Just Speak, We Listen</h3>
                <p className="text-xl text-slate-600 leading-relaxed mb-10">
                    Voice commands in 22 Indian languages. Say what happened in Hindi, Bengali, Tamil - whatever you're comfortable with. We understand and update everything instantly.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {[
                        'Works in 22 Indian languages',
                        'Understands natural speech',
                        'Updates sales, inventory, analytics',
                        'Works offline, syncs later'
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="text-indigo-600" size={24} />
                            <span className="font-semibold text-slate-700">{item}</span>
                        </div>
                    ))}
                </div>

                {/* Language Pills */}
                <div className="flex gap-2 overflow-hidden mb-12 relative h-10 items-center">
                    {languages.map((lang, i) => (
                        <motion.span
                            key={i}
                            className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
                            whileHover={{ scale: 1.1, backgroundColor: '#eef2ff', color: '#4338ca' }}
                        >
                            {lang}
                        </motion.span>
                    ))}
                    <span className="text-slate-400 text-sm font-medium ml-2">+15 more</span>
                </div>

                <button className="flex items-center gap-2 text-indigo-600 font-bold text-xl group">
                    Try Voice Demo
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
};

const ScanFeature = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col lg:flex-row-reverse items-center gap-16 min-h-[600px]"
        >
            {/* Right Visual */}
            <div className="w-full lg:w-1/2 relative h-[500px] flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-screen bg-slate-900 rounded-[2.5rem] border-8 border-slate-800 shadow-2xl overflow-hidden">
                    {/* Camera View Simulation */}
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-70">
                        {/* Scan Line */}
                        <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            className="absolute left-0 right-0 h-1 bg-indigo-400 shadow-[0_0_20px_#4338ca] z-20"
                        />

                        {/* Bounding Boxes */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="absolute top-[20%] left-[10%] w-[30%] h-[30%] border-2 border-indigo-500 rounded-lg flex flex-col justify-end"
                        >
                            <div className="bg-indigo-500 text-white text-[10px] px-1 font-bold">Parle-G 95%</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="absolute top-[40%] right-[15%] w-[35%] h-[25%] border-2 border-green-500 rounded-lg flex flex-col justify-end"
                        >
                            <div className="bg-green-500 text-white text-[10px] px-1 font-bold">Lays 92%</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.5 }}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur p-4 rounded-xl shadow-2xl flex items-center gap-3"
                        >
                            <CheckCircle2 className="text-green-500" size={20} />
                            <span className="font-bold text-slate-900 italic">15 items scanned</span>
                        </motion.div>
                    </div>

                    {/* UI Overlay */}
                    <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/50 to-transparent flex items-center justify-center">
                        <div className="w-16 h-1.5 bg-white/20 rounded-full" />
                    </div>
                </div>
                {/* AI Badge */}
                <div className="absolute -bottom-4 -left-4 bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl border-4 border-white rotate-[-5deg] flex items-center gap-2">
                    <Sparkles size={20} />
                    Powered by YOLOv8 AI
                </div>
            </div>

            {/* Left Content */}
            <div className="w-full lg:w-1/2 text-left">
                <h3 className="text-5xl font-bold text-slate-900 mb-8">Point, Scan, Done</h3>
                <p className="text-xl text-slate-600 leading-relaxed mb-10">
                    Point your camera at products. Our AI recognizes Indian products instantly, counts them, and updates your inventory. No barcodes needed. No manual entry.
                </p>

                <div className="space-y-6">
                    {[
                        'Recognizes 10,000+ Indian products',
                        'No barcodes or QR codes needed',
                        'Counts quantities automatically',
                        'Updates in real-time'
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <ChevronRight size={18} />
                            </div>
                            <span className="font-semibold text-slate-700 text-lg">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const InsightsFeature = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex flex-col items-center max-w-4xl mx-auto"
        >
            <div className="relative w-full h-[400px] flex items-center justify-center mb-16">
                {/* Central Brain Visual */}
                <div className="relative w-48 h-48 bg-indigo-100/50 rounded-full flex items-center justify-center overflow-hidden">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="text-8xl bg-white p-6 rounded-full shadow-2xl relative z-10"
                    >
                        🧠
                    </motion.div>
                    {/* Animated Glow Particles */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                opacity: [0, 0.5, 0],
                                scale: [0, 1.5],
                                x: [0, (Math.random() - 0.5) * 200],
                                y: [0, (Math.random() - 0.5) * 200]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 2 + Math.random(),
                                delay: i * 0.4
                            }}
                            className="absolute w-4 h-4 rounded-full bg-indigo-400 blur-sm"
                        />
                    ))}
                </div>

                {/* Insight Bubbles Orbiting */}
                {[
                    { text: '🚨 3 items expiring soon', color: 'border-red-500 text-red-600', pos: 'top-0 left-[-40px]' },
                    { text: '📈 Stock up on Milk', color: 'border-indigo-500 text-indigo-600', pos: 'top-10 right-[-40px]' },
                    { text: '💰 Best profit: Snacks', color: 'border-green-500 text-green-600', pos: 'bottom-20 left-[-60px]' },
                    { text: '🎯 Recommendation ready', color: 'border-purple-500 text-purple-600', pos: 'bottom-0 right-[-20px]' }
                ].map((bubble, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}
                        className={`absolute ${bubble.pos} bg-white border-2 ${bubble.color} px-6 py-3 rounded-2xl font-bold shadow-xl animate-float`}
                        style={{ animationDelay: `${i * 0.5}s` }}
                    >
                        {bubble.text}
                    </motion.div>
                ))}
            </div>

            <div className="text-center">
                <h3 className="text-5xl font-bold text-slate-900 mb-8">Your AI Business Partner</h3>
                <p className="text-xl text-slate-600 leading-relaxed mb-12">
                    Get smart recommendations based on your sales patterns, inventory levels, and market trends. Know what to stock, when to promote, and how to grow.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                    {[
                        'Predicts stockouts',
                        'Expiry alerts',
                        'Best-seller tracking',
                        'Optimized restocking'
                    ].map((item, i) => (
                        <div key={i} className="bg-indigo-50 px-6 py-3 rounded-2xl flex items-center gap-2">
                            <Sparkles className="text-indigo-600" size={20} />
                            <span className="font-bold text-indigo-700">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default FeatureShowcase;
