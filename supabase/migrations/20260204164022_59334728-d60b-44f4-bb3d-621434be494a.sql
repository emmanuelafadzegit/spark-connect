-- Fix the security definer view issue by making it use invoker security
-- This ensures RLS policies are respected when querying the view

DROP VIEW IF EXISTS public.safe_profiles;

CREATE VIEW public.safe_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  user_id,
  display_name,
  date_of_birth,
  gender,
  looking_for,
  city,
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
  -- Hide precise location for non-matched users
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