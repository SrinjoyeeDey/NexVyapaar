import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Languages,
    ArrowLeft,
    MessageCircle,
    Globe2,
    Sparkles,
    ArrowRight,
    UserCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
    { id: 'en', name: 'English', greeting: 'Welcome to NexVyapaar', desc: 'Enterprise Business Intelligence' },
    { id: 'hi', name: 'हिन्दी', greeting: 'NexVyapaar में आपका स्वागत है', desc: 'आपका अपना डिजिटल साथी' },
    { id: 'bn', name: 'বাংলা', greeting: 'NexVyapaar-এ আপনাকে স্বাগতম', desc: 'আপনার ব্যবসায়ের ডিজিটাল বন্ধু' },
    { id: 'ta', name: 'தமிழ்', greeting: 'NexVyapaar-க்கு உங்களை வரவேற்கிறோம்', desc: 'உங்கள் வணிகத்தின் டிஜிட்டல் உதவியாளர்' }
];

const VernacularLink: React.FC = () => {
    const navigate = useNavigate();
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

    return (
        <div className="min-h-screen bg-[#FDFCFB] pb-24 font-sans">
            {/* Soft Gradient Header */}
            <div className="bg-gradient-to-r from-orange-50 via-white to-indigo-50 pb-20 pt-10 px-6 rounded-b-[4rem] shadow-sm border-b border-orange-100/50">
                <div className="max-w-5xl mx-auto">
                    <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-indigo-600 hover:bg-white mb-8 -ml-2 font-bold"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                                <div className="p-4 bg-orange-500 rounded-3xl shadow-xl shadow-orange-100 rotate-3 text-white">
                                    <Languages className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Vernacular Link</h1>
                                    <Badge className="bg-orange-100 text-orange-700 border-none font-black text-[10px] mt-1">AI CHOICE OF LANGUAGE</Badge>
                                </div>
                            </div>
                            <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-xl italic">
                                "Software shouldn't be a language barrier. NexVyapaar adapts to the tongue of the shopkeeper."
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedLang.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="col-span-2 bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center"
                                >
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedLang.greeting}</h2>
                                    <p className="text-indigo-600 font-bold">{selectedLang.desc}</p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {LANGUAGES.map((lang) => (
                        <motion.div
                            key={lang.id}
                            whileHover={{ y: -10 }}
                            onClick={() => setSelectedLang(lang)}
                            className="cursor-pointer"
                        >
                            <Card className={`border-none shadow-xl rounded-[2.5rem] transition-all duration-500 overflow-hidden ${selectedLang.id === lang.id ? 'bg-slate-900 text-white scale-105 ring-4 ring-indigo-500/20' : 'bg-white text-slate-600 hover:shadow-2xl'}`}>
                                <CardContent className="p-8 flex flex-col items-center justify-center h-48">
                                    <span className="text-4xl font-black mb-4">{lang.name}</span>
                                    <div className={`h-1.5 w-12 rounded-full ${selectedLang.id === lang.id ? 'bg-indigo-400' : 'bg-slate-100'}`} />
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20">
                    <Card className="border-none shadow-2xl rounded-[3rem] bg-indigo-600 overflow-hidden text-white relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <CardContent className="p-12 md:p-16 flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 space-y-6">
                                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full font-bold text-sm">
                                    <Sparkles className="w-4 h-4 text-orange-300" />
                                    AI Insight
                                </div>
                                <h3 className="text-4xl font-black leading-tight">AI Insights in your regional language.</h3>
                                <p className="text-indigo-100 text-lg font-medium max-w-md">
                                    NexVyapaar doesn't just translate words; it understands regional business nuances, festivals, and local consumer behavior.
                                </p>
                                <Button className="h-14 px-8 bg-white text-indigo-600 hover:bg-slate-50 font-black rounded-2xl text-lg shadow-xl">
                                    Start Talking to AI
                                </Button>
                            </div>
                            <div className="w-full md:w-80 space-y-4">
                                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 transform rotate-2">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-400 flex items-center justify-center">
                                            <MessageCircle className="w-6 h-6" />
                                        </div>
                                        <p className="font-bold text-sm text-indigo-100">AI Support (Hindi)</p>
                                    </div>
                                    <p className="text-sm font-medium italic">"आज आपकी दुकान पर दूध की मांग 20% अधिक हो सकती है।"</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 transform -rotate-3 translate-x-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-300 flex items-center justify-center">
                                            <UserCheck className="w-6 h-6" />
                                        </div>
                                        <p className="font-bold text-sm text-indigo-100">Community Connect</p>
                                    </div>
                                    <p className="text-sm font-medium italic">"আপনার পাশের দোকানের সাথে গ্রুপ বাই-এ যোগ দিন।"</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="mt-24 text-center">
                <div className="inline-flex items-center gap-3 text-slate-400 px-6 py-3 border border-slate-200 rounded-full mb-8">
                    <Globe2 className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Bridging the Literacy Gap with Real-time AI Voice & Text</span>
                </div>
            </div>
        </div>
    );
};

export default VernacularLink;
