-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT,
  delivery_time_days INTEGER DEFAULT 7,
  rating DECIMAL(2,1) DEFAULT 0.0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create raw_materials table
CREATE TABLE public.raw_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT NOT NULL DEFAULT 'kg',
  current_stock DECIMAL(10,2) DEFAULT 0,
  reorder_point DECIMAL(10,2),
  optimal_stock_level DECIMAL(10,2),
  cost_per_unit DECIMAL(10,2),
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  last_ordered_at TIMESTAMP WITH TIME ZONE,
  burn_rate DECIMAL(10,2),
  seasonality_tag TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create finished_products table (catalog of what you sell)
CREATE TABLE public.finished_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  selling_price DECIMAL(10,2) NOT NULL,
  cost_to_produce DECIMAL(10,2),
  current_stock INTEGER DEFAULT 0,
  reorder_point INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_ingredients (BOM - Bill of Materials)
CREATE TABLE public.product_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.finished_products(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE CASCADE,
  quantity_required DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create supplier_prices table (price history/comparison)
CREATE TABLE public.supplier_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.raw_materials(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.finished_products(id) ON DELETE CASCADE,
  price_per_unit DECIMAL(10,2) NOT NULL,
  minimum_order_quantity DECIMAL(10,2),
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expected_delivery_date TIMESTAMP WITH TIME ZONE,
  actual_delivery_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft',
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.raw_materials(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.finished_products(id) ON DELETE SET NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create low_stock_alerts table
CREATE TABLE public.low_stock_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.raw_materials(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.finished_products(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL DEFAULT 'low_stock',
  message TEXT NOT NULL,
  threshold_value DECIMAL(10,2),
  current_value DECIMAL(10,2),
  is_acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finished_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.low_stock_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for suppliers
CREATE POLICY "Users can view own suppliers" ON public.suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own suppliers" ON public.suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own suppliers" ON public.suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own suppliers" ON public.suppliers FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for raw_materials
CREATE POLICY "Users can view own materials" ON public.raw_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own materials" ON public.raw_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own materials" ON public.raw_materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own materials" ON public.raw_materials FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for finished_products
CREATE POLICY "Users can view own products" ON public.finished_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON public.finished_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON public.finished_products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON public.finished_products FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for product_ingredients
CREATE POLICY "Users can view own ingredients" ON public.product_ingredients FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.finished_products WHERE id = product_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own ingredients" ON public.product_ingredients FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.finished_products WHERE id = product_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own ingredients" ON public.product_ingredients FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.finished_products WHERE id = product_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own ingredients" ON public.product_ingredients FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.finished_products WHERE id = product_id AND user_id = auth.uid()));

-- RLS Policies for supplier_prices
CREATE POLICY "Users can view prices for own suppliers" ON public.supplier_prices FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.suppliers WHERE id = supplier_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert prices for own suppliers" ON public.supplier_prices FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.suppliers WHERE id = supplier_id AND user_id = auth.uid()));
CREATE POLICY "Users can update prices for own suppliers" ON public.supplier_prices FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.suppliers WHERE id = supplier_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete prices for own suppliers" ON public.supplier_prices FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.suppliers WHERE id = supplier_id AND user_id = auth.uid()));

-- RLS Policies for purchase_orders
CREATE POLICY "Users can view own purchase orders" ON public.purchase_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchase orders" ON public.purchase_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own purchase orders" ON public.purchase_orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own purchase orders" ON public.purchase_orders FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for purchase_order_items
CREATE POLICY "Users can view own PO items" ON public.purchase_order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.purchase_orders WHERE id = purchase_order_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own PO items" ON public.purchase_order_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.purchase_orders WHERE id = purchase_order_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own PO items" ON public.purchase_order_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.purchase_orders WHERE id = purchase_order_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own PO items" ON public.purchase_order_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.purchase_orders WHERE id = purchase_order_id AND user_id = auth.uid()));

-- RLS Policies for low_stock_alerts
CREATE POLICY "Users can view own alerts" ON public.low_stock_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.low_stock_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.low_stock_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON public.low_stock_alerts FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_suppliers_user_id ON public.suppliers(user_id);
CREATE INDEX idx_raw_materials_user_id ON public.raw_materials(user_id);
CREATE INDEX idx_raw_materials_supplier_id ON public.raw_materials(supplier_id);
CREATE INDEX idx_finished_products_user_id ON public.finished_products(user_id);
CREATE INDEX idx_purchase_orders_user_id ON public.purchase_orders(user_id);
CREATE INDEX idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_low_stock_alerts_user_id ON public.low_stock_alerts(user_id);
CREATE INDEX idx_low_stock_alerts_acknowledged ON public.low_stock_alerts(is_acknowledged);

-- Triggers for updated_at
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_raw_materials_updated_at BEFORE UPDATE ON public.raw_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_finished_products_updated_at BEFORE UPDATE ON public.finished_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();