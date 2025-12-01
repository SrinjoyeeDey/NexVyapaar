-- Add inventory tracking fields to sales_data table
ALTER TABLE public.sales_data 
ADD COLUMN seasonality_tag TEXT,
ADD COLUMN burn_rate DECIMAL,
ADD COLUMN waste_quantity INTEGER DEFAULT 0,
ADD COLUMN cost_per_unit DECIMAL;

-- Create indexes for better query performance
CREATE INDEX idx_sales_data_seasonality ON public.sales_data(seasonality_tag);
CREATE INDEX idx_sales_data_product ON public.sales_data(product_name);
CREATE INDEX idx_sales_data_category ON public.sales_data(category);