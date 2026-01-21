-- Create password_reset_tokens table for secure token-based password reset
CREATE TABLE public.password_reset_tokens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    reset_token TEXT,
    otp_verified BOOLEAN DEFAULT FALSE,
    otp_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_password_reset_email ON public.password_reset_tokens(email);
CREATE INDEX idx_password_reset_token ON public.password_reset_tokens(reset_token);

-- No RLS needed - this table is only accessed by edge functions using service role
-- Enable RLS but no policies (deny all direct client access)
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;