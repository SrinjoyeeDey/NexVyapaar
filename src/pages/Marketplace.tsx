import React from 'react';
import { CommunityInsights } from "@/components/demo/CommunityInsights";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Building2,
    TrendingUp,
    ShieldCheck,
    Zap,
    Users,
    Wallet,
    Globe,
    BarChart3,
    ArrowUpRight,
    Search,
    Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar
} from "recharts";
import { Badge } from "@/components/ui/badge";

const marketplaceTrends = [
    { date: 'Day 1', savings: 4500, participants: 12 },
    { date: 'Day 7', savings: 12000, participants: 28 },
    { date: 'Day 14', savings: 18500, participants: 45 },
    { date: 'Day 21', savings: 32000, participants: 68 },
    { date: 'Day 30', savings: 54000, participants: 92 },
];

const Marketplace: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Premium Header */}
            <div className="bg-white border-b border-slate-100 pb-12 pt-10 px-6 rounded-b-[3rem] shadow-sm relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative text-center md:text-left">
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
                            <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
                                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Marketplace</h1>
                                    <p className="text-indigo-600 font-bold tracking-[0.1em] uppercase text-[10px] mt-0.5">Ecosystem Infrastructure</p>
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                Join our network of over 500+ local businesses. Experience collective growth through group buying and location-aware partnerships.
                            </p>
                        </div>

                        <div className="flex gap-4 self-center md:self-end">
                            <div className="text-center px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Savings</p>
                                <p className="text-xl font-bold text-slate-900">₹4.2L+</p>
                            </div>
                            <div className="text-center px-4 py-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                                <p className="text-[9px] font-bold text-white/70 uppercase tracking-widest mb-0.5">Active Hubs</p>
                                <p className="text-xl font-bold text-white">42</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50 -mr-48 -mt-48" />
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left & Middle Column (Main Content) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Section 1: Business Search & Discovery */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-500" />
                                Nearby Ecosystem
                            </h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl font-semibold gap-2 border-slate-200">
                                    <Filter className="w-4 h-4" /> Filter
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-xl font-semibold gap-2 border-slate-200">
                                    <Search className="w-4 h-4" /> Search
                                </Button>
                            </div>
                        </div>

                        {/* Marketplace content from CommunityInsights */}
                        <CommunityInsights hideHeader={true} />

                        {/* Section 2: Recent Activity Table */}
                        <Card className="border-none shadow-xl bg-white overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold">Recent Network Activity</CardTitle>
                                <CardDescription className="font-medium text-slate-400">Latest transactions and partnerships in your area</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">Business</th>
                                                <th className="px-6 py-4">Action</th>
                                                <th className="px-6 py-4">Volume</th>
                                                <th className="px-6 py-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {[
                                                { name: "Gupta Kirana", action: "Bulk Purchase", value: "₹45,000", status: "Completed", time: "2h ago" },
                                                { name: "Modern Electronics", action: "Group Order Join", value: "8% Save", status: "Pending", time: "5h ago" },
                                                { name: "Super Fresh Dairy", action: "Inventory Sync", value: "340 Units", status: "Completed", time: "1d ago" },
                                                { name: "Sai Medicals", action: "Digital Credit", value: "A+ Grade", status: "Verified", time: "2d ago" },
                                            ].map((row, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-800">{row.name}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium">{row.time}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-slate-600">{row.action}</td>
                                                    <td className="px-6 py-4 font-bold text-indigo-600">{row.value}</td>
                                                    <td className="px-6 py-4">
                                                        <Badge className={`${row.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                            row.status === 'Verified' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                'bg-amber-50 text-amber-600 border-amber-100'
                                                            } font-bold text-[10px] h-5`}>
                                                            {row.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (Insights & Context) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Section 3: Ecosystem Savings Chart */}
                        <Card className="border-none shadow-xl bg-white overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                                    Community ROI
                                </CardTitle>
                                <CardDescription className="font-medium text-slate-400">Total savings growth in this hub</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={marketplaceTrends}>
                                            <defs>
                                                <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                itemStyle={{ fontWeight: 'bold' }}
                                            />
                                            <Area type="monotone" dataKey="savings" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#roiGradient)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-6 flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <TrendingUp className="w-6 h-6 text-indigo-600 shrink-0" />
                                    <p className="text-xs font-semibold text-indigo-900 leading-relaxed">
                                        Businesses in this hub achieved <span className="text-indigo-600 font-bold underline">12% higher profit margins</span> than solitary shops.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 4: Detailed Infos / Benefit Cards */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Member Infrastructure</h3>

                            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow transition-all group cursor-pointer border border-transparent hover:border-indigo-100">
                                <CardContent className="p-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Verified Network</h4>
                                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                                Every member shop is KYC-verified. NexVyapaar AI uses high-trust signals for all partnerships.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow transition-all group cursor-pointer border border-transparent hover:border-green-100">
                                <CardContent className="p-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Instant Scale</h4>
                                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                                Access bulk-buying discounts usually reserved for enterprise chains. Grow with collective power.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow transition-all group cursor-pointer border border-transparent hover:border-amber-100">
                                <CardContent className="p-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm">Credit Ready</h4>
                                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                                Collaborating on the marketplace signals business maturity, improving your digital credit score by up to 15%.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Marketplace;
