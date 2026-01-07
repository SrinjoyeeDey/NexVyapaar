/**
 * ComplianceBlockModal - Red alert modal for compliance violations
 * 
 * Shows when attempting to sell banned/expired medicines
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ComplianceBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    medicine: {
        name: string;
        code?: string;
        batch?: string;
    };
    reason: string;
    message: string;
    actionLabel?: string;
}

export const ComplianceBlockModal: React.FC<ComplianceBlockModalProps> = ({
    isOpen,
    onClose,
    medicine,
    reason,
    message,
    actionLabel = 'Remove from Cart'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="w-full max-w-md"
                        >
                            <Card className="border-4 border-red-500 bg-white shadow-2xl shadow-red-500/50 overflow-hidden">
                                {/* Red Header with Animation */}
                                <motion.div
                                    className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white relative overflow-hidden"
                                    animate={{
                                        boxShadow: [
                                            '0 0 20px rgba(239, 68, 68, 0.5)',
                                            '0 0 40px rgba(239, 68, 68, 0.8)',
                                            '0 0 20px rgba(239, 68, 68, 0.5)'
                                        ]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <Shield className="h-8 w-8" />
                                            <h2 className="text-2xl font-black">⛔ SALE BLOCKED</h2>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="text-white/80 hover:text-white transition-colors"
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <p className="text-red-100 text-sm font-medium">Regulatory Compliance Violation</p>
                                </motion.div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    {/* Medicine Info */}
                                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                        <p className="text-sm font-bold text-red-600 mb-1">Medicine:</p>
                                        <p className="text-lg font-black text-red-900">{medicine.name}</p>
                                        {medicine.code && (
                                            <p className="text-xs text-red-600 mt-1">Code: {medicine.code}</p>
                                        )}
                                        {medicine.batch && (
                                            <p className="text-xs text-red-600">Batch: {medicine.batch}</p>
                                        )}
                                    </div>

                                    {/* Reason */}
                                    <div className="flex items-start gap-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-yellow-900 mb-1">Reason:</p>
                                            <p className="text-sm text-yellow-800">{reason}</p>
                                        </div>
                                    </div>

                                    {/* Bilingual Message */}
                                    <div className="space-y-2">
                                        <p className="text-lg font-bold text-slate-900 text-center">
                                            {message}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            onClick={onClose}
                                            className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-black text-base shadow-lg"
                                        >
                                            {actionLabel}
                                        </Button>
                                    </div>

                                    {/* Footer Note */}
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500">
                                            This check protects you from legal violations
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
