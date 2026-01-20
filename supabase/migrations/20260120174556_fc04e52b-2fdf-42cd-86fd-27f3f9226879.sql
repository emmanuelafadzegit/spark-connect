-- Face verification fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_photo_url TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'submitted', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_reviewed_by UUID;

-- Daily message tracking in subscriptions
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS daily_messages_remaining INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS last_message_reset TIMESTAMPTZ DEFAULT now();

-- Create function to check message limits
CREATE OR REPLACE FUNCTION public.check_message_limit(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    sub_record RECORD;
BEGIN
    SELECT tier, daily_messages_remaining, last_message_reset 
    INTO sub_record
    FROM public.subscriptions
    WHERE user_id = _user_id AND is_active = TRUE;
    
    -- Premium users have unlimited messages
    IF sub_record.tier IN ('premium', 'premium_plus') THEN
        RETURN TRUE;
    END IF;
    
    -- Reset daily count if needed
    IF sub_record.last_message_reset IS NULL OR 
       sub_record.last_message_reset < CURRENT_DATE THEN
        UPDATE public.subscriptions
        SET daily_messages_remaining = 5, last_message_reset = now()
        WHERE user_id = _user_id;
        RETURN TRUE;
    END IF;
    
    RETURN sub_record.daily_messages_remaining > 0;
END;
$$;

-- Create function to decrement message count
CREATE OR REPLACE FUNCTION public.decrement_message_count(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    sub_tier TEXT;
BEGIN
    SELECT tier INTO sub_tier
    FROM public.subscriptions
    WHERE user_id = _user_id AND is_active = TRUE;
    
    -- Only decrement for free users
    IF sub_tier = 'free' THEN
        UPDATE public.subscriptions
        SET daily_messages_remaining = GREATEST(0, daily_messages_remaining - 1)
        WHERE user_id = _user_id;
    END IF;
END;
$$;

-- Paystack transactions table
CREATE TABLE IF NOT EXISTS public.paystack_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    reference TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'NGN',
    plan TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    paystack_response JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.paystack_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
ON public.paystack_transactions FOR SELECT
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create own transactions"
ON public.paystack_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only system can update transactions"
ON public.paystack_transactions FOR UPDATE
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_paystack_transactions_updated_at
BEFORE UPDATE ON public.paystack_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();