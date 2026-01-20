-- =============================================
-- MATCHLY DATING APP - COMPLETE DATABASE SCHEMA
-- =============================================

-- Create enum types
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'non_binary', 'other');
CREATE TYPE public.swipe_type AS ENUM ('like', 'pass', 'super_like');
CREATE TYPE public.subscription_tier AS ENUM ('free', 'premium', 'premium_plus');
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- =============================================
-- USER ROLES TABLE (separate from profiles for security)
-- =============================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    bio TEXT,
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    looking_for gender_type[] DEFAULT ARRAY['male', 'female']::gender_type[],
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    city TEXT,
    max_distance_km INTEGER DEFAULT 50,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 50,
    is_verified BOOLEAN DEFAULT FALSE,
    is_profile_complete BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    last_active TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILE PHOTOS TABLE
-- =============================================
CREATE TABLE public.profile_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- INTERESTS TABLE (predefined list)
-- =============================================
CREATE TABLE public.interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    emoji TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILE INTERESTS (junction table)
-- =============================================
CREATE TABLE public.profile_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(profile_id, interest_id)
);

ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SWIPES TABLE
-- =============================================
CREATE TABLE public.swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    swiped_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    swipe_type swipe_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(swiper_id, swiped_id)
);

ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- MATCHES TABLE
-- =============================================
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_message_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    daily_swipes_remaining INTEGER DEFAULT 20,
    last_swipe_reset TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- BLOCKED USERS TABLE
-- =============================================
CREATE TABLE public.blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(blocker_id, blocked_id)
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- =============================================
-- REPORTS TABLE
-- =============================================
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- =============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Check if two users are matched
CREATE OR REPLACE FUNCTION public.are_matched(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.matches
        WHERE is_active = TRUE
        AND (
            (user1_id = LEAST(user_a, user_b) AND user2_id = GREATEST(user_a, user_b))
        )
    )
$$;

-- Check if user is blocked
CREATE OR REPLACE FUNCTION public.is_blocked(checker_id UUID, target_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.blocked_users
        WHERE (blocker_id = checker_id AND blocked_id = target_id)
           OR (blocker_id = target_id AND blocked_id = checker_id)
    )
$$;

-- Check if user has already swiped on someone
CREATE OR REPLACE FUNCTION public.has_swiped(swiper UUID, swiped UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.swipes
        WHERE swiper_id = swiper AND swiped_id = swiped
    )
$$;

-- Get user's subscription tier
CREATE OR REPLACE FUNCTION public.get_subscription_tier(_user_id UUID)
RETURNS subscription_tier
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT tier FROM public.subscriptions WHERE user_id = _user_id AND is_active = TRUE),
        'free'::subscription_tier
    )
$$;

-- Calculate age from date of birth
CREATE OR REPLACE FUNCTION public.calculate_age(dob DATE)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT EXTRACT(YEAR FROM age(CURRENT_DATE, dob))::INTEGER
$$;

-- =============================================
-- TRIGGER: Auto-create profile and subscription on user signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    -- Create subscription (free tier)
    INSERT INTO public.subscriptions (user_id, tier)
    VALUES (NEW.id, 'free');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TRIGGER: Create match on mutual like
-- =============================================
CREATE OR REPLACE FUNCTION public.check_for_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only check for matches on 'like' or 'super_like'
    IF NEW.swipe_type IN ('like', 'super_like') THEN
        -- Check if the other person also liked this user
        IF EXISTS (
            SELECT 1 FROM public.swipes
            WHERE swiper_id = NEW.swiped_id
            AND swiped_id = NEW.swiper_id
            AND swipe_type IN ('like', 'super_like')
        ) THEN
            -- Create a match (ensure user1_id < user2_id for uniqueness)
            INSERT INTO public.matches (user1_id, user2_id)
            VALUES (
                LEAST(NEW.swiper_id, NEW.swiped_id),
                GREATEST(NEW.swiper_id, NEW.swiped_id)
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_swipe_created
    AFTER INSERT ON public.swipes
    FOR EACH ROW
    EXECUTE FUNCTION public.check_for_match();

-- =============================================
-- TRIGGER: Update last_message_at on new message
-- =============================================
CREATE OR REPLACE FUNCTION public.update_match_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.matches
    SET last_message_at = NEW.created_at
    WHERE id = NEW.match_id;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_created
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_match_last_message();

-- =============================================
-- TRIGGER: Update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- RLS POLICIES
-- =============================================

-- User Roles policies
CREATE POLICY "Users can view own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Profiles policies
CREATE POLICY "Users can view visible profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() = user_id 
        OR public.is_admin()
        OR (
            is_visible = TRUE 
            AND is_profile_complete = TRUE
            AND NOT public.is_blocked(auth.uid(), user_id)
        )
    );

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Profile Photos policies
CREATE POLICY "Users can view photos of visible profiles" ON public.profile_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = profile_photos.profile_id
            AND (
                p.user_id = auth.uid()
                OR public.is_admin()
                OR (p.is_visible = TRUE AND NOT public.is_blocked(auth.uid(), p.user_id))
            )
        )
    );

CREATE POLICY "Users can manage own photos" ON public.profile_photos
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_photos.profile_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can update own photos" ON public.profile_photos
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_photos.profile_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete own photos" ON public.profile_photos
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_photos.profile_id AND user_id = auth.uid())
        OR public.is_admin()
    );

-- Interests policies (public read)
CREATE POLICY "Anyone can view interests" ON public.interests
    FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can manage interests" ON public.interests
    FOR ALL USING (public.is_admin());

-- Profile Interests policies
CREATE POLICY "Users can view profile interests" ON public.profile_interests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = profile_interests.profile_id
            AND (p.user_id = auth.uid() OR p.is_visible = TRUE)
        )
    );

CREATE POLICY "Users can manage own interests" ON public.profile_interests
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_interests.profile_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete own interests" ON public.profile_interests
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_interests.profile_id AND user_id = auth.uid())
    );

-- Swipes policies
CREATE POLICY "Users can view own swipes" ON public.swipes
    FOR SELECT USING (auth.uid() = swiper_id OR public.is_admin());

CREATE POLICY "Users can create swipes" ON public.swipes
    FOR INSERT WITH CHECK (
        auth.uid() = swiper_id 
        AND NOT public.is_blocked(auth.uid(), swiped_id)
        AND NOT public.has_swiped(auth.uid(), swiped_id)
    );

-- Matches policies
CREATE POLICY "Users can view own matches" ON public.matches
    FOR SELECT USING (
        auth.uid() = user1_id 
        OR auth.uid() = user2_id 
        OR public.is_admin()
    );

CREATE POLICY "Users can delete own matches (unmatch)" ON public.matches
    FOR DELETE USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

CREATE POLICY "Users can update own matches" ON public.matches
    FOR UPDATE USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Messages policies
CREATE POLICY "Users can view messages from their matches" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.matches m
            WHERE m.id = messages.match_id
            AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        )
        OR public.is_admin()
    );

CREATE POLICY "Users can send messages to their matches" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.matches m
            WHERE m.id = messages.match_id
            AND m.is_active = TRUE
            AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can update messages (read status)" ON public.messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.matches m
            WHERE m.id = messages.match_id
            AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        )
    );

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Blocked Users policies
CREATE POLICY "Users can view own blocks" ON public.blocked_users
    FOR SELECT USING (auth.uid() = blocker_id OR public.is_admin());

CREATE POLICY "Users can block others" ON public.blocked_users
    FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock" ON public.blocked_users
    FOR DELETE USING (auth.uid() = blocker_id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_id OR public.is_admin());

CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update reports" ON public.reports
    FOR UPDATE USING (public.is_admin());

-- =============================================
-- SEED DATA: Interests
-- =============================================
INSERT INTO public.interests (name, category, emoji) VALUES
    ('Travel', 'Lifestyle', '✈️'),
    ('Music', 'Entertainment', '🎵'),
    ('Movies', 'Entertainment', '🎬'),
    ('Cooking', 'Lifestyle', '👨‍🍳'),
    ('Fitness', 'Health', '💪'),
    ('Photography', 'Creative', '📸'),
    ('Reading', 'Entertainment', '📚'),
    ('Gaming', 'Entertainment', '🎮'),
    ('Art', 'Creative', '🎨'),
    ('Dancing', 'Entertainment', '💃'),
    ('Hiking', 'Outdoors', '🥾'),
    ('Yoga', 'Health', '🧘'),
    ('Coffee', 'Food & Drink', '☕'),
    ('Wine', 'Food & Drink', '🍷'),
    ('Pets', 'Lifestyle', '🐕'),
    ('Sports', 'Health', '⚽'),
    ('Fashion', 'Lifestyle', '👗'),
    ('Technology', 'Career', '💻'),
    ('Volunteering', 'Lifestyle', '🤝'),
    ('Meditation', 'Health', '🧘‍♀️');

-- =============================================
-- STORAGE BUCKET FOR PROFILE PHOTOS
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT DO NOTHING;

-- Storage policies for profile photos
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'profile-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'profile-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'profile-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);