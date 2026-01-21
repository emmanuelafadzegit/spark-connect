export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      discovery_preferences: {
        Row: {
          children_filter:
            | Database["public"]["Enums"]["children_status"][]
            | null
          created_at: string
          drinking_filter:
            | Database["public"]["Enums"]["drinking_status"][]
            | null
          education_filter:
            | Database["public"]["Enums"]["education_level"][]
            | null
          gender_preference: Database["public"]["Enums"]["gender_type"][] | null
          height_max_cm: number | null
          height_min_cm: number | null
          id: string
          max_age: number | null
          max_distance_km: number | null
          min_age: number | null
          relationship_intent_filter:
            | Database["public"]["Enums"]["relationship_intent"][]
            | null
          show_verified_only: boolean | null
          smoking_filter: Database["public"]["Enums"]["smoking_status"][] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          children_filter?:
            | Database["public"]["Enums"]["children_status"][]
            | null
          created_at?: string
          drinking_filter?:
            | Database["public"]["Enums"]["drinking_status"][]
            | null
          education_filter?:
            | Database["public"]["Enums"]["education_level"][]
            | null
          gender_preference?:
            | Database["public"]["Enums"]["gender_type"][]
            | null
          height_max_cm?: number | null
          height_min_cm?: number | null
          id?: string
          max_age?: number | null
          max_distance_km?: number | null
          min_age?: number | null
          relationship_intent_filter?:
            | Database["public"]["Enums"]["relationship_intent"][]
            | null
          show_verified_only?: boolean | null
          smoking_filter?:
            | Database["public"]["Enums"]["smoking_status"][]
            | null
          updated_at?: string
          user_id: string
        }
        Update: {
          children_filter?:
            | Database["public"]["Enums"]["children_status"][]
            | null
          created_at?: string
          drinking_filter?:
            | Database["public"]["Enums"]["drinking_status"][]
            | null
          education_filter?:
            | Database["public"]["Enums"]["education_level"][]
            | null
          gender_preference?:
            | Database["public"]["Enums"]["gender_type"][]
            | null
          height_max_cm?: number | null
          height_min_cm?: number | null
          id?: string
          max_age?: number | null
          max_distance_km?: number | null
          min_age?: number | null
          relationship_intent_filter?:
            | Database["public"]["Enums"]["relationship_intent"][]
            | null
          show_verified_only?: boolean | null
          smoking_filter?:
            | Database["public"]["Enums"]["smoking_status"][]
            | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feed_comments: {
        Row: {
          content: string
          created_at: string
          feed_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          feed_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          feed_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_likes: {
        Row: {
          created_at: string
          feed_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feed_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feed_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_likes_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      feeds: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string
          id: string
          likes_count: number | null
          media_type: string
          media_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          media_type?: string
          media_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          likes_count?: number | null
          media_type?: string
          media_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          category: string | null
          created_at: string
          emoji: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          emoji?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          emoji?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_message_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          match_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          match_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      paystack_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          paystack_response: Json | null
          plan: string
          reference: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          paystack_response?: Json | null
          plan: string
          reference: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          paystack_response?: Json | null
          plan?: string
          reference?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profile_interests: {
        Row: {
          created_at: string
          id: string
          interest_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interest_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interest_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_photos: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_primary: boolean | null
          photo_url: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean | null
          photo_url: string
          profile_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean | null
          photo_url?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_prompts: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          profile_id: string
          prompt_answer: string
          prompt_question: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          profile_id: string
          prompt_answer: string
          prompt_question: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          profile_id?: string
          prompt_answer?: string
          prompt_question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_prompts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          children: Database["public"]["Enums"]["children_status"] | null
          city: string | null
          company: string | null
          created_at: string
          date_of_birth: string
          deal_breakers: string[] | null
          diet: Database["public"]["Enums"]["diet_type"] | null
          display_name: string
          drinking: Database["public"]["Enums"]["drinking_status"] | null
          education: Database["public"]["Enums"]["education_level"] | null
          gender: Database["public"]["Enums"]["gender_type"]
          height_cm: number | null
          id: string
          is_online: boolean | null
          is_profile_complete: boolean | null
          is_verified: boolean | null
          is_visible: boolean | null
          job_title: string | null
          languages: string[] | null
          last_active: string | null
          latitude: number | null
          longitude: number | null
          looking_for: Database["public"]["Enums"]["gender_type"][] | null
          love_language: Database["public"]["Enums"]["love_language"] | null
          max_age: number | null
          max_distance_km: number | null
          min_age: number | null
          personality_type: string | null
          pets: Database["public"]["Enums"]["pet_type"] | null
          political_views: string | null
          relationship_intent:
            | Database["public"]["Enums"]["relationship_intent"][]
            | null
          relationship_status:
            | Database["public"]["Enums"]["relationship_status"]
            | null
          religion: string | null
          school: string | null
          sexual_orientation: string | null
          show_distance: boolean | null
          show_online_status: boolean | null
          show_political_views: boolean | null
          show_religion: boolean | null
          show_sexual_orientation: boolean | null
          sleep_schedule: Database["public"]["Enums"]["sleep_schedule"] | null
          smoking: Database["public"]["Enums"]["smoking_status"] | null
          updated_at: string
          user_id: string
          verification_photo_url: string | null
          verification_reviewed_at: string | null
          verification_reviewed_by: string | null
          verification_status: string | null
          verification_submitted_at: string | null
          workout: Database["public"]["Enums"]["workout_status"] | null
          zodiac: Database["public"]["Enums"]["zodiac_sign"] | null
        }
        Insert: {
          bio?: string | null
          children?: Database["public"]["Enums"]["children_status"] | null
          city?: string | null
          company?: string | null
          created_at?: string
          date_of_birth: string
          deal_breakers?: string[] | null
          diet?: Database["public"]["Enums"]["diet_type"] | null
          display_name: string
          drinking?: Database["public"]["Enums"]["drinking_status"] | null
          education?: Database["public"]["Enums"]["education_level"] | null
          gender: Database["public"]["Enums"]["gender_type"]
          height_cm?: number | null
          id?: string
          is_online?: boolean | null
          is_profile_complete?: boolean | null
          is_verified?: boolean | null
          is_visible?: boolean | null
          job_title?: string | null
          languages?: string[] | null
          last_active?: string | null
          latitude?: number | null
          longitude?: number | null
          looking_for?: Database["public"]["Enums"]["gender_type"][] | null
          love_language?: Database["public"]["Enums"]["love_language"] | null
          max_age?: number | null
          max_distance_km?: number | null
          min_age?: number | null
          personality_type?: string | null
          pets?: Database["public"]["Enums"]["pet_type"] | null
          political_views?: string | null
          relationship_intent?:
            | Database["public"]["Enums"]["relationship_intent"][]
            | null
          relationship_status?:
            | Database["public"]["Enums"]["relationship_status"]
            | null
          religion?: string | null
          school?: string | null
          sexual_orientation?: string | null
          show_distance?: boolean | null
          show_online_status?: boolean | null
          show_political_views?: boolean | null
          show_religion?: boolean | null
          show_sexual_orientation?: boolean | null
          sleep_schedule?: Database["public"]["Enums"]["sleep_schedule"] | null
          smoking?: Database["public"]["Enums"]["smoking_status"] | null
          updated_at?: string
          user_id: string
          verification_photo_url?: string | null
          verification_reviewed_at?: string | null
          verification_reviewed_by?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
          workout?: Database["public"]["Enums"]["workout_status"] | null
          zodiac?: Database["public"]["Enums"]["zodiac_sign"] | null
        }
        Update: {
          bio?: string | null
          children?: Database["public"]["Enums"]["children_status"] | null
          city?: string | null
          company?: string | null
          created_at?: string
          date_of_birth?: string
          deal_breakers?: string[] | null
          diet?: Database["public"]["Enums"]["diet_type"] | null
          display_name?: string
          drinking?: Database["public"]["Enums"]["drinking_status"] | null
          education?: Database["public"]["Enums"]["education_level"] | null
          gender?: Database["public"]["Enums"]["gender_type"]
          height_cm?: number | null
          id?: string
          is_online?: boolean | null
          is_profile_complete?: boolean | null
          is_verified?: boolean | null
          is_visible?: boolean | null
          job_title?: string | null
          languages?: string[] | null
          last_active?: string | null
          latitude?: number | null
          longitude?: number | null
          looking_for?: Database["public"]["Enums"]["gender_type"][] | null
          love_language?: Database["public"]["Enums"]["love_language"] | null
          max_age?: number | null
          max_distance_km?: number | null
          min_age?: number | null
          personality_type?: string | null
          pets?: Database["public"]["Enums"]["pet_type"] | null
          political_views?: string | null
          relationship_intent?:
            | Database["public"]["Enums"]["relationship_intent"][]
            | null
          relationship_status?:
            | Database["public"]["Enums"]["relationship_status"]
            | null
          religion?: string | null
          school?: string | null
          sexual_orientation?: string | null
          show_distance?: boolean | null
          show_online_status?: boolean | null
          show_political_views?: boolean | null
          show_religion?: boolean | null
          show_sexual_orientation?: boolean | null
          sleep_schedule?: Database["public"]["Enums"]["sleep_schedule"] | null
          smoking?: Database["public"]["Enums"]["smoking_status"] | null
          updated_at?: string
          user_id?: string
          verification_photo_url?: string | null
          verification_reviewed_at?: string | null
          verification_reviewed_by?: string | null
          verification_status?: string | null
          verification_submitted_at?: string | null
          workout?: Database["public"]["Enums"]["workout_status"] | null
          zodiac?: Database["public"]["Enums"]["zodiac_sign"] | null
        }
        Relationships: []
      }
      prompts: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          question: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          question: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          question?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          daily_messages_remaining: number | null
          daily_swipes_remaining: number | null
          id: string
          is_active: boolean | null
          last_message_reset: string | null
          last_swipe_reset: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          daily_messages_remaining?: number | null
          daily_swipes_remaining?: number | null
          id?: string
          is_active?: boolean | null
          last_message_reset?: string | null
          last_swipe_reset?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          daily_messages_remaining?: number | null
          daily_swipes_remaining?: number | null
          id?: string
          is_active?: boolean | null
          last_message_reset?: string | null
          last_swipe_reset?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      swipes: {
        Row: {
          created_at: string
          id: string
          swipe_type: Database["public"]["Enums"]["swipe_type"]
          swiped_id: string
          swiper_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          swipe_type: Database["public"]["Enums"]["swipe_type"]
          swiped_id: string
          swiper_id: string
        }
        Update: {
          created_at?: string
          id?: string
          swipe_type?: Database["public"]["Enums"]["swipe_type"]
          swiped_id?: string
          swiper_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      are_matched: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
      calculate_age: { Args: { dob: string }; Returns: number }
      check_message_limit: { Args: { _user_id: string }; Returns: boolean }
      decrement_message_count: {
        Args: { _user_id: string }
        Returns: undefined
      }
      get_subscription_tier: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["subscription_tier"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_swiped: { Args: { swiped: string; swiper: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_blocked: {
        Args: { checker_id: string; target_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
      children_status:
        | "have_kids"
        | "want_kids"
        | "dont_want_kids"
        | "open_to_kids"
      diet_type: "omnivore" | "vegetarian" | "vegan" | "pescatarian" | "other"
      drinking_status: "never" | "socially" | "often"
      education_level:
        | "high_school"
        | "some_college"
        | "bachelors"
        | "masters"
        | "doctorate"
        | "trade_school"
        | "other"
      gender_type: "male" | "female" | "non_binary" | "other"
      love_language:
        | "words_of_affirmation"
        | "acts_of_service"
        | "receiving_gifts"
        | "quality_time"
        | "physical_touch"
      pet_type: "dog" | "cat" | "both" | "other" | "none"
      relationship_intent:
        | "long_term"
        | "short_term"
        | "casual"
        | "friends"
        | "figuring_out"
      relationship_status: "single" | "divorced" | "widowed" | "separated"
      sleep_schedule: "early_bird" | "night_owl" | "balanced"
      smoking_status: "non_smoker" | "social_smoker" | "smoker"
      subscription_tier: "free" | "premium" | "premium_plus"
      swipe_type: "like" | "pass" | "super_like"
      workout_status: "never" | "sometimes" | "often"
      zodiac_sign:
        | "aries"
        | "taurus"
        | "gemini"
        | "cancer"
        | "leo"
        | "virgo"
        | "libra"
        | "scorpio"
        | "sagittarius"
        | "capricorn"
        | "aquarius"
        | "pisces"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin"],
      children_status: [
        "have_kids",
        "want_kids",
        "dont_want_kids",
        "open_to_kids",
      ],
      diet_type: ["omnivore", "vegetarian", "vegan", "pescatarian", "other"],
      drinking_status: ["never", "socially", "often"],
      education_level: [
        "high_school",
        "some_college",
        "bachelors",
        "masters",
        "doctorate",
        "trade_school",
        "other",
      ],
      gender_type: ["male", "female", "non_binary", "other"],
      love_language: [
        "words_of_affirmation",
        "acts_of_service",
        "receiving_gifts",
        "quality_time",
        "physical_touch",
      ],
      pet_type: ["dog", "cat", "both", "other", "none"],
      relationship_intent: [
        "long_term",
        "short_term",
        "casual",
        "friends",
        "figuring_out",
      ],
      relationship_status: ["single", "divorced", "widowed", "separated"],
      sleep_schedule: ["early_bird", "night_owl", "balanced"],
      smoking_status: ["non_smoker", "social_smoker", "smoker"],
      subscription_tier: ["free", "premium", "premium_plus"],
      swipe_type: ["like", "pass", "super_like"],
      workout_status: ["never", "sometimes", "often"],
      zodiac_sign: [
        "aries",
        "taurus",
        "gemini",
        "cancer",
        "leo",
        "virgo",
        "libra",
        "scorpio",
        "sagittarius",
        "capricorn",
        "aquarius",
        "pisces",
      ],
    },
  },
} as const
