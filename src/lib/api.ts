import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type GenderType = Database['public']['Enums']['gender_type'];
export type SwipeType = Database['public']['Enums']['swipe_type'];
export type SubscriptionTier = Database['public']['Enums']['subscription_tier'];
export type RelationshipIntent = Database['public']['Enums']['relationship_intent'];
export type SmokingStatus = Database['public']['Enums']['smoking_status'];
export type DrinkingStatus = Database['public']['Enums']['drinking_status'];
export type WorkoutStatus = Database['public']['Enums']['workout_status'];
export type DietType = Database['public']['Enums']['diet_type'];
export type PetType = Database['public']['Enums']['pet_type'];
export type SleepSchedule = Database['public']['Enums']['sleep_schedule'];
export type ChildrenStatus = Database['public']['Enums']['children_status'];
export type RelationshipStatus = Database['public']['Enums']['relationship_status'];
export type EducationLevel = Database['public']['Enums']['education_level'];
export type ZodiacSign = Database['public']['Enums']['zodiac_sign'];
export type LoveLanguage = Database['public']['Enums']['love_language'];

export interface ProfileWithPhotos extends Profile {
  profile_photos: Array<{
    id: string;
    photo_url: string;
    display_order: number;
    is_primary: boolean;
  }>;
  profile_interests: Array<{
    interest_id: string;
    interests: {
      id: string;
      name: string;
      emoji: string | null;
      category: string | null;
    };
  }>;
  profile_prompts?: Array<{
    id: string;
    prompt_question: string;
    prompt_answer: string;
    display_order: number;
  }>;
}

export interface MatchWithProfile {
  id: string;
  created_at: string;
  last_message_at: string | null;
  is_active: boolean;
  other_user: ProfileWithPhotos;
  last_message?: {
    content: string;
    sender_id: string;
    created_at: string;
  };
}

// Lifestyle display helpers
export const lifestyleLabels = {
  smoking: {
    non_smoker: { label: 'Non-smoker', icon: '🚭' },
    social_smoker: { label: 'Social smoker', icon: '🚬' },
    smoker: { label: 'Smoker', icon: '🚬' },
  },
  drinking: {
    never: { label: 'Never drinks', icon: '🚫' },
    socially: { label: 'Social drinker', icon: '🍷' },
    often: { label: 'Drinks often', icon: '🍺' },
  },
  workout: {
    never: { label: 'Never works out', icon: '🛋️' },
    sometimes: { label: 'Sometimes works out', icon: '🏃' },
    often: { label: 'Gym regular', icon: '💪' },
  },
  diet: {
    omnivore: { label: 'Omnivore', icon: '🍖' },
    vegetarian: { label: 'Vegetarian', icon: '🥗' },
    vegan: { label: 'Vegan', icon: '🌱' },
    pescatarian: { label: 'Pescatarian', icon: '🐟' },
    other: { label: 'Other diet', icon: '🍽️' },
  },
  pets: {
    dog: { label: 'Dog lover', icon: '🐕' },
    cat: { label: 'Cat lover', icon: '🐱' },
    both: { label: 'Dog & Cat lover', icon: '🐾' },
    other: { label: 'Has pets', icon: '🐾' },
    none: { label: 'No pets', icon: '🚫' },
  },
  sleep_schedule: {
    early_bird: { label: 'Early bird', icon: '🌅' },
    night_owl: { label: 'Night owl', icon: '🦉' },
    balanced: { label: 'Balanced', icon: '😴' },
  },
  children: {
    have_kids: { label: 'Has kids', icon: '👶' },
    want_kids: { label: 'Wants kids', icon: '👶' },
    dont_want_kids: { label: "Doesn't want kids", icon: '🚫' },
    open_to_kids: { label: 'Open to kids', icon: '🤷' },
  },
  relationship_intent: {
    long_term: { label: 'Long-term', icon: '💍' },
    short_term: { label: 'Short-term', icon: '📅' },
    casual: { label: 'Casual', icon: '😎' },
    friends: { label: 'Friends', icon: '👋' },
    figuring_out: { label: 'Figuring it out', icon: '🤔' },
  },
  zodiac: {
    aries: { label: 'Aries', icon: '♈' },
    taurus: { label: 'Taurus', icon: '♉' },
    gemini: { label: 'Gemini', icon: '♊' },
    cancer: { label: 'Cancer', icon: '♋' },
    leo: { label: 'Leo', icon: '♌' },
    virgo: { label: 'Virgo', icon: '♍' },
    libra: { label: 'Libra', icon: '♎' },
    scorpio: { label: 'Scorpio', icon: '♏' },
    sagittarius: { label: 'Sagittarius', icon: '♐' },
    capricorn: { label: 'Capricorn', icon: '♑' },
    aquarius: { label: 'Aquarius', icon: '♒' },
    pisces: { label: 'Pisces', icon: '♓' },
  },
  love_language: {
    words_of_affirmation: { label: 'Words of affirmation', icon: '💬' },
    acts_of_service: { label: 'Acts of service', icon: '🛠️' },
    receiving_gifts: { label: 'Receiving gifts', icon: '🎁' },
    quality_time: { label: 'Quality time', icon: '⏰' },
    physical_touch: { label: 'Physical touch', icon: '🤗' },
  },
  education: {
    high_school: { label: 'High school', icon: '🏫' },
    some_college: { label: 'Some college', icon: '📚' },
    bachelors: { label: "Bachelor's", icon: '🎓' },
    masters: { label: "Master's", icon: '🎓' },
    doctorate: { label: 'Doctorate', icon: '🎓' },
    trade_school: { label: 'Trade school', icon: '🔧' },
    other: { label: 'Other', icon: '📖' },
  },
};

// Auth functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Profile functions
export const getMyProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_photos (id, photo_url, display_order, is_primary),
      profile_interests (
        interest_id,
        interests (id, name, emoji, category)
      ),
      profile_prompts (id, prompt_question, prompt_answer, display_order)
    `)
    .eq('user_id', user.id)
    .maybeSingle();

  return { data: data as ProfileWithPhotos | null, error };
};

export const createProfile = async (profile: Omit<ProfileInsert, 'user_id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('profiles')
    .insert({ ...profile, user_id: user.id })
    .select()
    .single();

  return { data, error };
};

export const updateProfile = async (updates: ProfileUpdate) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  return { data, error };
};

// Discovery functions
export const getDiscoverProfiles = async (limit = 10) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: new Error('Not authenticated') };

  // Get profiles that:
  // 1. Are not the current user
  // 2. Are visible and complete
  // 3. Haven't been swiped on yet
  const { data: swipedIds } = await supabase
    .from('swipes')
    .select('swiped_id')
    .eq('swiper_id', user.id);

  const excludeIds = [user.id, ...(swipedIds?.map(s => s.swiped_id) || [])];

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      profile_photos (id, photo_url, display_order, is_primary),
      profile_interests (
        interest_id,
        interests (id, name, emoji, category)
      ),
      profile_prompts (id, prompt_question, prompt_answer, display_order)
    `)
    .eq('is_visible', true)
    .eq('is_profile_complete', true)
    .not('user_id', 'in', `(${excludeIds.join(',')})`)
    .order('last_active', { ascending: false })
    .limit(limit);

  return { data: (data as ProfileWithPhotos[]) || [], error };
};

// Swipe functions
export const createSwipe = async (swipedId: string, swipeType: SwipeType) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated'), isMatch: false };

  const { data, error } = await supabase
    .from('swipes')
    .insert({
      swiper_id: user.id,
      swiped_id: swipedId,
      swipe_type: swipeType,
    })
    .select()
    .single();

  if (error) return { data: null, error, isMatch: false };

  // Check if it's a match
  if (swipeType === 'like' || swipeType === 'super_like') {
    const { data: matchData } = await supabase
      .from('matches')
      .select('id')
      .or(`and(user1_id.eq.${user.id < swipedId ? user.id : swipedId},user2_id.eq.${user.id > swipedId ? user.id : swipedId})`)
      .maybeSingle();

    return { data, error: null, isMatch: !!matchData };
  }

  return { data, error: null, isMatch: false };
};

// Match functions
export const getMatches = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('matches')
    .select(`
      id,
      created_at,
      last_message_at,
      is_active,
      user1_id,
      user2_id
    `)
    .eq('is_active', true)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error || !data) return { data: [], error };

  // Get the other user's profile for each match
  const matchesWithProfiles: MatchWithProfile[] = [];
  
  for (const match of data) {
    const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_photos (id, photo_url, display_order, is_primary),
        profile_interests (
          interest_id,
          interests (id, name, emoji, category)
        ),
        profile_prompts (id, prompt_question, prompt_answer, display_order)
      `)
      .eq('user_id', otherUserId)
      .single();

    // Get last message
    const { data: lastMessageData } = await supabase
      .from('messages')
      .select('content, sender_id, created_at')
      .eq('match_id', match.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (profileData) {
      matchesWithProfiles.push({
        id: match.id,
        created_at: match.created_at,
        last_message_at: match.last_message_at,
        is_active: match.is_active,
        other_user: profileData as ProfileWithPhotos,
        last_message: lastMessageData || undefined,
      });
    }
  }

  return { data: matchesWithProfiles, error: null };
};

// Message functions
export const getMessages = async (matchId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  return { data: data || [], error };
};

export const sendMessage = async (matchId: string, content: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('messages')
    .insert({
      match_id: matchId,
      sender_id: user.id,
      content,
    })
    .select()
    .single();

  return { data, error };
};

export const markMessagesAsRead = async (matchId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Not authenticated') };

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('match_id', matchId)
    .neq('sender_id', user.id)
    .eq('is_read', false);

  return { error };
};

// Subscription functions
export const getSubscription = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return { data, error };
};

// Interest functions
export const getInterests = async () => {
  const { data, error } = await supabase
    .from('interests')
    .select('*')
    .order('category', { ascending: true });

  return { data: data || [], error };
};

export const updateProfileInterests = async (interestIds: string[]) => {
  const { data: profile } = await getMyProfile();
  if (!profile) return { error: new Error('Profile not found') };

  // Delete existing interests
  await supabase
    .from('profile_interests')
    .delete()
    .eq('profile_id', profile.id);

  // Insert new interests
  if (interestIds.length > 0) {
    const { error } = await supabase
      .from('profile_interests')
      .insert(interestIds.map(id => ({
        profile_id: profile.id,
        interest_id: id,
      })));

    return { error };
  }

  return { error: null };
};

// Prompts functions
export const getPrompts = async () => {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true });

  return { data: data || [], error };
};

export const saveProfilePrompt = async (promptQuestion: string, promptAnswer: string) => {
  const { data: profile } = await getMyProfile();
  if (!profile) return { error: new Error('Profile not found') };

  // Check if prompt already exists
  const { data: existing } = await supabase
    .from('profile_prompts')
    .select('id')
    .eq('profile_id', profile.id)
    .eq('prompt_question', promptQuestion)
    .maybeSingle();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('profile_prompts')
      .update({ prompt_answer: promptAnswer })
      .eq('id', existing.id);
    return { error };
  } else {
    // Insert new
    const { error } = await supabase
      .from('profile_prompts')
      .insert({
        profile_id: profile.id,
        prompt_question: promptQuestion,
        prompt_answer: promptAnswer,
      });
    return { error };
  }
};

export const deleteProfilePrompt = async (promptId: string) => {
  const { error } = await supabase
    .from('profile_prompts')
    .delete()
    .eq('id', promptId);
  return { error };
};

// Photo upload functions
export const uploadProfilePhoto = async (file: File) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { url: null, error: new Error('Not authenticated') };

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, file);

  if (uploadError) return { url: null, error: uploadError };

  const { data: urlData } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl, error: null };
};

export const addProfilePhoto = async (photoUrl: string, isPrimary = false) => {
  const { data: profile } = await getMyProfile();
  if (!profile) return { data: null, error: new Error('Profile not found') };

  // Get current photo count for ordering
  const { data: existingPhotos } = await supabase
    .from('profile_photos')
    .select('display_order')
    .eq('profile_id', profile.id)
    .order('display_order', { ascending: false })
    .limit(1);

  const nextOrder = existingPhotos && existingPhotos.length > 0 
    ? existingPhotos[0].display_order + 1 
    : 0;

  const { data, error } = await supabase
    .from('profile_photos')
    .insert({
      profile_id: profile.id,
      photo_url: photoUrl,
      display_order: nextOrder,
      is_primary: isPrimary,
    })
    .select()
    .single();

  return { data, error };
};

export const deleteProfilePhoto = async (photoId: string) => {
  const { error } = await supabase
    .from('profile_photos')
    .delete()
    .eq('id', photoId);
  return { error };
};

export const setPrimaryPhoto = async (photoId: string) => {
  const { data: profile } = await getMyProfile();
  if (!profile) return { error: new Error('Profile not found') };

  // Unset all primary flags
  await supabase
    .from('profile_photos')
    .update({ is_primary: false })
    .eq('profile_id', profile.id);

  // Set new primary
  const { error } = await supabase
    .from('profile_photos')
    .update({ is_primary: true })
    .eq('id', photoId);

  return { error };
};

// Convert height between cm and feet/inches
export const cmToFeetInches = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

export const feetInchesToCm = (feet: number, inches: number): number => {
  return Math.round((feet * 12 + inches) * 2.54);
};
