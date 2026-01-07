import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const ComplianceSummary: React.FC = () => {
    return (
        <Card className="bg-white border-none shadow-xl border-l-4 border-l-blue-500">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Compliance & Tax</h3>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mt-1">GST Readiness Center</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-2xl">
                        <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Monthly Summary</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="text-slate-600">Taxable Turnover</span>
                                <span className="text-slate-900">₹3,42,000</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="text-slate-600">GST Input Credit</span>
                                <span className="text-green-600">+₹12,450</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-semibold border-t border-slate-200 pt-2">
                                <span className="text-slate-900">Net Payable</span>
                                <span className="text-slate-900 font-bold">₹4,200</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-1">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Data verified by Government Sandbox</p>
                    </div>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-full h-12 bg-slate-100 text-slate-400 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
                                    <Download className="w-4 h-4" />
                                    Download GST Report
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white font-semibold border-none">
                                <p>Available in Production Mode</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
};
