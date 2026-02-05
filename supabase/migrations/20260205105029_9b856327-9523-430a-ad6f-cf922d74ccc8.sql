-- Add is_suspended and suspension tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS suspended_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS suspended_by uuid,
ADD COLUMN IF NOT EXISTS suspension_reason text;

-- Update the 'Users can view profiles with restrictions' policy to also exclude suspended profiles from discovery
DROP POLICY IF EXISTS "Users can view profiles with restrictions" ON public.profiles;

CREATE POLICY "Users can view profiles with restrictions" ON public.profiles
FOR SELECT USING (
  (auth.uid() = user_id) OR 
  is_admin() OR 
  (
    (is_visible = true) AND 
    (is_profile_complete = true) AND 
    (is_suspended IS NOT TRUE) AND
    (NOT is_blocked(auth.uid(), user_id)) AND 
    (EXISTS (
      SELECT 1 FROM profiles viewer
      WHERE (viewer.user_id = auth.uid()) AND 
            ((viewer.looking_for IS NULL) OR (profiles.gender = ANY (viewer.looking_for)))
    ))
  )
);

-- Create policy to prevent suspended users from creating swipes
DROP POLICY IF EXISTS "Users can create swipes" ON public.swipes;

CREATE POLICY "Users can create swipes" ON public.swipes
FOR INSERT WITH CHECK (
  (auth.uid() = swiper_id) AND 
  (NOT is_blocked(auth.uid(), swiped_id)) AND 
  (NOT has_swiped(auth.uid(), swiped_id)) AND
  (NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_suspended = true
  ))
);

-- Update message policy to prevent suspended users from sending messages
DROP POLICY IF EXISTS "Users can send messages to their matches" ON public.messages;

CREATE POLICY "Users can send messages to their matches" ON public.messages
FOR INSERT WITH CHECK (
  (auth.uid() = sender_id) AND 
  (EXISTS (
    SELECT 1 FROM matches m
    WHERE (m.id = messages.match_id) AND 
          (m.is_active = true) AND 
          ((m.user1_id = auth.uid()) OR (m.user2_id = auth.uid()))
  )) AND
  (NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_suspended = true
  ))
);

-- Prevent suspended users from creating feeds
DROP POLICY IF EXISTS "Users can create own feeds" ON public.feeds;

CREATE POLICY "Users can create own feeds" ON public.feeds
FOR INSERT WITH CHECK (
  (auth.uid() = user_id) AND
  (NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_suspended = true
  ))
);

-- Prevent suspended users from commenting
DROP POLICY IF EXISTS "Users can create comments" ON public.feed_comments;

CREATE POLICY "Users can create comments" ON public.feed_comments
FOR INSERT WITH CHECK (
  (auth.uid() = user_id) AND
  (NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_suspended = true
  ))
);