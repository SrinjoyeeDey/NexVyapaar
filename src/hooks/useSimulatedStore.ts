import { useState, useEffect } from 'react';

export interface InventoryItem {
    id: string;
    name: string;
    stock: number;
    threshold: number;
    usage: 'Low' | 'Medium' | 'High';
    status: 'Critical' | 'Low' | 'Healthy' | 'Optimal';
    daysRemaining: number;
    icon: string;
    category: string;
}

const SEEDED_DATA: InventoryItem[] = [
    {
        id: '1',
        name: 'Flour (Ashirvaad)',
        stock: 5,
        threshold: 12,
        usage: 'High',
        status: 'Critical',
        daysRemaining: 2,
        icon: '🌾',
        category: 'Staples'
    },
    {
        id: '2',
        name: 'Kissan Jam',
        stock: 10,
        threshold: 15,
        usage: 'Medium',
        status: 'Low',
        daysRemaining: 5,
        icon: '🍓',
        category: 'Spreads'
    },
    {
        id: '3',
        name: 'Harvest Bread',
        stock: 40,
        threshold: 15,
        usage: 'High',
        status: 'Healthy',
        daysRemaining: 12,
        icon: '🍞',
        category: 'Bakery'
    },
    {
        id: '4',
        name: 'Amul Gold Milk',
        stock: 100,
        threshold: 30,
        usage: 'High',
        status: 'Optimal',
        daysRemaining: 20,
        icon: '🥛',
        category: 'Dairy'
    },
    {
        id: '5',
        name: 'Maggi Noodles',
        stock: 8,
        threshold: 20,
        usage: 'Medium',
        status: 'Low',
        daysRemaining: 4,
        icon: '🍜',
        category: 'Instant'
    }
];

export const useSimulatedStore = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>(() => {
        const saved = localStorage.getItem('nex_vyapaar_simulated_inventory');
        return saved ? JSON.parse(saved) : SEEDED_DATA;
    });

    useEffect(() => {
        localStorage.setItem('nex_vyapaar_simulated_inventory', JSON.stringify(inventory));
    }, [inventory]);

    const updateStock = (id: string, newStock: number) => {
        setInventory(prev => prev.map(item => {
            if (item.id === id) {
                let status: InventoryItem['status'] = 'Optimal';
                if (newStock <= item.threshold / 2) status = 'Critical';
                else if (newStock <= item.threshold) status = 'Low';
                else if (newStock <= item.threshold * 2) status = 'Healthy';

                return {
                    ...item,
                    stock: newStock,
                    status,
                    daysRemaining: Math.ceil(newStock / (item.usage === 'High' ? 5 : item.usage === 'Medium' ? 3 : 1))
                };
            }
            return item;
        }));
    };

    const placeOrder = (id: string) => {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const item = inventory.find(i => i.id === id);
                if (item) {
                    updateStock(id, item.stock + 50); // Simulate large restock
                }
                resolve();
            }, 2000);
        });
    };

    return { inventory, updateStock, placeOrder };
};
