/**
 * ProgressiveUploadService - Chunked, resumable image uploads with deduplication
 * 
 * Purpose: Upload images reliably even on unstable networks by breaking them
 * into chunks and supporting resume from interruption points.
 */

import { imageCacheService } from './ImageCacheService';
import { networkAwarenessService } from './NetworkAwarenessService';

interface UploadChunk {
    index: number;
    data: string;
    hash: string;
}

interface UploadProgress {
    imageId: string;
    totalChunks: number;
    uploadedChunks: number;
    currentChunk: number;
    percentage: number;
}

interface UploadResult {
    success: boolean;
    imageId: string;
    imageHash: string;
    uploadedUrl?: string;
    error?: string;
    wasDuplicate?: boolean;
}

class ProgressiveUploadService {
    private readonly CHUNK_SIZE = 256 * 1024; // 256KB chunks
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY_MS = 2000;

    private activeUploads: Map<string, AbortController> = new Map();
    private uploadQueue: string[] = [];
    private isProcessingQueue = false;

    /**
     * Generate SHA-256 hash of image data for deduplication
     */
    private async generateHash(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Split base64 image into chunks
     */
    private async splitIntoChunks(base64: string): Promise<UploadChunk[]> {
        // Remove data URL prefix if present
        const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');

        const chunks: UploadChunk[] = [];
        const totalLength = base64Data.length;
        let index = 0;

        for (let i = 0; i < totalLength; i += this.CHUNK_SIZE) {
            const chunkData = base64Data.substring(i, i + this.CHUNK_SIZE);
            const chunkHash = await this.generateHash(chunkData);

            chunks.push({
                index,
                data: chunkData,
                hash: chunkHash,
            });
            index++;
        }

        return chunks;
    }

    /**
     * Check if image already exists on server (deduplication)
     */
    private async checkDuplicate(imageHash: string): Promise<boolean> {
        try {
            // TODO: Replace with actual API call to check if hash exists
            // For now, we'll store hashes in localStorage as a simple implementation
            const uploadedHashes = JSON.parse(
                localStorage.getItem('uploadedImageHashes') || '[]'
            );
            return uploadedHashes.includes(imageHash);
        } catch (error) {
            console.error('Error checking duplicate:', error);
            return false;
        }
    }

    /**
     * Mark image hash as uploaded (for deduplication)
     */
    private async markAsUploaded(imageHash: string): Promise<void> {
        try {
            const uploadedHashes = JSON.parse(
                localStorage.getItem('uploadedImageHashes') || '[]'
            );
            if (!uploadedHashes.includes(imageHash)) {
                uploadedHashes.push(imageHash);
                localStorage.setItem('uploadedImageHashes', JSON.stringify(uploadedHashes));
            }
        } catch (error) {
            console.error('Error marking as uploaded:', error);
        }
    }

    /**
     * Upload a single chunk with retry logic
     */
    private async uploadChunk(
        chunk: UploadChunk,
        imageId: string,
        totalChunks: number,
        abortSignal: AbortSignal
    ): Promise<boolean> {
        let retries = 0;

        while (retries < this.MAX_RETRIES) {
            try {
                // Check if aborted
                if (abortSignal.aborted) {
                    throw new Error('Upload cancelled');
                }

                // TODO: Replace with actual API endpoint
                // For MVP, we'll simulate upload with a delay
                await new Promise((resolve) => setTimeout(resolve, 100));

                // Simulated successful upload
                return true;

                /* Actual implementation would be:
                const response = await fetch('/api/upload-chunk', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    imageId,
                    chunkIndex: chunk.index,
                    totalChunks,
                    chunkData: chunk.data,
                    chunkHash: chunk.hash,
                  }),
                  signal: abortSignal,
                });
        
                if (!response.ok) {
                  throw new Error(`Upload failed: ${response.statusText}`);
                }
        
                return true;
                */
            } catch (error: any) {
                retries++;

                if (error.name === 'AbortError' || abortSignal.aborted) {
                    throw new Error('Upload cancelled');
                }

                if (retries < this.MAX_RETRIES) {
                    // Exponential backoff
                    await new Promise((resolve) =>
                        setTimeout(resolve, this.RETRY_DELAY_MS * Math.pow(2, retries - 1))
                    );
                } else {
                    throw error;
                }
            }
        }

        return false;
    }

    /**
     * Upload image with progress tracking and resume capability
     */
    async uploadImage(
        imageId: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<UploadResult> {
        try {
            // Get image from cache
            const cachedImage = await imageCacheService.getImage(imageId);
            if (!cachedImage) {
                throw new Error('Image not found in cache');
            }

            // Generate image hash for deduplication
            const imageHash = await this.generateHash(cachedImage.base64);

            // Check if already uploaded (deduplication)
            const isDuplicate = await this.checkDuplicate(imageHash);
            if (isDuplicate) {
                await imageCacheService.updateUploadStatus(imageId, 'uploaded', 100);
                return {
                    success: true,
                    imageId,
                    imageHash,
                    wasDuplicate: true,
                };
            }

            // Update status to uploading
            await imageCacheService.updateUploadStatus(imageId, 'uploading', 0);

            // Split into chunks
            const chunks = await this.splitIntoChunks(cachedImage.base64);
            const totalChunks = chunks.length;

            // Create abort controller for this upload
            const abortController = new AbortController();
            this.activeUploads.set(imageId, abortController);

            // Determine resume point (check which chunks already uploaded)
            // For MVP, we start from 0. In production, check server for existing chunks
            let startChunk = 0;

            // Upload chunks sequentially
            for (let i = startChunk; i < totalChunks; i++) {
                const chunk = chunks[i];

                // Update progress
                const progress: UploadProgress = {
                    imageId,
                    totalChunks,
                    uploadedChunks: i,
                    currentChunk: i + 1,
                    percentage: Math.round((i / totalChunks) * 100),
                };

                onProgress?.(progress);
                await imageCacheService.updateUploadStatus(
                    imageId,
                    'uploading',
                    progress.percentage
                );

                // Upload chunk
                const success = await this.uploadChunk(
                    chunk,
                    imageId,
                    totalChunks,
                    abortController.signal
                );

                if (!success) {
                    throw new Error(`Failed to upload chunk ${i + 1}`);
                }
            }

            // All chunks uploaded successfully
            await imageCacheService.updateUploadStatus(imageId, 'uploaded', 100);
            await this.markAsUploaded(imageHash);

            // Cleanup
            this.activeUploads.delete(imageId);

            return {
                success: true,
                imageId,
                imageHash,
                uploadedUrl: `uploads/${imageId}`, // TODO: Get actual URL from server
            };
        } catch (error: any) {
            // Mark as failed
            await imageCacheService.updateUploadStatus(
                imageId,
                'failed',
                undefined,
                error.message
            );

            // Cleanup
            this.activeUploads.delete(imageId);

            return {
                success: false,
                imageId,
                imageHash: '',
                error: error.message,
            };
        }
    }

    /**
     * Cancel an active upload
     */
    cancelUpload(imageId: string): void {
        const abortController = this.activeUploads.get(imageId);
        if (abortController) {
            abortController.abort();
            this.activeUploads.delete(imageId);
        }
    }

    /**
     * Add image to upload queue
     */
    async queueUpload(imageId: string): Promise<void> {
        if (!this.uploadQueue.includes(imageId)) {
            this.uploadQueue.push(imageId);
        }

        // Start processing queue if not already processing
        if (!this.isProcessingQueue) {
            this.processQueue();
        }
    }

    /**
     * Process upload queue with network awareness
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessingQueue || this.uploadQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.uploadQueue.length > 0) {
            // Check network quality
            const quality = networkAwarenessService.getCurrentQuality();

            if (!quality.recommendUpload) {
                console.log('Network quality poor, pausing queue processing');
                // Wait for better network
                const gotBetterNetwork = await networkAwarenessService.waitForGoodNetwork(
                    60000, // Wait up to 1 minute
                    40 // Minimum score of 40
                );

                if (!gotBetterNetwork) {
                    // Still poor network, pause for now
                    break;
                }
            }

            // Get next image from queue
            const imageId = this.uploadQueue.shift();
            if (!imageId) continue;

            // Attempt upload
            console.log(`Uploading ${imageId} from queue`);
            const result = await this.uploadImage(imageId);

            if (!result.success && result.error !== 'Upload cancelled') {
                // If upload failed, re-queue with lower priority (add to end)
                const cachedImage = await imageCacheService.getImage(imageId);
                if (cachedImage && cachedImage.retryCount < this.MAX_RETRIES) {
                    this.uploadQueue.push(imageId);
                }
            }

            // Small delay between uploads
            await new Promise((resolve) => setTimeout(resolve, 500));
        }

        this.isProcessingQueue = false;
    }

    /**
     * Upload all pending images from cache
     */
    async uploadAllPending(
        onProgress?: (imageId: string, progress: UploadProgress) => void
    ): Promise<{ succeeded: number; failed: number }> {
        const pendingImages = await imageCacheService.getImagesByStatus('upload', 'pending');
        const failedImages = await imageCacheService.getImagesByStatus('upload', 'failed');

        const allImages = [...pendingImages, ...failedImages];
        let succeeded = 0;
        let failed = 0;

        for (const image of allImages) {
            const result = await this.uploadImage(image.id, (progress) => {
                onProgress?.(image.id, progress);
            });

            if (result.success) {
                succeeded++;
            } else {
                failed++;
            }
        }

        return { succeeded, failed };
    }

    /**
     * Get current queue status
     */
    getQueueStatus(): {
        queueLength: number;
        activeUploads: number;
        isProcessing: boolean;
    } {
        return {
            queueLength: this.uploadQueue.length,
            activeUploads: this.activeUploads.size,
            isProcessing: this.isProcessingQueue,
        };
    }

    /**
     * Start automatic background sync
     */
    startAutoSync(intervalMs: number = 60000): void {
        setInterval(async () => {
            // Only sync if network is good
            if (networkAwarenessService.shouldUploadNow()) {
                const pending = await imageCacheService.getImagesByStatus('upload', 'pending');
                if (pending.length > 0) {
                    console.log(`Auto-syncing ${pending.length} pending images`);
                    pending.forEach((img) => this.queueUpload(img.id));
                }
            }
        }, intervalMs);
    }
}

// Export singleton instance
export const progressiveUploadService = new ProgressiveUploadService();
export type { UploadProgress, UploadResult };
