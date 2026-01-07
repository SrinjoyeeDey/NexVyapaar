/**
 * UserMessageService - Centralized user-friendly messaging system
 * 
 * Purpose: Provide shopkeeper-friendly messages in Hindi and English,
 * avoiding all technical jargon and error codes.
 */

export interface UserMessage {
    hindi: string;
    english: string;
    icon?: string;
    type?: 'success' | 'info' | 'warning' | 'error';
}

class UserMessageService {
    // Bilingual message templates
    private readonly messages = {
        // Image Capture
        imageCaptured: {
            hindi: 'फोटो सुरक्षित।',
            english: 'Saved safely.',
            icon: '✓',
            type: 'success' as const,
        },

        // Upload Status
        uploadPending: {
            hindi: 'नेटवर्क ठीक होने पर अपलोड होगा।',
            english: 'Will sync when network improves.',
            icon: '⏳',
            type: 'info' as const,
        },

        uploading: {
            hindi: 'अपलोड हो रहा है...',
            english: 'Uploading...',
            icon: '⬆️',
            type: 'info' as const,
        },

        uploadComplete: {
            hindi: 'अपलोड पूर्ण।',
            english: 'Upload complete.',
            icon: '✓',
            type: 'success' as const,
        },

        // Scan Status
        scanComplete: {
            hindi: 'स्कैन पूर्ण ✓',
            english: 'Scan complete ✓',
            icon: '✓',
            type: 'success' as const,
        },

        scanProcessing: {
            hindi: 'स्कैन हो रहा है...',
            english: 'Scanning...',
            icon: '🔍',
            type: 'info' as const,
        },

        scanFailed: {
            hindi: 'स्कैन अधूरा। मैन्युअल एंट्री उपलब्ध।',
            english: 'Scan incomplete. Manual entry available.',
            icon: '⚠️',
            type: 'warning' as const,
        },

        // Confirmation Needed
        confirmLowConfidence: {
            hindi: 'कृपया जांचें:',
            english: 'Please confirm:',
            icon: '👀',
            type: 'warning' as const,
        },

        confirmHighConfidence: {
            hindi: 'ये सही है?',
            english: 'Does this look correct?',
            icon: '✓',
            type: 'info' as const,
        },

        // Network Status
        networkWeak: {
            hindi: 'नेटवर्क कमजोर है। बाद में सिंक होगा।',
            english: 'Weak network. Will sync later.',
            icon: '📶',
            type: 'warning' as const,
        },

        networkOffline: {
            hindi: 'ऑफलाइन। फोटो सुरक्षित है।',
            english: 'Offline. Photo saved safely.',
            icon: '📴',
            type: 'info' as const,
        },

        networkGood: {
            hindi: 'नेटवर्क अच्छा है।',
            english: 'Network stable.',
            icon: '📶',
            type: 'success' as const,
        },

        // Inventory Updates
        inventoryUpdated: {
            hindi: 'इन्वेंटरी अपडेट हो गई।',
            english: 'Inventory updated.',
            icon: '✓',
            type: 'success' as const,
        },

        inventoryUpdateFailed: {
            hindi: 'अपडेट नहीं हुआ। बाद में कोशिश करें।',
            english: 'Update failed. Will retry later.',
            icon: '⚠️',
            type: 'warning' as const,
        },

        // Background Sync
        backgroundSyncComplete: {
            hindi: 'पुराने स्कैन सिंक हो गए।',
            english: 'Previous scans synced.',
            icon: '✓',
            type: 'success' as const,
        },

        // Manual Entry
        manualEntryAvailable: {
            hindi: 'मैन्युअल एंट्री करें।',
            english: 'Enter manually.',
            icon: '✍️',
            type: 'info' as const,
        },

        // General
        tryAgain: {
            hindi: 'फिर से कोशिश करें।',
            english: 'Try again.',
            icon: '🔄',
            type: 'info' as const,
        },

        success: {
            hindi: 'सफल!',
            english: 'Success!',
            icon: '✓',
            type: 'success' as const,
        },
    };

    /**
     * Get a message by key
     */
    getMessage(key: keyof typeof this.messages): UserMessage {
        return this.messages[key];
    }

    /**
     * Format message for display (both languages)
     */
    formatMessage(key: keyof typeof this.messages): string {
        const msg = this.messages[key];
        return `${msg.icon ? msg.icon + ' ' : ''}${msg.hindi} / ${msg.english}`;
    }

    /**
     * Get Hindi-only message
     */
    getHindi(key: keyof typeof this.messages): string {
        const msg = this.messages[key];
        return `${msg.icon ? msg.icon + ' ' : ''}${msg.hindi}`;
    }

    /**
     * Get English-only message
     */
    getEnglish(key: keyof typeof this.messages): string {
        const msg = this.messages[key];
        return `${msg.icon ? msg.icon + ' ' : ''}${msg.english}`;
    }

    /**
     * Create a custom bilingual message
     */
    createMessage(hindi: string, english: string, icon?: string, type?: UserMessage['type']): string {
        return `${icon ? icon + ' ' : ''}${hindi} / ${english}`;
    }

    /**
     * Get upload progress message
     */
    getUploadProgressMessage(current: number, total: number): UserMessage {
        return {
            hindi: `अपलोड हो रहा है ${current}/${total}`,
            english: `Uploading ${current}/${total}`,
            icon: '⬆️',
            type: 'info',
        };
    }

    /**
     * Get scan items detected message
     */
    getItemsDetectedMessage(count: number, needsReview: boolean): UserMessage {
        if (needsReview) {
            return {
                hindi: `${count} आइटम मिले। कृपया जांचें।`,
                english: `${count} items detected. Please review.`,
                icon: '👀',
                type: 'warning',
            };
        } else {
            return {
                hindi: `${count} आइटम मिले।`,
                english: `${count} items detected.`,
                icon: '✓',
                type: 'success',
            };
        }
    }

    /**
     * Get network quality message
     */
    getNetworkQualityMessage(
        rating: 'excellent' | 'good' | 'fair' | 'poor' | 'offline'
    ): UserMessage {
        const messages = {
            excellent: {
                hindi: 'नेटवर्क बहुत अच्छा है',
                english: 'Network excellent',
                icon: '📶',
                type: 'success' as const,
            },
            good: {
                hindi: 'नेटवर्क अच्छा है',
                english: 'Good connection',
                icon: '📶',
                type: 'success' as const,
            },
            fair: {
                hindi: 'नेटवर्क कमजोर',
                english: 'Weak network',
                icon: '📶',
                type: 'warning' as const,
            },
            poor: {
                hindi: 'नेटवर्क बहुत कमजोर',
                english: 'Very weak network',
                icon: '📶',
                type: 'warning' as const,
            },
            offline: {
                hindi: 'ऑफलाइन',
                english: 'No internet',
                icon: '📴',
                type: 'error' as const,
            },
        };

        return messages[rating];
    }

    /**
     * Get sync status message
     */
    getSyncStatusMessage(pendingCount: number): UserMessage {
        if (pendingCount === 0) {
            return {
                hindi: 'सब सिंक हो गया',
                english: 'All synced',
                icon: '✓',
                type: 'success',
            };
        } else {
            return {
                hindi: `${pendingCount} फोटो बाकी`,
                english: `${pendingCount} pending`,
                icon: '⏳',
                type: 'info',
            };
        }
    }
}

// Export singleton instance
export const userMessageService = new UserMessageService();
