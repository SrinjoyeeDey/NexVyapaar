import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { useCountAnimation, formatCurrency, formatPercentage } from "@/hooks/useCountAnimation";
import { Progress } from "@/components/ui/progress";
import { fadeInUp } from "@/utils/animations";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: number;
    isCurrency?: boolean;
    isPercentage?: boolean;
    trend: {
        value: number;
        isPositive: boolean;
        label: string;
    };
    progress: {
        current: number;
        goal: number;
        label: string;
    };
    icon: LucideIcon;
    accentColor: "indigo" | "saffron" | "blue" | "purple";
    delay?: number;
}

const accentColors = {
    indigo: {
        bg: "from-indigo-500 to-indigo-600",
        border: "border-indigo-500",
        progressBg: "bg-indigo-500",
        shadow: "shadow-indigo-500/20",
    },
    saffron: {
        bg: "from-saffron-500 to-saffron-600",
        border: "border-saffron-500",
        progressBg: "bg-saffron-500",
        shadow: "shadow-saffron-500/20",
    },
    blue: {
        bg: "from-blue-500 to-blue-600",
        border: "border-blue-500",
        progressBg: "bg-blue-500",
        shadow: "shadow-blue-500/20",
    },
    purple: {
        bg: "from-purple-500 to-purple-600",
        border: "border-purple-500",
        progressBg: "bg-purple-500",
        shadow: "shadow-purple-500/20",
    },
};

export function MetricCard({
    title,
    value,
    isCurrency = false,
    isPercentage = false,
    trend,
    progress,
    icon: Icon,
    accentColor,
    delay = 0,
}: MetricCardProps) {
    const animatedValue = useCountAnimation(value, 1000, delay);
    const progressPercent = Math.round((progress.current / progress.goal) * 100);

    const colors = accentColors[accentColor];

    const formattedValue = isCurrency
        ? formatCurrency(animatedValue)
        : isPercentage
            ? formatPercentage(animatedValue)
            : animatedValue.toLocaleString();

    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay }}
            whileHover={{ y: -4 }}
            className={`
        relative bg-white rounded-2xl p-8 
        border border-slate-200
        shadow-sm hover:shadow-lg
        transition-all duration-300
        group
        ${colors.shadow}
        border-t-4 ${colors.border}
      `}
        >
            {/* Icon Circle */}
            <div className={`
        w-14 h-14 rounded-full 
        bg-gradient-to-br ${colors.bg}
        flex items-center justify-center
        shadow-md mb-4
        group-hover:rotate-3 transition-transform duration-300
      `}>
                <Icon className="h-7 w-7 text-white" />
            </div>

            {/* Title */}
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                {title}
            </div>

            {/* Large Number */}
            <div className="text-5xl font-bold text-slate-900 mb-3 tabular-nums">
                {formattedValue}
            </div>

            {/* Trend Badge */}
            <div className="flex items-center gap-2 mb-4">
                <span className={`
          inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold
          ${trend.isPositive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }
        `}>
                    {trend.isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                    ) : (
                        <TrendingDown className="h-4 w-4" />
                    )}
                    {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
                <span className="text-xs text-slate-500">{trend.label}</span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, delay: delay + 0.4, ease: "easeOut" }}
                        className={`h-full ${colors.progressBg} rounded-full`}
                    />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{progress.label}</span>
                    <span className="font-semibold">{progressPercent}%</span>
                </div>
            </div>

            {/* Action Link */}
            <div className="mt-4">
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium group/link">
                    Set goal
                    <span className="inline-block transition-transform group-hover/link:translate-x-1 ml-1">
                        →
                    </span>
                </button>
            </div>
        </motion.div>
    );
}
