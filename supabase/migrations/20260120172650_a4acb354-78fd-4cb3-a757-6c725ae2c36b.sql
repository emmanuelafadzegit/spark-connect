-- =============================================
-- MATCHLY EXTENDED PROFILE SYSTEM
-- =============================================

-- Create new enum types for lifestyle and preferences
CREATE TYPE public.relationship_intent AS ENUM (
    'long_term', 'short_term', 'casual', 'friends', 'figuring_out'
);

CREATE TYPE public.smoking_status AS ENUM (
    'non_smoker', 'social_smoker', 'smoker'
);

CREATE TYPE public.drinking_status AS ENUM (
    'never', 'socially', 'often'
);

CREATE TYPE public.workout_status AS ENUM (
    'never', 'sometimes', 'often'
);

CREATE TYPE public.diet_type AS ENUM (
    'omnivore', 'vegetarian', 'vegan', 'pescatarian', 'other'
);

CREATE TYPE public.pet_type AS ENUM (
    'dog', 'cat', 'both', 'other', 'none'
);

CREATE TYPE public.sleep_schedule AS ENUM (
    'early_bird', 'night_owl', 'balanced'
);

CREATE TYPE public.children_status AS ENUM (
    'have_kids', 'want_kids', 'dont_want_kids', 'open_to_kids'
);

CREATE TYPE public.relationship_status AS ENUM (
    'single', 'divorced', 'widowed', 'separated'
);

CREATE TYPE public.education_level AS ENUM (
    'high_school', 'some_college', 'bachelors', 'masters', 'doctorate', 'trade_school', 'other'
);

CREATE TYPE public.zodiac_sign AS ENUM (
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
);

CREATE TYPE public.love_language AS ENUM (
    'words_of_affirmation', 'acts_of_service', 'receiving_gifts', 
    'quality_time', 'physical_touch'
);

-- =============================================
-- ADD NEW COLUMNS TO PROFILES TABLE
-- =============================================

-- Basic info
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sexual_orientation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_sexual_orientation BOOLEAN DEFAULT TRUE;

-- Relationship
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS relationship_intent relationship_intent[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS relationship_status relationship_status DEFAULT 'single';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deal_breakers TEXT[];

-- Lifestyle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smoking smoking_status;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS drinking drinking_status;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS workout workout_status;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS diet diet_type;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pets pet_type;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sleep_schedule sleep_schedule;

-- Personal
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education education_level;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS zodiac zodiac_sign;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personality_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS love_language love_language;

-- Family & Values
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS children children_status;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_religion BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS political_views TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_political_views BOOLEAN DEFAULT FALSE;

-- Status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_distance BOOLEAN DEFAULT TRUE;

-- =============================================
-- PROFILE PROMPTS TABLE (Icebreakers)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profile_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prompt_question TEXT NOT NULL,
    prompt_answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_prompts ENABLE ROW LEVEL SECURITY;

-- RLS for profile prompts
CREATE POLICY "Users can view prompts of visible profiles" ON public.profile_prompts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = profile_prompts.profile_id
            AND (p.user_id = auth.uid() OR p.is_visible = TRUE)
        )
    );

CREATE POLICY "Users can manage own prompts" ON public.profile_prompts
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_prompts.profile_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can update own prompts" ON public.profile_prompts
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_prompts.profile_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can delete own prompts" ON public.profile_prompts
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_prompts.profile_id AND user_id = auth.uid())
    );

-- Trigger for updated_at
CREATE TRIGGER update_profile_prompts_updated_at
    BEFORE UPDATE ON public.profile_prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- PREDEFINED PROMPTS LIST
-- =============================================
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL UNIQUE,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prompts" ON public.prompts
    FOR SELECT USING (TRUE);

-- Seed prompt questions
INSERT INTO public.prompts (question, category) VALUES
    ('My real-life superpower is…', 'personality'),
    ('The one thing you should know about me…', 'personality'),
    ('The most spontaneous thing I''ve done…', 'experiences'),
    ('A perfect first date looks like…', 'dating'),
    ('Two truths and a lie…', 'fun'),
    ('My love language is…', 'relationship'),
    ('The quickest way to my heart is…', 'relationship'),
    ('I''m looking for someone who…', 'dating'),
    ('My biggest pet peeve is…', 'personality'),
    ('On weekends you''ll find me…', 'lifestyle'),
    ('My go-to karaoke song is…', 'fun'),
    ('The way to win me over is…', 'dating'),
    ('I''m weirdly attracted to…', 'fun'),
    ('My most controversial opinion is…', 'personality'),
    ('I''ll know it''s love when…', 'relationship')
ON CONFLICT (question) DO NOTHING;

-- =============================================
-- ADD MORE INTERESTS WITH CATEGORIES
-- =============================================
INSERT INTO public.interests (name, category, emoji) VALUES
    ('Nightlife', 'Entertainment', '🎉'),
    ('Concerts', 'Entertainment', '🎤'),
    ('Theater', 'Entertainment', '🎭'),
    ('Board Games', 'Entertainment', '🎲'),
    ('Podcasts', 'Entertainment', '🎧'),
    ('Outdoor Activities', 'Outdoors', '🏕️'),
    ('Beach', 'Outdoors', '🏖️'),
    ('Camping', 'Outdoors', '⛺'),
    ('Gardening', 'Outdoors', '🌱'),
    ('Running', 'Health', '🏃'),
    ('Cycling', 'Health', '🚴'),
    ('Swimming', 'Health', '🏊'),
    ('Climbing', 'Health', '🧗'),
    ('Brunch', 'Food & Drink', '🥞'),
    ('Sushi', 'Food & Drink', '🍣'),
    ('Baking', 'Food & Drink', '🧁'),
    ('Craft Beer', 'Food & Drink', '🍺'),
    ('Cocktails', 'Food & Drink', '🍸'),
    ('Festivals', 'Lifestyle', '🎪'),
    ('Tattoos', 'Lifestyle', '💉'),
    ('Vintage', 'Lifestyle', '🎸'),
    ('Sustainability', 'Lifestyle', '♻️'),
    ('Entrepreneurship', 'Career', '💼'),
    ('Investing', 'Career', '📈'),
    ('Writing', 'Creative', '✍️'),
    ('DIY', 'Creative', '🔧'),
    ('Anime', 'Entertainment', '🎌'),
    ('K-Pop', 'Entertainment', '🎤'),
    ('True Crime', 'Entertainment', '🔍'),
    ('Astrology', 'Spiritual', '⭐'),
    ('Spirituality', 'Spiritual', '🧘‍♂️'),
    ('Languages', 'Education', '🗣️'),
    ('History', 'Education', '📜'),
    ('Science', 'Education', '🔬'),
    ('Cars', 'Hobbies', '🚗'),
    ('Motorcycles', 'Hobbies', '🏍️'),
    ('Collecting', 'Hobbies', '📦'),
    ('Thrifting', 'Hobbies', '🛍️')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- DISCOVERY PREFERENCES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.discovery_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 50,
    max_distance_km INTEGER DEFAULT 50,
    gender_preference gender_type[],
    relationship_intent_filter relationship_intent[],
    show_verified_only BOOLEAN DEFAULT FALSE,
    -- Premium filters
    height_min_cm INTEGER,
    height_max_cm INTEGER,
    education_filter education_level[],
    smoking_filter smoking_status[],
    drinking_filter drinking_status[],
    children_filter children_status[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.discovery_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.discovery_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.discovery_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.discovery_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_discovery_preferences_updated_at
    BEFORE UPDATE ON public.discovery_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- CREATE DEFAULT DISCOVERY PREFERENCES ON USER SIGNUP
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
    
    -- Create discovery preferences
    INSERT INTO public.discovery_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$;