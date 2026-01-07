/**
 * ImageCacheService - Offline-first image storage using IndexedDB
 * 
 * Purpose: Store captured images locally before upload to ensure
 * zero data loss even in complete offline scenarios.
 */

interface CachedImage {
    id: string;
    base64: string;
    timestamp: string;
    shopId: string;
    context: 'inventory' | 'sales' | 'shelf';
    metadata: {
        size: number;
        format: string;
    };
    uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed';
    scanStatus: 'pending' | 'processing' | 'completed' | 'failed';
    retryCount: number;
    lastRetryAt?: string;
    errorMessage?: string;
    uploadProgress?: number; // 0-100
    scanResult?: any; // Store AI result when available
}

class ImageCacheService {
    private dbName = 'NexVyapaarImageCache';
    private storeName = 'images';
    private version = 1;
    private db: IDBDatabase | null = null;

    /**
     * Initialize IndexedDB connection
     */
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    objectStore.createIndex('uploadStatus', 'uploadStatus', { unique: false });
                    objectStore.createIndex('scanStatus', 'scanStatus', { unique: false });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                    objectStore.createIndex('context', 'context', { unique: false });
                }
            };
        });
    }

    /**
     * Ensure DB is initialized before operations
     */
    private async ensureInit(): Promise<IDBDatabase> {
        if (!this.db) {
            await this.init();
        }
        if (!this.db) {
            throw new Error('Failed to initialize IndexedDB');
        }
        return this.db;
    }

    /**
     * Generate unique image ID
     */
    private generateImageId(): string {
        return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Store a new image locally (offline-first capture)
     */
    async cacheImage(
        base64: string,
        context: 'inventory' | 'sales' | 'shelf',
        shopId: string = 'default'
    ): Promise<CachedImage> {
        const db = await this.ensureInit();

        // Extract format and calculate size
        const matches = base64.match(/^data:image\/([a-zA-Z]*);base64,/);
        const format = matches ? matches[1] : 'unknown';
        const size = Math.round((base64.length * 3) / 4); // Approximate base64 to bytes

        const cachedImage: CachedImage = {
            id: this.generateImageId(),
            base64,
            timestamp: new Date().toISOString(),
            shopId,
            context,
            metadata: {
                size,
                format,
            },
            uploadStatus: 'pending',
            scanStatus: 'pending',
            retryCount: 0,
        };

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.add(cachedImage);

            request.onsuccess = () => resolve(cachedImage);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get a single cached image by ID
     */
    async getImage(id: string): Promise<CachedImage | null> {
        const db = await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all images with a specific status
     */
    async getImagesByStatus(
        statusType: 'upload' | 'scan',
        status: string
    ): Promise<CachedImage[]> {
        const db = await this.ensureInit();
        const indexName = statusType === 'upload' ? 'uploadStatus' : 'scanStatus';

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const index = objectStore.index(indexName);
            const request = index.getAll(status);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all pending images (need upload or scan)
     */
    async getPendingImages(): Promise<CachedImage[]> {
        const db = await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.getAll();

            request.onsuccess = () => {
                const all = request.result;
                const pending = all.filter(
                    (img) =>
                        img.uploadStatus === 'pending' ||
                        img.uploadStatus === 'failed' ||
                        img.scanStatus === 'pending' ||
                        img.scanStatus === 'failed'
                );
                resolve(pending);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update image upload status
     */
    async updateUploadStatus(
        id: string,
        status: CachedImage['uploadStatus'],
        progress?: number,
        errorMessage?: string
    ): Promise<void> {
        const db = await this.ensureInit();
        const image = await this.getImage(id);

        if (!image) {
            throw new Error(`Image ${id} not found`);
        }

        image.uploadStatus = status;
        if (progress !== undefined) {
            image.uploadProgress = progress;
        }
        if (errorMessage) {
            image.errorMessage = errorMessage;
        }
        if (status === 'failed') {
            image.retryCount++;
            image.lastRetryAt = new Date().toISOString();
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.put(image);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update image scan status and store result
     */
    async updateScanStatus(
        id: string,
        status: CachedImage['scanStatus'],
        scanResult?: any,
        errorMessage?: string
    ): Promise<void> {
        const db = await this.ensureInit();
        const image = await this.getImage(id);

        if (!image) {
            throw new Error(`Image ${id} not found`);
        }

        image.scanStatus = status;
        if (scanResult) {
            image.scanResult = scanResult;
        }
        if (errorMessage) {
            image.errorMessage = errorMessage;
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.put(image);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Delete a cached image (cleanup after successful processing)
     */
    async deleteImage(id: string): Promise<void> {
        const db = await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Cleanup successfully processed images older than N days
     */
    async cleanupOldImages(daysToKeep: number = 7): Promise<number> {
        const db = await this.ensureInit();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.getAll();

            request.onsuccess = () => {
                const all = request.result;
                const toDelete = all.filter(
                    (img) =>
                        img.uploadStatus === 'uploaded' &&
                        img.scanStatus === 'completed' &&
                        new Date(img.timestamp) < cutoffDate
                );

                let deleteCount = 0;
                toDelete.forEach((img) => {
                    objectStore.delete(img.id);
                    deleteCount++;
                });

                resolve(deleteCount);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get cache statistics
     */
    async getCacheStats(): Promise<{
        total: number;
        pending: number;
        uploading: number;
        uploaded: number;
        failed: number;
        totalSize: number;
    }> {
        const db = await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.getAll();

            request.onsuccess = () => {
                const all = request.result;
                const stats = {
                    total: all.length,
                    pending: all.filter((img) => img.uploadStatus === 'pending').length,
                    uploading: all.filter((img) => img.uploadStatus === 'uploading').length,
                    uploaded: all.filter((img) => img.uploadStatus === 'uploaded').length,
                    failed: all.filter((img) => img.uploadStatus === 'failed').length,
                    totalSize: all.reduce((sum, img) => sum + img.metadata.size, 0),
                };
                resolve(stats);
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all cached images (use with caution)
     */
    async clearAll(): Promise<void> {
        const db = await this.ensureInit();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Export singleton instance
export const imageCacheService = new ImageCacheService();
export type { CachedImage };
