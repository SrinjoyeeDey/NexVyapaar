/**
 * ImageSyncStatus - Dashboard widget for monitoring pending uploads and scans
 * 
 * Purpose: Show users which images are pending upload/scan and provide
 * manual controls for retry and network quality monitoring.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CloudUpload,
    Wifi,
    WifiOff,
    RefreshCw,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Loader2,
    HardDrive
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { imageCacheService, CachedImage } from '@/services/ImageCacheService';
import { networkAwarenessService, NetworkQuality } from '@/services/NetworkAwarenessService';
import { progressiveUploadService } from '@/services/ProgressiveUploadService';
import { userMessageService } from '@/services/UserMessageService';

export const ImageSyncStatus: React.FC = () => {
    const [pendingImages, setPendingImages] = useState<CachedImage[]>([]);
    const [networkQuality, setNetworkQuality] = useState<NetworkQuality>(
        networkAwarenessService.getCurrentQuality()
    );
    const [cacheStats, setCacheStats] = useState({
        total: 0,
        pending: 0,
        uploading: 0,
        uploaded: 0,
        failed: 0,
        totalSize: 0,
    });
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Load pending images and stats
    const loadData = async () => {
        const pending = await imageCacheService.getPendingImages();
        const stats = await imageCacheService.getCacheStats();
        setPendingImages(pending);
        setCacheStats(stats);
    };

    useEffect(() => {
        loadData();

        // Monitor network quality
        const unsubscribe = networkAwarenessService.subscribe((quality) => {
            setNetworkQuality(quality);
        });

        // Refresh data every 10 seconds
        const interval = setInterval(loadData, 10000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    // Manual retry for single image
    const handleRetry = async (imageId: string) => {
        try {
            toast.info(userMessageService.formatMessage('uploading'));
            await progressiveUploadService.queueUpload(imageId);
            await loadData();
        } catch (error) {
            toast.error('Retry failed');
        }
    };

    // Retry all pending
    const handleRetryAll = async () => {
        setIsRefreshing(true);
        try {
            const result = await progressiveUploadService.uploadAllPending();
            toast.success(`${result.succeeded} uploaded, ${result.failed} failed`);
            await loadData();
        } catch (error) {
            toast.error('Batch retry failed');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Delete single image from cache
    const handleDelete = async (imageId: string) => {
        try {
            await imageCacheService.deleteImage(imageId);
            toast.success('Image removed from cache');
            await loadData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    // Format file size
    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Network quality indicator
    const NetworkIndicator = () => {
        const getColor = () => {
            switch (networkQuality.rating) {
                case 'excellent': return 'text-green-600 bg-green-100';
                case 'good': return 'text-green-500 bg-green-50';
                case 'fair': return 'text-yellow-600 bg-yellow-100';
                case 'poor': return 'text-orange-600 bg-orange-100';
                case 'offline': return 'text-red-600 bg-red-100';
            }
        };

        const getIcon = () => {
            if (networkQuality.rating === 'offline') return <WifiOff className="h-4 w-4" />;
            return <Wifi className="h-4 w-4" />;
        };

        return (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${getColor()}`}>
                {getIcon()}
                <span className="text-sm font-bold">
                    {networkQuality.message}
                </span>
                <span className="text-xs opacity-70">
                    ({networkQuality.score}/100)
                </span>
            </div>
        );
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-primary" />
                        Image Sync Status
                    </CardTitle>
                    <NetworkIndicator />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900">{cacheStats.pending}</div>
                        <div className="text-xs text-slate-600">Pending Upload</div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-900">{cacheStats.uploading}</div>
                        <div className="text-xs text-blue-600">Uploading</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-900">{cacheStats.uploaded}</div>
                        <div className="text-xs text-green-600">Uploaded</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-red-900">{cacheStats.failed}</div>
                        <div className="text-xs text-red-600">Failed</div>
                    </div>
                </div>

                {/* Cache Size */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Cache Size:</span>
                    <span className="font-bold">{formatSize(cacheStats.totalSize)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={handleRetryAll}
                        disabled={pendingImages.length === 0 || !networkQuality.recommendUpload || isRefreshing}
                        size="sm"
                        className="flex-1"
                    >
                        {isRefreshing ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Syncing...</>
                        ) : (
                            <><RefreshCw className="h-4 w-4 mr-2" /> Retry All</>
                        )}
                    </Button>
                    <Button
                        onClick={loadData}
                        variant="outline"
                        size="sm"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>

                {/* Pending Images List */}
                {pendingImages.length > 0 ? (
                    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                        <div className="space-y-3">
                            {pendingImages.map((image) => (
                                <motion.div
                                    key={image.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-white border rounded-lg p-3 space-y-2"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant={
                                                    image.uploadStatus === 'pending' ? 'secondary' :
                                                        image.uploadStatus === 'uploading' ? 'default' :
                                                            image.uploadStatus === 'failed' ? 'destructive' :
                                                                'outline'
                                                }>
                                                    {image.uploadStatus}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {image.context}
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {new Date(image.timestamp).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {formatSize(image.metadata.size)} • {image.metadata.format}
                                            </div>
                                        </div>

                                        <div className="flex gap-1">
                                            {image.uploadStatus === 'failed' && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    onClick={() => handleRetry(image.id)}
                                                    disabled={!networkQuality.recommendUpload}
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                                onClick={() => handleDelete(image.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {image.uploadProgress !== undefined && image.uploadProgress > 0 && (
                                        <div className="space-y-1">
                                            <Progress value={image.uploadProgress} className="h-2" />
                                            <div className="text-xs text-slate-500 text-right">
                                                {image.uploadProgress}% uploaded
                                            </div>
                                        </div>
                                    )}

                                    {image.errorMessage && (
                                        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                            <span>{image.errorMessage}</span>
                                        </div>
                                    )}

                                    {image.scanStatus === 'completed' && (
                                        <div className="flex items-center gap-2 text-xs text-green-600">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Scan completed
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center py-8 text-slate-400">
                        <CloudUpload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                            {userMessageService.formatMessage('backgroundSyncComplete').split('/')[1].trim()}
                        </p>
                    </div>
                )}

                {/* Network Recommendation */}
                {pendingImages.length > 0 && !networkQuality.recommendUpload && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-900">
                                <div className="font-bold mb-1">
                                    {userMessageService.getNetworkQualityMessage(networkQuality.rating).hindi}
                                </div>
                                <div className="text-xs opacity-80">
                                    Uploads will resume automatically when network improves
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
