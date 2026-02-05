-- Fix infinite recursion in profiles SELECT policy by removing self-referential subquery

-- Helper: does the current user have a profile row?
CREATE OR REPLACE FUNCTION public.has_my_profile()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
  )
$$;

-- Helper: read current user's looking_for without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_looking_for()
RETURNS gender_type[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.looking_for
  FROM public.profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1
$$;

-- Replace the broken policy that referenced the profiles table directly
DROP POLICY IF EXISTS "Users can view profiles with restrictions" ON public.profiles;

CREATE POLICY "Users can view profiles with restrictions"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() = user_id)
  OR is_admin()
  OR (
    is_visible = true
    AND is_profile_complete = true
    AND COALESCE(is_suspended, false) = false
    AND NOT is_blocked(auth.uid(), user_id)
    AND public.has_my_profile()
    AND (
      public.get_my_looking_for() IS NULL
      OR gender = ANY (public.get_my_looking_for())
    )
  )
);
