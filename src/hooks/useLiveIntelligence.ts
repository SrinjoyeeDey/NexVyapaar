import { useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useMarketplaceStore } from "@/hooks/useMarketplaceStore";
import { useSimulatedStore } from "@/hooks/useSimulatedStore";

const INSIGHTS = [
    {
        title: "AI Restock Alert ⚠️",
        description: "Ashirvaad Flour is critically low. Sales velocity suggests you'll run out by closing time.",
        type: "danger"
    },
    {
        title: "Community Signal 🤝",
        description: "3 nearby shops just joined the Detergent Group Order. Join now to lock ₹1,200 savings.",
        type: "info"
    },
    {
        title: "Expiry Warning 🍞",
        description: "Harvest Bread (Batch #203) expires in 48h. NexVyapaar suggests a 'Buy 1 Get 1' for local customers.",
        type: "warning"
    },
    {
        title: "Credit Score Boost 📈",
        description: "Your digital compliance score improved to 82/100 after syncing latest bank records.",
        type: "success"
    },
    {
        title: "Marketing Opportunity 📱",
        description: "Localized rain forecasted for tomorrow. AI suggests running a 'Monsoon Essentials' bundle.",
        type: "info"
    }
];

export const useLiveIntelligence = () => {
    const { toast } = useToast();
    const { inventory } = useSimulatedStore();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Initialization toast
        toast({
            title: "NexVyapaar OS Initialized 🚀",
            description: "Decision intelligence and live sync active for this session.",
            className: "bg-slate-900 text-white border-indigo-500",
        });

        // Start periodic notifications after a short delay
        const timer = setTimeout(() => {
            intervalRef.current = setInterval(() => {
                const insight = INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)];

                toast({
                    title: insight.title,
                    description: insight.description,
                    variant: insight.type === 'danger' ? 'destructive' : 'default',
                    className: insight.type === 'success' ? 'bg-green-600 text-white' :
                        insight.type === 'warning' ? 'bg-amber-500 text-white' :
                            insight.type === 'info' ? 'bg-indigo-600 text-white' : '',
                });
            }, 30000); // Every 30 seconds for non-overwhelming demo feel
        }, 5000);

        return () => {
            clearTimeout(timer);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Additional logic can be added here to bridge stores if needed
};
