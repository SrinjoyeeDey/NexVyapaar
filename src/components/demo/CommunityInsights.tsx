import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    Users,
    ShoppingBag,
    ArrowRight,
    CheckCircle2,
    Info,
    Calendar,
    Building2,
    Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMarketplaceStore, Business } from "@/hooks/useMarketplaceStore";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export const CommunityInsights: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
    const { businesses, groupBuys, joinGroupBuy, isJoined } = useMarketplaceStore();
    const { toast } = useToast();
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

    const activeGroupBuy = groupBuys[0]; // Focusing on the primary active one as requested
    const joined = isJoined(activeGroupBuy.id);

    const handleJoin = () => {
        const result = joinGroupBuy(activeGroupBuy.id);
        if (result.success) {
            toast({
                title: "Successfully Joined",
                description: "You're now part of the group order. Expected savings locked.",
            });
        }
    };

    const progressValue = (activeGroupBuy.current_participants / activeGroupBuy.required_participants) * 100;

    return (
        <div className="space-y-6">
            <Card className="bg-white border-none shadow-xl overflow-hidden">
                <CardContent className="p-8">
                    {!hideHeader && (
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Marketplace & Community</h3>
                                <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Nearby Ecosystem Hub</p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-2xl">
                                <Building2 className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 mb-10">
                        {businesses.slice(0, 3).map((shop) => (
                            <Sheet key={shop.id}>
                                <SheetTrigger asChild>
                                    <div
                                        className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 hover:shadow-sm transition-all cursor-pointer group"
                                        onClick={() => setSelectedBusiness(shop)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                                {shop.category === 'Grocery' ? '🏪' :
                                                    shop.category === 'Dairy & Poultry' ? '🥛' :
                                                        shop.category === 'Electronics' ? '⚡' : '🏬'}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-sm tracking-tight">{shop.name}</h4>
                                                <div className="flex flex-col gap-1 mt-1">
                                                    <p className="text-[10px] text-slate-400 font-medium">{shop.category}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md">
                                                            <MapPin className="w-2.5 h-2.5" />
                                                            {Math.round(shop.distance)}m away
                                                        </div>
                                                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">Status: Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader className="pb-6 border-b border-slate-100">
                                        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-4xl mb-4">
                                            {shop.category === 'Grocery' ? '🏪' :
                                                shop.category === 'Dairy & Poultry' ? '🥛' :
                                                    shop.category === 'Electronics' ? '⚡' : '🏬'}
                                        </div>
                                        <SheetTitle className="text-2xl font-bold text-slate-900">{shop.name}</SheetTitle>
                                        <SheetDescription className="text-slate-500 font-medium pt-2 leading-relaxed">
                                            {shop.description}
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="py-8 space-y-6">
                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Shield className="w-4 h-4 text-green-500" />
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verification Status</span>
                                            </div>
                                            <p className="text-sm font-semibold text-green-600">Active on NexVyapaar</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> Joined
                                                </p>
                                                <p className="text-sm font-semibold text-slate-800">{new Date(shop.joined_date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> Proximity
                                                </p>
                                                <p className="text-sm font-semibold text-slate-800">{Math.round(shop.distance)} meters away</p>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <p className="text-xs text-slate-400 font-medium leading-relaxed italic border-l-2 border-slate-200 pl-4 py-2">
                                                "Participating in ecosystem signals helps and improves discoverability for all nearby partners."
                                            </p>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        ))}
                    </div>

                    {/* Group Buying Banner */}
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                <div className="flex gap-4 items-center">
                                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                                        <ShoppingBag className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Group Buying Active</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-white tracking-tight">{activeGroupBuy.product_name}</h4>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Potential ROI</p>
                                    <p className="text-xl font-bold text-green-400">{activeGroupBuy.discount_percentage}% Savings</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                                    <span>{activeGroupBuy.current_participants} of {activeGroupBuy.required_participants} joined</span>
                                    <span>{Math.round(progressValue)}% Complete</span>
                                </div>
                                <Progress value={progressValue} className="h-2 bg-white/10" indicatorClassName="bg-indigo-500" />
                            </div>

                            <AnimatePresence mode="wait">
                                {joined ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white uppercase tracking-wide">You're part of this group order</p>
                                            <p className="text-xs font-medium text-slate-400 mt-1">
                                                Expected savings: ₹{activeGroupBuy.estimated_savings}. Supplier finalized on completion.
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <Button
                                        onClick={handleJoin}
                                        className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-2xl h-14 transition-all shadow-xl shadow-white/5 group"
                                    >
                                        Join Group Order
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                )}
                            </AnimatePresence>

                            <div className="mt-8 pt-6 border-t border-white/10 flex items-start gap-3">
                                <Info className="w-4 h-4 text-slate-500 mt-0.5" />
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                    Group buying reduces per-unit cost by aggregating demand across nearby businesses. NexVyapaar AI manages the logistics and ensures equitable allocation.
                                </p>
                            </div>
                        </div>

                        {/* Decorative background elements to match premium feel */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
