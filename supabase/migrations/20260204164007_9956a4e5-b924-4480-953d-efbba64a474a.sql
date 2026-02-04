-- ================================================
-- SECURITY FIX: Protect password_reset_tokens table
-- ================================================
-- This table should NEVER be accessible to regular users.
-- Only the service role (edge functions) should access it.

-- First, ensure RLS is enabled
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies (clean slate)
DROP POLICY IF EXISTS "No user access to reset tokens" ON public.password_reset_tokens;

-- Create policy that blocks ALL user access
-- The service role (used by edge functions) bypasses RLS, so edge functions can still work
CREATE POLICY "No user access to reset tokens" 
ON public.password_reset_tokens 
FOR ALL 
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- ================================================
-- SECURITY FIX: Restrict profiles table access
-- ================================================
-- Create a security definer function to check if users are matched
-- This prevents infinite recursion in RLS policies

-- Drop the old permissive SELECT policy
DROP POLICY IF EXISTS "Users can view visible profiles" ON public.profiles;

-- Create a more secure SELECT policy that:
-- 1. Users can always see their own profile
-- 2. Admins can see all profiles
-- 3. Other users can only see visible, complete profiles that they haven't blocked
-- 4. Sensitive fields are still accessible but location data is protected via application logic
CREATE POLICY "Users can view profiles with restrictions" 
ON public.profiles 
FOR SELECT 
USING (
  -- User can always see their own profile
  (auth.uid() = user_id) 
  OR 
  -- Admins can see all
  is_admin()
  OR 
  -- Others can only see visible, complete, non-blocked profiles of the appropriate gender
  (
    is_visible = true 
    AND is_profile_complete = true 
    AND NOT is_blocked(auth.uid(), user_id)
    -- Only show profiles that match the viewer's "looking_for" preferences
    AND EXISTS (
      SELECT 1 FROM public.profiles AS viewer
      WHERE viewer.user_id = auth.uid()
      AND (
        -- Check if this profile's gender is in viewer's looking_for array
        (viewer.looking_for IS NULL OR profiles.gender = ANY(viewer.looking_for))
      )
    )
  )
);

-- ================================================
-- Create a view for safe profile data (hides sensitive fields for non-matched users)
-- ================================================
DROP VIEW IF EXISTS public.safe_profiles;

CREATE VIEW public.safe_profiles AS
SELECT 
  id,
  user_id,
  display_name,
  date_of_birth,
  gender,
  looking_for,
  city, -- City is fine to show
  bio,
  height_cm,
  education,
  relationship_intent,
  relationship_status,
  smoking,
  drinking,
  workout,
  diet,
  pets,
  children,
  zodiac,
  love_language,
  is_verified,
  is_profile_complete,
  is_visible,
  is_online,
  show_online_status,
  show_distance,
  last_active,
  created_at,
  updated_at,
  -- Hide precise location for non-matched users (only show if matched)
  CASE 
    WHEN user_id = auth.uid() THEN latitude
    WHEN are_matched(auth.uid(), user_id) THEN latitude
    ELSE NULL 
  END as latitude,
  CASE 
    WHEN user_id = auth.uid() THEN longitude
    WHEN are_matched(auth.uid(), user_id) THEN longitude
    ELSE NULL 
  END as longitude,
  -- Hide sensitive personal details unless matched or own profile
  CASE 
    WHEN user_id = auth.uid() THEN job_title
    WHEN are_matched(auth.uid(), user_id) THEN job_title
    ELSE NULL 
  END as job_title,
  CASE 
    WHEN user_id = auth.uid() THEN company
    WHEN are_matched(auth.uid(), user_id) THEN company
    ELSE NULL 
  END as company,
  CASE 
    WHEN user_id = auth.uid() THEN school
    WHEN are_matched(auth.uid(), user_id) THEN school
    ELSE NULL 
  END as school,
  CASE 
    WHEN user_id = auth.uid() THEN sexual_orientation
    WHEN are_matched(auth.uid(), user_id) AND show_sexual_orientation = true THEN sexual_orientation
    ELSE NULL 
  END as sexual_orientation,
  CASE 
    WHEN user_id = auth.uid() THEN religion
    WHEN are_matched(auth.uid(), user_id) AND show_religion = true THEN religion
    ELSE NULL 
  END as religion,
  CASE 
    WHEN user_id = auth.uid() THEN political_views
    WHEN are_matched(auth.uid(), user_id) AND show_political_views = true THEN political_views
    ELSE NULL 
  END as political_views,
  languages,
  personality_type
FROM public.profiles;

-- Grant access to the safe view
GRANT SELECT ON public.safe_profiles TO authenticated;