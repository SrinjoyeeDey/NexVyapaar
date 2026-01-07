import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to determine if the app is in demo mode or production mode
 * @returns {Object} - { isDemo: boolean, isLoading: boolean }
 */
export const useDataMode = () => {
    const [isDemo, setIsDemo] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkMode = async () => {
            // Check if demo mode flag exists in localStorage
            const demoMode = localStorage.getItem("demo_mode");

            if (demoMode === "true") {
                setIsDemo(true);
                setIsLoading(false);
                return;
            }

            // Check if real user is authenticated via Supabase
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setIsDemo(false);
            } else {
                setIsDemo(true);
            }

            setIsLoading(false);
        };

        checkMode();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                // User logged in - switch to production mode
                localStorage.removeItem("demo_mode");
                setIsDemo(false);
            } else if (!localStorage.getItem("demo_mode")) {
                // No user and no demo flag - default to demo
                setIsDemo(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return { isDemo, isLoading };
};
