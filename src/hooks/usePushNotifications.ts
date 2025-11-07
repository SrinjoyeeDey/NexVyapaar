import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePushNotifications() {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Not supported",
        description: "Push notifications are not supported in this browser",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        await registerServiceWorker();
        toast({
          title: "Notifications enabled! 🔔",
          description: "You'll receive updates even when the app is closed"
        });
        return true;
      } else {
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);
        console.log('Service Worker registered:', reg);
        
        // Subscribe to push notifications
        await subscribeToPush(reg);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const subscribeToPush = async (reg: ServiceWorkerRegistration) => {
    try {
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // This is a placeholder VAPID public key - in production, generate your own
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8v_qmLRZoOz...'
        )
      });

      // Save subscription to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Store subscription in your database
        console.log('Push subscription:', subscription);
      }
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && registration) {
      registration.showNotification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    }
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: 'Notification' in window
  };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
