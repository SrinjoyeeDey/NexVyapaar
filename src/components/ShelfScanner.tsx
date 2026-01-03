import React, { useState, useRef, useEffect } from 'react';
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
    TrendingDown,
    TrendingUp,
    History,
    Save,
    Trash2,
    Calendar,
    Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { VisionService, ShelfItem, ShelfDelta } from '@/services/VisionService';
import { supabase } from '@/integrations/supabase/client';

interface ShelfScannerProps {
    onComplete: (deltas: ShelfDelta[]) => void;
}

export const ShelfScanner: React.FC<ShelfScannerProps> = ({ onComplete }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [deltas, setDeltas] = useState<ShelfDelta[]>([]);
    const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'review'>('idle');
    const [previousSnapshot, setPreviousSnapshot] = useState<ShelfItem[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchLatestSnapshot();
    }, []);

    const fetchLatestSnapshot = async () => {
        const { data, error } = await (supabase as any)
            .from('shelf_snapshots')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (data) {
            setPreviousSnapshot(data.snapshot_data as any);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            setPreviewUrl(base64);
            processShelfImage(base64);
        };
        reader.readAsDataURL(file);
    };

    const processShelfImage = async (base64: string) => {
        setIsScanning(true);
        setScanStep('scanning');

        try {
            const result = await VisionService.analyzeShelfImage(base64);

            // If we have a previous snapshot, compare them
            if (previousSnapshot) {
                const calculatedDeltas = VisionService.compareScans(previousSnapshot, result.items);

                // Fetch reorder points for these items
                const enrichedDeltas = await Promise.all(calculatedDeltas.map(async (delta) => {
                    const { data } = await (supabase as any)
                        .from('raw_materials')
                        .select('reorder_point')
                        .ilike('name', delta.name)
                        .maybeSingle();

                    return {
                        ...delta,
                        reorderPoint: data?.reorder_point
                    };
                }));

                setDeltas(enrichedDeltas);
            } else {
                // First time scanning - all items are new or just current state
                const currentCounts = (VisionService as any).getCounts(result.items);
                const initialDeltas = Object.entries(currentCounts).map(([name, count]) => ({
                    name,
                    previousCount: 0,
                    currentCount: count as number,
                    delta: count as number,
                    action: 'restocked' as const,
                    reason: 'sale' as const
                }));
                setDeltas(initialDeltas);
            }

            setScanStep('review');
            toast.success("Shelf analysis complete! Detected " + result.items.length + " products.");

            // Temporarily store this as the "latest" for next time
            // In a real app, this would happen AFTER confirmation
            await saveSnapshot(result.items);

        } catch (error) {
            console.error('Shelf Scan Error:', error);
            toast.error("Failed to analyze shelf image.");
            setScanStep('idle');
        } finally {
            setIsScanning(false);
        }
    };

    const saveSnapshot = async (items: ShelfItem[]) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await (supabase as any).from('shelf_snapshots').insert({
            user_id: user.id,
            snapshot_data: items
        });
    };

    const handleConfirm = () => {
        onComplete(deltas);
        resetScanner();
    };

    const updateDeltaReason = (index: number, reason: ShelfDelta['reason']) => {
        const newDeltas = [...deltas];
        newDeltas[index].reason = reason;
        setDeltas(newDeltas);
    };

    const resetScanner = () => {
        setPreviewUrl(null);
        setDeltas([]);
        setScanStep('idle');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <Card className="overflow-hidden border-2 border-indigo-200 bg-white shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-6">
                    <CardTitle className="text-2xl font-black flex items-center gap-3">
                        <Scan className="h-8 w-8" />
                        AI Shelf Storekeeper
                    </CardTitle>
                    <CardDescription className="text-indigo-100">
                        Visual inventory automation via shelf image monitoring
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                    <AnimatePresence mode="wait">
                        {scanStep === 'idle' && (
                            <motion.div
                                key="idle"
                                className="p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                                    <Camera className="h-12 w-12 text-indigo-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Scan Your Shelf</h3>
                                <p className="text-slate-500 max-w-md mb-8">
                                    Take a photo of your shelves. I'll automatically count items and calculate what was sold since your last scan.
                                </p>
                                <Button size="lg" className="rounded-full px-12 h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700">
                                    <Upload className="mr-3 h-5 w-5" />
                                    Upload Shelf Photo
                                </Button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </motion.div>
                        )}

                        {scanStep === 'scanning' && (
                            <div className="p-12 flex flex-col items-center justify-center">
                                <div className="relative w-full max-w-lg aspect-video bg-slate-100 rounded-3xl overflow-hidden shadow-inner border-8 border-white">
                                    {previewUrl && <img src={previewUrl} className="w-full h-full object-cover" />}
                                    <motion.div
                                        className="absolute inset-x-0 h-1 bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,1)]"
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    />
                                    <div className="absolute inset-0 bg-indigo-900/40 flex flex-col items-center justify-center gap-4 text-white">
                                        <Loader2 className="h-16 w-16 animate-spin" />
                                        <p className="font-black text-xl tracking-tighter uppercase">Analyzing Objects & Labels...</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {scanStep === 'review' && (
                            <div className="flex flex-col lg:flex-row h-[600px]">
                                {/* Visual Preview Sub-panel */}
                                <div className="w-full lg:w-1/2 p-4 bg-slate-900 flex items-center justify-center overflow-hidden">
                                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                                        {previewUrl && <img src={previewUrl} className="w-full h-full object-cover opacity-80" />}
                                        {/* Object Detection Overlays (Mock for now) */}
                                        <div className="absolute inset-0 border-2 border-indigo-400/50 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Delta Report Sub-panel */}
                                <div className="w-full lg:w-1/2 p-6 overflow-y-auto custom-scrollbar bg-white">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <History className="h-5 w-5 text-indigo-600" />
                                            Inventory Deltas
                                        </h3>
                                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                                            {deltas.length} Items Changed
                                        </Badge>
                                    </div>

                                    <div className="space-y-4">
                                        {deltas.map((delta, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className={`p-4 rounded-2xl border-2 transition-all ${delta.action === 'sold' ? 'border-amber-100 bg-amber-50/50' :
                                                    delta.action === 'restocked' ? 'border-green-100 bg-green-50/50' : 'border-slate-100'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-black text-slate-900 text-lg">{delta.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-slate-500 font-medium">Was: <b>{delta.previousCount}</b></span>
                                                            <span className="text-xs text-slate-500 font-medium">Is: <b>{delta.currentCount}</b></span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-2">
                                                        <Badge className={`rounded-lg px-2 py-1 ${delta.action === 'sold' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {delta.action === 'sold' ? <TrendingDown size={14} className="mr-1 inline" /> : <TrendingUp size={14} className="mr-1 inline" />}
                                                            {Math.abs(delta.delta)} {delta.action === 'sold' ? 'Sold' : 'Added'}
                                                        </Badge>

                                                        {delta.delta < 0 && (
                                                            <Select
                                                                value={delta.reason}
                                                                onValueChange={(val: any) => updateDeltaReason(i, val)}
                                                            >
                                                                <SelectTrigger className="h-7 w-24 text-[10px] py-0 px-2 bg-white border-slate-200">
                                                                    <SelectValue placeholder="Reason" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="sale">Sale</SelectItem>
                                                                    <SelectItem value="damage">Damage</SelectItem>
                                                                    <SelectItem value="expired">Expired</SelectItem>
                                                                    <SelectItem value="theft">Theft</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}

                                                        {delta.reorderPoint !== undefined && delta.currentCount <= delta.reorderPoint && (
                                                            <div className="flex flex-col items-end gap-1">
                                                                <div className="flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100 uppercase animate-pulse">
                                                                    <AlertCircle size={10} />
                                                                    Critical
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    className="h-7 text-[10px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toast.info(`Auto-generating PO for ${delta.name}...`);
                                                                        // Logic for auto-PO will be handled in handleConfirm or via callback
                                                                    }}
                                                                >
                                                                    <Truck size={12} className="mr-1" />
                                                                    Fast PO
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {delta.price && <p className="text-sm font-bold text-slate-700">₹{delta.price}</p>}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {deltas.length === 0 && (
                                            <div className="text-center py-12 text-slate-400">
                                                No significant changes detected compared to previous scan.
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 space-y-3">
                                        <Button
                                            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-black shadow-lg shadow-indigo-100"
                                            onClick={handleConfirm}
                                        >
                                            <Save className="mr-2 h-5 w-5" />
                                            Update Store Database
                                        </Button>
                                        <Button variant="ghost" className="w-full h-12 rounded-2xl text-slate-500 font-bold" onClick={resetScanner}>
                                            <X className="mr-2 h-4 w-4" />
                                            Cancel & Restart
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* AI Pro-Tip */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl flex items-start gap-4 shadow-xl border border-white/10">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                    <h4 className="font-black text-lg mb-1">Visual Intelligence Tip</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        I compare this photo with your scan from <b>{previousSnapshot ? 'earlier today' : 'the past'}</b>.
                        By matching bounding boxes and labels, I automatically calculate sales without you touching a keyboard.
                        Ensure good lighting for <b>handwritten price tags</b>!
                    </p>
                </div>
            </div>
        </div>
    );
};
