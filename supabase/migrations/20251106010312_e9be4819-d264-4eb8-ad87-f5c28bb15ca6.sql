-- Create transactions table for payment tracking
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_gateway TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  subscription_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create AI recommendations table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_score INTEGER DEFAULT 0,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own recommendations"
  ON public.ai_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON public.ai_recommendations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add seed data for community posts
INSERT INTO public.community_posts (user_id, title, content, category, status, likes_count, comments_count)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  title,
  content,
  category,
  'approved',
  likes,
  comments
FROM (VALUES
  ('Festival Sale - 30% Off Everything!', 'Get ready for the biggest sale of the season! Use code FEST30 to get 30% off on all items. Valid till this weekend only. Limited stock available!', 'ads', 45, 12),
  ('How I Increased Instagram Engagement by 200%', 'Started posting reels showing behind-the-scenes of my cafe. Customers love seeing how we make coffee! Posting 3x per week at 7 PM works best. Try it!', 'tips', 89, 24),
  ('Business Networking Meetup - Dec 15th', 'Join us for a casual networking event at Cafe Central. Meet fellow small business owners, share experiences, and grow together. Free entry!', 'events', 34, 8),
  ('Flash Deal: Buy 2 Get 1 Free on Pastries', 'Today only! Visit our bakery and enjoy our special offer. Fresh baked goods, amazing quality. Tag a friend who loves pastries!', 'ads', 67, 15),
  ('Best Accounting Software for Small Business?', 'Looking for recommendations on affordable accounting tools. Currently using spreadsheets but need something better. What do you use?', 'tips', 52, 31),
  ('Weekend Pop-up Market - Vendors Wanted', 'Organizing a weekend market in MG Road. Looking for small businesses to showcase products. DM for booth details. Great foot traffic!', 'events', 28, 19)
) AS seed_data(title, content, category, likes, comments)
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);