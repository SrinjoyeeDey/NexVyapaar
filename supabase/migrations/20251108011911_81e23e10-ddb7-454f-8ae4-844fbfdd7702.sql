-- Create courses table for SmartBizGrow Academy
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  thumbnail_url TEXT,
  video_url TEXT,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user progress tracking table
CREATE TABLE public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  progress_percentage INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  rewards_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user referrals tracking table
CREATE TABLE public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_user_id UUID NOT NULL UNIQUE,
  referral_code TEXT NOT NULL,
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses (public read)
CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT
  USING (is_published = true);

-- RLS Policies for course progress
CREATE POLICY "Users can view own progress"
  ON public.course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.course_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for referrals
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can insert own referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update own referrals"
  ON public.referrals FOR UPDATE
  USING (auth.uid() = referrer_id);

-- RLS Policies for user referrals
CREATE POLICY "Users can view referrals they made"
  ON public.user_referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can insert referrals"
  ON public.user_referrals FOR INSERT
  WITH CHECK (true);

-- Insert sample courses
INSERT INTO public.courses (title, description, category, difficulty, duration_minutes, content, thumbnail_url) VALUES
  ('Digital Marketing Basics', 'Learn the fundamentals of digital marketing including SEO, social media, and email marketing', 'Marketing', 'beginner', 45, 'Introduction to digital marketing strategies and tools that can help grow your business online...', 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400'),
  ('Understanding AI for Business', 'Discover how AI can transform your business operations and decision-making', 'AI Adoption', 'beginner', 30, 'Learn about practical AI applications for small businesses including automation and analytics...', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400'),
  ('Social Media Strategy 101', 'Master the art of social media marketing for your business', 'Marketing', 'beginner', 40, 'Build an effective social media presence across platforms like Facebook, Instagram, and LinkedIn...', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400'),
  ('Financial Planning Essentials', 'Learn to manage your business finances effectively', 'Finance', 'intermediate', 50, 'Understand cash flow, budgeting, and financial forecasting for sustainable business growth...', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400'),
  ('Customer Service Excellence', 'Build a customer-centric business culture', 'Business Skills', 'beginner', 35, 'Master communication skills and strategies to deliver exceptional customer experiences...', 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=400'),
  ('E-commerce Setup Guide', 'Step-by-step guide to launching your online store', 'Digital Literacy', 'intermediate', 60, 'Everything you need to know about setting up and running a successful e-commerce business...', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400');

-- Add trigger for updating updated_at
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();