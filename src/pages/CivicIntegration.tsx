import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVendor } from '@/contexts/VendorContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Smartphone, 
  CheckCircle2, 
  Shield, 
  Bell, 
  Ban, 
  Lock,
  Settings,
  Unplug,
  Info,
  Users,
  UserCheck,
  Clock
} from 'lucide-react';

const CivicIntegration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { civicConnection, connectCivic, disconnectCivic } = useVendor();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<'authorize' | 'loading' | 'success'>('authorize');
  const [customerStats, setCustomerStats] = useState({
    total: 0,
    optedIn: 0,
    pending: 0,
  });

  useEffect(() => {
    loadCustomerStats();
  }, []);

  const loadCustomerStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('customer_consents')
        .select('consent_status')
        .eq('vendor_id', user.id);

      if (data && !error) {
        const total = data.length;
        const optedIn = data.filter(c => c.consent_status === 'opted_in').length;
        const pending = data.filter(c => c.consent_status === 'pending').length;
        setCustomerStats({ total, optedIn, pending });
      }
    } catch (error) {
      console.error('Error loading customer stats:', error);
    }
  };

  const handleConnect = () => {
    setShowAuthModal(true);
    setAuthStep('authorize');
  };

  const handleAuthorize = async () => {
    setAuthStep('loading');
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = await connectCivic();
    
    if (success) {
      setAuthStep('success');
      toast({
        title: "Civic Connected!",
        description: "Your account is now linked with Civic for verified communications.",
      });
    } else {
      setShowAuthModal(false);
      toast({
        title: "Connection Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    await disconnectCivic();
    toast({
      title: "Civic Disconnected",
      description: "Your Civic connection has been removed.",
    });
  };

  const optInPercentage = customerStats.total > 0 
    ? Math.round((customerStats.optedIn / customerStats.total) * 100) 
    : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          ← Back
        </Button>
        <h1 className="text-2xl font-bold">Civic Integration</h1>
      </div>

      {!civicConnection ? (
        <Card className="border-2 border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Connect with Civic</CardTitle>
            <CardDescription>
              Enable verified, consent-based communication with your customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Verified customer identity</p>
                  <p className="text-sm text-muted-foreground">Know your customers are real</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Consent-based communication</p>
                  <p className="text-sm text-muted-foreground">GDPR compliant messaging</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Bell className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">Instant notifications</p>
                  <p className="text-sm text-muted-foreground">Reach customers instantly</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Ban className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Zero spam complaints</p>
                  <p className="text-sm text-muted-foreground">Only opted-in recipients</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Lock className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">GDPR compliant</p>
                  <p className="text-sm text-muted-foreground">Full privacy compliance</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button size="lg" onClick={handleConnect} className="gap-2">
                <Smartphone className="h-5 w-5" />
                Connect Civic Account
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Civic enables verified, consent-based communication without spam</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-green-700 dark:text-green-400">Civic Connected</CardTitle>
                    <CardDescription>Your account is linked with Civic</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="border-green-500 text-green-600">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">Civic ID</p>
                  <p className="font-mono font-medium">{civicConnection.civicId}</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">Connected on</p>
                  <p className="font-medium">
                    {new Date(civicConnection.connectedAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Manage Settings
                </Button>
                <Button variant="outline" className="gap-2 text-destructive" onClick={handleDisconnect}>
                  <Unplug className="h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Consent Status</CardTitle>
              <CardDescription>Overview of customer notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg text-center">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-3xl font-bold">{customerStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <UserCheck className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <p className="text-3xl font-bold text-green-600">{customerStats.optedIn}</p>
                  <p className="text-sm text-muted-foreground">Opted-in ({optInPercentage}%)</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Clock className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                  <p className="text-3xl font-bold text-orange-600">{customerStats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>

              {customerStats.total > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Opt-in Rate</span>
                    <span>{optInPercentage}%</span>
                  </div>
                  <Progress value={optInPercentage} className="h-2" />
                </div>
              )}

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Engagement Improvement</p>
                    <p className="text-sm text-muted-foreground">
                      Engagement rate improved from 12% to 45% with verified IDs
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Civic OAuth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          {authStep === 'authorize' && (
            <>
              <DialogHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white text-2xl font-bold">C</span>
                </div>
                <DialogTitle>Authorize NexVyapaar</DialogTitle>
                <DialogDescription>
                  NexVyapaar is requesting access to your Civic account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm font-medium">This will allow NexVyapaar to:</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Access basic profile</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Send notifications</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm">View contact information</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAuthModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAuthorize}>
                  Authorize
                </Button>
              </div>
            </>
          )}

          {authStep === 'loading' && (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-lg font-medium">Connecting...</p>
              <p className="text-sm text-muted-foreground">Please wait while we establish a secure connection</p>
            </div>
          )}

          {authStep === 'success' && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle>Connected Successfully!</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Your Civic account is now linked with NexVyapaar
              </p>
              <Button onClick={() => setShowAuthModal(false)} className="mt-4">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CivicIntegration;
