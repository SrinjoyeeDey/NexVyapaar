import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const SocialProof = () => {
    const reviews = [
        {
            quote: "We saved 8 hours every week. Now I actually have time to plan growth instead of drowning in paperwork.",
            name: "Priya Sharma",
            business: "Priya's Boutique, Mumbai",
            metric: "+36% Sales",
            metricColor: "bg-green-100 text-green-700",
            avatar: "👩🏽‍🎨"
        },
        {
            quote: "The voice feature in Hindi changed everything. My staff can update sales while serving customers.",
            name: "Rajesh Kumar",
            business: "RK Medical Store, Delhi",
            metric: "8 hrs saved/week",
            metricColor: "bg-blue-100 text-blue-700",
            avatar: "👨🏽‍⚕️"
        },
        {
            quote: "Expiry alerts saved me ₹45,000 in wasted stock. The AI pays for itself every month.",
            name: "Maya Patel",
            business: "Fresh Mart, Ahmedabad",
            metric: "₹45K saved",
            metricColor: "bg-amber-100 text-amber-700",
            avatar: "👩🏽‍🌾"
        }
    ];

    return (
        <section className="min-h-screen w-full bg-gradient-to-b from-indigo-50 to-white py-32 flex flex-col items-center overflow-hidden">
            <div className="container mx-auto px-4 text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-6xl font-bold text-slate-900 mb-6"
                >
                    Real Businesses, Real Results
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl text-slate-600 max-w-2xl mx-auto"
                >
                    Join 2,500+ businesses transforming with NexVyapaar
                </motion.p>
            </div>

            <div className="container mx-auto px-4 flex flex-wrap justify-center gap-12">
                {reviews.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15, duration: 0.8 }}
                        whileHover={{ y: -12 }}
                        className="w-full md:w-[400px] bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100 relative group animate-float"
                        style={{ animationDelay: `${idx * 0.5}s` }}
                    >
                        {/* Quote Mark */}
                        <div className="text-8xl text-indigo-50 absolute top-4 left-6 pointer-events-none">"</div>

                        <p className="text-xl text-slate-700 leading-relaxed mb-10 relative z-10 italic">
                            {card.quote}
                        </p>

                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl shadow-inner">
                                {card.avatar}
                            </div>
                            <div className="text-left flex-1">
                                <div className="font-bold text-slate-900 text-lg">{card.name}</div>
                                <div className="text-slate-500 text-sm">{card.business}</div>
                            </div>
                            <div className={`px-4 py-2 rounded-xl text-sm font-bold ${card.metricColor}`}>
                                {card.metric}
                            </div>
                        </div>

                        {/* Hover decorative element */}
                        <motion.div
                            className="absolute bottom-4 right-10 opacity-0 group-hover:opacity-100 transition-opacity"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Star className="text-indigo-400 fill-indigo-400" size={24} />
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-20 flex flex-col items-center gap-4"
            >
                <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className="text-saffron-500 fill-saffron-500" size={32} />
                    ))}
                </div>
                <div className="text-2xl font-bold text-slate-900">
                    4.9/5 <span className="text-slate-500 font-medium text-lg">from 500+ reviews</span>
                </div>
            </motion.div>
        </section>
    );
};

export default SocialProof;
