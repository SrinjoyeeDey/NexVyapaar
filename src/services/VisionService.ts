import * as jose from 'jose';
import { toast } from "sonner";
import credentialsData from '../../AIVision.json';

// Load actual Google Cloud Vision API credentials
const credentials = {
    client_email: credentialsData.client_email,
    private_key_id: credentialsData.private_key_id,
    private_key: credentialsData.private_key
};

// Enhanced interfaces with confidence scoring
export interface KhataItem {
    name: string;
    quantity: number;
    unit: string;
    price: number;
    date: string;
    expiry_date?: string;
    type: 'sale' | 'inventory';
    supplier?: string;
    confidence?: number; // 0-1 confidence score
    requiresReview?: boolean; // Needs manual confirmation
}

export interface ShelfItem {
    name: string;
    boundingBox: {
        normalizedVertices: { x: number; y: number }[];
    };
    confidence: number;
    price?: number;
    expiryDate?: string;
    labelDetected: boolean;
    rawLabel?: string;
    requiresReview?: boolean;
}

export interface ShelfScanResult {
    items: ShelfItem[];
    timestamp: string;
    overallConfidence?: number; // Overall scan confidence
    partialFailure?: boolean;
}

export interface ShelfDelta {
    name: string;
    previousCount: number;
    currentCount: number;
    delta: number;
    action: 'sold' | 'restocked' | 'none';
    reason: 'sale' | 'damage' | 'expired' | 'theft';
    price?: number;
    expiryDate?: string;
    reorderPoint?: number;
    confidence?: number;
}

// New result interface for enhanced resilience
export interface VisionResult<T> {
    items: T[];
    confidence: number; // 0-1
    needsConfirmation: boolean;
    suggestedAction: string;
    partialFailure: boolean;
    errorMessage?: string;
}

// Configuration for confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
    HIGH: 0.7, // Above this = auto-accept
    MEDIUM: 0.5, // Medium confidence
    LOW: 0.3, // Below medium
};

export class VisionService {
    private static async getAccessToken(): Promise<string> {
        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + 3600;

        const jwt = await new jose.SignJWT({
            iss: credentials.client_email,
            sub: credentials.client_email,
            aud: 'https://oauth2.googleapis.com/token',
            iat,
            exp,
            scope: 'https://www.googleapis.com/auth/cloud-platform',
        })
            .setProtectedHeader({ alg: 'RS256', kid: credentials.private_key_id })
            .sign(await jose.importPKCS8(credentials.private_key, 'RS256'));

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt,
            }),
        });

        const data = await response.json();
        return data.access_token;
    }

    public static async analyzeHandwriting(base64Image: string): Promise<KhataItem[]> {
        // CHECK FOR DEMO MODE FIRST
        const demoMode = localStorage.getItem("demo_mode");

        if (demoMode === "true") {
            // DEMO MODE: Return reliable hardcoded data for hackathon presentations
            console.log("VisionService: Demo Mode Active - Using sample data for presentation");

            // Simulate API delay for realistic demo experience
            await new Promise(resolve => setTimeout(resolve, 2000));

            return [
                {
                    name: "Amul Gold Milk",
                    quantity: 50,
                    unit: "packets",
                    price: 33,
                    date: new Date().toISOString().split('T')[0],
                    expiry_date: "2025-06-30",
                    type: 'inventory',
                    supplier: "Demo Supplier"
                },
                {
                    name: "Harvest Bread",
                    quantity: 20,
                    unit: "units",
                    price: 45,
                    date: new Date().toISOString().split('T')[0],
                    expiry_date: "2025-01-10",
                    type: 'inventory'
                },
                {
                    name: "Kissan Jam",
                    quantity: 5,
                    unit: "jars",
                    price: 150,
                    date: new Date().toISOString().split('T')[0],
                    expiry_date: "2025-06-20",
                    type: 'inventory'
                }
            ];
        }

        // PRODUCTION MODE: Use real Google Cloud Vision API
        console.log("VisionService: Production Mode - Calling Google Cloud Vision API");

        try {
            const accessToken = await this.getAccessToken();
            const content = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');

            const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requests: [{
                        image: { content },
                        features: [{ type: 'TEXT_DETECTION' }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Google Vision API Error Response (Handwriting):', errorData);
                throw new Error(`Google Vision API error: ${response.statusText}${errorData.error?.message ? ' - ' + errorData.error.message : ''}`);
            }

            const data = await response.json();

            if (data.error) {
                console.error('Vision API returned top-level error:', data.error);
                throw new Error(`Vision API Error: ${data.error.message || 'Unknown error'}`);
            }

            const text = data.responses[0]?.fullTextAnnotation?.text || '';

            if (!text) {
                console.warn("No text detected in image");
                toast.warning("No text found in the image. Please try a clearer photo.");
                return [];
            }

            return this.parseKhataText(text);
        } catch (error) {
            console.error("Vision API Error:", error);
            // Fallback to empty result with toast instead of throwing
            if (error instanceof Error) {
                toast.error(`Vision API Error: ${error.message}. Checking internet or credentials.`);
            } else {
                toast.error('Failed to process image. Please try again.');
            }
            return []; // Return empty array so UI doesn't crash
        }
    }

    public static async analyzeShelfImage(base64Image: string): Promise<ShelfScanResult> {
        // Check for demo mode
        const demoMode = localStorage.getItem("demo_mode") === "true";

        if (demoMode) {
            console.log("VisionService: Demo Mode - Returning mock shelf scan data");
            // Return demo shelf items
            return {
                items: [
                    {
                        name: "Maggi Noodles",
                        boundingBox: { normalizedVertices: [{ x: 0.1, y: 0.1 }, { x: 0.3, y: 0.1 }, { x: 0.3, y: 0.3 }, { x: 0.1, y: 0.3 }] },
                        confidence: 0.95,
                        labelDetected: true,
                        rawLabel: "Maggi ₹12"
                    },
                    {
                        name: "Lays Chips",
                        boundingBox: { normalizedVertices: [{ x: 0.4, y: 0.1 }, { x: 0.6, y: 0.1 }, { x: 0.6, y: 0.3 }, { x: 0.4, y: 0.3 }] },
                        confidence: 0.92,
                        labelDetected: true,
                        rawLabel: "Lays ₹20"
                    },
                    {
                        name: "Coca Cola",
                        boundingBox: { normalizedVertices: [{ x: 0.7, y: 0.1 }, { x: 0.9, y: 0.1 }, { x: 0.9, y: 0.3 }, { x: 0.7, y: 0.3 }] },
                        confidence: 0.88,
                        labelDetected: true,
                        rawLabel: "Coca Cola ₹40"
                    },
                    {
                        name: "Parle-G",
                        boundingBox: { normalizedVertices: [{ x: 0.1, y: 0.4 }, { x: 0.3, y: 0.4 }, { x: 0.3, y: 0.6 }, { x: 0.1, y: 0.6 }] },
                        confidence: 0.93,
                        labelDetected: true,
                        rawLabel: "Parle-G ₹10"
                    }
                ],
                timestamp: new Date().toISOString()
            };
        }

        // PRODUCTION MODE: Use real Google Cloud Vision API with error handling
        console.log("VisionService: Production Mode - Calling Google Cloud Vision API for shelf analysis");

        try {
            const accessToken = await this.getAccessToken();
            const content = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');

            const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requests: [
                        {
                            image: { content },
                            features: [
                                { type: 'OBJECT_LOCALIZATION' },
                                { type: 'TEXT_DETECTION' }
                            ],
                        },
                    ],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Google Vision API Error Response:', errorData);
                throw new Error(`Google Vision API error: ${response.statusText}${errorData.error?.message ? ' - ' + errorData.error.message : ''}`);
            }

            const data = await response.json();
            const visionResponse = data.responses[0];

            if (visionResponse.error) {
                console.error('Vision API returned error:', visionResponse.error);
                throw new Error(`Vision API Error: ${visionResponse.error.message || 'Unknown error'}`);
            }

            const localizedObjects = visionResponse.localizedObjectAnnotations || [];
            const textAnnotations = visionResponse.textAnnotations || [];

            // Logical Step: Association
            // We link text labels (price, name) to objects based on spatial proximity
            const shelfItems: ShelfItem[] = localizedObjects.map((obj: any) => {
                const box = obj.boundingPoly.normalizedVertices;

                // Find text that falls within or near this box
                const associatedText = textAnnotations.find((text: any) => {
                    const textVertices = text.boundingPoly.normalizedVertices;
                    if (!textVertices) return false;

                    // Simple check: is the first vertex of the text inside the object box?
                    const center = this.getPolygonCenter(box);
                    const textCenter = this.getPolygonCenter(textVertices);

                    const dist = Math.sqrt(Math.pow(center.x - textCenter.x, 2) + Math.pow(center.y - textCenter.y, 2));
                    return dist < 0.1; // Threshold for proximity
                });

                return {
                    name: associatedText?.description || obj.name,
                    boundingBox: { normalizedVertices: box },
                    confidence: obj.score,
                    labelDetected: !!associatedText,
                    rawLabel: associatedText?.description
                };
            });

            return {
                items: shelfItems,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error("Shelf Vision API Error:", error);
            // Provide user-friendly error message
            if (error instanceof Error) {
                throw new Error(`Failed to analyze shelf image: ${error.message}. Please check your internet connection and Google Cloud Vision API credentials.`);
            }
            throw new Error('Failed to analyze shelf image. Please try again.');
        }
    }

    public static compareScans(previous: ShelfItem[], current: ShelfItem[]): ShelfDelta[] {
        const prevCounts = this.getCounts(previous);
        const currCounts = this.getCounts(current);

        const allNames = new Set([...Object.keys(prevCounts), ...Object.keys(currCounts)]);
        const deltas: ShelfDelta[] = [];

        allNames.forEach(name => {
            const prev = prevCounts[name] || 0;
            const curr = currCounts[name] || 0;
            const diff = curr - prev;

            // Try to find the labels from the current scan for price/expiry
            const currentItem = current.find(i => i.name === name);
            const parsedInfo = currentItem?.rawLabel ? this.parseKhataText(currentItem.rawLabel)[0] : null;

            deltas.push({
                name,
                previousCount: prev,
                currentCount: curr,
                delta: diff,
                action: diff < 0 ? 'sold' : (diff > 0 ? 'restocked' : 'none'),
                reason: 'sale', // Default reason for any depletion
                price: parsedInfo?.price,
                expiryDate: parsedInfo?.expiry_date
            });
        });

        return deltas;
    }

    public static getCounts(items: ShelfItem[]): Record<string, number> {
        const counts: Record<string, number> = {};
        items.forEach(item => {
            if (item.name && item.name !== 'Unknown') {
                counts[item.name] = (counts[item.name] || 0) + 1;
            }
        });
        return counts;
    }

    private static getPolygonCenter(vertices: { x: number; y: number }[]): { x: number; y: number } {
        const x = vertices.reduce((sum, v) => sum + (v.x || 0), 0) / vertices.length;
        const y = vertices.reduce((sum, v) => sum + (v.y || 0), 0) / vertices.length;
        return { x, y };
    }

    private static normalizeDate(dateStr: string): string {
        try {
            const months: { [key: string]: string } = {
                jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
                jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
                january: '01', february: '02', march: '03', april: '04',
                july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
            };

            const clean = dateStr.toLowerCase().replace(/(st|nd|rd|th)/g, '').trim();

            // Format: "4 Feb 2026" or "4/02/2026"
            const parts = clean.split(/[\s\/\-]+/).filter(p => p.length > 0);

            if (parts.length >= 3) {
                let day = parts[0].padStart(2, '0');
                let monthStr = parts[1];
                let year = parts[2];

                let month = months[monthStr] || monthStr.padStart(2, '0');
                if (year.length === 2) year = '20' + year;

                // Safety check for swapped D/M
                if (parseInt(day) > 31) {
                    const temp = day;
                    day = month.padStart(2, '0');
                    month = temp.padStart(2, '0');
                }

                return `${day}-${month}-${year}`;
            }
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    }

    private static parseKhataText(text: string): KhataItem[] {
        console.log('Vision OCR Semantic Input:', text);
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        const items: KhataItem[] = [];

        lines.forEach(line => {
            let workingLine = line.trim();
            const originalLine = line;

            // 1. Identify Supplier (Semantic reasoning: often starts with "From:" or "Supplier:")
            const supplierRegex = /(?:from|supplier|dealer|purchased from)[:\s]+([A-Za-z0-9\s]+?)(?=\s-|\s\d|$)/i;
            const supplierMatch = workingLine.match(supplierRegex);
            let supplier: string | undefined = undefined;
            if (supplierMatch) {
                supplier = supplierMatch[1].trim();
                workingLine = workingLine.replace(supplierMatch[0], '').trim();
            }

            // 2. Identify and Extract Date
            const dateRegex = /(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i;
            const dateMatch = workingLine.match(dateRegex);
            let expiry_date: string | undefined = undefined;
            if (dateMatch) {
                expiry_date = this.normalizeDate(dateMatch[0]);
                workingLine = workingLine.replace(dateMatch[0], '').trim();
            }

            // 2. Identify and Extract Price (Semantic reasoning: preceded by ₹, Rs, or follows a dash after quantity)
            // We search for numbers that look like prices
            const priceRegex = /(?:₹|Rs\.?|[:\-])\s*(\d+(?:\.\d+)?)/i;
            let priceMatch = workingLine.match(priceRegex);
            let price = 0;
            if (priceMatch) {
                price = parseFloat(priceMatch[1]);
                workingLine = workingLine.replace(priceMatch[0], '').trim();
            } else {
                // Fallback: search for any number at the end of the line if price not explicitly marked
                const numbers = workingLine.match(/(\d+(?:\.\d+)?)/g);
                if (numbers && numbers.length > 0) {
                    const lastNum = numbers[numbers.length - 1];
                    // If it's a large-ish number or at the end, it might be the price
                    if (originalLine.indexOf(lastNum) > originalLine.length / 2) {
                        price = parseFloat(lastNum);
                        workingLine = workingLine.replace(lastNum, '').trim();
                    }
                }
            }

            // 3. Identify and Extract Quantity & Unit
            const qtyRegex = /(\d+(?:\.\d+)?)\s*(kg|packet|pc|pcs|unit|units|gm|g|l|ml|piece|pieces)/i;
            const qtyMatch = workingLine.match(qtyRegex);
            let quantity = 1;
            let unit = 'unit';
            if (qtyMatch) {
                quantity = parseFloat(qtyMatch[1]);
                unit = qtyMatch[2].toLowerCase();
                workingLine = workingLine.replace(qtyMatch[0], '').trim();
            }

            // 4. Remaining text is the Item Name
            // Clean up separators (- , : _)
            let name = workingLine.replace(/^[\-\s\:]+|[\-\s\:]+$/g, '').trim();
            if (!name && originalLine.includes('-')) {
                // If name is empty, it might have been mangled. Try to extract from before the first dash
                name = originalLine.split('-')[0].trim();
            }

            if (name && (price > 0 || quantity > 0)) {
                items.push({
                    name: name || 'Unknown Item',
                    quantity,
                    unit,
                    price,
                    date: new Date().toISOString().split('T')[0],
                    expiry_date,
                    supplier,
                    type: originalLine.toLowerCase().includes('sold') ? 'sale' : 'inventory'
                });
            }
        });

        // Human-like refinement: if we have "Item 4th Feb" we know 4th Feb isn't a name
        return items.filter(item =>
            item.name.length > 1 &&
            !/^\d+(st|nd|rd|th)?\s+[a-z]+/i.test(item.name)
        );
    }

    /**
     * Enhanced handwriting analysis with confidence scoring and graceful degradation
     */
    public static async analyzeHandwritingEnhanced(base64Image: string): Promise<VisionResult<KhataItem>> {
        try {
            const items = await this.analyzeHandwriting(base64Image);

            // Calculate overall confidence
            const itemsWithConfidence = items.map(item => {
                // Calculate item confidence based on completeness
                let confidence = 1.0;

                // Reduce confidence if critical fields are missing or questionable
                if (!item.name || item.name === 'Unknown Item') confidence *= 0.5;
                if (item.price === 0) confidence *= 0.7;
                if (item.quantity === 0) confidence *= 0.7;
                if (!item.unit || item.unit === 'unit') confidence *= 0.9;

                // Name quality checks
                if (item.name.length < 3) confidence *= 0.6;
                if (/^\d+/.test(item.name)) confidence *= 0.5; // Starts with number

                item.confidence = confidence;
                item.requiresReview = confidence < CONFIDENCE_THRESHOLDS.HIGH;

                return item;
            });

            const overallConfidence = itemsWithConfidence.length > 0
                ? itemsWithConfidence.reduce((sum, item) => sum + (item.confidence || 0), 0) / itemsWithConfidence.length
                : 0;

            const needsConfirmation = overallConfidence < CONFIDENCE_THRESHOLDS.HIGH;

            let suggestedAction = '';
            if (overallConfidence >= CONFIDENCE_THRESHOLDS.HIGH) {
                suggestedAction = `स्कैन पूर्ण ✓ / Scan complete ✓`;
            } else if (overallConfidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
                suggestedAction = `कृपया जांचें: / Please confirm:`;
            } else {
                suggestedAction = `स्कैन अधूरा। मैन्युअल एंट्री उपलब्ध। / Scan incomplete. Manual entry available.`;
            }

            return {
                items: itemsWithConfidence,
                confidence: overallConfidence,
                needsConfirmation,
                suggestedAction,
                partialFailure: items.length === 0 || overallConfidence < CONFIDENCE_THRESHOLDS.LOW,
            };
        } catch (error: any) {
            // Graceful degradation: return empty result instead of throwing
            console.error('Enhanced vision analysis error:', error);

            return {
                items: [],
                confidence: 0,
                needsConfirmation: true,
                suggestedAction: 'स्कैन विफल। मैन्युअल एंट्री करें। / Scan failed. Please enter manually.',
                partialFailure: true,
                errorMessage: error.message || 'Analysis failed',
            };
        }
    }

    /**
     * Enhanced shelf analysis with confidence scoring
     */
    public static async analyzeShelfImageEnhanced(base64Image: string): Promise<VisionResult<ShelfItem>> {
        try {
            const result = await this.analyzeShelfImage(base64Image);

            // Add requiresReview flag to items with low confidence
            const enhancedItems = result.items.map(item => ({
                ...item,
                requiresReview: item.confidence < CONFIDENCE_THRESHOLDS.HIGH,
            }));

            const overallConfidence = enhancedItems.length > 0
                ? enhancedItems.reduce((sum, item) => sum + item.confidence, 0) / enhancedItems.length
                : 0;

            const needsConfirmation = overallConfidence < CONFIDENCE_THRESHOLDS.HIGH;

            let suggestedAction = '';
            if (overallConfidence >= CONFIDENCE_THRESHOLDS.HIGH) {
                suggestedAction = `स्कैन पूर्ण ✓ / Scan complete ✓`;
            } else if (overallConfidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
                suggestedAction = `कृपया जांचें: / Please confirm:`;
            } else {
                suggestedAction = `स्कैन अधूरा। मैन्युअल एंट्री उपलब्ध। / Scan incomplete. Manual entry available.`;
            }

            return {
                items: enhancedItems,
                confidence: overallConfidence,
                needsConfirmation,
                suggestedAction,
                partialFailure: enhancedItems.length === 0,
            };
        } catch (error: any) {
            console.error('Enhanced shelf analysis error:', error);

            return {
                items: [],
                confidence: 0,
                needsConfirmation: true,
                suggestedAction: 'स्कैन विफल। मैन्युअल एंट्री करें। / Scan failed. Please enter manually.',
                partialFailure: true,
                errorMessage: error.message || 'Analysis failed',
            };
        }
    }

    /**
     * Partial failure recovery - extract what's possible from failed scan
     */
    public static parseFallbackData(text: string): KhataItem[] {
        try {
            // Try to extract at least item names even if other fields fail
            const lines = text.split('\\n').filter(l => l.trim().length > 2);
            const fallbackItems: KhataItem[] = [];

            lines.forEach(line => {
                // Very basic extraction: assume each line might be an item
                const cleaned = line.trim();
                if (cleaned.length > 2 && !/^\\d+$/.test(cleaned)) {
                    fallbackItems.push({
                        name: cleaned.substring(0, 50), // Limit name length
                        quantity: 1,
                        unit: 'unit',
                        price: 0,
                        date: new Date().toISOString().split('T')[0],
                        type: 'inventory',
                        confidence: 0.3,
                        requiresReview: true,
                    });
                }
            });

            return fallbackItems;
        } catch (error) {
            console.error('Fallback parsing failed:', error);
            return [];
        }
    }

    /**
     * Calculate confidence for shelf deltas
     */
    public static compareScanWithConfidence(
        previous: ShelfItem[],
        current: ShelfItem[]
    ): ShelfDelta[] {
        const deltas = this.compareScans(previous, current);

        // Add confidence scoring to deltas
        return deltas.map(delta => {
            // Find matching items in current scan
            const currentItems = current.filter(item => item.name === delta.name);
            const avgConfidence = currentItems.length > 0
                ? currentItems.reduce((sum, item) => sum + item.confidence, 0) / currentItems.length
                : 0.5;

            return {
                ...delta,
                confidence: avgConfidence,
            };
        });
    }
}

