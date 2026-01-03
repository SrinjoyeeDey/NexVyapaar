import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  PackageOpen,
  AlertTriangle,
  TrendingDown,
  Plus,
  RefreshCw,
  Bell,
  Sparkles,
  ArrowUpRight,
  Edit,
  Trash2,
  CheckCircle2,
  Upload,
  History,
  Wifi,
  Scan,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { InventoryCSVImport } from "@/components/InventoryCSVImport";
import { SupplierPriceHistory } from "@/components/SupplierPriceHistory";
import { KhataScanner } from "@/components/KhataScanner";
import { ShelfScanner } from "@/components/ShelfScanner";
import { KhataItem, ShelfDelta } from "@/services/VisionService";

interface RawMaterial {
  id: string;
  name: string;
  category: string | null;
  current_stock: number | null;
  unit: string;
  reorder_point: number | null;
  optimal_stock_level: number | null;
  burn_rate: number | null;
  cost_per_unit: number | null;
  supplier_id: string | null;
  seasonality_tag: string | null;
  expiry_date?: string | null;
}

interface FinishedProduct {
  id: string;
  name: string;
  category: string | null;
  current_stock: number | null;
  selling_price: number;
  cost_to_produce: number | null;
  reorder_point: number | null;
}

interface LowStockAlert {
  id: string;
  message: string;
  alert_type: string;
  current_value: number | null;
  threshold_value: number | null;
  is_acknowledged: boolean | null;
  created_at: string | null;
  product_id: string | null;
  material_id: string | null;
}

const Inventory = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("raw-materials");
  const [addMaterialOpen, setAddMaterialOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [priceHistoryOpen, setPriceHistoryOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | undefined>();
  const [selectedMaterialName, setSelectedMaterialName] = useState<string | undefined>();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [khataScannerOpen, setKhataScannerOpen] = useState(false);
  const [shelfScannerOpen, setShelfScannerOpen] = useState(false);

  // Form states
  const [materialForm, setMaterialForm] = useState({
    name: "",
    category: "",
    current_stock: "",
    unit: "kg",
    reorder_point: "",
    optimal_stock_level: "",
    burn_rate: "",
    cost_per_unit: "",
    seasonality_tag: "year_round"
  });

  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    current_stock: "",
    selling_price: "",
    cost_to_produce: "",
    reorder_point: ""
  });

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/auth');
    }
  }, [navigate]);

  // Real-time subscriptions for inventory updates
  useEffect(() => {
    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'raw_materials' },
        (payload) => {
          console.log('Raw materials change:', payload);
          queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
          if (payload.eventType === 'UPDATE') {
            toast.info('Stock level updated in real-time');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'finished_products' },
        (payload) => {
          console.log('Finished products change:', payload);
          queryClient.invalidateQueries({ queryKey: ['finished-products'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'low_stock_alerts' },
        (payload) => {
          console.log('New low stock alert:', payload);
          queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] });
          toast.warning('New low stock alert!', {
            description: (payload.new as any)?.message
          });
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch raw materials
  const { data: rawMaterials, isLoading: loadingMaterials } = useQuery({
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

  // Fetch finished products
  const { data: finishedProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['finished-products'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('finished_products')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data as FinishedProduct[];
    }
  });

  // Fetch low stock alerts
  const { data: alerts, isLoading: loadingAlerts } = useQuery({
    queryKey: ['low-stock-alerts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('low_stock_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LowStockAlert[];
    }
  });

  // Add raw material mutation
  const addMaterialMutation = useMutation({
    mutationFn: async (material: typeof materialForm) => {
      let { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user ?? null;
      }
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('raw_materials')
        .insert({
          user_id: user.id,
          name: material.name,
          category: material.category || null,
          current_stock: parseFloat(material.current_stock) || 0,
          unit: material.unit,
          reorder_point: parseFloat(material.reorder_point) || null,
          optimal_stock_level: parseFloat(material.optimal_stock_level) || null,
          burn_rate: parseFloat(material.burn_rate) || null,
          cost_per_unit: parseFloat(material.cost_per_unit) || null,
          seasonality_tag: material.seasonality_tag
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      setAddMaterialOpen(false);
      resetMaterialForm();
      toast.success("Raw material added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add material: " + error.message);
    }
  });

  // Add finished product mutation
  const addProductMutation = useMutation({
    mutationFn: async (product: typeof productForm) => {
      let { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user ?? null;
      }
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('finished_products')
        .insert({
          user_id: user.id,
          name: product.name,
          category: product.category || null,
          current_stock: parseInt(product.current_stock) || 0,
          selling_price: parseFloat(product.selling_price),
          cost_to_produce: parseFloat(product.cost_to_produce) || null,
          reorder_point: parseInt(product.reorder_point) || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finished-products'] });
      setAddProductOpen(false);
      resetProductForm();
      toast.success("Product added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add product: " + error.message);
    }
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      let { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user ?? null;
      }
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('low_stock_alerts')
        .update({ is_acknowledged: true })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] });
      toast.success("Alert acknowledged");
    }
  });

  // Delete material mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: async (id: string) => {
      let { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user ?? null;
      }
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('raw_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw-materials'] });
      toast.success("Material deleted");
    }
  });

  const handleKhataData = async (items: KhataItem[]) => {
    let { data: { user } } = await supabase.auth.getUser();

    // Fallback to session if getUser fails
    if (!user) {
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user ?? null;
    }

    if (!user) {
      toast.error("User not authenticated. Please log in again.");
      return;
    }

    let updatedCount = 0;
    let newCount = 0;
    let poCreated = false;

    try {
      // 1. Group items by supplier for PO creation
      // For now, we'll create one PO for all inventory items if there's at least one inventory item
      const inventoryItems = items.filter(i => i.type === 'inventory');

      let poId: string | null = null;
      if (inventoryItems.length > 0) {
        // Find a supplier from the scan, or use a default one
        const firstSupplierName = items.find(i => i.supplier)?.supplier;
        let supplierId = null;

        if (firstSupplierName) {
          const { data: sData } = await supabase
            .from('suppliers')
            .select('id')
            .ilike('name', `% ${firstSupplierName}% `)
            .maybeSingle();
          supplierId = sData?.id;
        }

        // Create PO Header
        const { data: poData, error: poError } = await supabase
          .from('purchase_orders')
          .insert({
            user_id: user.id,
            po_number: `SCAN - ${Date.now().toString(36).toUpperCase()} `,
            status: 'confirmed', // Automatically mark as confirmed since we have the data
            total_amount: inventoryItems.reduce((sum, i) => sum + (i.price * i.quantity), 0),
            notes: 'Created via Khata Scan',
            supplier_id: supplierId // May be null if no supplier detected
          })
          .select('id')
          .single();

        if (poError) {
          console.error("PO Creation Error:", poError);
          toast.error("Failed to create Purchase Order record");
        } else {
          poId = poData.id;
          poCreated = true;
        }
      }

      for (const item of items) {
        let supplierId = null;

        // Handle Supplier lookup/creation
        if (item.supplier) {
          const { data: existingSupplier } = await supabase
            .from('suppliers')
            .select('id')
            .eq('user_id', user.id)
            .ilike('name', `% ${item.supplier}% `)
            .maybeSingle();

          if (existingSupplier) {
            supplierId = existingSupplier.id;
          } else {
            const { data: newSupplier, error: sError } = await supabase
              .from('suppliers')
              .insert({
                user_id: user.id,
                name: item.supplier,
                notes: 'Auto-created from Khata Scan'
              })
              .select('id')
              .single();

            if (!sError) supplierId = newSupplier.id;
          }
        }

        if (item.type === 'inventory') {
          const existing = rawMaterials?.find(m => m.name.toLowerCase() === item.name.toLowerCase());
          let materialId = existing?.id;

          if (existing) {
            const newStock = (existing.current_stock || 0) + item.quantity;
            const { error: invError } = await supabase
              .from('raw_materials')
              .update({
                current_stock: newStock,
                cost_per_unit: item.price,
                expiry_date: item.expiry_date || existing.expiry_date,
                supplier_id: supplierId || existing.supplier_id
              })
              .eq('id', existing.id);

            if (invError) throw invError;
            updatedCount++;
          } else {
            const { data: newMat, error: invError } = await supabase
              .from('raw_materials')
              .insert({
                user_id: user.id,
                name: item.name,
                current_stock: item.quantity,
                unit: item.unit,
                cost_per_unit: item.price,
                category: 'Khata Import',
                expiry_date: item.expiry_date || null,
                supplier_id: supplierId
              })
              .select('id')
              .single();

            if (invError) throw invError;
            materialId = newMat?.id;
            newCount++;
          }

          // Create PO Item if PO was created
          if (poId && materialId) {
            await supabase
              .from('purchase_order_items')
              .insert({
                purchase_order_id: poId,
                material_id: materialId,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.quantity * item.price
              });
          }
        } else if (item.type === 'sale') {
          const { error: saleError } = await supabase
            .from('sales_data')
            .insert({
              user_id: user.id,
              product_name: item.name,
              quantity: item.quantity,
              price: item.price,
              sale_date: item.date,
              category: 'Khata Import',
              expiry_date: item.expiry_date || null
            });

          if (saleError) throw saleError;
          updatedCount++;
        }
      }

      queryClient.invalidateQueries();
      setKhataScannerOpen(false);
      toast.success(`Khata Sync Complete! ${updatedCount + newCount} items processed.${poCreated ? ' Purchase Order generated.' : ''} `);

    } catch (error: any) {
      console.error("Khata Sync Detailed Error:", error);
      toast.error(`Sync partially failed: ${error.message || "Database connection error"} `);
    }
  };

  const handleShelfDeltas = async (deltas: ShelfDelta[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let salesCount = 0;
      let lossCount = 0;
      let restockCount = 0;
      let autoPOCount = 0;

      for (const delta of deltas) {
        if (delta.action === 'sold') {
          // 1. Log Sale or Loss
          const isSale = delta.reason === 'sale';

          await supabase.from('sales_data').insert({
            user_id: user.id,
            product_name: delta.name,
            quantity: isSale ? Math.abs(delta.delta) : 0,
            waste_quantity: !isSale ? Math.abs(delta.delta) : 0,
            price: (delta.price || 0),
            sale_date: new Date().toISOString()
          });

          // 2. Decrement Stock
          const { data: material } = await (supabase as any)
            .from('raw_materials')
            .select('id, current_stock, supplier_id')
            .ilike('name', delta.name)
            .maybeSingle();

          if (material) {
            await (supabase as any)
              .from('raw_materials')
              .update({ current_stock: Number(material.current_stock) - Math.abs(delta.delta) })
              .eq('id', material.id);

            // 3. Auto-PO if triggered (Fast PO button) or if critically low
            // In a real scenario, we'd check if the user clicked Fast PO. 
            // Here we'll treat 'Critical' during the scan as a trigger if they accepted the deltas
            if (delta.reorderPoint !== undefined && (Number(material.current_stock) - Math.abs(delta.delta)) <= delta.reorderPoint) {
              const poNumber = `AUTO-SHELF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

              const { data: po } = await (supabase as any).from('purchase_orders').insert({
                user_id: user.id,
                po_number: poNumber,
                supplier_id: material.supplier_id,
                status: 'pending',
                total_amount: Math.abs(delta.delta) * (delta.price || 0) * 2 // Suggested restock: 2x delta
              }).select().single();

              if (po) {
                await (supabase as any).from('purchase_order_items').insert({
                  purchase_order_id: po.id,
                  material_id: material.id, // Assuming material_id is the correct column name
                  quantity: Math.abs(delta.delta) * 2,
                  unit_price: delta.price || 0
                });
                autoPOCount++;
              }
            }
          }

          if (isSale) salesCount++;
          else lossCount++;

        } else if (delta.action === 'restocked') {
          // 3. Increment Stock
          const { data: material } = await (supabase as any)
            .from('raw_materials')
            .select('id, current_stock')
            .ilike('name', delta.name)
            .maybeSingle();

          if (material) {
            await (supabase as any)
              .from('raw_materials')
              .update({ current_stock: Number(material.current_stock) + Math.abs(delta.delta) })
              .eq('id', material.id);
          }
          restockCount++;
        }
      }

      queryClient.invalidateQueries();
      setShelfScannerOpen(false);
      toast.success(
        `Visual Sync Complete! Logged ${salesCount} sales, ${lossCount} losses, and restocked ${restockCount} items. ${autoPOCount > 0 ? `Generated ${autoPOCount} Purchase Orders.` : ''}`
      );
    } catch (error: any) {
      console.error("Shelf Delta Sync Error:", error);
      toast.error(`Failed to update database: ${error.message}`);
    }
  };

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('finished_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finished-products'] });
      toast.success("Product deleted");
    }
  });

  const resetMaterialForm = () => {
    setMaterialForm({
      name: "",
      category: "",
      current_stock: "",
      unit: "kg",
      reorder_point: "",
      optimal_stock_level: "",
      burn_rate: "",
      cost_per_unit: "",
      seasonality_tag: "year_round"
    });
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      category: "",
      current_stock: "",
      selling_price: "",
      cost_to_produce: "",
      reorder_point: ""
    });
  };

  // Calculate stock status
  const getStockStatus = (current: number | null, reorder: number | null) => {
    if (!current || !reorder) return { status: "unknown", color: "secondary" };
    const ratio = current / reorder;
    if (ratio <= 0.5) return { status: "Critical", color: "destructive" };
    if (ratio <= 1) return { status: "Low", color: "warning" };
    if (ratio <= 1.5) return { status: "Adequate", color: "secondary" };
    return { status: "Good", color: "success" };
  };

  // Calculate reorder recommendation
  const getReorderRecommendation = (item: RawMaterial) => {
    if (!item.burn_rate || !item.current_stock || !item.optimal_stock_level) return null;
    const daysOfStock = item.current_stock / (item.burn_rate / 7);
    const amountNeeded = item.optimal_stock_level - item.current_stock;

    if (daysOfStock < 7 && amountNeeded > 0) {
      return {
        urgent: true,
        message: `Order ${amountNeeded.toFixed(1)} ${item.unit} within ${Math.ceil(daysOfStock)} days`,
        amount: amountNeeded
      };
    } else if (daysOfStock < 14 && amountNeeded > 0) {
      return {
        urgent: false,
        message: `Consider ordering ${amountNeeded.toFixed(1)} ${item.unit} soon`,
        amount: amountNeeded
      };
    }
    return null;
  };

  // Summary stats
  const lowStockCount = rawMaterials?.filter(m => {
    const status = getStockStatus(m.current_stock, m.reorder_point);
    return status.status === "Critical" || status.status === "Low";
  }).length || 0;

  const totalMaterialsValue = rawMaterials?.reduce((sum, m) => {
    return sum + ((m.current_stock || 0) * (m.cost_per_unit || 0));
  }, 0) || 0;

  const totalProductsValue = finishedProducts?.reduce((sum, p) => {
    return sum + ((p.current_stock || 0) * p.selling_price);
  }, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            {t.nav.inventory}
            {isRealtimeConnected && (
              <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.inventory.statsSubtitle || "Real-time stock levels, alerts, and AI-powered reorder recommendations"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setCsvImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            {t.inventory.importCSV}
          </Button>
          <Dialog open={khataScannerOpen} onOpenChange={setKhataScannerOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200">
                <Scan className="h-4 w-4 mr-2" />
                Khata Scanner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
              <KhataScanner
                context={activeTab === 'raw-materials' ? 'inventory' : 'sales'}
                onDataExtracted={handleKhataData}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={shelfScannerOpen} onOpenChange={setShelfScannerOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200">
                <PackageOpen className="h-4 w-4 mr-2" />
                Visual Shelf Check
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl p-0 overflow-hidden bg-transparent border-0 shadow-none">
              <ShelfScanner
                onComplete={handleShelfDeltas}
              />
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => {
            setSelectedMaterialId(undefined);
            setSelectedMaterialName(undefined);
            setPriceHistoryOpen(true);
          }}>
            <History className="h-4 w-4 mr-2" />
            {t.inventory.priceHistory}
          </Button>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.inventory.rawMaterials}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rawMaterials?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              ₹{totalMaterialsValue.toLocaleString()} {t.inventory.stockValue}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.inventory.finishedProducts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finishedProducts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              ₹{totalProductsValue.toLocaleString()} {t.inventory.stockValue}
            </p>
          </CardContent>
        </Card>

        <Card className={lowStockCount > 0 ? "border-destructive" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              {t.inventory.lowStockItems}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              {t.inventory.requiresAttention}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Bell className="h-4 w-4" />
              {t.inventory.activeAlerts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unacknowledged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Bell className="h-5 w-5" />
              {t.inventory.activeAlerts}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.voice?.quantity || "Current"}: {alert.current_value} | {t.inventory.reorderPoint}: {alert.threshold_value}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="raw-materials" className="flex items-center gap-2">
            <PackageOpen className="h-4 w-4" />
            {t.inventory.rawMaterials}
          </TabsTrigger>
          <TabsTrigger value="finished-products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t.inventory.finishedProducts}
          </TabsTrigger>
        </TabsList>

        {/* Raw Materials Tab */}
        <TabsContent value="raw-materials" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t.inventory.rawMaterialsInv}</h3>
            <Dialog open={addMaterialOpen} onOpenChange={setAddMaterialOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.inventory.addMaterial}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t.inventory.addMaterial}</DialogTitle>
                  <DialogDescription>
                    {t.inventory.addMaterialDesc || "Add a new raw material to track inventory levels"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={materialForm.name}
                      onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                      placeholder="e.g., Flour, Sugar"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={materialForm.category}
                        onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                        placeholder="e.g., Bakery"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select
                        value={materialForm.unit}
                        onValueChange={(v) => setMaterialForm({ ...materialForm, unit: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">{t.inventory.kg || "Kilograms (kg)"}</SelectItem>
                          <SelectItem value="g">{t.inventory.g || "Grams (g)"}</SelectItem>
                          <SelectItem value="l">{t.inventory.l || "Liters (l)"}</SelectItem>
                          <SelectItem value="ml">{t.inventory.ml || "Milliliters (ml)"}</SelectItem>
                          <SelectItem value="units">{t.inventory.units || "Units"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="current_stock">Current Stock</Label>
                      <Input
                        id="current_stock"
                        type="number"
                        value={materialForm.current_stock}
                        onChange={(e) => setMaterialForm({ ...materialForm, current_stock: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cost_per_unit">Cost/Unit (₹)</Label>
                      <Input
                        id="cost_per_unit"
                        type="number"
                        value={materialForm.cost_per_unit}
                        onChange={(e) => setMaterialForm({ ...materialForm, cost_per_unit: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reorder_point">Reorder Point</Label>
                      <Input
                        id="reorder_point"
                        type="number"
                        value={materialForm.reorder_point}
                        onChange={(e) => setMaterialForm({ ...materialForm, reorder_point: e.target.value })}
                        placeholder="Trigger alert when below"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="optimal_stock">Optimal Stock</Label>
                      <Input
                        id="optimal_stock"
                        type="number"
                        value={materialForm.optimal_stock_level}
                        onChange={(e) => setMaterialForm({ ...materialForm, optimal_stock_level: e.target.value })}
                        placeholder="Target level"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="burn_rate">Burn Rate (units/week)</Label>
                    <Input
                      id="burn_rate"
                      type="number"
                      value={materialForm.burn_rate}
                      onChange={(e) => setMaterialForm({ ...materialForm, burn_rate: e.target.value })}
                      placeholder="Average weekly consumption"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddMaterialOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => addMaterialMutation.mutate(materialForm)}
                    disabled={!materialForm.name || addMaterialMutation.isPending}
                  >
                    {addMaterialMutation.isPending ? "Adding..." : "Add Material"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {loadingMaterials ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : rawMaterials && rawMaterials.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.inventory.material}</TableHead>
                      <TableHead>{t.nav.category || "Category"}</TableHead>
                      <TableHead>{t.inventory.stockLevel}</TableHead>
                      <TableHead>{t.common.status}</TableHead>
                      <TableHead>{t.inventory.burnRate}</TableHead>
                      <TableHead>Weekly Trend</TableHead>
                      <TableHead>{t.inventory.aiRecommendation}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawMaterials.map((material) => {
                      const status = getStockStatus(material.current_stock, material.reorder_point);
                      const recommendation = getReorderRecommendation(material);
                      const stockPercentage = material.optimal_stock_level
                        ? ((material.current_stock || 0) / material.optimal_stock_level) * 100
                        : 50;

                      return (
                        <TableRow key={material.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{material.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ₹{material.cost_per_unit || 0}/{material.unit}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{material.category || "Uncategorized"}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {material.current_stock || 0} {material.unit}
                                </span>
                              </div>
                              <Progress
                                value={Math.min(stockPercentage, 100)}
                                className="h-2"
                              />
                              <p className="text-xs text-muted-foreground">
                                Reorder at: {material.reorder_point || "N/A"} {material.unit}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={status.color as any}
                              className={
                                status.status === "Critical" ? "bg-destructive text-destructive-foreground" :
                                  status.status === "Low" ? "bg-amber-500 text-white" :
                                    status.status === "Good" ? "bg-green-500 text-white" : ""
                              }
                            >
                              {status.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {material.burn_rate ? (
                              <div className="flex items-center gap-1 text-sm">
                                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                                {material.burn_rate} {material.unit}/week
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {material.burn_rate && material.burn_rate > 10 ? (
                              <Badge className="bg-orange-100/80 text-orange-700 border-none flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                Fast Moving 🔥
                              </Badge>
                            ) : material.burn_rate && material.burn_rate > 0 ? (
                              <Badge className="bg-indigo-100/80 text-indigo-700 border-none flex items-center gap-1">
                                <TrendingDown className="h-3 w-3" />
                                Steady
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-400">Stable</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {recommendation ? (
                              <div className={`text - sm p - 2 rounded ${recommendation.urgent ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"} `}>
                                <div className="flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" />
                                  {recommendation.message}
                                </div>
                              </div>
                            ) : (
                              <span className="text-green-600 text-sm">✓ Stock OK</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteMaterialMutation.mutate(material.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <PackageOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No raw materials yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start tracking your inventory by adding your first raw material
                </p>
                <Button onClick={() => setAddMaterialOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Finished Products Tab */}
        <TabsContent value="finished-products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Finished Products Inventory</h3>
            <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Finished Product</DialogTitle>
                  <DialogDescription>
                    Add a new product to track inventory levels
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="prod_name">Name *</Label>
                    <Input
                      id="prod_name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g., Chocolate Cake, Samosa"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="prod_category">Category</Label>
                    <Input
                      id="prod_category"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      placeholder="e.g., Bakery, Snacks"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="prod_stock">Current Stock</Label>
                      <Input
                        id="prod_stock"
                        type="number"
                        value={productForm.current_stock}
                        onChange={(e) => setProductForm({ ...productForm, current_stock: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="prod_reorder">Reorder Point</Label>
                      <Input
                        id="prod_reorder"
                        type="number"
                        value={productForm.reorder_point}
                        onChange={(e) => setProductForm({ ...productForm, reorder_point: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="selling_price">Selling Price (₹) *</Label>
                      <Input
                        id="selling_price"
                        type="number"
                        value={productForm.selling_price}
                        onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cost_to_produce">Cost to Produce (₹)</Label>
                      <Input
                        id="cost_to_produce"
                        type="number"
                        value={productForm.cost_to_produce}
                        onChange={(e) => setProductForm({ ...productForm, cost_to_produce: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddProductOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => addProductMutation.mutate(productForm)}
                    disabled={!productForm.name || !productForm.selling_price || addProductMutation.isPending}
                  >
                    {addProductMutation.isPending ? "Adding..." : "Add Product"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {loadingProducts ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : finishedProducts && finishedProducts.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finishedProducts.map((product) => {
                      const status = getStockStatus(product.current_stock, product.reorder_point);
                      const margin = product.cost_to_produce
                        ? ((product.selling_price - product.cost_to_produce) / product.selling_price * 100).toFixed(1)
                        : null;

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category || "Uncategorized"}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{product.current_stock || 0}</span>
                              <span className="text-muted-foreground text-sm">units</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={status.color as any}
                              className={
                                status.status === "Critical" ? "bg-destructive text-destructive-foreground" :
                                  status.status === "Low" ? "bg-amber-500 text-white" :
                                    status.status === "Good" ? "bg-green-500 text-white" : ""
                              }
                            >
                              {status.status}
                            </Badge>
                          </TableCell>
                          <TableCell>₹{product.selling_price}</TableCell>
                          <TableCell>
                            {margin ? (
                              <span className={parseFloat(margin) > 30 ? "text-green-600" : "text-amber-600"}>
                                {margin}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteProductMutation.mutate(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start tracking your finished products inventory
                </p>
                <Button onClick={() => setAddProductOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* CSV Import Modal */}
      <InventoryCSVImport
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        importType="both"
      />

      {/* Supplier Price History */}
      <SupplierPriceHistory
        open={priceHistoryOpen}
        onOpenChange={setPriceHistoryOpen}
        materialId={selectedMaterialId}
        materialName={selectedMaterialName}
      />
    </div>
  );
};

export default Inventory;
