import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useOfflineDemo } from '@/contexts/OfflineDemoContext';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, FileText, Package, Truck, CloudOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const OfflineActivityWidget: React.FC = () => {
    const { isOffline, offlineQueue } = useOfflineDemo();

    if (!isOffline) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
            >
                <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/30 overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                                <CloudOff className="h-5 w-5" />
                                Offline Activity Center
                            </CardTitle>
                            <Badge variant="outline" className="text-yellow-700 border-yellow-300 animate-pulse bg-yellow-100">
                                Local Storage Active
                            </Badge>
                        </div>
                        <CardDescription>
                            Your actions are being queued securely on this device
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <QueueCard
                                icon={FileText}
                                count={offlineQueue.bills}
                                label="Invoices Queued"
                                color="text-blue-600"
                                delay={0.1}
                            />
                            <QueueCard
                                icon={Package}
                                count={offlineQueue.inventoryActions}
                                label="Inventory Updates"
                                color="text-orange-600"
                                delay={0.2}
                            />
                            <QueueCard
                                icon={Truck}
                                count={offlineQueue.supplierActions}
                                label="Supplier Notes"
                                color="text-purple-600"
                                delay={0.3}
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
};

const QueueCard: React.FC<{ icon: any, count: number, label: string, color: string, delay: number }> = ({ icon: Icon, count, label, color, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-50 ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">{label}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 rounded">Stored</span>
                    </div>
                </div>
            </div>
            <span className="text-2xl font-black text-slate-800">{count}</span>
        </motion.div>
    );
};
