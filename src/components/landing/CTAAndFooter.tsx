import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Twitter, Linkedin, Instagram, Heart } from 'lucide-react';

const FinalCTA = () => {
    return (
        <section className="relative min-h-[80vh] w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 py-32 flex items-center justify-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-20">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -1000],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 10 + Math.random() * 10,
                            delay: Math.random() * 10
                        }}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: '100%'
                        }}
                    />
                ))}
            </div>

            <div className="container mx-auto px-4 text-center relative z-10 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="text-white/90 text-xl font-bold uppercase tracking-widest mb-6"
                >
                    Ready to Transform Your Business?
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-7xl md:text-8xl font-black text-white leading-tight mb-12"
                >
                    Start Growing Today.<br />
                    Zero Risk. Zero Complexity.
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl text-white/80 max-w-4xl mb-16 leading-relaxed"
                >
                    Join 2,500+ smart business owners using AI to save time and grow revenue. Set up in 5 minutes. No credit card needed.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-6"
                >
                    <button className="px-12 py-6 bg-white text-indigo-600 text-2xl font-black rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all">
                        Start Free Trial →
                    </button>
                    <button className="px-12 py-6 bg-transparent border-2 border-white text-white text-2xl font-black rounded-2xl hover:bg-white/10 active:scale-95 transition-all">
                        Watch 2-Min Demo
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 flex gap-8 text-white/70 font-bold"
                >
                    <span>✓ 14-day free trial</span>
                    <span>✓ No credit card</span>
                    <span>✓ Cancel anytime</span>
                </motion.div>
            </div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="w-full bg-slate-900 py-20 text-white">
            <div className="container mx-auto px-4 flex flex-col items-center">
                <div className="flex flex-col md:flex-row items-center justify-between w-full mb-12 gap-8">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl italic">NV</div>
                        <span className="text-2xl font-black tracking-tighter">NexVyapaar</span>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-8 font-bold text-slate-400">
                        {['Features', 'Pricing', 'Demo', 'Login', 'Sign Up'].map((link) => (
                            <a key={link} href="#" className="hover:text-white transition-colors uppercase tracking-widest text-sm">{link}</a>
                        ))}
                    </div>

                    {/* Social */}
                    <div className="flex gap-6">
                        <a href="#" className="p-3 bg-slate-800 rounded-xl hover:bg-indigo-600 transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="p-3 bg-slate-800 rounded-xl hover:bg-indigo-600 transition-colors"><Linkedin size={20} /></a>
                        <a href="#" className="p-3 bg-slate-800 rounded-xl hover:bg-indigo-600 transition-colors"><Instagram size={20} /></a>
                    </div>
                </div>

                <div className="w-full h-px bg-slate-800 mb-8" />

                <div className="flex flex-col md:flex-row items-center justify-between w-full text-slate-500 font-bold text-sm gap-4">
                    <p>© 2026 NexVyapaar. Empowering Bharat with AI.</p>
                    <p className="flex items-center gap-2 italic">
                        Made with <Heart className="text-red-500 fill-red-500" size={16} /> in India
                    </p>
                </div>
            </div>
        </footer>
    );
};

export { FinalCTA, Footer };
