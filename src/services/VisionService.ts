import * as jose from 'jose';

// Load Service Account JSON (in a real app, this should be handled securely on the backend)
// For this demo, we use the provided credentials to demonstrate immediate functionality
import credentials from '../../abp-mirgated-8f78aa899c88.json';

export interface KhataItem {
    name: string;
    quantity: number;
    unit: string;
    price: number;
    date: string;
    expiry_date?: string;
    type: 'sale' | 'inventory';
    supplier?: string;
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
}

export interface ShelfScanResult {
    items: ShelfItem[];
    timestamp: string;
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
}

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
                        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
                        imageContext: {
                            languageHints: ['en', 'hi'],
                        },
                    },
                ],
            }),
        });

        const data = await response.json();
        const fullText = data.responses[0]?.fullTextAnnotation?.text || '';

        return this.parseKhataText(fullText);
    }

    public static async analyzeShelfImage(base64Image: string): Promise<ShelfScanResult> {
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

        const data = await response.json();
        const visionResponse = data.responses[0];

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
}
