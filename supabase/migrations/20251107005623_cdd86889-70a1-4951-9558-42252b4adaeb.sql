-- Create marketing campaigns table
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_name TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'social', 'email', 'whatsapp'
  generated_content TEXT NOT NULL,
  schedule_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'sent', 'failed'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own campaigns" 
ON public.marketing_campaigns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns" 
ON public.marketing_campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" 
ON public.marketing_campaigns 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" 
ON public.marketing_campaigns 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketing_campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;