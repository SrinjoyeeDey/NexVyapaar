import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface OfflineQueue {
    bills: number;
    inventoryActions: number;
    supplierActions: number;
}

interface OfflineDemoContextType {
    isOffline: boolean;
    syncProgress: number;
    syncStatus: 'idle' | 'syncing' | 'synced';
    offlineQueue: OfflineQueue;
    syncedData: OfflineQueue | null;
    toggleOffline: () => void;
    triggerSync: () => void;
}

const OfflineDemoContext = createContext<OfflineDemoContextType | undefined>(undefined);

export const useOfflineDemo = () => {
    const context = useContext(OfflineDemoContext);
    if (!context) {
        throw new Error('useOfflineDemo must be used within an OfflineDemoProvider');
    }
    return context;
};

// Seeded data for the demo
const SEEDED_QUEUE: OfflineQueue = {
    bills: 3,
    inventoryActions: 2,
    supplierActions: 1
};

export const OfflineDemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOffline, setIsOffline] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
    const [offlineQueue, setOfflineQueue] = useState<OfflineQueue>({ bills: 0, inventoryActions: 0, supplierActions: 0 });
    const [syncedData, setSyncedData] = useState<OfflineQueue | null>(null);

    const toggleOffline = () => {
        if (isOffline) {
            // Switching to ONLINE -> Trigger Sync
            triggerSync();
        } else {
            // Switching to OFFLINE
            setIsOffline(true);
            setSyncStatus('idle');
            setSyncProgress(0);
            setOfflineQueue(SEEDED_QUEUE); // Load seeded data immediately for demo impact
            toast("You are now in Offline Mode", {
                description: "All transactions will be stored locally.",
                action: {
                    label: "Undo",
                    onClick: () => triggerSync(),
                },
            });
        }
    };

    const triggerSync = () => {
        setIsOffline(false);
        setSyncStatus('syncing');
        setSyncProgress(0);

        // Simulation Sequence
        // Start -> 0%
        setTimeout(() => setSyncProgress(35), 1000);
        setTimeout(() => setSyncProgress(78), 2000);
        setTimeout(() => {
            setSyncProgress(100);
            setSyncStatus('synced');
            setSyncedData({ ...offlineQueue }); // Capture what was just synced
            setOfflineQueue({ bills: 0, inventoryActions: 0, supplierActions: 0 }); // Clear queue

            // Reset to idle after a delay
            setTimeout(() => {
                setSyncStatus('idle');
                // Optional: Clear synced display after a longer delay, or keep it until next offline session?
                // Let's keep it for 10s so user has time to see it
                setTimeout(() => setSyncedData(null), 10000);
            }, 5000);

        }, 3000);
    };

    return (
        <OfflineDemoContext.Provider value={{
            isOffline,
            syncProgress,
            syncStatus,
            offlineQueue,
            syncedData,
            toggleOffline,
            triggerSync
        }}>
            {children}
        </OfflineDemoContext.Provider>
    );
};
