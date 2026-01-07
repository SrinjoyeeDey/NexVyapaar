/**
 * ComplianceCheckService - Medicine regulatory compliance validation
 * 
 * Purpose: Validate medicines against ban lists, recalls, and expiry dates
 * before allowing sale. Works offline using cached regulatory data.
 */

export interface MedicineInfo {
    code: string;
    name: string;
    batch?: string;
    manufacturer?: string;
    expiryDate?: string;
}

export interface ComplianceResult {
    allowed: boolean;
    reason: 'SAFE' | 'EXPIRED' | 'BANNED' | 'RECALLED' | 'NOT_FOR_SALE';
    message: string;
    action?: string;
    details?: any;
}

export interface ComplianceStats {
    totalBanned: number;
    cdscoBanned: number;
    stateBanned: number;
    recalled: number;
    lastUpdated: string;
    source: 'SEED' | 'UPLOADED';
}

export type FileIntent = 'COMPLIANCE' | 'INVENTORY' | 'UNKNOWN';

export interface ParseResult {
    success: boolean;
    intent: FileIntent;
    itemsAdded: number;
    summary: string;
}

interface BannedMedicineData {
    code: string;
    name: string;
    batch?: string;
    manufacturer?: string;
    reason: string;
    source: 'CDSCO' | 'STATE_DRUG_CONTROL' | 'MANUAL';
    effectiveDate: string;
}

class ComplianceCheckService {
    private bannedList: BannedMedicineData[] = [];
    private listeners: Function[] = [];

    constructor() {
        this.initializeData();
    }

    private initializeData() {
        this.bannedList = [
            {
                name: "Paracetamol 500mg",
                manufacturer: "HealthCare Pharma",
                batch: "XYZ123",
                reason: "Failed dissolution test",
                source: "CDSCO",
                effectiveDate: "2024-01-15",
                code: "PARA500"
            },
            {
                name: "Cough Syrup ABC",
                manufacturer: "Generic Meds Ltd",
                reason: "Contamination risk",
                source: "MANUAL",
                effectiveDate: "2024-02-01",
                code: "COUGH001"
            },
            {
                name: "Aspirin 100mg",
                manufacturer: "Wellness Corp",
                batch: "DEF456",
                reason: "Substandard quality",
                source: "STATE_DRUG_CONTROL",
                effectiveDate: "2024-01-20",
                code: "ASP100"
            }
        ];
    }

    // Subscribe to data changes
    subscribe(listener: Function) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(l => l());
    }

    /**
     * Main compliance validation method
     */
    async validateMedicine(medicine: MedicineInfo): Promise<ComplianceResult> {
        // 1. Check expiry date first (fastest check)
        if (medicine.expiryDate) {
            const expiryDate = new Date(medicine.expiryDate);
            const today = new Date();

            if (expiryDate < today) {
                return {
                    allowed: false,
                    reason: 'EXPIRED',
                    message: `⏰ समय सीमा समाप्त। निपटान करें। / Expired on ${medicine.expiryDate}. Please dispose.`,
                    action: 'MARK_FOR_DISPOSAL'
                };
            }

            // Warn if expiring within 30 days
            const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                console.warn(`Medicine ${medicine.name} expiring in ${daysUntilExpiry} days`);
            }
        }

        // 2. Check ban list (demo mode uses mock data)
        const bannedMatch = this.bannedList.find(banned => {
            // Match by code
            if (banned.code === medicine.code) {
                // If batch specified, must match
                if (banned.batch && medicine.batch) {
                    return banned.batch === medicine.batch;
                }
                // No batch restriction or no batch provided
                return true;
            }
            return false;
        });

        if (bannedMatch) {
            return {
                allowed: false,
                reason: bannedMatch.source === 'MANUAL' ? 'RECALLED' : 'BANNED',
                message: `⛔ ${bannedMatch.reason}`,
                action: 'BLOCK_SALE',
                details: bannedMatch
            };
        }

        // 3. All checks passed
        return {
            allowed: true,
            reason: 'SAFE',
            message: '✅ Safe to sell'
        };
    }

    /**
     * Get all banned medicines for dashboard display
     */
    getBannedList(): BannedMedicineData[] {
        return [...this.bannedList];
    }

    /**
     * Add a medicine to ban list (simulated)
     */
    addToBanList(medicine: BannedMedicineData): void {
        this.bannedList.push({
            ...medicine,
            effectiveDate: new Date().toISOString().split('T')[0]
        });

        console.log(`Added to ban list: ${medicine.name}`);
        this.notifyListeners();
    }

    /**
     * Remove from ban list (for testing)
     */
    removeFromBanList(code: string): void {
        this.bannedList = this.bannedList.filter(item => item.code !== code);
        this.notifyListeners();
    }

    /**
     * Get statistics for dashboard
     */
    getComplianceStats(): ComplianceStats {
        return {
            totalBanned: this.bannedList.length,
            cdscoBanned: this.bannedList.filter(m => m.source === 'CDSCO').length,
            stateBanned: this.bannedList.filter(m => m.source === 'STATE_DRUG_CONTROL').length,
            recalled: this.bannedList.filter(m => m.source === 'MANUAL').length,
            lastUpdated: new Date().toISOString().split('T')[0],
            source: this.bannedList.length > 3 ? 'UPLOADED' : 'SEED'
        };
    }

    /**
     * Intelligent CSV/File Parser
     * Detects intent and merges data
     */
    async processUpload(file: File): Promise<ParseResult> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const text = e.target?.result as string;
                if (!text) {
                    reject(new Error("Empty file"));
                    return;
                }

                try {
                    const result = this.parseCSV(text);
                    if (result.success) {
                        this.notifyListeners(); // Update UI globally
                    }
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = () => reject(new Error("Read error"));
            reader.readAsText(file);
        });
    }

    private parseCSV(csvText: string): ParseResult {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) return { success: false, intent: 'UNKNOWN', itemsAdded: 0, summary: "File too short" };

        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        const intent = this.detectIntent(headers);

        if (intent === 'COMPLIANCE') {
            let processedCount = 0;
            // Keep seeded data but allow overrides? 
            // User requested: "Replace old demo data with newly uploaded content"
            // But also: "keep seeded data"
            // Strategy: Clear list ONLY if intent is confirmed, then re-add valid rows.

            // Backup in case of parse failure mid-way? No, simplistic approach.
            const newItems: BannedMedicineData[] = [];

            // Parse rows
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                if (cols.length < 2) continue; // Skip partial lines

                // Map columns dynamically based on detected headers or assume standard order if vague
                // Standard: Code, Name, Batch, Reason, Source

                // Flexible mapping
                const codeIdx = headers.findIndex(h => h.includes('code') || h.includes('id'));
                const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('drug') || h.includes('medicine'));
                const batchIdx = headers.findIndex(h => h.includes('batch'));
                const reasonIdx = headers.findIndex(h => h.includes('reason') || h.includes('status'));
                const sourceIdx = headers.findIndex(h => h.includes('source') || h.includes('authority'));

                if (nameIdx === -1) continue; // Minimal requirement

                newItems.push({
                    code: codeIdx > -1 ? cols[codeIdx] : `CSV_${Date.now()}_${i}`,
                    name: cols[nameIdx],
                    batch: batchIdx > -1 ? cols[batchIdx] : undefined,
                    reason: reasonIdx > -1 ? cols[reasonIdx] : "Regulatory Restriction",
                    source: sourceIdx > -1 ? (cols[sourceIdx].toUpperCase() as any) : 'MANUAL',
                    effectiveDate: new Date().toISOString().split('T')[0],
                    manufacturer: "Unknown (CSV)"
                });
                processedCount++;
            }

            if (processedCount > 0) {
                // Merge strategy: Overwrite seeded data with REAL upload data for the "System becomes smarter" feel
                this.bannedList = newItems;
                return {
                    success: true,
                    intent: 'COMPLIANCE',
                    itemsAdded: processedCount,
                    summary: `Successfully imported ${processedCount} banned medicines.`
                };
            }
        }

        return { success: false, intent: 'UNKNOWN', itemsAdded: 0, summary: "Could not identify valid data" };
    }

    private detectIntent(headers: string[]): FileIntent {
        const complianceKeywords = ['drug', 'banned', 'recall', 'code', 'reason', 'status', 'cdsco'];
        const inventoryKeywords = ['quantity', 'stock', 'price', 'product', 'sku'];

        const complianceScore = headers.filter(h => complianceKeywords.some(k => h.includes(k))).length;
        const inventoryScore = headers.filter(h => inventoryKeywords.some(k => h.includes(k))).length;

        if (complianceScore > inventoryScore) return 'COMPLIANCE';
        if (inventoryScore > complianceScore) return 'INVENTORY';

        return 'UNKNOWN';
    }

    /**
     * Simulate uploading a government ban list file
     */
    async uploadBanList(file: File): Promise<ParseResult> {
        return this.processUpload(file);
    }
}

// Export singleton
export const complianceCheckService = new ComplianceCheckService();
export type { BannedMedicineData };
