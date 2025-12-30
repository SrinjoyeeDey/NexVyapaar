import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Radio, MessageSquare, CheckCircle2, Clock, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'broadcast_sent' | 'broadcast_scheduled' | 'campaign_launched';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Set up real-time subscription for broadcasts
    const channel = supabase
      .channel('broadcasts-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'broadcasts'
        },
        (payload: any) => {
          const newNotification: Notification = {
            id: payload.new.id,
            type: payload.new.status === 'sent' ? 'broadcast_sent' : 'broadcast_scheduled',
            title: payload.new.status === 'sent' ? 'Broadcast Sent!' : 'Broadcast Scheduled',
            message: `"${payload.new.subject}" - ${payload.new.recipients_count} recipients`,
            timestamp: payload.new.created_at,
            read: false,
            link: '/broadcasts',
          };
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marketing_campaigns'
        },
        (payload: any) => {
          const newNotification: Notification = {
            id: payload.new.id,
            type: 'campaign_launched',
            title: 'Campaign Launched!',
            message: `"${payload.new.campaign_name}" is now active`,
            timestamp: payload.new.created_at,
            read: false,
            link: '/marketing',
          };
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Load recent broadcasts as notifications
      const { data: broadcasts } = await supabase
        .from('broadcasts')
        .select('id, subject, status, recipients_count, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Load recent campaigns
      const { data: campaigns } = await supabase
        .from('marketing_campaigns')
        .select('id, campaign_name, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const broadcastNotifications: Notification[] = (broadcasts || []).map(b => ({
        id: b.id,
        type: b.status === 'sent' ? 'broadcast_sent' as const : 'broadcast_scheduled' as const,
        title: b.status === 'sent' ? 'Broadcast Sent' : 'Broadcast Scheduled',
        message: `"${b.subject}" - ${b.recipients_count} recipients`,
        timestamp: b.created_at,
        read: true, // Already loaded ones are "read"
        link: '/broadcasts',
      }));

      const campaignNotifications: Notification[] = (campaigns || []).map(c => ({
        id: c.id,
        type: 'campaign_launched' as const,
        title: 'Campaign Active',
        message: `"${c.campaign_name}"`,
        timestamp: c.created_at,
        read: true,
        link: '/marketing',
      }));

      // Combine and sort by timestamp
      const allNotifications = [...broadcastNotifications, ...campaignNotifications]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - (notification.read ? 0 : 1)));
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'broadcast_sent':
        return <Send className="h-4 w-4 text-green-500" />;
      case 'broadcast_scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'campaign_launched':
        return <Radio className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-auto p-1"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No notifications yet
          </div>
        ) : (
          <>
            {notifications.map(notification => (
              <DropdownMenuItem 
                key={notification.id}
                className={`flex items-start gap-3 p-3 cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-center text-sm text-primary cursor-pointer"
              onClick={() => navigate('/broadcasts')}
            >
              View all activity
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
