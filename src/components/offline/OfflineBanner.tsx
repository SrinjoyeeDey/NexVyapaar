import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudOff, RefreshCw, CheckCircle2, Wifi, Zap } from 'lucide-react';
import { useOfflineDemo } from '@/contexts/OfflineDemoContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const OfflineBanner: React.FC = () => {
    const { isOffline, syncStatus, syncProgress, toggleOffline, offlineQueue } = useOfflineDemo();

    if (!isOffline && syncStatus === 'idle') return null;

    return (
        <div className="w-full px-4 mb-4 z-40 relative">
            <AnimatePresence mode="wait">
                {isOffline && (
                    <motion.div
                        key="offline-banner"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="max-w-4xl mx-auto rounded-xl shadow-lg border border-yellow-400/50 backdrop-blur-md bg-yellow-50/90 overflow-hidden"
                    >
                        <div className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.8, 1, 0.8]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="p-2 bg-yellow-200 rounded-full text-yellow-700 shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                                >
                                    <CloudOff className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <h3 className="font-bold text-yellow-900 text-sm md:text-base">
                                        You are in Offline Mode
                                    </h3>
                                    <p className="text-xs text-yellow-700">
                                        All features working locally. Data will sync when online.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex gap-2 mr-4">
                                    <OfflineChip icon="🧾" count={offlineQueue.bills} label="Bills" delay={0.1} />
                                    <OfflineChip icon="📦" count={offlineQueue.inventoryActions} label="Inv Actions" delay={0.3} />
                                    <OfflineChip icon="🚚" count={offlineQueue.supplierActions} label="Suppliers" delay={0.5} />
                                </div>
                                <Button
                                    size="sm"
                                    onClick={toggleOffline}
                                    className="bg-yellow-600 hover:bg-yellow-700 text-white border-none shadow-md"
                                >
                                    <Wifi className="h-4 w-4 mr-2" />
                                    Restore Internet
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {syncStatus !== 'idle' && (
                    <motion.div
                        key="sync-banner"
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className={`max-w-4xl mx-auto rounded-xl shadow-lg border backdrop-blur-md overflow-hidden ${syncStatus === 'synced'
                            ? 'bg-green-50/90 border-green-400/50'
                            : 'bg-blue-50/90 border-blue-400/50'
                            }`}
                    >
                        <div className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                {syncStatus === 'syncing' ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="p-2 bg-blue-100 rounded-full text-blue-600"
                                    >
                                        <RefreshCw className="h-5 w-5" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: [0, 1.2, 1] }}
                                        className="p-2 bg-green-100 rounded-full text-green-600"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                    </motion.div>
                                )}

                                <div className="flex-1 max-w-md">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={`font-bold text-sm ${syncStatus === 'synced' ? 'text-green-900' : 'text-blue-900'
                                            }`}>
                                            {syncStatus === 'synced'
                                                ? 'All offline data synced successfully'
                                                : 'Internet Restored – Syncing Automatically...'}
                                        </h3>
                                        <span className="text-xs font-bold text-slate-500">{syncProgress}%</span>
                                    </div>
                                    {syncStatus === 'syncing' && (
                                        <Progress value={syncProgress} className="h-1.5 w-full bg-blue-200" indicatorClassName="bg-blue-600" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Mini Chip Component for the Banner
const OfflineChip: React.FC<{ icon: string; count: number; label: string; delay: number }> = ({ icon, count, label, delay }) => {
    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay }}
            className="flex items-center gap-2 bg-white/50 px-2 py-1 rounded-md text-xs font-medium text-yellow-900 border border-yellow-200/50"
        >
            <span>{icon}</span>
            <span className="font-bold">{count}</span>
            <span className="opacity-70">{label}</span>
        </motion.div>
    );
};
