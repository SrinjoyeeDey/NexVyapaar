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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Truck,
  Plus,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  Edit,
  Trash2,
  ArrowUpDown,
  BarChart3,
  CheckCircle,
  XCircle,
  Users,
  History,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { SupplierPriceHistory } from "@/components/SupplierPriceHistory";

interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  payment_terms: string | null;
  notes: string | null;
  rating: number | null;
  delivery_time_days: number | null;
  created_at: string | null;
}

const Suppliers = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [editSupplierOpen, setEditSupplierOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [compareSheetOpen, setCompareSheetOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "rating" | "delivery">("name");
  const [priceHistoryOpen, setPriceHistoryOpen] = useState(false);

  // Form state
  const [supplierForm, setSupplierForm] = useState({
    id: "",
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    payment_terms: "",
    notes: "",
    rating: "0",
    delivery_time_days: ""
  });

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/auth');
    }
  }, [navigate]);

  // Real-time subscriptions
  useEffect(() => {
    let channel = supabase
      .channel('suppliers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'suppliers' },
        () => queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'supplier_prices' },
        () => queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch suppliers
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers', sortBy],
    queryFn: async () => {
      let { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user ?? null;
      }
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id);

      if (sortBy === "rating") {
        query = query.order('rating', { ascending: false });
      } else if (sortBy === "delivery") {
        query = query.order('delivery_time_days', { ascending: true });
      } else {
        query = query.order('name');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Supplier[];
    }
  });

  // Add supplier mutation
  const addSupplierMutation = useMutation({
    mutationFn: async (supplier: typeof supplierForm) => {
      let { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user ?? null;
      }
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('suppliers')
        .insert({
          user_id: user.id,
          name: supplier.name,
          contact_person: supplier.contact_person || null,
          email: supplier.email || null,
          phone: supplier.phone || null,
          address: supplier.address || null,
          payment_terms: supplier.payment_terms || null,
          notes: supplier.notes || null,
          rating: parseFloat(supplier.rating) || 0,
          delivery_time_days: parseInt(supplier.delivery_time_days) || 7
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setAddSupplierOpen(false);
      resetForm();
      toast.success(t.suppliers.addedSuccess);
    },
    onError: (error) => {
      toast.error((t.common.error || "Error") + ": " + error.message);
    }
  });

  // Update supplier mutation
  const updateSupplierMutation = useMutation({
    mutationFn: async (supplier: typeof supplierForm) => {
      let { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user ?? null;
      }
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('suppliers')
        .update({
          name: supplier.name,
          contact_person: supplier.contact_person || null,
          email: supplier.email || null,
          phone: supplier.phone || null,
          address: supplier.address || null,
          payment_terms: supplier.payment_terms || null,
          notes: supplier.notes || null,
          rating: parseFloat(supplier.rating) || 0,
          delivery_time_days: parseInt(supplier.delivery_time_days) || 7
        })
        .eq('id', supplier.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setEditSupplierOpen(false);
      resetForm();
      toast.success(t.suppliers.updatedSuccess);
    },
    onError: (error) => {
      toast.error((t.common.error || "Error") + ": " + error.message);
    }
  });

  // Delete supplier mutation
  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: string) => {
      let { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user ?? null;
      }
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(t.suppliers.deletedSuccess);
    },
    onError: (error) => {
      toast.error((t.common.error || "Error") + ": " + error.message);
    }
  });

  const resetForm = () => {
    setSupplierForm({
      id: "",
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      payment_terms: "",
      notes: "",
      rating: "0",
      delivery_time_days: ""
    });
  };

  const openEditDialog = (supplier: Supplier) => {
    setSupplierForm({
      id: supplier.id,
      name: supplier.name,
      contact_person: supplier.contact_person || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      payment_terms: supplier.payment_terms || "",
      notes: supplier.notes || "",
      rating: (supplier.rating || 0).toString(),
      delivery_time_days: (supplier.delivery_time_days || "").toString()
    });
    setEditSupplierOpen(true);
  };

  const toggleSupplierSelection = (id: string) => {
    setSelectedSuppliers(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const getSelectedSuppliersData = () => {
    return suppliers?.filter(s => selectedSuppliers.includes(s.id)) || [];
  };

  // Render stars
  const renderStars = (rating: number | null) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < fullStars ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" />
            {t.nav.suppliers}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your suppliers, track delivery times, and compare performance
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setPriceHistoryOpen(true)}>
            <History className="h-4 w-4 mr-2" />
            {t.inventory.priceHistory}
          </Button>
          <Button
            variant={compareMode ? "default" : "outline"}
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedSuppliers([]);
            }}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {compareMode ? t.suppliers.exitCompare : t.suppliers.compare}
          </Button>
          <Dialog open={addSupplierOpen} onOpenChange={setAddSupplierOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t.suppliers.addSupplier}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t.suppliers.addSupplierTitle}</DialogTitle>
                <DialogDescription>
                  {t.suppliers.addSupplierDesc}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t.suppliers.supplierName} *</Label>
                  <Input
                    id="name"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    placeholder="e.g., ABC Distributors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contact_person">{t.suppliers.contactPerson}</Label>
                    <Input
                      id="contact_person"
                      value={supplierForm.contact_person}
                      onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">{t.suppliers.phone}</Label>
                    <Input
                      id="phone"
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">{t.suppliers.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    placeholder="supplier@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">{t.suppliers.address}</Label>
                  <Textarea
                    id="address"
                    value={supplierForm.address}
                    onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                    placeholder="Full address"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="delivery_time">{t.suppliers.deliveryTime}</Label>
                    <Input
                      id="delivery_time"
                      type="number"
                      value={supplierForm.delivery_time_days}
                      onChange={(e) => setSupplierForm({ ...supplierForm, delivery_time_days: e.target.value })}
                      placeholder="7"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="rating">{t.suppliers.rating}</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="0"
                      max="5"
                      step="0.5"
                      value={supplierForm.rating}
                      onChange={(e) => setSupplierForm({ ...supplierForm, rating: e.target.value })}
                      placeholder="4.5"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payment_terms">{t.suppliers.paymentTerms}</Label>
                  <Input
                    id="payment_terms"
                    value={supplierForm.payment_terms}
                    onChange={(e) => setSupplierForm({ ...supplierForm, payment_terms: e.target.value })}
                    placeholder="e.g., Net 30, COD"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">{t.suppliers.notes}</Label>
                  <Textarea
                    id="notes"
                    value={supplierForm.notes}
                    onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                    placeholder="Additional notes about this supplier"
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setAddSupplierOpen(false); resetForm(); }}>
                  {t.common.cancel}
                </Button>
                <Button
                  onClick={() => addSupplierMutation.mutate(supplierForm)}
                  disabled={!supplierForm.name || addSupplierMutation.isPending}
                >
                  {addSupplierMutation.isPending ? t.inventory.adding : t.suppliers.addSupplier}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Compare Mode Banner */}
      {compareMode && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t.suppliers.compareModeTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {t.suppliers.compareModeDesc.replace("{count}", selectedSuppliers.length.toString())}
                </p>
              </div>
              <Button
                disabled={selectedSuppliers.length < 2}
                onClick={() => setCompareSheetOpen(true)}
              >
                {t.suppliers.compareSelected}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.suppliers.totalSuppliers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.suppliers.avgLeadTime}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers && suppliers.length > 0
                ? Math.round(suppliers.reduce((sum, s) => sum + (s.delivery_time_days || 7), 0) / suppliers.length)
                : 0} {t.suppliers.days}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.suppliers.topRated}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers?.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.name || "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.suppliers.fastestDelivery}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers?.sort((a, b) => (a.delivery_time_days || 99) - (b.delivery_time_days || 99))[0]?.name || "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t.suppliers.sortBy}:</span>
        <Button
          variant={sortBy === "name" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSortBy("name")}
        >
          {t.suppliers.supplierName}
        </Button>
        <Button
          variant={sortBy === "rating" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSortBy("rating")}
        >
          {t.suppliers.rating}
        </Button>
        <Button
          variant={sortBy === "delivery" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSortBy("delivery")}
        >
          {t.suppliers.deliveryTime}
        </Button>
      </div>

      {/* Suppliers Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : suppliers && suppliers.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {compareMode && <TableHead className="w-12"></TableHead>}
                  <TableHead>{t.suppliers.supplierName}</TableHead>
                  <TableHead>{t.suppliers.contactPerson}</TableHead>
                  <TableHead>{t.suppliers.deliveryTime}</TableHead>
                  <TableHead>{t.suppliers.rating}</TableHead>
                  <TableHead>{t.suppliers.paymentTerms}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow
                    key={supplier.id}
                    className={selectedSuppliers.includes(supplier.id) ? "bg-primary/10" : ""}
                  >
                    {compareMode && (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedSuppliers.includes(supplier.id)}
                          onChange={() => toggleSupplierSelection(supplier.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        {supplier.contact_person && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {supplier.contact_person}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {supplier.phone && (
                          <p className="text-sm flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {supplier.phone}
                          </p>
                        )}
                        {supplier.email && (
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {supplier.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {supplier.delivery_time_days || 7} {t.suppliers.days}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {renderStars(supplier.rating)}
                        <span className="ml-1 text-sm text-muted-foreground">
                          ({supplier.rating || 0})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {supplier.payment_terms || t.suppliers.notSpecified}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditDialog(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteSupplierMutation.mutate(supplier.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t.suppliers.noSuppliers}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t.suppliers.addFirstSupplier}
            </p>
            <Button onClick={() => setAddSupplierOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.suppliers.addSupplier}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Supplier Dialog */}
      <Dialog open={editSupplierOpen} onOpenChange={setEditSupplierOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.suppliers.editSupplier}</DialogTitle>
            <DialogDescription>
              {t.suppliers.editSupplierDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="edit_name">{t.suppliers.supplierName} *</Label>
              <Input
                id="edit_name"
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_contact">{t.suppliers.contactPerson}</Label>
                <Input
                  id="edit_contact"
                  value={supplierForm.contact_person}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_phone">{t.suppliers.phone}</Label>
                <Input
                  id="edit_phone"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_email">{t.suppliers.email}</Label>
              <Input
                id="edit_email"
                type="email"
                value={supplierForm.email}
                onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_address">{t.suppliers.address}</Label>
              <Textarea
                id="edit_address"
                value={supplierForm.address}
                onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_delivery">{t.suppliers.deliveryTime}</Label>
                <Input
                  id="edit_delivery"
                  type="number"
                  value={supplierForm.delivery_time_days}
                  onChange={(e) => setSupplierForm({ ...supplierForm, delivery_time_days: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_rating">{t.suppliers.rating}</Label>
                <Input
                  id="edit_rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={supplierForm.rating}
                  onChange={(e) => setSupplierForm({ ...supplierForm, rating: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_payment">{t.suppliers.paymentTerms}</Label>
              <Input
                id="edit_payment"
                value={supplierForm.payment_terms}
                onChange={(e) => setSupplierForm({ ...supplierForm, payment_terms: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_notes">{t.suppliers.notes}</Label>
              <Textarea
                id="edit_notes"
                value={supplierForm.notes}
                onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditSupplierOpen(false); resetForm(); }}>
              {t.common.cancel}
            </Button>
            <Button
              onClick={() => updateSupplierMutation.mutate(supplierForm)}
              disabled={!supplierForm.name || updateSupplierMutation.isPending}
            >
              {updateSupplierMutation.isPending ? t.common.saving : t.suppliers.saveChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Sheet */}
      <Sheet open={compareSheetOpen} onOpenChange={setCompareSheetOpen}>
        <SheetContent className="w-[600px] sm:w-[800px] sm:max-w-[800px]">
          <SheetHeader>
            <SheetTitle>{t.suppliers.comparison}</SheetTitle>
            <SheetDescription>
              {t.suppliers.comparisonDesc}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.suppliers.metric}</TableHead>
                  {getSelectedSuppliersData().map((s) => (
                    <TableHead key={s.id} className="text-center">{s.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{t.suppliers.metric}</TableCell>
                  {getSelectedSuppliersData().map((s) => (
                    <TableHead key={s.id} className="text-center">{s.name}</TableHead>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t.suppliers.rating}</TableCell>
                  {getSelectedSuppliersData().map((s) => {
                    const maxRating = Math.max(...getSelectedSuppliersData().map(sp => sp.rating || 0));
                    const isMax = s.rating === maxRating;
                    return (
                      <TableCell key={s.id} className="text-center">
                        <div className={`flex items-center justify-center gap-1 ${isMax ? "text-green-600 font-bold" : ""}`}>
                          {isMax && <CheckCircle className="h-4 w-4" />}
                          {s.rating || 0}/5
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t.suppliers.deliveryTime}</TableCell>
                  {getSelectedSuppliersData().map((s) => {
                    const minDelivery = Math.min(...getSelectedSuppliersData().map(sp => sp.delivery_time_days || 99));
                    const isBest = s.delivery_time_days === minDelivery;
                    return (
                      <TableCell key={s.id} className="text-center">
                        <div className={`flex items-center justify-center gap-1 ${isBest ? "text-green-600 font-bold" : ""}`}>
                          {isBest && <CheckCircle className="h-4 w-4" />}
                          {s.delivery_time_days || 7} {t.suppliers.days}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t.suppliers.paymentTerms}</TableCell>
                  {getSelectedSuppliersData().map((s) => (
                    <TableCell key={s.id} className="text-center">
                      {s.payment_terms || "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t.suppliers.contactPerson}</TableCell>
                  {getSelectedSuppliersData().map((s) => (
                    <TableCell key={s.id} className="text-center">
                      {s.contact_person || "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t.suppliers.location || "Location"}</TableCell>
                  {getSelectedSuppliersData().map((s) => (
                    <TableCell key={s.id} className="text-center text-sm">
                      {s.address ? s.address.substring(0, 50) + (s.address.length > 50 ? "..." : "") : "N/A"}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </SheetContent>
      </Sheet>

      {/* Supplier Price History */}
      <SupplierPriceHistory
        open={priceHistoryOpen}
        onOpenChange={setPriceHistoryOpen}
      />
    </div>
  );
};

export default Suppliers;
