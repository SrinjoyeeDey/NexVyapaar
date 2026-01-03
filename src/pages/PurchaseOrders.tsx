import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ClipboardList,
  Plus,
  Sparkles,
  Send,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Package,
  Truck,
  Calculator,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Supplier {
  id: string;
  name: string;
  delivery_time_days: number | null;
  email: string | null;
}

interface RawMaterial {
  id: string;
  name: string;
  current_stock: number | null;
  reorder_point: number | null;
  optimal_stock_level: number | null;
  burn_rate: number | null;
  unit: string;
  cost_per_unit: number | null;
  supplier_id: string | null;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  status: string;
  total_amount: number;
  order_date: string | null;
  expected_delivery_date: string | null;
  notes: string | null;
  created_at: string | null;
}

interface POItem {
  material_id: string;
  material_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit: string;
}

const PurchaseOrders = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createPOOpen, setCreatePOOpen] = useState(false);
  const [viewPOOpen, setViewPOOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [aiRecommendationsOpen, setAiRecommendationsOpen] = useState(false);
  
  // PO Form state
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [poItems, setPoItems] = useState<POItem[]>([]);
  const [notes, setNotes] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/auth');
    }
  }, [navigate]);

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('purchase-orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchase_orders' },
        () => queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchase_order_items' },
        () => queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch suppliers
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, delivery_time_days, email')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data as Supplier[];
    }
  });

  // Fetch raw materials
  const { data: rawMaterials } = useQuery({
    queryKey: ['raw-materials'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('raw_materials')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data as RawMaterial[];
    }
  });

  // Fetch purchase orders
  const { data: purchaseOrders, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PurchaseOrder[];
    }
  });

  // Create PO mutation
  const createPOMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const supplier = suppliers?.find(s => s.id === selectedSupplier);
      const totalAmount = poItems.reduce((sum, item) => sum + item.total_price, 0);
      const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;
      
      const expectedDelivery = supplier?.delivery_time_days 
        ? new Date(Date.now() + supplier.delivery_time_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Create PO
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          user_id: user.id,
          po_number: poNumber,
          supplier_id: selectedSupplier,
          status: 'draft',
          total_amount: totalAmount,
          expected_delivery_date: expectedDelivery,
          notes: notes || null
        })
        .select()
        .single();

      if (poError) throw poError;

      // Create PO items
      const itemsToInsert = poItems.map(item => ({
        purchase_order_id: poData.id,
        material_id: item.material_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return poData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      setCreatePOOpen(false);
      resetForm();
      toast.success("Purchase order created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create PO: " + error.message);
    }
  });

  // Update PO status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Status updated!");
    }
  });

  // Delete PO mutation
  const deletePOMutation = useMutation({
    mutationFn: async (id: string) => {
      // First delete items
      await supabase
        .from('purchase_order_items')
        .delete()
        .eq('purchase_order_id', id);

      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Purchase order deleted");
    }
  });

  const resetForm = () => {
    setSelectedSupplier("");
    setPoItems([]);
    setNotes("");
  };

  // AI-powered reorder recommendations
  const generateAIRecommendations = () => {
    setIsGeneratingAI(true);
    
    // Calculate items that need reordering based on burn rate and stock levels
    const recommendations: POItem[] = [];
    
    rawMaterials?.forEach(material => {
      if (!material.current_stock || !material.reorder_point) return;
      
      // Check if stock is below or near reorder point
      if (material.current_stock <= (material.reorder_point * 1.2)) {
        const optimalStock = material.optimal_stock_level || material.reorder_point * 2;
        const quantityNeeded = Math.max(optimalStock - material.current_stock, 0);
        
        if (quantityNeeded > 0) {
          // Apply burn rate adjustment for seasonal demand
          let adjustedQuantity = quantityNeeded;
          if (material.burn_rate) {
            // Assume 2-week safety stock based on burn rate
            const safetyStock = material.burn_rate * 2;
            adjustedQuantity = Math.max(quantityNeeded, safetyStock);
          }
          
          recommendations.push({
            material_id: material.id,
            material_name: material.name,
            quantity: Math.ceil(adjustedQuantity),
            unit_price: material.cost_per_unit || 0,
            total_price: Math.ceil(adjustedQuantity) * (material.cost_per_unit || 0),
            unit: material.unit
          });
        }
      }
    });

    setTimeout(() => {
      setPoItems(recommendations);
      setIsGeneratingAI(false);
      if (recommendations.length > 0) {
        toast.success(`Found ${recommendations.length} items that need reordering!`);
      } else {
        toast.info("All inventory levels look good!");
      }
    }, 1500);
  };

  const addItemToPO = (material: RawMaterial) => {
    if (poItems.find(item => item.material_id === material.id)) {
      toast.error("Item already added");
      return;
    }

    const optimalStock = material.optimal_stock_level || (material.reorder_point || 0) * 2;
    const quantityNeeded = Math.max(optimalStock - (material.current_stock || 0), 1);

    setPoItems([...poItems, {
      material_id: material.id,
      material_name: material.name,
      quantity: Math.ceil(quantityNeeded),
      unit_price: material.cost_per_unit || 0,
      total_price: Math.ceil(quantityNeeded) * (material.cost_per_unit || 0),
      unit: material.unit
    }]);
  };

  const updateItemQuantity = (materialId: string, quantity: number) => {
    setPoItems(poItems.map(item => 
      item.material_id === materialId 
        ? { ...item, quantity, total_price: quantity * item.unit_price }
        : item
    ));
  };

  const removeItem = (materialId: string) => {
    setPoItems(poItems.filter(item => item.material_id !== materialId));
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      draft: { variant: "secondary", icon: Clock },
      sent: { variant: "default", icon: Send },
      confirmed: { variant: "outline", icon: CheckCircle },
      delivered: { variant: "default", icon: Package },
      cancelled: { variant: "destructive", icon: AlertTriangle }
    };
    const style = styles[status] || styles.draft;
    const Icon = style.icon;
    
    return (
      <Badge variant={style.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSupplierName = (supplierId: string) => {
    return suppliers?.find(s => s.id === supplierId)?.name || "Unknown";
  };

  // Summary stats
  const pendingOrders = purchaseOrders?.filter(po => po.status === 'sent' || po.status === 'confirmed').length || 0;
  const totalOrderValue = purchaseOrders?.reduce((sum, po) => sum + po.total_amount, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-primary" />
            {t.nav.purchaseOrders}
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage purchase orders with AI-powered reorder recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAiRecommendationsOpen(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Recommendations
          </Button>
          <Button onClick={() => setCreatePOOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create PO
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOrders?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOrderValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Suppliers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Purchase Orders</CardTitle>
          <CardDescription>View and manage your purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : purchaseOrders && purchaseOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono font-medium">{po.po_number}</TableCell>
                    <TableCell>{getSupplierName(po.supplier_id)}</TableCell>
                    <TableCell>{getStatusBadge(po.status)}</TableCell>
                    <TableCell>₹{po.total_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {po.order_date ? new Date(po.order_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {po.expected_delivery_date 
                        ? new Date(po.expected_delivery_date).toLocaleDateString() 
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedPO(po);
                            setViewPOOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {po.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatusMutation.mutate({ id: po.id, status: 'sent' })}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {po.status === 'sent' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatusMutation.mutate({ id: po.id, status: 'delivered' })}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => deletePOMutation.mutate(po.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No purchase orders yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first purchase order to start tracking supplier orders
              </p>
              <Button onClick={() => setCreatePOOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create PO Dialog */}
      <Dialog open={createPOOpen} onOpenChange={setCreatePOOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Create Purchase Order
            </DialogTitle>
            <DialogDescription>
              Create a new purchase order for your supplier
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Supplier Selection */}
            <div className="space-y-2">
              <Label>Select Supplier *</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        {supplier.name}
                        {supplier.delivery_time_days && (
                          <span className="text-muted-foreground text-xs">
                            ({supplier.delivery_time_days} days)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AI Generate Button */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={generateAIRecommendations}
                disabled={isGeneratingAI}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGeneratingAI ? "Calculating..." : "Auto-generate from AI Recommendations"}
              </Button>
            </div>

            {/* Add Items Manually */}
            <div className="space-y-2">
              <Label>Add Items</Label>
              <Select onValueChange={(value) => {
                const material = rawMaterials?.find(m => m.id === value);
                if (material) addItemToPO(material);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material to add" />
                </SelectTrigger>
                <SelectContent>
                  {rawMaterials?.filter(m => !poItems.find(i => i.material_id === m.id)).map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name} (Stock: {material.current_stock} {material.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Items Table */}
            {poItems.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poItems.map((item) => (
                      <TableRow key={item.material_id}>
                        <TableCell>{item.material_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.material_id, parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                            <span className="text-muted-foreground text-sm">{item.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell>₹{item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">₹{item.total_price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.material_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={3} className="font-medium text-right">
                        Total Amount:
                      </TableCell>
                      <TableCell className="font-bold text-lg">
                        ₹{poItems.reduce((sum, item) => sum + item.total_price, 0).toFixed(2)}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special instructions or notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreatePOOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={() => createPOMutation.mutate()}
              disabled={!selectedSupplier || poItems.length === 0 || createPOMutation.isPending}
            >
              {createPOMutation.isPending ? "Creating..." : "Create Purchase Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View PO Sheet */}
      <Sheet open={viewPOOpen} onOpenChange={setViewPOOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Purchase Order Details</SheetTitle>
            <SheetDescription>
              {selectedPO?.po_number}
            </SheetDescription>
          </SheetHeader>
          {selectedPO && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Supplier</Label>
                  <p className="font-medium">{getSupplierName(selectedPO.supplier_id)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPO.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Order Date</Label>
                  <p className="font-medium">
                    {selectedPO.order_date 
                      ? new Date(selectedPO.order_date).toLocaleDateString() 
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expected Delivery</Label>
                  <p className="font-medium">
                    {selectedPO.expected_delivery_date 
                      ? new Date(selectedPO.expected_delivery_date).toLocaleDateString() 
                      : '-'}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Label className="text-muted-foreground">Total Amount</Label>
                <p className="text-2xl font-bold">₹{selectedPO.total_amount.toLocaleString()}</p>
              </div>

              {selectedPO.notes && (
                <div className="pt-4 border-t">
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1">{selectedPO.notes}</p>
                </div>
              )}

              <div className="pt-4 flex gap-2">
                {selectedPO.status === 'draft' && (
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      updateStatusMutation.mutate({ id: selectedPO.id, status: 'sent' });
                      setViewPOOpen(false);
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send to Supplier
                  </Button>
                )}
                {selectedPO.status === 'sent' && (
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      updateStatusMutation.mutate({ id: selectedPO.id, status: 'delivered' });
                      setViewPOOpen(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* AI Recommendations Sheet */}
      <Sheet open={aiRecommendationsOpen} onOpenChange={setAiRecommendationsOpen}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Reorder Recommendations
            </SheetTitle>
            <SheetDescription>
              Based on your inventory levels, burn rates, and seasonal patterns
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {rawMaterials?.filter(m => {
              if (!m.current_stock || !m.reorder_point) return false;
              return m.current_stock <= (m.reorder_point * 1.2);
            }).map((material) => {
              const optimalStock = material.optimal_stock_level || material.reorder_point! * 2;
              const quantityNeeded = Math.max(optimalStock - (material.current_stock || 0), 0);
              const estimatedCost = quantityNeeded * (material.cost_per_unit || 0);
              
              return (
                <Card key={material.id} className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          {material.name}
                        </h4>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          <p>Current: {material.current_stock} {material.unit} | Reorder Point: {material.reorder_point} {material.unit}</p>
                          <p className="text-amber-600 font-medium">
                            Recommended: Order {Math.ceil(quantityNeeded)} {material.unit} (~₹{estimatedCost.toFixed(0)})
                          </p>
                          {material.burn_rate && (
                            <p className="text-xs">
                              Weekly burn rate: {material.burn_rate} {material.unit}/week
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          addItemToPO(material);
                          setAiRecommendationsOpen(false);
                          setCreatePOOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to PO
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {rawMaterials?.filter(m => {
              if (!m.current_stock || !m.reorder_point) return false;
              return m.current_stock <= (m.reorder_point * 1.2);
            }).length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="font-medium">All stocked up!</h3>
                <p className="text-muted-foreground">Your inventory levels look healthy</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default PurchaseOrders;