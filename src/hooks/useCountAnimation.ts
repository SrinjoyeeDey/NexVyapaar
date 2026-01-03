import { useEffect, useState } from "react";

/**
 * Custom hook for animating number values
 * Counts from 0 to target value with easing
 */
export function useCountAnimation(
    target: number,
    duration: number = 1000,
    delay: number = 0
): number {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const startTime = Date.now();
            const startValue = 0;

            const animate = () => {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function (ease-out cubic)
                const easeOut = 1 - Math.pow(1 - progress, 3);

                const currentValue = startValue + (target - startValue) * easeOut;
                setCount(Math.round(currentValue));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            animate();
        }, delay);

        return () => clearTimeout(timeout);
    }, [target, duration, delay]);

    return count;
}

/**
 * Format number as currency
 */
export function formatCurrency(value: number, currency: string = "₹"): string {
    return `${currency}${value.toLocaleString("en-IN")}`;
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number, decimal: number = 1): string {
    return `${value.toFixed(decimal)}%`;
}
