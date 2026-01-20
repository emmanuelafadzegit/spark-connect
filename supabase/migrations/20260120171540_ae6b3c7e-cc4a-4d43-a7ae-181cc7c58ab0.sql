-- Fix function search_path warnings
CREATE OR REPLACE FUNCTION public.calculate_age(dob DATE)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
    SELECT EXTRACT(YEAR FROM age(CURRENT_DATE, dob))::INTEGER
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;