
import { useMemo } from 'react';

// Define localized interfaces that match our DB schema + logical needs
export interface SmartInventoryItem {
    id: string;
    name: string;
    current_stock: number;
    expiry_date?: string | null; // ISO YYYY-MM-DD
    batch_number?: string | null;
    unit?: string;
    cost_price?: number; // Cost Per Unit
    cost_per_unit?: number; // Backend uses cost_per_unit
    selling_price?: number;
    category?: string;
    updated_at?: string | null;
}

export type InventoryStatus = 'expired' | 'high_risk' | 'slow_moving' | 'healthy';

export interface ProfitAction {
    id: string;
    type: 'discount' | 'bundle' | 'clearance';
    title: string;
    description: string;
    potential_recovery: number;
    items: SmartInventoryItem[];
    urgency: 'critical' | 'high' | 'medium';
}

export function useSmartInventory(items: SmartInventoryItem[] = []) {

    const analyzedInventory = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expired: SmartInventoryItem[] = [];
        const highRisk: SmartInventoryItem[] = []; // Expiring within 7 days
        const slowMoving: SmartInventoryItem[] = []; // No updates in 30 days

        // Recovery Calculations
        let potentialLoss = 0;
        let recoverableRevenue = 0;

        items.forEach(item => {
            if (!item.current_stock || item.current_stock <= 0) return;

            let status: InventoryStatus = 'healthy';
            const cost = item.cost_price || item.cost_per_unit || 0;
            const stockValue = item.current_stock * cost;

            // Check Expiry
            if (item.expiry_date) {
                const expiry = new Date(item.expiry_date);
                expiry.setHours(0, 0, 0, 0);

                const diffTime = expiry.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                    status = 'expired';
                    expired.push(item);
                    potentialLoss += stockValue;
                } else if (diffDays <= 7) {
                    status = 'high_risk';
                    highRisk.push(item);
                    // Assuming we can recover 70% if we act now
                    recoverableRevenue += (stockValue * 0.7);
                }
            }

            // Check Slow Moving (if not already expired/risk)
            if (status === 'healthy' && item.updated_at) {
                const lastUpdate = new Date(item.updated_at);
                const diffTime = today.getTime() - lastUpdate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 30) {
                    status = 'slow_moving';
                    slowMoving.push(item);
                }
            }
        });

        return { expired, highRisk, slowMoving, potentialLoss, recoverableRevenue };
    }, [items]);

    // Generate Actionable Profit Alerts
    const profitActions = useMemo(() => {
        const actions: ProfitAction[] = [];
        const { highRisk, slowMoving } = analyzedInventory;

        if (highRisk.length > 0) {
            const topRiskItems = highRisk.slice(0, 3); // Top 3
            const totalValue = highRisk.reduce((sum, i) => sum + (i.current_stock * (i.selling_price || i.cost_price || i.cost_per_unit || 0)), 0);

            actions.push({
                id: 'act_expiry_rush',
                type: 'discount',
                title: 'Expiry Rush!',
                description: `${highRisk.length} items expiring soon (e.g., ${topRiskItems[0].name}). Run a Flash Sale?`,
                potential_recovery: totalValue * 0.3, // Assuming 30% margin saved
                items: highRisk,
                urgency: 'critical'
            });
        }

        if (slowMoving.length > 0) {
            const topSlow = slowMoving.slice(0, 3);
            actions.push({
                id: 'act_dead_stock',
                type: 'bundle',
                title: 'Clear Dead Stock',
                description: `Unlock cash trapped in ${slowMoving.length} slow items (e.g., ${topSlow[0].name}). Bundle them?`,
                potential_recovery: slowMoving.reduce((sum, i) => sum + (i.current_stock * (i.cost_price || i.cost_per_unit || 0)), 0) * 0.1, // 10% cashflow boost
                items: slowMoving,
                urgency: 'medium'
            });
        }

        return actions;
    }, [analyzedInventory]);

    return {
        ...analyzedInventory,
        profitActions
    };
}
