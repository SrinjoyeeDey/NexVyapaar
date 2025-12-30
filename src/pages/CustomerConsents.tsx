import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  UserCheck,
  Clock,
  Mail,
  Phone,
  Shield,
  Download,
  Send,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Bell,
  MessageSquare,
  Megaphone,
  ShoppingBag,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface CustomerConsent {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  civic_verified: boolean;
  marketing_offers: boolean;
  product_updates: boolean;
  announcements: boolean;
  sms_notifications: boolean;
  consent_status: string;
  last_contacted_at: string | null;
  messages_received: number;
  engagement_rate: number;
  created_at: string;
}

const CustomerConsents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerConsent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerConsent | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('customer_consents')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter customer name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('customer_consents').insert({
        vendor_id: user.id,
        customer_name: newCustomer.name,
        customer_email: newCustomer.email || null,
        customer_phone: newCustomer.phone || null,
        consent_status: 'pending',
      });

      if (error) throw error;

      toast({
        title: "Customer Added",
        description: "Customer has been added successfully",
      });

      setShowAddCustomer(false);
      setNewCustomer({ name: '', email: '', phone: '' });
      loadCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: "Error",
        description: "Failed to add customer",
        variant: "destructive",
      });
    }
  };

  const handleUpdateConsent = async (customerId: string, field: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('customer_consents')
        .update({ [field]: value })
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(prev => prev.map(c => 
        c.id === customerId ? { ...c, [field]: value } : c
      ));

      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(prev => prev ? { ...prev, [field]: value } : null);
      }

      toast({
        title: "Updated",
        description: "Consent preference updated",
      });
    } catch (error) {
      console.error('Error updating consent:', error);
    }
  };

  const handleSendConsentRequest = async () => {
    const pendingCustomers = customers.filter(c => c.consent_status === 'pending');
    
    toast({
      title: "Consent Requests Sent",
      description: `Sent to ${pendingCustomers.length} customers`,
    });

    // Update status to sent
    for (const customer of pendingCustomers) {
      await supabase
        .from('customer_consents')
        .update({ consent_status: 'sent' })
        .eq('id', customer.id);
    }

    loadCustomers();
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Status', 'Marketing', 'Updates', 'Announcements', 'SMS'].join(','),
      ...customers.map(c => [
        c.customer_name,
        c.customer_email || '',
        c.customer_phone || '',
        c.consent_status,
        c.marketing_offers ? 'Yes' : 'No',
        c.product_updates ? 'Yes' : 'No',
        c.announcements ? 'Yes' : 'No',
        c.sms_notifications ? 'Yes' : 'No',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_consents.csv';
    a.click();
  };

  const filteredCustomers = customers.filter(c =>
    c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customer_phone?.includes(searchQuery)
  );

  const stats = {
    total: customers.length,
    optedIn: customers.filter(c => c.consent_status === 'opted_in').length,
    pending: customers.filter(c => c.consent_status === 'pending').length,
    verified: customers.filter(c => c.civic_verified).length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Consent Management</h1>
          <p className="text-muted-foreground">Manage notification preferences for your customers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleSendConsentRequest} className="gap-2">
            <Send className="h-4 w-4" />
            Send Consent Requests
          </Button>
          <Button onClick={() => setShowAddCustomer(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.optedIn}</p>
                <p className="text-sm text-muted-foreground">Opted In</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
                <p className="text-sm text-muted-foreground">Civic Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Civic</TableHead>
                <TableHead>Subscriptions</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map(customer => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">{customer.customer_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {customer.customer_email && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {customer.customer_email}
                          </div>
                        )}
                        {customer.customer_phone && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {customer.customer_phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={customer.consent_status === 'opted_in' ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        {customer.consent_status === 'opted_in' && <CheckCircle2 className="h-3 w-3" />}
                        {customer.consent_status === 'pending' && <Clock className="h-3 w-3" />}
                        {customer.consent_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {customer.civic_verified ? (
                        <Badge variant="outline" className="text-green-600 border-green-500 gap-1">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {customer.marketing_offers && (
                          <Badge variant="outline" className="text-xs">
                            <ShoppingBag className="h-3 w-3" />
                          </Badge>
                        )}
                        {customer.product_updates && (
                          <Badge variant="outline" className="text-xs">
                            <Bell className="h-3 w-3" />
                          </Badge>
                        )}
                        {customer.announcements && (
                          <Badge variant="outline" className="text-xs">
                            <Megaphone className="h-3 w-3" />
                          </Badge>
                        )}
                        {customer.sms_notifications && (
                          <Badge variant="outline" className="text-xs">
                            <MessageSquare className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{customer.engagement_rate}%</span>
                        <span className="text-muted-foreground ml-1">
                          ({customer.messages_received} msgs)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Detail Modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notification Preferences</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedCustomer.customer_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {selectedCustomer.civic_verified ? (
                    <Badge variant="outline" className="text-green-600 border-green-500 gap-1">
                      <Shield className="h-3 w-3" />
                      Civic Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Not Verified</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium">Subscriptions</p>
                
                <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    <span>Marketing offers</span>
                  </div>
                  <Checkbox
                    checked={selectedCustomer.marketing_offers}
                    onCheckedChange={v => handleUpdateConsent(selectedCustomer.id, 'marketing_offers', !!v)}
                  />
                </label>

                <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span>Product updates</span>
                  </div>
                  <Checkbox
                    checked={selectedCustomer.product_updates}
                    onCheckedChange={v => handleUpdateConsent(selectedCustomer.id, 'product_updates', !!v)}
                  />
                </label>

                <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Megaphone className="h-5 w-5 text-muted-foreground" />
                    <span>Announcements</span>
                  </div>
                  <Checkbox
                    checked={selectedCustomer.announcements}
                    onCheckedChange={v => handleUpdateConsent(selectedCustomer.id, 'announcements', !!v)}
                  />
                </label>

                <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <span>SMS notifications</span>
                  </div>
                  <Checkbox
                    checked={selectedCustomer.sms_notifications}
                    onCheckedChange={v => handleUpdateConsent(selectedCustomer.id, 'sms_notifications', !!v)}
                  />
                </label>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last contacted</span>
                  <span>
                    {selectedCustomer.last_contacted_at 
                      ? format(new Date(selectedCustomer.last_contacted_at), 'MMM d, yyyy')
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Messages received</span>
                  <span>{selectedCustomer.messages_received}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Engagement rate</span>
                  <span>{selectedCustomer.engagement_rate}%</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Customer Modal */}
      <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Customer name"
                value={newCustomer.name}
                onChange={e => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={newCustomer.email}
                onChange={e => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={newCustomer.phone}
                onChange={e => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowAddCustomer(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleAddCustomer}>
              Add Customer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerConsents;
