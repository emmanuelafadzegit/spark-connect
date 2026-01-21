-- Create feeds table for posts
CREATE TABLE public.feeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feeds ENABLE ROW LEVEL SECURITY;

-- Create feed_likes table
CREATE TABLE public.feed_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_id UUID NOT NULL REFERENCES public.feeds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(feed_id, user_id)
);

-- Enable RLS
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;

-- Create feed_comments table
CREATE TABLE public.feed_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_id UUID NOT NULL REFERENCES public.feeds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feeds
CREATE POLICY "Anyone authenticated can view feeds"
ON public.feeds FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own feeds"
ON public.feeds FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feeds"
ON public.feeds FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feeds"
ON public.feeds FOR DELETE
USING (auth.uid() = user_id OR is_admin());

-- RLS Policies for feed_likes
CREATE POLICY "Anyone authenticated can view likes"
ON public.feed_likes FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can like feeds"
ON public.feed_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike feeds"
ON public.feed_likes FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for feed_comments
CREATE POLICY "Anyone authenticated can view comments"
ON public.feed_comments FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create comments"
ON public.feed_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.feed_comments FOR DELETE
USING (auth.uid() = user_id OR is_admin());

-- Trigger to update likes count
CREATE OR REPLACE FUNCTION public.update_feed_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feeds SET likes_count = likes_count + 1 WHERE id = NEW.feed_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feeds SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.feed_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_feed_like_change
AFTER INSERT OR DELETE ON public.feed_likes
FOR EACH ROW EXECUTE FUNCTION public.update_feed_likes_count();

-- Trigger to update comments count
CREATE OR REPLACE FUNCTION public.update_feed_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feeds SET comments_count = comments_count + 1 WHERE id = NEW.feed_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feeds SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.feed_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_feed_comment_change
AFTER INSERT OR DELETE ON public.feed_comments
FOR EACH ROW EXECUTE FUNCTION public.update_feed_comments_count();

-- Add trigger for updated_at on feeds
CREATE TRIGGER update_feeds_updated_at
BEFORE UPDATE ON public.feeds
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();