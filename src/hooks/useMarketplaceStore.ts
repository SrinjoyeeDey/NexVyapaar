import { useState, useEffect } from 'react';

export interface Business {
    id: string;
    name: string;
    category: string;
    latitude: number;
    longitude: number;
    active_status: boolean;
    description?: string;
    joined_date: string;
}

export interface GroupBuy {
    id: string;
    product_name: string;
    current_participants: number;
    required_participants: number;
    discount_percentage: number;
    status: 'open' | 'locked' | 'completed';
    estimated_savings: number;
}

export interface Participation {
    business_id: string;
    groupbuy_id: string;
    joined_at: string;
}

const SEEDED_BUSINESSES: Business[] = [
    {
        id: 'b1',
        name: 'Gupta Kirana & General Store',
        category: 'Grocery',
        latitude: 19.0762,
        longitude: 72.8780,
        active_status: true,
        description: 'Quality staples and daily needs since 1995.',
        joined_date: '2023-11-12'
    },
    {
        id: 'b2',
        name: 'Super Fresh Dairy',
        category: 'Dairy & Poultry',
        latitude: 19.0758,
        longitude: 72.8775,
        active_status: true,
        description: 'Fresh milk, paneer and eggs delivered daily.',
        joined_date: '2024-01-05'
    },
    {
        id: 'b3',
        name: 'Modern Electronics',
        category: 'Electronics',
        latitude: 19.0765,
        longitude: 72.8770,
        active_status: true,
        description: 'Authorised dealer for top appliance brands.',
        joined_date: '2023-08-20'
    },
    {
        id: 'b4',
        name: 'Sai Medicals',
        category: 'Pharmacy',
        latitude: 19.0750,
        longitude: 72.8790,
        active_status: true,
        description: '24/7 medicine supply and healthcare products.',
        joined_date: '2024-02-15'
    },
    {
        id: 'b5',
        name: 'Vikas Stationery',
        category: 'Office Supplies',
        latitude: 19.0770,
        longitude: 72.8760,
        active_status: true,
        description: 'Everything for students and local offices.',
        joined_date: '2023-12-01'
    }
];

const SEEDED_GROUP_BUYS: GroupBuy[] = [
    {
        id: 'gb1',
        product_name: 'Detergent (Bulk 50kg)',
        current_participants: 5,
        required_participants: 6,
        discount_percentage: 8,
        status: 'open',
        estimated_savings: 1200
    }
];

// Current User Business (Simulated)
const USER_BUSINESS_ID = 'user_main_shop';
const USER_COORDS = { lat: 19.0760, lng: 72.8777 };

export const useMarketplaceStore = () => {
    const [businesses] = useState<Business[]>(SEEDED_BUSINESSES);
    const [groupBuys, setGroupBuys] = useState<GroupBuy[]>(() => {
        const saved = localStorage.getItem('nex_vyapaar_group_buys');
        return saved ? JSON.parse(saved) : SEEDED_GROUP_BUYS;
    });
    const [participations, setParticipations] = useState<Participation[]>(() => {
        const saved = localStorage.getItem('nex_vyapaar_participations');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('nex_vyapaar_group_buys', JSON.stringify(groupBuys));
    }, [groupBuys]);

    useEffect(() => {
        localStorage.setItem('nex_vyapaar_participations', JSON.stringify(participations));
    }, [participations]);

    // Haversine formula for distance calculation
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in metres
    };

    const getNearbyBusinesses = () => {
        return businesses
            .map(b => ({
                ...b,
                distance: calculateDistance(USER_COORDS.lat, USER_COORDS.lng, b.latitude, b.longitude)
            }))
            .filter(b => b.distance <= 500) // 500m radius
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5); // Limit to top 5
    };

    const joinGroupBuy = (groupBuyId: string) => {
        // Check if already joined
        if (participations.some(p => p.groupbuy_id === groupBuyId && p.business_id === USER_BUSINESS_ID)) {
            return { success: false, message: 'Already joined this order.' };
        }

        const newParticipation: Participation = {
            business_id: USER_BUSINESS_ID,
            groupbuy_id: groupBuyId,
            joined_at: new Date().toISOString()
        };

        setParticipations(prev => [...prev, newParticipation]);

        setGroupBuys(prev => prev.map(gb => {
            if (gb.id === groupBuyId) {
                const newCount = gb.current_participants + 1;
                return {
                    ...gb,
                    current_participants: newCount,
                    status: newCount >= gb.required_participants ? 'locked' : 'open'
                };
            }
            return gb;
        }));

        return { success: true, message: 'Successfully joined the group order.' };
    };

    const isJoined = (groupBuyId: string) => {
        return participations.some(p => p.groupbuy_id === groupBuyId && p.business_id === USER_BUSINESS_ID);
    };

    return {
        businesses: getNearbyBusinesses(),
        groupBuys,
        joinGroupBuy,
        isJoined,
        participations
    };
};
