-- Create admin_messages table for direct admin-to-user communications
CREATE TABLE public.admin_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can send messages
CREATE POLICY "Admins can insert messages"
ON public.admin_messages
FOR INSERT
WITH CHECK (public.is_admin());

-- Policy: Recipients can view their messages
CREATE POLICY "Users can view their admin messages"
ON public.admin_messages
FOR SELECT
USING (auth.uid() = recipient_id OR public.is_admin());

-- Policy: Recipients can mark as read
CREATE POLICY "Users can update read status"
ON public.admin_messages
FOR UPDATE
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- Create admin_announcements table for broadcast messages
CREATE TABLE public.admin_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_tier TEXT DEFAULT 'all', -- 'all', 'free', 'premium', 'premium_plus'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.admin_announcements ENABLE ROW LEVEL SECURITY;

-- Only admins can manage announcements
CREATE POLICY "Admins can manage announcements"
ON public.admin_announcements
FOR ALL
USING (public.is_admin());

-- Users can view active announcements
CREATE POLICY "Users can view active announcements"
ON public.admin_announcements
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Track which announcements users have dismissed
CREATE TABLE public.dismissed_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  announcement_id UUID NOT NULL REFERENCES public.admin_announcements(id) ON DELETE CASCADE,
  dismissed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, announcement_id)
);

ALTER TABLE public.dismissed_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can dismiss announcements"
ON public.dismissed_announcements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own dismissals"
ON public.dismissed_announcements
FOR SELECT
USING (auth.uid() = user_id);
