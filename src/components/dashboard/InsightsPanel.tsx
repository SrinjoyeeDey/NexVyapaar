import { motion } from "framer-motion";
import {
    AlertTriangle,
    TrendingUp,
    CheckCircle,
    Target,
    ArrowRight
} from "lucide-react";

interface InsightCard {
    type: "URGENT" | "OPPORTUNITY" | "DOING_WELL" | "PREDICTION";
    icon: string;
    title: string;
    description: string;
    action: string;
}

const mockInsights: InsightCard[] = [
    {
        type: "URGENT",
        icon: "🚨",
        title: "Low stock alert",
        description: "5 items running low. Restock soon to avoid stockouts.",
        action: "View Items",
    },
    {
        type: "OPPORTUNITY",
        icon: "📈",
        title: "Peak sales time detected",
        description: "Launch a campaign between 2-4 PM for 30% higher engagement.",
        action: "Create Campaign",
    },
    {
        type: "DOING_WELL",
        icon: "✅",
        title: "Great month!",
        description: "You're 85% ahead of your monthly target. Keep it up!",
        action: "View Report",
    },
    {
        type: "PREDICTION",
        icon: "🎯",
        title: "Demand forecast",
        description: "Coffee sales likely to increase 20% next week based on trends.",
        action: "Prepare Stock",
    },
];

const insightStyles = {
    URGENT: {
        borderColor: "border-red-200",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        badgeColor: "text-red-700",
    },
    OPPORTUNITY: {
        borderColor: "border-green-200",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        badgeColor: "text-green-700",
    },
    DOING_WELL: {
        borderColor: "border-blue-200",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        badgeColor: "text-blue-700",
    },
    PREDICTION: {
        borderColor: "border-purple-200",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        badgeColor: "text-purple-700",
    },
};

export function InsightsPanel() {
    return (
        <div className="bg-gradient-to-b from-indigo-50 to-transparent rounded-2xl p-6 border border-indigo-100">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-xl">✨</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Smart Insights</h3>
                    <p className="text-xs text-slate-500">AI-powered recommendations</p>
                </div>
            </div>

            {/* Insight Cards */}
            <div className="space-y-4">
                {mockInsights.map((insight, index) => {
                    const styles = insightStyles[insight.type];

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={{ scale: 1.02 }}
                            className={`
                bg-white rounded-xl p-4 border-l-4 ${styles.borderColor}
                shadow-sm hover:shadow-md transition-all duration-300
              `}
                        >
                            {/* Type Badge */}
                            <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${styles.badgeColor}`}>
                                {insight.type.replace("_", " ")}
                            </div>

                            {/* Content */}
                            <div className="flex gap-3">
                                {/* Icon */}
                                <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
                                    <span className="text-xl">{insight.icon}</span>
                                </div>

                                {/* Text */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-900 mb-1">
                                        {insight.title}
                                    </h4>
                                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                                        {insight.description}
                                    </p>

                                    {/* Action Button */}
                                    <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 group">
                                        {insight.action}
                                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* View All Button */}
            <button className="w-full mt-4 px-4 py-2 border-2 border-indigo-200 text-indigo-600 rounded-xl font-medium text-sm hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-center gap-2">
                View All Insights
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    );
}
