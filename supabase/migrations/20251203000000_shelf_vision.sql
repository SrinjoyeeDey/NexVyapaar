-- Create shelf_snapshots table for AI vision tracking
CREATE TABLE public.shelf_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_data JSONB NOT NULL, -- Array of objects: { name, bounding_box, confidence, label_text }
  image_url TEXT, -- Optional: link to the stored shelf image
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shelf_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own snapshots" ON public.shelf_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own snapshots" ON public.shelf_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_shelf_snapshots_user_id ON public.shelf_snapshots(user_id);
CREATE INDEX idx_shelf_snapshots_created_at ON public.shelf_snapshots(created_at DESC);
