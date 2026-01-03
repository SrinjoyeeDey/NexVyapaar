import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    Upload,
    Scan,
    Check,
    X,
    Loader2,
    AlertCircle,
    Package,
    ShoppingCart,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { VisionService, KhataItem } from '@/services/VisionService';

interface KhataScannerProps {
    onDataExtracted: (items: KhataItem[]) => void;
    context?: 'inventory' | 'sales' | 'general';
}

export const KhataScanner: React.FC<KhataScannerProps> = ({ onDataExtracted, context = 'general' }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extractedItems, setExtractedItems] = useState<KhataItem[]>([]);
    const [scanStep, setScanStep] = useState<'idle' | 'uploading' | 'scanning' | 'review'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            setPreviewUrl(base64);
            processImage(base64);
        };
        reader.readAsDataURL(file);
    };

    const processImage = async (base64: string) => {
        setIsScanning(true);
        setScanStep('scanning');

        try {
            const items = await VisionService.analyzeHandwriting(base64);
            setExtractedItems(items);
            setScanStep('review');
            if (items.length === 0) {
                toast.warning("Could not extract any items. Please try a clearer picture of your handwriting.");
            } else {
                toast.success(`Extracted ${items.length} items from Khata!`);
            }
        } catch (error) {
            console.error('Scan Error:', error);
            toast.error("Failed to process image. Check your internet or Google Cloud credentials.");
            setScanStep('idle');
        } finally {
            setIsScanning(false);
        }
    };

    const handleConfirm = () => {
        onDataExtracted(extractedItems);
        resetScanner();
        toast.success("Data successfully synced with " + context);
    };

    const resetScanner = () => {
        setPreviewUrl(null);
        setExtractedItems([]);
        setScanStep('idle');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-white to-slate-50 shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-black flex items-center justify-center gap-2">
                        <Scan className="text-primary h-6 w-6" />
                        Smart Khata Scanner
                    </CardTitle>
                    <CardDescription>
                        Turn your handwritten ledgers into digital data instantly
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                    <AnimatePresence mode="wait">
                        {scanStep === 'idle' && (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-12 bg-white/50 hover:bg-slate-50 transition-colors cursor-pointer group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Camera className="text-primary h-10 w-10" />
                                </div>
                                <h3 className="font-bold text-xl mb-2">Capture or Upload Khata</h3>
                                <p className="text-slate-500 text-center max-w-sm mb-6">
                                    Take a photo of your handwritten page. Ensure it includes item names, quantities, and prices.
                                </p>
                                <Button size="lg" className="rounded-full px-8">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Select Image
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </motion.div>
                        )}

                        {scanStep === 'scanning' && (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="relative flex flex-col items-center justify-center p-8"
                            >
                                {previewUrl && (
                                    <div className="relative w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden mb-6 shadow-2xl border-4 border-white">
                                        <img src={previewUrl} alt="Khata Preview" className="w-full h-full object-cover grayscale opacity-50" />

                                        {/* Scanning Laser Line */}
                                        <motion.div
                                            className="absolute left-0 right-0 h-1 bg-primary/80 shadow-[0_0_15px_rgba(67,56,202,0.8)] z-20"
                                            initial={{ top: '0%' }}
                                            animate={{ top: '100%' }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        />

                                        <div className="absolute inset-0 bg-primary/10 flex flex-col items-center justify-center gap-4">
                                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                                            <p className="text-primary font-black uppercase tracking-widest bg-white/80 px-4 py-2 rounded-full">
                                                AI Vision Analyzing...
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <p className="text-slate-600 animate-pulse">
                                    Recognizing handwritten items, scales, and prices...
                                </p>
                            </motion.div>
                        )}

                        {scanStep === 'review' && (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-xl">Extracted Data</h3>
                                    <Badge variant="outline" className="text-primary border-primary">
                                        {extractedItems.length} Items Found
                                    </Badge>
                                </div>

                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {extractedItems.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`bg-white border p-4 rounded-2xl shadow-sm hover:shadow-md transition-all ${(!item.name || item.price === 0 || item.quantity === 0)
                                                ? 'border-red-200 bg-red-50/30'
                                                : 'border-slate-100'
                                                }`}
                                        >
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'sale' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            {item.type === 'sale' ? <ShoppingCart size={20} /> : <Package size={20} />}
                                                        </div>
                                                        <input
                                                            value={item.name}
                                                            onChange={(e) => {
                                                                const newItems = [...extractedItems];
                                                                newItems[idx].name = e.target.value;
                                                                setExtractedItems(newItems);
                                                            }}
                                                            className={`bg-transparent font-bold text-slate-900 border-none focus:ring-1 focus:ring-primary rounded px-2 py-1 w-full ${!item.name ? 'placeholder-red-400 bg-red-100/50' : ''}`}
                                                            placeholder="Item Name Required"
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                                                        onClick={() => setExtractedItems(extractedItems.filter((_, i) => i !== idx))}
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    <div>
                                                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Qty</label>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const newItems = [...extractedItems];
                                                                newItems[idx].quantity = parseFloat(e.target.value) || 0;
                                                                setExtractedItems(newItems);
                                                            }}
                                                            className={`w-full text-xs font-bold border rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary ${item.quantity === 0 ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Unit</label>
                                                        <input
                                                            value={item.unit}
                                                            onChange={(e) => {
                                                                const newItems = [...extractedItems];
                                                                newItems[idx].unit = e.target.value;
                                                                setExtractedItems(newItems);
                                                            }}
                                                            className="w-full text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary"
                                                            placeholder="kg/pc"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Price (₹)</label>
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => {
                                                                const newItems = [...extractedItems];
                                                                newItems[idx].price = parseFloat(e.target.value) || 0;
                                                                setExtractedItems(newItems);
                                                            }}
                                                            className={`w-full text-xs font-bold border rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary ${item.price === 0 ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Expiry Date</label>
                                                        <input
                                                            value={item.expiry_date || ''}
                                                            onChange={(e) => {
                                                                const newItems = [...extractedItems];
                                                                newItems[idx].expiry_date = e.target.value;
                                                                setExtractedItems(newItems);
                                                            }}
                                                            className={`w-full text-xs font-bold border rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary ${!item.expiry_date ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}
                                                            placeholder="DD-MM-YYYY"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1">Supplier (Optional)</label>
                                                        <input
                                                            value={item.supplier || ''}
                                                            onChange={(e) => {
                                                                const newItems = [...extractedItems];
                                                                newItems[idx].supplier = e.target.value;
                                                                setExtractedItems(newItems);
                                                            }}
                                                            className="w-full text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary"
                                                            placeholder="Supplier Name"
                                                        />
                                                    </div>
                                                </div>

                                                {(!item.name || item.price === 0 || item.quantity === 0) && (
                                                    <div className="flex items-center gap-1.5 text-red-600 text-[10px] font-bold uppercase animate-pulse">
                                                        <AlertCircle size={10} />
                                                        Requires Attention: Some details were not detected clearly.
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}

                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed border-2 py-8 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all text-sm font-bold"
                                        onClick={() => setExtractedItems([...extractedItems, {
                                            name: '',
                                            quantity: 0,
                                            unit: 'units',
                                            price: 0,
                                            date: new Date().toISOString().split('T')[0],
                                            type: context === 'sales' ? 'sale' : 'inventory'
                                        }])}
                                    >
                                        <Plus size={20} />
                                        Add Another Product Manually
                                    </Button>

                                    {extractedItems.length === 0 && (
                                        <div className="text-center py-12 text-slate-400 italic flex flex-col items-center">
                                            <AlertCircle size={48} className="mb-4 opacity-20" />
                                            We couldn't semantically identify any products.
                                            Try the manual button above or a clearer photo.
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-slate-100">
                                    <Button variant="outline" className="flex-1 rounded-full py-6 font-bold" onClick={resetScanner}>
                                        <X className="mr-2 h-4 w-4" />
                                        Clear & Retry
                                    </Button>
                                    <Button
                                        className="flex-1 rounded-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 font-bold shadow-lg shadow-indigo-200"
                                        onClick={handleConfirm}
                                        disabled={extractedItems.length === 0}
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Verify & Save to Inventory
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-indigo-200 rounded-full">
                    <Scan className="h-4 w-4 text-indigo-700" />
                </div>
                <div>
                    <p className="text-sm text-indigo-900 font-bold">Semantic Handwriting AI</p>
                    <p className="text-xs text-indigo-800 opacity-80 mt-1 leading-relaxed">
                        I now use <b>Semantic Reasoning</b> to understand your list. I automatically identify
                        dates, prices (₹), and quantities even if you don't use dashes.
                        Check the red fields and help me learn!
                    </p>
                </div>
            </div>
        </div>
    );
};
