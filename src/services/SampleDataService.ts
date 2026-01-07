/**
 * Sample/Template Data Service
 * 
 * Provides pre-populated sample data visible to ALL authenticated users.
 * This makes the application look professional and complete immediately upon login.
 * 
 * Sample data is marked with is_sample: true and displayed with visual badges.
 * Users can add their own data which appears alongside samples.
 */

export const SampleDataService = {
    // Sample Inventory Items
    inventory: [
        {
            id: 'sample-inv-1',
            name: 'Amul Gold Milk (1L)',
            current_stock: 50,
            unit: 'packets',
            cost_per_unit: 28,
            selling_price: 33,
            category: 'Dairy',
            supplier: 'Sample Dairy Co.',
            expiry_date: '2025-06-30',
            reorder_point: 20,
            batch_number: 'SAMPLE-BATCH-001',
            is_sample: true
        },
        {
            id: 'sample-inv-2',
            name: 'Harvest Gold Bread',
            current_stock: 30,
            unit: 'loaves',
            cost_per_unit: 35,
            selling_price: 45,
            category: 'Bakery',
            supplier: 'Sample Bakery Ltd.',
            expiry_date: '2025-01-15',
            reorder_point: 15,
            batch_number: 'SAMPLE-BATCH-002',
            is_sample: true
        },
        {
            id: 'sample-inv-3',
            name: 'Tata Salt (1kg)',
            current_stock: 100,
            unit: 'packets',
            cost_per_unit: 18,
            selling_price: 22,
            category: 'Groceries',
            supplier: 'Sample Wholesale',
            expiry_date: '2026-12-31',
            reorder_point: 40,
            batch_number: 'SAMPLE-BATCH-003',
            is_sample: true
        },
        {
            id: 'sample-inv-4',
            name: 'Britannia Biscuits',
            current_stock: 45,
            unit: 'packets',
            cost_per_unit: 25,
            selling_price: 30,
            category: 'Snacks',
            supplier: 'Sample Distributors',
            expiry_date: '2025-08-20',
            reorder_point: 25,
            batch_number: 'SAMPLE-BATCH-004',
            is_sample: true
        },
        {
            id: 'sample-inv-5',
            name: 'Fresh Paneer (200g)',
            current_stock: 12,
            unit: 'packets',
            cost_per_unit: 80,
            selling_price: 100,
            category: 'Dairy',
            supplier: 'Sample Dairy Co.',
            expiry_date: '2025-01-10',
            reorder_point: 8,
            batch_number: 'SAMPLE-BATCH-005',
            is_sample: true
        }
    ],

    // Sample Suppliers
    suppliers: [
        {
            id: 'sample-supp-1',
            name: 'Sample Dairy Co.',
            contact_person: 'Srinjoyee',
            phone: '+91 98765 43210',
            email: 'contact@sampledairy.com',
            address: '123 Sample Street, Mumbai, Maharashtra 400001',
            products_supplied: ['Milk', 'Butter', 'Paneer', 'Curd'],
            payment_terms: 'Net 30',
            is_verified: true,
            is_sample: true
        },
        {
            id: 'sample-supp-2',
            name: 'Sample Bakery Ltd.',
            contact_person: 'Priya Sharma',
            phone: '+91 98765 43211',
            email: 'orders@samplebakery.com',
            address: '456 Baker Road, Delhi, NCR 110001',
            products_supplied: ['Bread', 'Buns', 'Cakes', 'Pastries'],
            payment_terms: 'Net 15',
            is_verified: true,
            is_sample: true
        },
        {
            id: 'sample-supp-3',
            name: 'Sample Wholesale',
            contact_person: 'Amit Patel',
            phone: '+91 98765 43212',
            email: 'info@samplewholesale.com',
            address: '789 Market Lane, Ahmedabad, Gujarat 380001',
            products_supplied: ['Salt', 'Sugar', 'Rice', 'Flour'],
            payment_terms: 'Cash on Delivery',
            is_verified: true,
            is_sample: true
        }
    ],

    // Sample Sales Data
    salesData: [
        {
            id: 'sample-sale-1',
            product_name: 'Amul Gold Milk (1L)',
            quantity: 10,
            total_price: 330,
            payment_method: 'upi',
            sale_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            profit: 50,
            is_sample: true
        },
        {
            id: 'sample-sale-2',
            product_name: 'Harvest Gold Bread',
            quantity: 5,
            total_price: 225,
            payment_method: 'cash',
            sale_date: new Date(Date.now() - 86400000).toISOString(),
            profit: 50,
            is_sample: true
        },
        {
            id: 'sample-sale-3',
            product_name: 'Tata Salt (1kg)',
            quantity: 15,
            total_price: 330,
            payment_method: 'upi',
            sale_date: new Date().toISOString(), // Today
            profit: 60,
            is_sample: true
        }
    ],

    // Sample Insights/Analytics
    insights: {
        totalRevenue: 150000,
        totalExpenses: 95000,
        totalProfit: 55000,
        profitMargin: 36.67,
        topProducts: [
            { name: 'Amul Gold Milk (1L)', sales: 15000, quantity: 450 },
            { name: 'Harvest Gold Bread', sales: 12000, quantity: 300 },
            { name: 'Tata Salt (1kg)', sales: 8000, quantity: 400 }
        ],
        monthlyTrend: [
            { month: 'Oct', revenue: 130000, expenses: 85000 },
            { month: 'Nov', revenue: 140000, expenses: 90000 },
            { month: 'Dec', revenue: 150000, expenses: 95000 },
            { month: 'Jan', revenue: 160000, expenses: 98000 }
        ],
        categoryBreakdown: [
            { category: 'Dairy', percentage: 40, sales: 60000 },
            { category: 'Bakery', percentage: 25, sales: 37500 },
            { category: 'Groceries', percentage: 20, sales: 30000 },
            { category: 'Snacks', percentage: 15, sales: 22500 }
        ]
    },

    // Sample Low Stock Alerts
    lowStockAlerts: [
        {
            id: 'sample-alert-1',
            material_id: 'sample-inv-5',
            message: 'Fresh Paneer (200g) is running low - 12 packets remaining',
            current_value: 12,
            threshold_value: 8,
            alert_type: 'low_stock',
            is_acknowledged: false,
            created_at: new Date().toISOString(),
            is_sample: true
        }
    ],

    // Sample AI Recommendations
    recommendationsai: [
        {
            id: 'sample-rec-1',
            title: 'Optimize Dairy Product Ordering',
            description: 'Consider increasing Amul Milk order quantity by 20% based on sales trends',
            recommendation_type: 'inventory',
            impact_score: 85,
            is_read: false,
            created_at: new Date().toISOString(),
            is_sample: true
        },
        {
            id: 'sample-rec-2',
            title: 'Seasonal Demand Alert',
            description: 'Bread sales typically increase by 30% during morning hours. Consider stocking more.',
            recommendation_type: 'sales',
            impact_score: 75,
            is_read: false,
            created_at: new Date().toISOString(),
            is_sample: true
        }
    ]
};
