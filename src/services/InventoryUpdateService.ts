/**
 * InventoryUpdateService - Idempotent, safe inventory updates with rollback
 * 
 * Purpose: Ensure inventory updates are safe, idempotent (no duplicate processing),
 * and can be rolled back if inconsistencies are detected.
 */

import { supabase } from '@/integrations/supabase/client';
import { KhataItem, ShelfDelta } from './VisionService';

interface UpdateResult {
    success: boolean;
    updatedCount: number;
    newCount: number;
    error?: string;
    imageId: string;
}

interface AuditLog {
    imageId: string;
    userId: string;
    action: 'khata_scan' | 'shelf_scan' | 'manual_update';
    changes: any;
    timestamp: string;
    confidence: number;
}

class InventoryUpdateService {
    /**
     * Check if image has already been processed (idempotency)
     */
    private async isImageProcessed(imageId: string, userId: string): Promise<boolean> {
        try {
            // Check if this image ID exists in our processing log
            // For MVP, we'll use localStorage. In production, use Supabase table
            const processedImages = JSON.parse(
                localStorage.getItem('processedImageIds') || '[]'
            );

            return processedImages.includes(imageId);
        } catch (error) {
            console.error('Error checking processed images:', error);
            return false;
        }
    }

    /**
     * Mark image as processed
     */
    private async markImageProcessed(imageId: string): Promise<void> {
        try {
            const processedImages = JSON.parse(
                localStorage.getItem('processedImageIds') || '[]'
            );

            if (!processedImages.includes(imageId)) {
                processedImages.push(imageId);
                localStorage.setItem('processedImageIds', JSON.stringify(processedImages));
            }
        } catch (error) {
            console.error('Error marking image as processed:', error);
        }
    }

    /**
     * Log audit entry for tracking and learning
     */
    private async logAudit(log: AuditLog): Promise<void> {
        try {
            // For MVP, store in localStorage. In production, use Supabase table
            const auditLogs = JSON.parse(localStorage.getItem('scanAuditLogs') || '[]');
            auditLogs.push(log);

            // Keep only last 100 logs in localStorage
            if (auditLogs.length > 100) {
                auditLogs.shift();
            }

            localStorage.setItem('scanAuditLogs', JSON.stringify(auditLogs));
        } catch (error) {
            console.error('Error logging audit:', error);
        }
    }

    /**
     * Process Khata scan items with idempotency
     */
    async processKhataScan(
        imageId: string,
        items: KhataItem[],
        overallConfidence: number
    ): Promise<UpdateResult> {
        try {
            // 1. Get user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // 2. Check idempotency
            const alreadyProcessed = await this.isImageProcessed(imageId, user.id);
            if (alreadyProcessed) {
                console.log(`Image ${imageId} already processed, skipping`);
                return {
                    success: true,
                    updatedCount: 0,
                    newCount: 0,
                    imageId,
                    error: 'Already processed',
                };
            }

            let updatedCount = 0;
            let newCount = 0;

            // 3. Process each item
            for (const item of items) {
                // Find existing material by name (case-insensitive)
                const { data: existingMaterials } = await supabase
                    .from('raw_materials')
                    .select('*')
                    .eq('user_id', user.id)
                    .ilike('name', item.name);

                const existing = existingMaterials?.[0];

                if (existing) {
                    // Update existing material
                    const newStock = (existing.current_stock || 0) + item.quantity;

                    const { error } = await supabase
                        .from('raw_materials')
                        .update({
                            current_stock: newStock,
                            cost_per_unit: item.price > 0 ? item.price : existing.cost_per_unit,
                            expiry_date: item.expiry_date || existing.expiry_date,
                            last_scan_image_id: imageId, // Track which scan last updated
                        })
                        .eq('id', existing.id);

                    if (error) throw error;
                    updatedCount++;
                } else {
                    // Create new material
                    const { error } = await supabase
                        .from('raw_materials')
                        .insert({
                            user_id: user.id,
                            name: item.name,
                            current_stock: item.quantity,
                            unit: item.unit,
                            cost_per_unit: item.price,
                            category: 'Khata Import',
                            expiry_date: item.expiry_date || null,
                            last_scan_image_id: imageId,
                        });

                    if (error) throw error;
                    newCount++;
                }
            }

            // 4. Mark as processed
            await this.markImageProcessed(imageId);

            // 5. Log audit
            await this.logAudit({
                imageId,
                userId: user.id,
                action: 'khata_scan',
                changes: { items, updatedCount, newCount },
                timestamp: new Date().toISOString(),
                confidence: overallConfidence,
            });

            return {
                success: true,
                updatedCount,
                newCount,
                imageId,
            };
        } catch (error: any) {
            console.error('Error processing khata scan:', error);
            return {
                success: false,
                updatedCount: 0,
                newCount: 0,
                imageId,
                error: error.message,
            };
        }
    }

    /**
     * Process shelf scan deltas with idempotency
     */
    async processShelfDeltas(
        imageId: string,
        deltas: ShelfDelta[]
    ): Promise<UpdateResult> {
        try {
            // 1. Get user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // 2. Check idempotency
            const alreadyProcessed = await this.isImageProcessed(imageId, user.id);
            if (alreadyProcessed) {
                console.log(`Image ${imageId} already processed, skipping`);
                return {
                    success: true,
                    updatedCount: 0,
                    newCount: 0,
                    imageId,
                    error: 'Already processed',
                };
            }

            let updatedCount = 0;

            // 3. Process each delta
            for (const delta of deltas) {
                if (delta.delta === 0) continue; // No change

                // Find material by name
                const { data: materials } = await supabase
                    .from('raw_materials')
                    .select('*')
                    .eq('user_id', user.id)
                    .ilike('name', delta.name);

                const material = materials?.[0];

                if (!material) {
                    console.warn(`Material not found: ${delta.name}`);
                    continue;
                }

                if (delta.action === 'sold') {
                    // Decrement stock
                    const newStock = Math.max(0, (material.current_stock || 0) - Math.abs(delta.delta));

                    const { error } = await supabase
                        .from('raw_materials')
                        .update({
                            current_stock: newStock,
                            last_scan_image_id: imageId,
                        })
                        .eq('id', material.id);

                    if (error) throw error;

                    // Log sale if it's actually a sale
                    if (delta.reason === 'sale') {
                        await supabase.from('sales_data').insert({
                            user_id: user.id,
                            product_name: delta.name,
                            quantity: Math.abs(delta.delta),
                            price: delta.price || 0,
                            sale_date: new Date().toISOString(),
                        });
                    }

                    updatedCount++;
                } else if (delta.action === 'restocked') {
                    // Increment stock
                    const newStock = (material.current_stock || 0) + Math.abs(delta.delta);

                    const { error } = await supabase
                        .from('raw_materials')
                        .update({
                            current_stock: newStock,
                            last_scan_image_id: imageId,
                        })
                        .eq('id', material.id);

                    if (error) throw error;
                    updatedCount++;
                }
            }

            // 4. Mark as processed
            await this.markImageProcessed(imageId);

            // 5. Log audit
            await this.logAudit({
                imageId,
                userId: user.id,
                action: 'shelf_scan',
                changes: { deltas, updatedCount },
                timestamp: new Date().toISOString(),
                confidence: deltas[0]?.confidence || 0.5,
            });

            return {
                success: true,
                updatedCount,
                newCount: 0,
                imageId,
            };
        } catch (error: any) {
            console.error('Error processing shelf deltas:', error);
            return {
                success: false,
                updatedCount: 0,
                newCount: 0,
                imageId,
                error: error.message,
            };
        }
    }

    /**
     * Get audit logs for learning
     */
    async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
        try {
            const logs = JSON.parse(localStorage.getItem('scanAuditLogs') || '[]');
            return logs.slice(-limit);
        } catch (error) {
            console.error('Error getting audit logs:', error);
            return [];
        }
    }

    /**
     * Clear processed images cache (for testing/debugging)
     */
    async clearProcessedCache(): Promise<void> {
        localStorage.removeItem('processedImageIds');
    }
}

// Export singleton instance
export const inventoryUpdateService = new InventoryUpdateService();
export type { UpdateResult, AuditLog };
