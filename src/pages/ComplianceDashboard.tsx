/**
 * ComplianceDashboard - Pharmacy compliance center
 * 
 * Shows banned medicines, allows ban list uploads, and displays
 * restricted inventory items.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    AlertTriangle,
    Ban,
    Clock,
    Upload,
    FileText,
    Trash2,
    RefreshCw,
    CheckCircle2,
    Download,
    ShoppingCart,
    Plus,
    X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { complianceCheckService, BannedMedicineData } from '@/services/ComplianceCheckService';
import { expiryTrackingService, ExpiryAlert } from '@/services/ExpiryTrackingService';
import { ComplianceBlockModal } from '@/components/ComplianceBlockModal';

// Mock Pharmacy Products for POS Demo
const MOCK_PRODUCTS = [
    { id: 'p1', name: 'Safe Paracetamol', price: 20, code: 'SAFE001', batch: 'OK123' },
    { id: 'p2', name: 'Vitamin C', price: 150, code: 'SAFE002', batch: 'GOOD456' },
    { id: 'p3', name: 'Banned Painkiller', price: 45, code: 'MED001', batch: 'XYZ123' }, // Banned
    { id: 'p4', name: 'Expired Cough Syrup', price: 85, code: 'EXP001', batch: 'BATCH005', expiryDate: '2025-12-31' }, // Expired
];

export const ComplianceDashboard: React.FC = () => {
    const [bannedList, setBannedList] = useState<BannedMedicineData[]>([]);
    const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
    const [stats, setStats] = useState({
        totalBanned: 0,
        cdscoBanned: 0,
        stateBanned: 0,
        recalled: 0,
        lastUpdated: '',
        source: 'SEED'
    });
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // POS Demo State
    const [cart, setCart] = useState<any[]>([]);
    const [blockModal, setBlockModal] = useState<{
        open: boolean;
        medicine?: any;
        reason?: string;
        message?: string;
    }>({ open: false });

    useEffect(() => {
        loadData();
        // Subscribe to real-time updates from CSV parser
        const unsubscribe = complianceCheckService.subscribe(() => {
            loadData();
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
        });
        return unsubscribe;
    }, []);

    const loadData = () => {
        const list = complianceCheckService.getBannedList();
        const complianceStats = complianceCheckService.getComplianceStats();
        const alerts = expiryTrackingService.getExpiryAlerts();

        setBannedList(list);
        setStats(complianceStats);
        setExpiryAlerts(alerts);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const result = await complianceCheckService.uploadBanList(file);

            if (result.success) {
                toast.success(`✅ CSV Parsed! Intent: ${result.intent || 'Detected'} - ${result.itemsAdded} records updated.`);
                // Data reload happens via subscription
            } else {
                toast.error('Could not interpret file intent.');
            }
        } catch (error) {
            toast.error('Failed to parse CSV');
        } finally {
            setIsUploading(false);
        }
    };

    // Generate Deduction CSV
    const generateDeductionReport = () => {
        const headers = ["Deduction Date", "Item Name", "Batch", "Reason", "Quantity Removed", "Status"];
        const rows = [
            ...expiryAlerts.filter(a => a.severity === 'critical').map(a => [
                new Date().toISOString().split('T')[0],
                a.medicineName,
                a.batch,
                "EXPIRED",
                "Full Stock",
                "REMOVED"
            ]),
            ...bannedList.map(b => [
                new Date().toISOString().split('T')[0],
                b.name,
                b.batch || "All Batches",
                b.reason,
                "Full Stock",
                "REMOVED"
            ])
        ];

        const csvContent = "data:text/csv;charset=utf-8," +
            [headers, ...rows].map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `inventory_deduction_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("✅ Deduction report generated & inventory adjusted");
    };

    // POS Demo Functions
    const addToCart = async (product: any) => {
        // Validate BEFORE adding to cart (Simulating scan intercept)
        const check = await complianceCheckService.validateMedicine({
            code: product.code,
            name: product.name,
            batch: product.batch,
            expiryDate: product.expiryDate
        });

        if (!check.allowed) {
            setBlockModal({
                open: true,
                medicine: product,
                reason: check.reason,
                message: check.message
            });
            return;
        }

        setCart([...cart, product]);
        toast.success("Added to cart");
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <ComplianceBlockModal
                isOpen={blockModal.open}
                onClose={() => setBlockModal({ ...blockModal, open: false })}
                medicine={blockModal.medicine || { name: '' }}
                reason={blockModal.reason || ''}
                message={blockModal.message || ''}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <Shield className="h-8 w-8 text-red-600" />
                        Pharmacy Compliance Center
                        {stats.source === 'UPLOADED' && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 animate-in fade-in zoom-in duration-500">
                                Live CSV Data
                            </Badge>
                        )}
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Medicine regulatory compliance and billing safety gate
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={generateDeductionReport}
                        className="bg-slate-900 text-white hover:bg-slate-800"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Deduction Report (CSV)
                    </Button>
                    <Button
                        variant="outline"
                        onClick={loadData}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
                    <TabsTrigger value="overview">Compliance Overview</TabsTrigger>
                    <TabsTrigger value="pos-demo" className="text-red-600 font-bold">⚠️ Simulated POS Checkout</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="border-2 border-red-200 bg-red-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-red-600">Banned Medicines</p>
                                        <p className="text-3xl font-black text-red-900 mt-1">
                                            {stats.totalBanned}
                                        </p>
                                    </div>
                                    <Ban className="h-10 w-10 text-red-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-orange-200 bg-orange-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-orange-600">Expired Stock</p>
                                        <p className="text-3xl font-black text-orange-900 mt-1">
                                            {expiryAlerts.filter(a => a.severity === 'critical').length}
                                        </p>
                                    </div>
                                    <Clock className="h-10 w-10 text-orange-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-yellow-200 bg-yellow-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-yellow-600">Expiring Soon</p>
                                        <p className="text-3xl font-black text-yellow-900 mt-1">
                                            {expiryAlerts.filter(a => a.severity === 'warning').length}
                                        </p>
                                    </div>
                                    <AlertTriangle className="h-10 w-10 text-yellow-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-blue-200 bg-blue-50">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">CDSCO Orders</p>
                                        <p className="text-3xl font-black text-blue-900 mt-1">
                                            {stats.cdscoBanned}
                                        </p>
                                    </div>
                                    <Shield className="h-10 w-10 text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Expiry Alerts Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Banned List */}
                        <Card className="border-2 border-red-200 h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-900">
                                    <Ban className="h-5 w-5" />
                                    Restricted Medicines
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bannedList.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <CheckCircle2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p className="font-bold">No banned medicines</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {bannedList.map((medicine, index) => (
                                            <div
                                                key={index}
                                                className="bg-white border-2 border-red-100 rounded-xl p-4 flex items-start justify-between"
                                            >
                                                <div>
                                                    <p className="font-bold text-slate-900">{medicine.name}</p>
                                                    <p className="text-xs text-red-600 mt-1">
                                                        ⚠️ {medicine.reason}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-red-600 border-red-200">
                                                    {medicine.source}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Expiry List */}
                        <Card className="border-2 border-orange-200 h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-900">
                                    <Clock className="h-5 w-5" />
                                    Expiry Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {expiryAlerts.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400">
                                        <CheckCircle2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p className="font-bold">No expiry alerts</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {expiryAlerts.map((alert, index) => (
                                            <div
                                                key={index}
                                                className={`
                                                    border-l-4 rounded-r-xl p-4 bg-white shadow-sm
                                                    ${alert.severity === 'critical' ? 'border-red-500 bg-red-50/50' : 'border-yellow-500 bg-yellow-50/50'}
                                                `}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-slate-900">{alert.medicineName}</p>
                                                        <p className="text-xs text-slate-500">Batch: {alert.batch}</p>
                                                    </div>
                                                    <Badge className={alert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}>
                                                        {alert.daysRemaining < 0
                                                            ? `Expired ${Math.abs(alert.daysRemaining)} days ago`
                                                            : `${alert.daysRemaining} days left`}
                                                    </Badge>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <p className="text-xs font-medium text-slate-600">
                                                        Prepare for: {alert.action.replace('_', ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Upload Ban List Section */}
                    {uploadSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center justify-between"
                        >
                            <span className="font-bold flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                Database Updated Successfully
                            </span>
                            <span className="text-sm">Now blocking {stats.totalBanned} medicines</span>
                        </motion.div>
                    )}

                    <Card className="border-2 border-slate-200 transition-all hover:border-slate-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5 text-primary" />
                                Ingest Regulatory Data
                            </CardTitle>
                            <CardDescription>
                                Upload CSV/Excel to instantly update ban lists. AI auto-detects column mapping.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 transition-all active:scale-[0.99]">
                                <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${isUploading ? 'text-blue-500 animate-bounce' : 'text-slate-400'}`} />
                                <p className="text-sm font-bold text-slate-700 mb-2">
                                    {isUploading ? "Analyzing CSV Structure..." : "Drag & Drop or Click to Browse"}
                                </p>
                                <input
                                    type="file"
                                    accept=".pdf,.xlsx,.csv,.txt"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="ban-list-upload"
                                />
                                <label htmlFor="ban-list-upload">
                                    <Button
                                        className="cursor-pointer"
                                        disabled={isUploading}
                                        type="button"
                                        onClick={() => document.getElementById('ban-list-upload')?.click()}
                                    >
                                        {isUploading ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                Parsing Data...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="h-4 w-4 mr-2" />
                                                Select File
                                            </>
                                        )}
                                    </Button>
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CHECKOUT DEMO TAB */}
                <TabsContent value="pos-demo">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Simulation Products */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-slate-50 border-2">
                                <CardHeader>
                                    <CardTitle>Products to Scan</CardTitle>
                                    <CardDescription>Click to simulate scanning at checkout</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {MOCK_PRODUCTS.map((p) => (
                                            <Button
                                                key={p.id}
                                                variant="outline"
                                                className="h-auto p-4 flex flex-col items-start gap-2 bg-white hover:border-primary border-2"
                                                onClick={() => addToCart(p)}
                                            >
                                                <div className="flex justify-between w-full">
                                                    <span className="font-bold text-lg">{p.name}</span>
                                                    <Badge variant="secondary">₹{p.price}</Badge>
                                                </div>
                                                <div className="text-xs text-slate-500 flex flex-col items-start gap-1">
                                                    <span>Code: {p.code}</span>
                                                    <span>Batch: {p.batch}</span>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-200">
                                💡 <strong>Demo Instructions:</strong> Try adding the "Banned Painkiller" or "Expired Cough Syrup". The system will intercept and BLOCK the transaction.
                            </div>
                        </div>

                        {/* Cart */}
                        <Card className="border-2 h-full flex flex-col">
                            <CardHeader className="bg-slate-100 border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    Current Bill
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-0">
                                {cart.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">
                                        <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        Cart is empty
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {cart.map((item, i) => (
                                            <div key={i} className="p-3 flex justify-between items-center hover:bg-slate-50">
                                                <div>
                                                    <p className="font-medium text-sm">{item.name}</p>
                                                    <p className="text-xs text-slate-500">₹{item.price}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-red-500"
                                                    onClick={() => setCart(cart.filter((_, idx) => idx !== i))}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            <div className="p-4 bg-slate-50 border-t mt-auto">
                                <div className="flex justify-between text-lg font-bold mb-4">
                                    <span>Total:</span>
                                    <span>₹{cart.reduce((sum, i) => sum + i.price, 0)}</span>
                                </div>
                                <Button className="w-full bg-green-600 hover:bg-green-700 font-bold" disabled={cart.length === 0}>
                                    Generate Invoice
                                </Button>
                            </div>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ComplianceDashboard;
