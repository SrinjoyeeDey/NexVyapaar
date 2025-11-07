import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';

export function RealtimeNotifications() {
  const { toast } = useToast();

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
              toast({
                title: "New Like! 👍",
                description: `Someone liked your post: "${post.title}"`,
                action: <Bell className="h-4 w-4" />
              });
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
              toast({
                title: "New Community Post 📝",
                description: `New post: "${payload.new.title}"`,
                action: <Bell className="h-4 w-4" />
              });
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
              toast({
                title: "Payment Confirmed! 💳",
                description: `Transaction of ₹${payload.new.amount} completed successfully`,
                action: <Bell className="h-4 w-4" />
              });
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
