/**
 * ExpiryTrackingService - Monitor medicine expiry dates
 * 
 * Purpose: Track batch-level expiry, generate alerts for medicines
 * nearing expiry, and provide disposal recommendations.
 */

export interface ExpiryAlert {
    medicineId: string;
    medicineName: string;
    batch: string;
    expiryDate: string;
    daysRemaining: number;
    severity: 'critical' | 'warning' | 'info';
    action: 'DISPOSE_NOW' | 'MARK_CLEARANCE' | 'MONITOR';
}

class ExpiryTrackingService {
    // Demo mode: Mock medicine inventory with expiry dates
    private mockInventory = [
        {
            id: 'INV001',
            name: 'Amoxicillin 500mg',
            batch: 'BATCH001',
            expiryDate: '2026-01-15', // 9 days from now
            quantity: 50
        },
        {
            id: 'INV002',
            name: 'Ibuprofen 200mg',
            batch: 'BATCH002',
            expiryDate: '2026-01-20', // 14 days
            quantity: 100
        },
        {
            id: 'INV003',
            name: 'Vitamin C Tablets',
            batch: 'BATCH003',
            expiryDate: '2026-02-28', // ~53 days
            quantity: 200
        },
        {
            id: 'INV004',
            name: 'Cough Syrup',
            batch: 'BATCH004',
            expiryDate: '2026-01-08', // 2 days - CRITICAL
            quantity: 25
        },
        {
            id: 'INV005',
            name: 'Paracetamol 650mg',
            batch: 'BATCH005',
            expiryDate: '2025-12-31', // EXPIRED
            quantity: 75
        }
    ];

    /**
     * Get all expiry alerts for medicines nearing expiry
     */
    getExpiryAlerts(): ExpiryAlert[] {
        const today = new Date();
        const alerts: ExpiryAlert[] = [];

        this.mockInventory.forEach(item => {
            const expiryDate = new Date(item.expiryDate);
            const daysRemaining = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            // Only alert for items expiring soon or already expired
            if (daysRemaining <= 90) {
                let severity: ExpiryAlert['severity'];
                let action: ExpiryAlert['action'];

                if (daysRemaining < 0) {
                    severity = 'critical';
                    action = 'DISPOSE_NOW';
                } else if (daysRemaining <= 7) {
                    severity = 'critical';
                    action = 'DISPOSE_NOW';
                } else if (daysRemaining <= 30) {
                    severity = 'warning';
                    action = 'MARK_CLEARANCE';
                } else {
                    severity = 'info';
                    action = 'MONITOR';
                }

                alerts.push({
                    medicineId: item.id,
                    medicineName: item.name,
                    batch: item.batch,
                    expiryDate: item.expiryDate,
                    daysRemaining,
                    severity,
                    action
                });
            }
        });

        // Sort by days remaining (most urgent first)
        return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
    }

    /**
     * Get statistics for dashboard
     */
    getExpiryStats() {
        const alerts = this.getExpiryAlerts();

        return {
            expired: alerts.filter(a => a.daysRemaining < 0).length,
            expiringThisWeek: alerts.filter(a => a.daysRemaining >= 0 && a.daysRemaining <= 7).length,
            expiringThisMonth: alerts.filter(a => a.daysRemaining > 7 && a.daysRemaining <= 30).length,
            total: alerts.length
        };
    }

    /**
     * Check if a specific medicine batch is expired
     */
    isBatchExpired(batch: string, expiryDate: string): boolean {
        const expiry = new Date(expiryDate);
        const today = new Date();
        return expiry < today;
    }

    /**
     * Get user-friendly expiry message
     */
    getExpiryMessage(daysRemaining: number): { hindi: string; english: string; icon: string } {
        if (daysRemaining < 0) {
            return {
                hindi: '⏰ समय सीमा समाप्त। तुरंत निपटान करें।',
                english: `Expired ${Math.abs(daysRemaining)} days ago. Dispose immediately.`,
                icon: '🔴'
            };
        } else if (daysRemaining === 0) {
            return {
                hindi: '⚠️ आज समाप्त हो रहा है!',
                english: 'Expiring today!',
                icon: '🟠'
            };
        } else if (daysRemaining <= 7) {
            return {
                hindi: `⚠️ ${daysRemaining} दिन में समाप्त। क्लीयरेंस सेल शुरू करें।`,
                english: `Expiring in ${daysRemaining} days. Start clearance sale.`,
                icon: '🟡'
            };
        } else {
            return {
                hindi: `📅 ${daysRemaining} दिन शेष।`,
                english: `${daysRemaining} days remaining.`,
                icon: '🟢'
            };
        }
    }
}

export const expiryTrackingService = new ExpiryTrackingService();
