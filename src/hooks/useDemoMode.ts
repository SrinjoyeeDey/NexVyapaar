import { useState, useEffect } from "react";

/**
 * Hook to detect if the app is in demo mode
 */
export const useDemoMode = () => {
    const [isDemoMode, setIsDemoMode] = useState(false);

    useEffect(() => {
        const checkDemoMode = () => {
            const demoFlag = localStorage.getItem("demo_mode") === "true";
            const urlParams = new URLSearchParams(window.location.search);
            const demoParam = urlParams.get("demo") === "true";

            setIsDemoMode(demoFlag || demoParam);
        };

        checkDemoMode();

        // Listen for storage changes
        window.addEventListener("storage", checkDemoMode);

        return () => {
            window.removeEventListener("storage", checkDemoMode);
        };
    }, []);

    return isDemoMode;
};

/**
 * Get current demo user ID
 */
export const getDemoUserId = (): string => {
    return localStorage.getItem("demo_user_id") || "demo_user";
};

/**
 * Check if currently in demo mode (synchronous)
 */
export const isDemoMode = (): boolean => {
    return (
        localStorage.getItem("demo_mode") === "true" ||
        window.location.search.includes("demo=true")
    );
};
