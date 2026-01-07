import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useOfflineDemo } from '@/contexts/OfflineDemoContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, FileText, Package, Truck, ArrowRight } from 'lucide-react';

export const PostSyncReportWidget: React.FC = () => {
    const { syncedData, syncStatus, isOffline } = useOfflineDemo();

    if (isOffline || !syncedData) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                className="mb-8"
            >
                <Card className="bg-green-50 border-green-200 overflow-hidden relative">
                    {/* Decorative background pattern */}
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-green-100 opacity-50 blur-xl"></div>

                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">

                            <div className="flex items-center gap-4 flex-1">
                                <div className="p-3 bg-green-100 rounded-full text-green-600 shadow-sm animate-in zoom-in duration-500">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-green-900 text-lg">Sync Complete</h3>
                                    <p className="text-sm text-green-700">
                                        Just now · {syncedData.bills + syncedData.inventoryActions + syncedData.supplierActions} items processed successfully
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <SyncStat icon={FileText} label="Invoices" value={syncedData.bills} delay={0.1} />
                                <SyncStat icon={Package} label="Inventory" value={syncedData.inventoryActions} delay={0.2} />
                                <SyncStat icon={Truck} label="Suppliers" value={syncedData.supplierActions} delay={0.3} />
                            </div>

                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
};

const SyncStat: React.FC<{ icon: any, label: string, value: number, delay: number }> = ({ icon: Icon, label, value, delay }) => {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay }}
            className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg border border-green-100/50"
        >
            <div className="p-1.5 bg-green-100 rounded text-green-700">
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-green-800 font-bold uppercase tracking-wider">{label}</span>
                <span className="font-black text-green-900 text-lg leading-none">+{value}</span>
            </div>
        </motion.div>
    )
}
