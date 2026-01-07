/**
 * Data Synchronization Service
 * 
 * Handles real-time updates across the application when data is added via:
 * - Manual text entry
 * - Voice input
 * - Handwriting OCR
 * - AR preview
 * 
 * Triggers:
 * - UI refresh via React Query invalidation
 * - AI analysis and insights recalculation
 * - Notification generation
 * - Low stock alerts
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DataSyncEvent {
    type: 'inventory' | 'sale' | 'khata' | 'supplier';
    action: 'create' | 'update' | 'delete';
    data: any;
    userId: string;
    source: 'manual' | 'voice' | 'ocr' | 'ar' | 'csv';
}

export class DataSyncService {
    /**
     * Add inventory item from any source and trigger all updates
     */
    static async addInventoryItem(userId: string, itemData: any, source: DataSyncEvent['source']) {
        try {
            // 1. Save to database
            const { data, error } = await supabase
                .from('raw_materials')
                .insert({
                    user_id: userId,
                    name: itemData.name,
                    current_stock: itemData.quantity || itemData.current_stock,
                    unit: itemData.unit || 'units',
                    cost_per_unit: itemData.cost || itemData.cost_per_unit || 0,
                    selling_price: itemData.price || itemData.selling_price || 0,
                    category: itemData.category || 'Other',
                    supplier: itemData.supplier || null,
                    expiry_date: itemData.expiry_date || null,
                    batch_number: itemData.batch_number || `BATCH-${Date.now()}`,
                    reorder_point: itemData.reorder_point || 10
                })
                .select()
                .single();

            if (error) throw error;

            // 2. Trigger UI updates (handled by React Query refetch)
            // Components using useQuery with 'materials' key will auto-refresh

            // 3. Check for low stock and create alert if needed
            if (data.current_stock <= data.reorder_point) {
                await this.createLowStockAlert(userId, data);
            }

            // 4. Trigger AI analysis (async, don't wait)
            this.triggerAIAnalysis(userId, 'inventory_added').catch(console.error);

            // 5. Show success notification
            toast.success(`${data.name} added successfully via ${source}`, {
                description: `Stock: ${data.current_stock} ${data.unit}`
            });

            return data;
        } catch (error: any) {
            console.error('Error adding inventory:', error);
            toast.error('Failed to add inventory item', {
                description: error.message
            });
            throw error;
        }
    }

    /**
     * Batch add multiple items (useful for OCR/CSV import)
     */
    static async addInventoryBatch(userId: string, items: any[], source: DataSyncEvent['source']) {
        const results = [];
        const errors = [];

        for (const item of items) {
            try {
                const result = await this.addInventoryItem(userId, item, source);
                results.push(result);
            } catch (error) {
                errors.push({ item, error });
            }
        }

        if (results.length > 0) {
            toast.success(`${results.length} items added successfully`, {
                description: errors.length > 0 ? `${errors.length} items failed` : undefined
            });
        }

        if (errors.length > 0) {
            toast.error(`${errors.length} items failed to add`, {
                description: 'Check console for details'
            });
            console.error('Batch add errors:', errors);
        }

        return { success: results, failed: errors };
    }

    /**
     * Create low stock alert
     */
    private static async createLowStockAlert(userId: string, material: any) {
        try {
            await supabase.from('low_stock_alerts').insert({
                user_id: userId,
                material_id: material.id,
                message: `${material.name} is running low - ${material.current_stock} ${material.unit} remaining`,
                current_value: material.current_stock,
                threshold_value: material.reorder_point,
                alert_type: 'low_stock',
                is_acknowledged: false
            });

            // Show notification
            toast.warning(`Low Stock Alert: ${material.name}`, {
                description: `Only ${material.current_stock} ${material.unit} left`
            });
        } catch (error) {
            console.error('Error creating alert:', error);
        }
    }

    /**
     * Trigger AI analysis and generate recommendations
     */
    private static async triggerAIAnalysis(userId: string, trigger: string) {
        try {
            // Call Supabase Edge Function for AI analysis
            const { data, error } = await supabase.functions.invoke('inventory-forecast', {
                body: { userId, trigger }
            });

            if (error) throw error;

            // If AI generated recommendations, store them
            if (data?.recommendations && data.recommendations.length > 0) {
                await supabase.from('ai_recommendations').insert(
                    data.recommendations.map((rec: any) => ({
                        user_id: userId,
                        ...rec
                    }))
                );

                toast.info('New AI insights generated', {
                    description: 'Check the Insights page for recommendations'
                });
            }
        } catch (error) {
            // AI analysis is non-critical, just log errors
            console.warn('AI analysis failed:', error);
        }
    }

    /**
     * Add sale and update inventory automatically
     */
    static async addSale(userId: string, saleData: any, source: DataSyncEvent['source']) {
        try {
            // 1. Record sale
            const { data: sale, error: saleError } = await supabase
                .from('sales_data')
                .insert({
                    user_id: userId,
                    product_name: saleData.product_name,
                    quantity: saleData.quantity,
                    total_price: saleData.total_price,
                    payment_method: saleData.payment_method || 'cash',
                    sale_date: saleData.sale_date || new Date().toISOString(),
                    profit: saleData.profit || 0
                })
                .select()
                .single();

            if (saleError) throw saleError;

            // 2. Update inventory stock (deduct sold quantity)
            const { data: materials } = await supabase
                .from('raw_materials')
                .select('*')
                .eq('user_id', userId)
                .eq('name', saleData.product_name)
                .single();

            if (materials) {
                const newStock = materials.current_stock - saleData.quantity;

                await supabase
                    .from('raw_materials')
                    .update({ current_stock: newStock })
                    .eq('id', materials.id);

                // Check if low stock after sale
                if (newStock <= materials.reorder_point) {
                    await this.createLowStockAlert(userId, { ...materials, current_stock: newStock });
                }
            }

            // 3. Trigger AI analysis
            this.triggerAIAnalysis(userId, 'sale_recorded').catch(console.error);

            toast.success('Sale recorded successfully', {
                description: `${saleData.quantity}x ${saleData.product_name} - ₹${saleData.total_price}`
            });

            return sale;
        } catch (error: any) {
            console.error('Error recording sale:', error);
            toast.error('Failed to record sale', {
                description: error.message
            });
            throw error;
        }
    }

    /**
     * Recalculate insights/analytics
     * Called after any data change to refresh dashboard metrics
     */
    static async recalculateInsights(userId: string) {
        try {
            // Fetch all user data
            const [materialsRes, salesRes, suppliersRes] = await Promise.all([
                supabase.from('raw_materials').select('*').eq('user_id', userId),
                supabase.from('sales_data').select('*').eq('user_id', userId),
                supabase.from('suppliers').select('*').eq('user_id', userId)
            ]);

            const materials = materialsRes.data || [];
            const sales = salesRes.data || [];

            // Calculate metrics
            const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_price || 0), 0);
            const totalProfit = sales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
            const totalInventoryValue = materials.reduce(
                (sum, item) => sum + (item.current_stock * item.cost_per_unit),
                0
            );

            return {
                totalRevenue,
                totalProfit,
                totalInventoryValue,
                totalItems: materials.length,
                totalSales: sales.length,
                profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
            };
        } catch (error) {
            console.error('Error calculating insights:', error);
            return null;
        }
    }
}
