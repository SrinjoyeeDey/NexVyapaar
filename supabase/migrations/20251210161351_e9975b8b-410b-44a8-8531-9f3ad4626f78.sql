-- Enable realtime for inventory tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.raw_materials;
ALTER PUBLICATION supabase_realtime ADD TABLE public.finished_products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.low_stock_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.supplier_prices;

-- Add price history tracking table for detailed historical records
CREATE TABLE public.supplier_price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_price_id UUID REFERENCES public.supplier_prices(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.raw_materials(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.finished_products(id) ON DELETE SET NULL,
  price_per_unit NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.supplier_price_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for price history
CREATE POLICY "Users can view own price history"
ON public.supplier_price_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own price history"
ON public.supplier_price_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own price history"
ON public.supplier_price_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create a trigger to automatically log price changes
CREATE OR REPLACE FUNCTION public.log_price_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.supplier_price_history (
    supplier_price_id,
    supplier_id,
    material_id,
    product_id,
    price_per_unit,
    user_id
  )
  SELECT 
    NEW.id,
    NEW.supplier_id,
    NEW.material_id,
    NEW.product_id,
    NEW.price_per_unit,
    s.user_id
  FROM public.suppliers s
  WHERE s.id = NEW.supplier_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_supplier_price_change
AFTER INSERT OR UPDATE ON public.supplier_prices
FOR EACH ROW
EXECUTE FUNCTION public.log_price_change();