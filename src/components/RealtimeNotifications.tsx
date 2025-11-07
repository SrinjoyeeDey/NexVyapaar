import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell } from 'lucide-react';

export function RealtimeNotifications() {
  const { toast } = useToast();
  const { sendNotification, permission } = usePushNotifications();

  useEffect(() => {
    const setupChannels = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Listen to community likes
      const likesChannel = supabase
        .channel('community-likes-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'community_likes'
          },
          async (payload: any) => {
            const { data: post } = await supabase
              .from('community_posts')
              .select('title, user_id')
              .eq('id', payload.new.post_id)
              .single();

            if (post && post.user_id === user.id) {
              const message = `Someone liked your post: "${post.title}"`;
              toast({
                title: "New Like! 👍",
                description: message,
                action: <Bell className="h-4 w-4" />
              });
              
              // Send push notification if enabled
              if (permission === 'granted') {
                sendNotification('New Like! 👍', {
                  body: message,
                  tag: 'community-like'
                });
              }
            }
          }
        )
        .subscribe();

      // Listen to community posts
      const postsChannel = supabase
        .channel('community-posts-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'community_posts'
          },
          (payload: any) => {
            if (payload.new.user_id !== user.id) {
              const message = `New post: "${payload.new.title}"`;
              toast({
                title: "New Community Post 📝",
                description: message,
                action: <Bell className="h-4 w-4" />
              });
              
              // Send push notification
              if (permission === 'granted') {
                sendNotification('New Community Post 📝', {
                  body: message,
                  tag: 'community-post'
                });
              }
            }
          }
        )
        .subscribe();

      // Listen to transactions
      const transactionsChannel = supabase
        .channel('transactions-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'transactions'
          },
          (payload: any) => {
            if (payload.new.user_id === user.id) {
              const message = `Transaction of ₹${payload.new.amount} completed successfully`;
              toast({
                title: "Payment Confirmed! 💳",
                description: message,
                action: <Bell className="h-4 w-4" />
              });
              
              // Send push notification
              if (permission === 'granted') {
                sendNotification('Payment Confirmed! 💳', {
                  body: message,
                  tag: 'payment'
                });
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(likesChannel);
        supabase.removeChannel(postsChannel);
        supabase.removeChannel(transactionsChannel);
      };
    };

    setupChannels();
  }, [toast]);

  return null;
}
