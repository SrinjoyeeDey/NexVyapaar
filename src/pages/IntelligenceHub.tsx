import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Sparkles,
    TrendingUp,
    Zap,
    ShieldCheck,
    Users,
    BrainCircuit,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from "recharts";

// Import existing components
import { RealTimePOS } from "@/components/demo/RealTimePOS";
import { AICopilotAdvice } from "@/components/demo/AICopilotAdvice";
import { CreditReadiness } from "@/components/demo/CreditReadiness";
import { CommunityInsights } from "@/components/demo/CommunityInsights";
import { ComplianceSummary } from "@/components/demo/ComplianceSummary";

const growthData = [
    { day: "Mon", revenue: 4200, orders: 45 },
    { day: "Tue", revenue: 5100, orders: 52 },
    { day: "Wed", revenue: 4800, orders: 48 },
    { day: "Thu", revenue: 6200, orders: 65 },
    { day: "Fri", revenue: 5800, orders: 58 },
    { day: "Sat", revenue: 7500, orders: 82 },
    { day: "Sun", revenue: 8200, orders: 95 },
];

const categoryData = [
    { name: "Dairy", value: 35, color: "#6366f1" },
    { name: "Snacks", value: 25, color: "#f59e0b" },
    { name: "Beverages", value: 20, color: "#10b981" },
    { name: "Groceries", value: 20, color: "#ec4899" },
];

const savingsData = [
    { month: "Jan", individual: 1200, group: 4500 },
    { month: "Feb", individual: 1500, group: 5200 },
    { month: "Mar", individual: 1100, group: 6100 },
    { month: "Apr", individual: 1800, group: 7500 },
];

const IntelligenceHub: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Premium Header */}
            <div className="bg-white border-b border-slate-100 pb-12 pt-10 px-6 rounded-b-[3rem] shadow-sm relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative">
                    <Button
                        variant="ghost"
                        className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 mb-6 -ml-2 font-semibold"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Overview
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Intelligence Hub</h1>
                                    <p className="text-indigo-600 font-bold tracking-[0.1em] uppercase text-[10px] mt-0.5">Enterprise Analytics & AI</p>
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                Your command center for business growth. NexVyapaar AI synchronizes your sales, credit readiness, and community signals into actionable intelligence.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-sm">
                                <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest mb-0.5">Weekly Growth</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-slate-900">+22.4%</span>
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                            </div>
                            <div className="bg-green-50 rounded-2xl p-4 border border-green-100 shadow-sm">
                                <p className="text-[9px] text-green-600 font-bold uppercase tracking-widest mb-0.5">AI Efficiency</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-slate-900">98%</span>
                                    <Zap className="w-4 h-4 text-amber-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Visualizations - 8 cols */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* 1. Revenue Analytics Chart */}
                        <Card className="border-none shadow-xl overflow-hidden bg-white">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                                            <LineChartIcon className="w-5 h-5 text-indigo-500" />
                                            Revenue Momentum
                                        </CardTitle>
                                        <CardDescription className="font-semibold text-slate-400">Real-time revenue tracking across all channels</CardDescription>
                                    </div>
                                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-semibold">LIVE SYNC</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={growthData}>
                                            <defs>
                                                <linearGradient id="hubRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                itemStyle={{ fontWeight: 'bold' }}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fill="url(#hubRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* 2. Order Distribution Chart */}
                            <Card className="border-none shadow-xl bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                                        Daily Operations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={growthData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                                <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 3. Category Insights Chart */}
                            <Card className="border-none shadow-xl bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <PieChartIcon className="w-5 h-5 text-indigo-500" />
                                        Category Mix
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categoryData}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                >
                                                    {categoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 4. Community Savings Trend */}
                        <Card className="border-none shadow-xl bg-white bg-gradient-to-br from-indigo-600 to-indigo-800 text-white overflow-hidden">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                        <Users className="w-5 h-5 text-indigo-200" />
                                        Ecosystem Savings
                                    </CardTitle>
                                    <Badge className="bg-white/10 text-white border-white/20 font-semibold">GROUP ROI</Badge>
                                </div>
                                <CardDescription className="text-indigo-100 font-medium">Monthly savings achieved through group buying</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={savingsData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                            <XAxis dataKey="month" hide />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', color: '#1e1b4b' }}
                                                itemStyle={{ fontWeight: 'bold' }}
                                            />
                                            <Area type="monotone" dataKey="group" stroke="#fbbf24" strokeWidth={3} fill="#fbbf24" fillOpacity={0.2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-indigo-100">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Total Savings</p>
                                        <p className="text-2xl font-bold italic">₹23,300</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Nearby Partners</p>
                                        <p className="text-2xl font-bold italic">14 Shops</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Intelligence Deck */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <RealTimePOS />
                            <AICopilotAdvice />
                        </div>
                    </div>

                    {/* Sidebar Insights - 4 cols */}
                    <div className="lg:col-span-4 space-y-8">
                        <CreditReadiness />
                        <ComplianceSummary />
                        <CommunityInsights />
                        <Button
                            variant="ghost"
                            className="w-full text-indigo-600 hover:bg-indigo-50 font-semibold"
                            onClick={() => navigate('/marketplace')}
                        >
                            View Marketplace Infrastructure →
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntelligenceHub;
