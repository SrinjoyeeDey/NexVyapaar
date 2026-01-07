/**
 * NetworkAwarenessService - Intelligent network monitoring and stability scoring
 * 
 * Purpose: Detect network quality to make smart decisions about when to upload
 * and provide user feedback about connectivity status.
 */

interface NetworkStatus {
    isOnline: boolean;
    effectiveType: string; // 'slow-2g' | '2g' | '3g' | '4g'
    downlink: number; // Mbps
    rtt: number; // Round-trip time in ms
    saveData: boolean;
}

interface NetworkQuality {
    score: number; // 0-100
    rating: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
    recommendUpload: boolean;
    message: string;
}

type NetworkChangeCallback = (quality: NetworkQuality) => void;

class NetworkAwarenessService {
    private listeners: Set<NetworkChangeCallback> = new Set();
    private currentQuality: NetworkQuality = {
        score: 100,
        rating: 'excellent',
        recommendUpload: true,
        message: 'Network stable',
    };

    private pingHistory: number[] = [];
    private maxHistorySize = 10;
    private pingInterval: number | null = null;
    private isMonitoring = false;

    constructor() {
        this.setupEventListeners();
    }

    /**
     * Setup browser network event listeners
     */
    private setupEventListeners(): void {
        // Online/Offline events
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));

        // Network Information API (if available)
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            connection?.addEventListener('change', () => this.updateNetworkQuality());
        }
    }

    /**
     * Handle connection status change
     */
    private handleConnectionChange(isOnline: boolean): void {
        if (!isOnline) {
            this.currentQuality = {
                score: 0,
                rating: 'offline',
                recommendUpload: false,
                message: 'No internet connection',
            };
            this.notifyListeners();
        } else {
            // Back online, recalculate quality
            this.updateNetworkQuality();
        }
    }

    /**
     * Get current network status from browser APIs
     */
    private getNetworkStatus(): NetworkStatus {
        const connection = (navigator as any).connection;

        return {
            isOnline: navigator.onLine,
            effectiveType: connection?.effectiveType || '4g',
            downlink: connection?.downlink || 10,
            rtt: connection?.rtt || 50,
            saveData: connection?.saveData || false,
        };
    }

    /**
     * Perform a network ping test
     */
    private async performPing(): Promise<number> {
        const startTime = Date.now();

        try {
            // Ping a small resource (1x1 pixel image) with cache-busting
            const response = await fetch(
                `https://www.google.com/favicon.ico?t=${Date.now()}`,
                {
                    method: 'HEAD',
                    cache: 'no-cache',
                    mode: 'no-cors',
                }
            );

            const endTime = Date.now();
            return endTime - startTime;
        } catch (error) {
            // If ping fails, return high latency
            return 5000;
        }
    }

    /**
     * Calculate network quality score based on multiple factors
     */
    private calculateQualityScore(status: NetworkStatus, avgPing: number): number {
        if (!status.isOnline) return 0;

        let score = 100;

        // Factor 1: Effective connection type (40 points)
        const typeScores: Record<string, number> = {
            '4g': 40,
            '3g': 25,
            '2g': 10,
            'slow-2g': 5,
        };
        score -= 40 - (typeScores[status.effectiveType] || 40);

        // Factor 2: RTT/Latency (30 points)
        const rtt = avgPing > 0 ? avgPing : status.rtt;
        if (rtt < 100) score -= 0;
        else if (rtt < 300) score -= 10;
        else if (rtt < 500) score -= 20;
        else score -= 30;

        // Factor 3: Bandwidth (30 points)
        if (status.downlink >= 5) score -= 0;
        else if (status.downlink >= 2) score -= 10;
        else if (status.downlink >= 1) score -= 20;
        else score -= 30;

        // Data saver mode penalty
        if (status.saveData) score -= 15;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Get quality rating from score
     */
    private getQualityRating(score: number): NetworkQuality['rating'] {
        if (score === 0) return 'offline';
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    }

    /**
     * Get user-friendly message based on quality
     */
    private getQualityMessage(rating: NetworkQuality['rating']): string {
        const messages = {
            excellent: 'Network stable',
            good: 'Good connection',
            fair: 'Weak network',
            poor: 'Very weak network',
            offline: 'No internet',
        };
        return messages[rating];
    }

    /**
     * Update network quality assessment
     */
    private async updateNetworkQuality(): Promise<void> {
        const status = this.getNetworkStatus();

        // Calculate average ping from history
        const avgPing =
            this.pingHistory.length > 0
                ? this.pingHistory.reduce((a, b) => a + b, 0) / this.pingHistory.length
                : 0;

        const score = this.calculateQualityScore(status, avgPing);
        const rating = this.getQualityRating(score);

        this.currentQuality = {
            score,
            rating,
            recommendUpload: score >= 40, // Recommend upload if score >= 40 (fair or better)
            message: this.getQualityMessage(rating),
        };

        this.notifyListeners();
    }

    /**
     * Start continuous monitoring with periodic pings
     */
    startMonitoring(intervalMs: number = 30000): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;

        // Initial quality check
        this.updateNetworkQuality();

        // Periodic ping tests
        this.pingInterval = window.setInterval(async () => {
            const ping = await this.performPing();

            // Add to history
            this.pingHistory.push(ping);
            if (this.pingHistory.length > this.maxHistorySize) {
                this.pingHistory.shift();
            }

            // Update quality
            await this.updateNetworkQuality();
        }, intervalMs);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring(): void {
        if (this.pingInterval !== null) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
        this.isMonitoring = false;
    }

    /**
     * Get current network quality
     */
    getCurrentQuality(): NetworkQuality {
        return { ...this.currentQuality };
    }

    /**
     * Check if upload should proceed based on current quality
     */
    shouldUploadNow(): boolean {
        return this.currentQuality.recommendUpload;
    }

    /**
     * Subscribe to network quality changes
     */
    subscribe(callback: NetworkChangeCallback): () => void {
        this.listeners.add(callback);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
        };
    }

    /**
     * Notify all listeners of quality change
     */
    private notifyListeners(): void {
        this.listeners.forEach((callback) => {
            try {
                callback(this.currentQuality);
            } catch (error) {
                console.error('Error in network quality listener:', error);
            }
        });
    }

    /**
     * Wait for good network quality (useful for uploads)
     */
    async waitForGoodNetwork(
        timeoutMs: number = 30000,
        minScore: number = 40
    ): Promise<boolean> {
        return new Promise((resolve) => {
            // Check immediately
            if (this.currentQuality.score >= minScore) {
                resolve(true);
                return;
            }

            const timeout = setTimeout(() => {
                unsubscribe();
                resolve(false);
            }, timeoutMs);

            const unsubscribe = this.subscribe((quality) => {
                if (quality.score >= minScore) {
                    clearTimeout(timeout);
                    unsubscribe();
                    resolve(true);
                }
            });
        });
    }

    /**
     * Get estimated upload time for a file size (in bytes)
     */
    getEstimatedUploadTime(sizeBytes: number): number {
        const status = this.getNetworkStatus();

        if (!status.isOnline || status.downlink === 0) {
            return Infinity;
        }

        // Convert Mbps to bytes per second
        const bytesPerSecond = (status.downlink * 1024 * 1024) / 8;

        // Add latency overhead
        const uploadTimeSeconds = sizeBytes / bytesPerSecond;
        const latencyOverhead = (status.rtt / 1000) * 2; // Round-trip

        return uploadTimeSeconds + latencyOverhead;
    }

    /**
     * Get human-readable upload time estimate
     */
    getUploadTimeEstimate(sizeBytes: number): string {
        const seconds = this.getEstimatedUploadTime(sizeBytes);

        if (seconds === Infinity) return 'Offline';
        if (seconds < 5) return 'Few seconds';
        if (seconds < 30) return 'Half a minute';
        if (seconds < 60) return 'About a minute';
        if (seconds < 300) return `${Math.ceil(seconds / 60)} minutes`;
        return 'Several minutes';
    }
}

// Export singleton instance
export const networkAwarenessService = new NetworkAwarenessService();
export type { NetworkQuality, NetworkStatus };
