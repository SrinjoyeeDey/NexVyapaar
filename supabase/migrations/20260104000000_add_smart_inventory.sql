-- Migration to add Smart Inventory features
-- Adds expiry_date and batch_number to raw_materials and finished_products

-- 1. Update raw_materials
ALTER TABLE public.raw_materials 
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS batch_number TEXT;

-- 2. Update finished_products
ALTER TABLE public.finished_products 
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS batch_number TEXT;

-- 3. Update sales_data to track sold item expiry (useful for tracking if we sold near-expiry items)
ALTER TABLE public.sales_data 
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS batch_number TEXT;

-- 4. Add index for faster queries on expiry_date
CREATE INDEX IF NOT EXISTS idx_raw_materials_expiry ON public.raw_materials(expiry_date);
CREATE INDEX IF NOT EXISTS idx_finished_products_expiry ON public.finished_products(expiry_date);
