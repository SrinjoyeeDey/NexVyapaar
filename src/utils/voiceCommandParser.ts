export interface ParsedCommand {
  type: 'sale' | 'inventory' | 'expired' | 'payment' | 'return' | 'query' | 'unknown';
  action: string;
  product?: string;
  quantity?: number;
  amount?: number;
  customer?: string;
  confidence: number;
  rawText: string;
  suggestions?: ProductSuggestion[];
}

export interface ProductSuggestion {
  name: string;
  price: number;
}

interface CommandPatternSet {
  sold: RegExp[];
  add: RegExp[];
  expired: RegExp[];
  payment: RegExp[];
  return: RegExp[];
  query?: RegExp[];
}

const commonProducts: ProductSuggestion[] = [
  { name: 'Parle-G Biscuits', price: 10 },
  { name: 'Britannia Biscuits', price: 12 },
  { name: 'Sunfeast Biscuits', price: 15 },
  { name: 'Milk Packets', price: 25 },
  { name: 'Maggi Noodles', price: 14 },
  { name: 'Bread', price: 35 },
  { name: 'Eggs (dozen)', price: 80 },
  { name: 'Rice (1kg)', price: 55 },
  { name: 'Dal (1kg)', price: 120 },
  { name: 'Chips', price: 20 },
  { name: 'Cold Drink', price: 40 },
  { name: 'Soap Bar', price: 30 },
  { name: 'Shampoo', price: 45 },
  { name: 'Toothpaste', price: 60 }
];

const commandPatterns = {
  en: {
    sold: [
      /sold\s+(\d+)\s+(.+?)(?:\s+for\s+(\d+)\s*(?:rupees|rs\.?|₹)?)?$/i,
      /(\d+)\s+(.+?)\s+sold/i
    ],
    add: [
      /add(?:ed)?\s+(\d+)\s+(.+?)(?:\s+to\s+(?:inventory|stock))?$/i,
      /(\d+)\s+(.+?)\s+(?:added|add)/i
    ],
    expired: [
      /(\d+)\s+(.+?)\s+expired/i,
      /expired\s+(\d+)\s+(.+)/i
    ],
    payment: [
      /received\s+(\d+)\s*(?:rupees|rs\.?|₹)?\s+from\s+(.+)/i,
      /payment\s+(?:of\s+)?(\d+)\s*(?:rupees|rs\.?|₹)?\s+from\s+(.+)/i
    ],
    return: [
      /(.+?)\s+returned\s+(\d+)\s+(.+)/i
    ],
    query: [
      /(?:show|what(?:'s)?|how\s+much)\s+(.+)/i
    ]
  } as CommandPatternSet,
  hi: {
    sold: [
      /(\d+)\s+(.+?)\s+(?:बेचा|बेचे|बिका)/i,
      /बेचा\s+(\d+)\s+(.+)/i
    ],
    add: [
      /(\d+)\s+(.+?)\s+(?:जोड़ें|जोड़|add)/i,
      /(?:जोड़ें|जोड़|add)\s+(\d+)\s+(.+)/i
    ],
    expired: [
      /(\d+)\s+(.+?)\s+(?:खराब|ख़राब|expired)/i
    ],
    payment: [
      /(.+?)\s+से\s+(\d+)\s*(?:रुपये|रुपए|₹)?\s+मिले/i
    ],
    return: [
      /(.+?)\s+ने\s+(\d+)\s+(.+?)\s+वापस/i
    ]
  } as CommandPatternSet,
  bn: {
    sold: [
      /(\d+)\s*(?:টা|টি)?\s+(.+?)\s+(?:বিক্রি|বেচেছি|বেচা)/i,
      /(?:বিক্রি|বেচেছি)\s+(\d+)\s*(?:টা|টি)?\s+(.+)/i
    ],
    add: [
      /(\d+)\s*(?:টা|টি)?\s+(.+?)\s+(?:যোগ|add|জমা)/i,
      /(?:যোগ|add)\s+(\d+)\s*(?:টা|টি)?\s+(.+)/i
    ],
    expired: [
      /(\d+)\s*(?:টা|টি)?\s+(.+?)\s+(?:নষ্ট|খারাপ|expired)/i
    ],
    payment: [
      /(.+?)\s+থেকে\s+(\d+)\s*(?:টাকা|₹)?\s+পেয়েছি/i
    ],
    return: []
  } as CommandPatternSet,
  mr: {
    sold: [/(\d+)\s+(.+?)\s+(?:विकले|विकला)/i],
    add: [/(\d+)\s+(.+?)\s+(?:जोडा|add)/i],
    expired: [/(\d+)\s+(.+?)\s+खराब/i],
    payment: [/(.+?)\s+कडून\s+(\d+)/i],
    return: []
  } as CommandPatternSet,
  ta: {
    sold: [/(\d+)\s+(.+?)\s+(?:விற்றேன்|விற்றது)/i],
    add: [/(\d+)\s+(.+?)\s+(?:சேர்க்கவும்|add)/i],
    expired: [/(\d+)\s+(.+?)\s+காலாவதி/i],
    payment: [/(.+?)\s+இடமிருந்து\s+(\d+)/i],
    return: []
  } as CommandPatternSet,
  te: {
    sold: [/(\d+)\s+(.+?)\s+(?:అమ్మాను|అమ్మింది)/i],
    add: [/(\d+)\s+(.+?)\s+(?:జోడించండి|add)/i],
    expired: [/(\d+)\s+(.+?)\s+ముగిసింది/i],
    payment: [],
    return: []
  } as CommandPatternSet,
  gu: {
    sold: [/(\d+)\s+(.+?)\s+(?:વેચ્યા|વેચ્યું)/i],
    add: [/(\d+)\s+(.+?)\s+(?:ઉમેરો|add)/i],
    expired: [/(\d+)\s+(.+?)\s+સમાપ્ત/i],
    payment: [],
    return: []
  } as CommandPatternSet
};

// Convert local script numbers to Arabic numerals
function parseLocalizedNumber(text: string): number {
  const digitMaps: Record<string, Record<string, string>> = {
    bengali: { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' },
    devanagari: { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' },
    tamil: { '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4', '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9' },
    telugu: { '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4', '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9' },
    gujarati: { '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4', '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9' }
  };

  let converted = text;
  for (const map of Object.values(digitMaps)) {
    for (const [local, arabic] of Object.entries(map)) {
      converted = converted.replace(new RegExp(local, 'g'), arabic);
    }
  }

  return parseInt(converted, 10) || 0;
}

function isAmbiguousProductText(productText: string) {
  const p = productText.toLowerCase().trim();
  return (
    p.length < 4 ||
    /(item|items|product|stuff|biscuit|biscuits)/i.test(p) ||
    /(सामान|आइटम|वस्तु|बिस्किट)/i.test(productText) ||
    /(আইটেম|পণ্য|বিস্কুট)/i.test(productText)
  );
}

function findProduct(productText: string): ProductSuggestion | null {
  const normalized = productText.toLowerCase().trim();
  
  // Direct match
  const direct = commonProducts.find(p => 
    p.name.toLowerCase().includes(normalized) || 
    normalized.includes(p.name.toLowerCase())
  );
  if (direct) return direct;

  // Fuzzy match keywords
  const keywords: Record<string, string[]> = {
    'Parle-G Biscuits': ['parle', 'parle-g', 'biscuit', 'biscuits'],
    'Britannia Biscuits': ['britannia', 'britannia biscuit'],
    'Sunfeast Biscuits': ['sunfeast'],
    'Milk Packets': ['milk', 'doodh', 'दूध', 'দুধ'],
    'Maggi Noodles': ['maggi', 'noodles', 'मैगी', 'ম্যাগি'],
    'Bread': ['bread', 'roti', 'রুটি'],
    'Eggs (dozen)': ['egg', 'eggs', 'anda', 'अंडा', 'ডিম'],
    'Rice (1kg)': ['rice', 'chawal', 'चावल', 'চাল'],
    'Dal (1kg)': ['dal', 'daal', 'दाल', 'ডাল'],
    'Chips': ['chips', 'चिप्स'],
    'Cold Drink': ['cold drink', 'soda', 'coke', 'pepsi'],
    'Soap Bar': ['soap', 'साबुन', 'সাবান'],
    'Shampoo': ['shampoo', 'शैम्पू'],
    'Toothpaste': ['toothpaste', 'colgate', 'टूथपेस्ट']
  };

  for (const [productName, kws] of Object.entries(keywords)) {
    if (kws.some(kw => normalized.includes(kw))) {
      return commonProducts.find(p => p.name === productName) || null;
    }
  }

  return null;
}

export function parseVoiceCommand(text: string, language: string = 'en'): ParsedCommand {
  const normalizedText = text.toLowerCase().trim();
  const lang = language as keyof typeof commandPatterns;
  const patterns = commandPatterns[lang] || commandPatterns.en;

  // Try sale patterns
  for (const pattern of patterns.sold || []) {
    const match = normalizedText.match(pattern);
    if (match) {
      const quantity = parseLocalizedNumber(match[1]);
      const productText = match[2]?.trim();
      const amount = match[3] ? parseLocalizedNumber(match[3]) : undefined;
      const product = productText ? findProduct(productText) : null;

      if (product) {
        return {
          type: 'sale',
          action: 'Sale',
          product: product.name,
          quantity,
          amount: amount || quantity * product.price,
          confidence: 0.9,
          rawText: text
        };
      }

      // If user said a generic thing (e.g. "biscuit"), ask; otherwise accept their product text.
      if (productText && isAmbiguousProductText(productText)) {
        return {
          type: 'sale',
          action: 'Sale',
          quantity,
          confidence: 0.5,
          rawText: text,
          suggestions: commonProducts.filter(p => p.name.toLowerCase().includes('biscuit')).slice(0, 3)
        };
      }

      return {
        type: 'sale',
        action: 'Sale',
        product: productText,
        quantity,
        amount,
        confidence: 0.75,
        rawText: text
      };
    }
  }

  // Try add patterns
  for (const pattern of patterns.add || []) {
    const match = normalizedText.match(pattern);
    if (match) {
      const quantity = parseLocalizedNumber(match[1]);
      const productText = match[2]?.trim();
      const product = productText ? findProduct(productText) : null;

      const resolvedName = product?.name || productText;
      const ambiguous = !!productText && isAmbiguousProductText(productText);

      return {
        type: 'inventory',
        action: 'Add Inventory',
        product: resolvedName,
        quantity,
        confidence: product ? 0.9 : 0.7,
        rawText: text,
        suggestions: !product && ambiguous ? commonProducts.slice(0, 3) : undefined
      };
    }
  }

  // Try expired patterns
  for (const pattern of patterns.expired || []) {
    const match = normalizedText.match(pattern);
    if (match) {
      const quantity = parseLocalizedNumber(match[1]);
      const productText = match[2]?.trim();
      const product = findProduct(productText);

      return {
        type: 'expired',
        action: 'Expired',
        product: product?.name || productText,
        quantity,
        confidence: product ? 0.9 : 0.6,
        rawText: text
      };
    }
  }

  // Try payment patterns
  for (const pattern of patterns.payment || []) {
    const match = normalizedText.match(pattern);
    if (match) {
      return {
        type: 'payment',
        action: 'Payment',
        amount: parseLocalizedNumber(match[1]),
        customer: match[2]?.trim(),
        confidence: 0.85,
        rawText: text
      };
    }
  }

  // Try return patterns
  for (const pattern of patterns.return || []) {
    const match = normalizedText.match(pattern);
    if (match) {
      const customer = match[1]?.trim();
      const quantity = parseLocalizedNumber(match[2]);
      const productText = match[3]?.trim();
      const product = findProduct(productText);

      return {
        type: 'return',
        action: 'Return',
        customer,
        product: product?.name || productText,
        quantity,
        confidence: 0.8,
        rawText: text
      };
    }
  }

  // Try English patterns as fallback for code-mixed speech
  if (lang !== 'en') {
    const enPatterns = commandPatterns.en;
    for (const pattern of enPatterns.sold) {
      const match = normalizedText.match(pattern);
      if (match) {
        const quantity = parseLocalizedNumber(match[1]);
        const productText = match[2]?.trim();
        const product = findProduct(productText);

        return {
          type: 'sale',
          action: 'Sale',
          product: product?.name || productText,
          quantity,
          amount: product ? quantity * product.price : undefined,
          confidence: product ? 0.85 : 0.5,
          rawText: text,
          suggestions: product ? undefined : commonProducts.slice(0, 3)
        };
      }
    }
  }

  return {
    type: 'unknown',
    action: 'Unknown',
    confidence: 0,
    rawText: text
  };
}

export { commonProducts };
