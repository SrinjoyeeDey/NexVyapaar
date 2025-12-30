-- Create vendors table for persistent vendor registration data
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_category TEXT NOT NULL,
  gst_number TEXT,
  store_description TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pin_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  aadhaar_verified BOOLEAN DEFAULT false,
  blockchain_hash TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  is_registered BOOLEAN DEFAULT false,
  registered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on vendors
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Vendors RLS policies
CREATE POLICY "Users can view own vendor profile" ON public.vendors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vendor profile" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vendor profile" ON public.vendors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vendor profile" ON public.vendors FOR DELETE USING (auth.uid() = user_id);

-- Create civic_connections table for Civic integration status
CREATE TABLE public.civic_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  civic_id TEXT NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id)
);

-- Enable RLS on civic_connections
ALTER TABLE public.civic_connections ENABLE ROW LEVEL SECURITY;

-- Civic connections RLS policies
CREATE POLICY "Users can view own civic connection" ON public.civic_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own civic connection" ON public.civic_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own civic connection" ON public.civic_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own civic connection" ON public.civic_connections FOR DELETE USING (auth.uid() = user_id);

-- Create broadcasts table for sent messages
CREATE TABLE public.broadcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'announcement',
  content TEXT NOT NULL,
  channels TEXT[] NOT NULL DEFAULT '{}',
  audience_type TEXT DEFAULT 'all',
  media_urls TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft',
  recipients_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  estimated_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on broadcasts
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- Broadcasts RLS policies
CREATE POLICY "Users can view own broadcasts" ON public.broadcasts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own broadcasts" ON public.broadcasts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own broadcasts" ON public.broadcasts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own broadcasts" ON public.broadcasts FOR DELETE USING (auth.uid() = user_id);

-- Create customer_consents table for managing notification preferences
CREATE TABLE public.customer_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  civic_verified BOOLEAN DEFAULT false,
  marketing_offers BOOLEAN DEFAULT true,
  product_updates BOOLEAN DEFAULT true,
  announcements BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  consent_status TEXT DEFAULT 'pending',
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  messages_received INTEGER DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on customer_consents
ALTER TABLE public.customer_consents ENABLE ROW LEVEL SECURITY;

-- Customer consents RLS policies
CREATE POLICY "Vendors can view own customer consents" ON public.customer_consents FOR SELECT USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors can insert own customer consents" ON public.customer_consents FOR INSERT WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Vendors can update own customer consents" ON public.customer_consents FOR UPDATE USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors can delete own customer consents" ON public.customer_consents FOR DELETE USING (auth.uid() = vendor_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_broadcasts_updated_at BEFORE UPDATE ON public.broadcasts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_customer_consents_updated_at BEFORE UPDATE ON public.customer_consents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();