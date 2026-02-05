-- Ensure one profile row per user (required for reliable onboarding + upsert)

CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_uidx
ON public.profiles (user_id);
