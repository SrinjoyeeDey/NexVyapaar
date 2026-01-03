import { Variants } from "framer-motion";

/**
 * Page load animation - Fade in with slide up
 */
export const fadeInUp: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
};

/**
 * Stagger children animation
 */
export const staggerChildren: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

/**
 * Scale in animation for modals/tooltips
 */
export const scaleIn: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.2,
            ease: "easeOut",
        },
    },
};

/**
 * Hover animation for cards
 */
export const cardHover = {
    rest: {
        y: 0,
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    },
    hover: {
        y: -4,
        boxShadow: "0 10px 15px -3px rgba(67, 56, 202, 0.2)",
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
};

/**
 * Spring animation config for FAB entrance
 */
export const springConfig = {
    type: "spring" as const,
    stiffness: 260,
    damping: 20,
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Get animation variants respecting user preference
 */
export const getAnimationVariants = (variants: Variants): Variants => {
    if (prefersReducedMotion()) {
        // Return simplified variants for reduced motion
        return {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.2 } },
        };
    }
    return variants;
};
