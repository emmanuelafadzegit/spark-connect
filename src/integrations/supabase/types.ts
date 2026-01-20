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
      profiles: {
        Row: {
          bio: string | null
          city: string | null
          created_at: string
          date_of_birth: string
          display_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          is_profile_complete: boolean | null
          is_verified: boolean | null
          is_visible: boolean | null
          last_active: string | null
          latitude: number | null
          longitude: number | null
          looking_for: Database["public"]["Enums"]["gender_type"][] | null
          max_age: number | null
          max_distance_km: number | null
          min_age: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          city?: string | null
          created_at?: string
          date_of_birth: string
          display_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          id?: string
          is_profile_complete?: boolean | null
          is_verified?: boolean | null
          is_visible?: boolean | null
          last_active?: string | null
          latitude?: number | null
          longitude?: number | null
          looking_for?: Database["public"]["Enums"]["gender_type"][] | null
          max_age?: number | null
          max_distance_km?: number | null
          min_age?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string
          display_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: string
          is_profile_complete?: boolean | null
          is_verified?: boolean | null
          is_visible?: boolean | null
          last_active?: string | null
          latitude?: number | null
          longitude?: number | null
          looking_for?: Database["public"]["Enums"]["gender_type"][] | null
          max_age?: number | null
          max_distance_km?: number | null
          min_age?: number | null
          updated_at?: string
          user_id?: string
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
          daily_swipes_remaining: number | null
          id: string
          is_active: boolean | null
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
          daily_swipes_remaining?: number | null
          id?: string
          is_active?: boolean | null
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
          daily_swipes_remaining?: number | null
          id?: string
          is_active?: boolean | null
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
      gender_type: "male" | "female" | "non_binary" | "other"
      subscription_tier: "free" | "premium" | "premium_plus"
      swipe_type: "like" | "pass" | "super_like"
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
      gender_type: ["male", "female", "non_binary", "other"],
      subscription_tier: ["free", "premium", "premium_plus"],
      swipe_type: ["like", "pass", "super_like"],
    },
  },
} as const
