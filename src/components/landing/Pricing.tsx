import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Info } from 'lucide-react';

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(false);

    const tiers = [
        {
            name: 'FREE',
            badge: 'Perfect to Start',
            price: '₹0',
            period: '/month',
            description: 'Always Free',
            features: [
                'Up to 100 products',
                'Voice commands',
                'Basic analytics',
                'Email support'
            ],
            button: 'Start Free',
            variant: 'outline'
        },
        {
            name: 'PRO',
            badge: 'Most Popular',
            price: isAnnual ? '₹399' : '₹499',
            period: '/month',
            description: isAnnual ? 'Billed annually (Save 20%)' : 'Billed monthly',
            features: [
                'Unlimited products',
                'AI scanner',
                'Smart campaigns',
                'AI insights',
                'Priority support',
                'Multi-language'
            ],
            button: 'Start 14-Day Trial',
            variant: 'gradient',
            highlight: true
        },
        {
            name: 'ENTERPRISE',
            badge: 'For Growing Teams',
            price: 'Custom',
            period: '',
            description: 'Contact for pricing',
            features: [
                'Everything in Pro',
                'Multiple locations',
                'Custom integrations',
                'Dedicated support',
                'Custom training'
            ],
            button: 'Contact Sales',
            variant: 'outline'
        }
    ];

    return (
        <section className="min-h-screen w-full bg-white py-32 flex flex-col items-center">
            <div className="container mx-auto px-4 text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-6xl font-bold text-slate-900 mb-12"
                >
                    Simple Pricing. Powerful Results.
                </motion.h2>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-4 mb-20">
                    <span className={`text-lg font-bold ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
                    <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className="w-16 h-8 rounded-full bg-slate-100 p-1 flex items-center transition-colors relative"
                    >
                        <motion.div
                            animate={{ x: isAnnual ? 32 : 0 }}
                            className="w-6 h-6 rounded-full bg-indigo-600 shadow-lg"
                        />
                    </button>
                    <span className={`text-lg font-bold ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
                        Annual <span className="text-green-600 text-sm font-black bg-green-50 px-2 py-1 rounded-lg ml-1">Save 20%</span>
                    </span>
                </div>
            </div>

            <div className="container mx-auto px-4 flex flex-wrap justify-center items-end gap-8">
                {tiers.map((tier, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.8 }}
                        className={`relative w-full md:w-[380px] rounded-[2.5rem] p-10 flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100 ${tier.highlight
                                ? 'bg-white border-4 border-indigo-600 shadow-2xl scale-105 z-10'
                                : 'bg-white border-2 border-slate-100'
                            }`}
                    >
                        {tier.highlight && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-saffron-500 text-white px-6 py-2 rounded-full font-black tracking-widest text-sm shadow-xl">
                                MOST POPULAR
                            </div>
                        )}

                        <div className="text-slate-500 font-black tracking-widest text-sm mb-4">{tier.name}</div>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-5xl font-black text-slate-900">{tier.price}</span>
                            <span className="text-slate-500 font-bold">{tier.period}</span>
                        </div>
                        <p className="text-sm text-slate-400 font-medium mb-8">{tier.description}</p>

                        <div className="space-y-4 mb-12 flex-1">
                            {tier.features.map((feature, fidx) => (
                                <div key={fidx} className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${tier.highlight ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                    <span className="font-semibold text-slate-700">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button className={`w-full py-6 rounded-2xl font-bold text-xl transition-all transform active:scale-95 ${tier.variant === 'gradient'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-200'
                                : 'bg-white border-2 border-slate-200 text-slate-900 hover:border-indigo-600 hover:text-indigo-600'
                            }`}>
                            {tier.button}
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="mt-16 flex flex-wrap justify-center gap-8 text-slate-500 font-medium text-sm">
                <div className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" /> No credit card required
                </div>
                <div className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" /> Cancel anytime
                </div>
                <div className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" /> 14-day money-back guarantee
                </div>
            </div>
        </section>
    );
};

export default Pricing;
