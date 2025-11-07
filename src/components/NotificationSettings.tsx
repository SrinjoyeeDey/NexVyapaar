import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff, CheckCircle2, XCircle } from "lucide-react";

export function NotificationSettings() {
  const { permission, requestPermission, isSupported, sendNotification } = usePushNotifications();

  const testNotification = () => {
    sendNotification('Test Notification 🔔', {
      body: 'This is a test push notification from SmartBizGrow!',
      tag: 'test'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">Push notifications are not supported in this browser</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Browser Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get notified even when the app is closed
                </p>
              </div>
              <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
                {permission === 'granted' ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Enabled
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <BellOff className="w-3 h-3" />
                    Disabled
                  </span>
                )}
              </Badge>
            </div>

            {permission !== 'granted' && (
              <Button onClick={requestPermission} className="w-full gap-2">
                <Bell className="w-4 h-4" />
                Enable Push Notifications
              </Button>
            )}

            {permission === 'granted' && (
              <Button onClick={testNotification} variant="outline" className="w-full gap-2">
                <Bell className="w-4 h-4" />
                Send Test Notification
              </Button>
            )}

            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-medium">You'll receive notifications for:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• New likes on your community posts</li>
                <li>• New posts in the community</li>
                <li>• Payment confirmations</li>
                <li>• Important business insights</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
