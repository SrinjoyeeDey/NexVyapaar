-- Migration to add expiry_date to inventory and sales
ALTER TABLE public.raw_materials ADD COLUMN IF NOT EXISTS expiry_date DATE;
ALTER TABLE public.sales_data ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Update RLS if needed (usually columns don't need explicit RLS changes if the table policies are broad)
