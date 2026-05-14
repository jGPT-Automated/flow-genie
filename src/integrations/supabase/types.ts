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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      groups: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      item_groups: {
        Row: {
          group_id: string
          id: string
          item_id: string
        }
        Insert: {
          group_id: string
          id?: string
          item_id: string
        }
        Update: {
          group_id?: string
          id?: string
          item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_groups_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      item_tags: {
        Row: {
          id: string
          item_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          item_id: string
          tag_id: string
        }
        Update: {
          id?: string
          item_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          created_at: string
          extracted_content: string | null
          id: string
          keywords: string[] | null
          raw_content: string | null
          source_url: string | null
          summary: string | null
          telegram_chat_id: number | null
          telegram_message_id: number | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          extracted_content?: string | null
          id?: string
          keywords?: string[] | null
          raw_content?: string | null
          source_url?: string | null
          summary?: string | null
          telegram_chat_id?: number | null
          telegram_message_id?: number | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          extracted_content?: string | null
          id?: string
          keywords?: string[] | null
          raw_content?: string | null
          source_url?: string | null
          summary?: string | null
          telegram_chat_id?: number | null
          telegram_message_id?: number | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      ov_community_likes: {
        Row: {
          created_at: string
          id: string
          reply_id: string | null
          thread_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reply_id?: string | null
          thread_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reply_id?: string | null
          thread_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ov_community_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "ov_community_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ov_community_likes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "ov_community_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      ov_community_replies: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          like_count: number
          thread_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          like_count?: number
          thread_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          like_count?: number
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ov_community_replies_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "ov_community_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      ov_community_threads: {
        Row: {
          author_id: string
          body: string
          color_hex: string
          color_tag: string
          created_at: string
          id: string
          is_team_post: boolean
          like_count: number
          pinned: boolean
          product_tags: string[]
          reply_count: number
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          color_hex?: string
          color_tag?: string
          created_at?: string
          id?: string
          is_team_post?: boolean
          like_count?: number
          pinned?: boolean
          product_tags?: string[]
          reply_count?: number
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          color_hex?: string
          color_tag?: string
          created_at?: string
          id?: string
          is_team_post?: boolean
          like_count?: number
          pinned?: boolean
          product_tags?: string[]
          reply_count?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ov_email_signups: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      ov_orders: {
        Row: {
          billing_interval: string
          created_at: string
          discount_pct: number
          id: string
          notes: string | null
          product_ids: string[]
          status: string
          stripe_subscription_id: string | null
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_interval?: string
          created_at?: string
          discount_pct?: number
          id?: string
          notes?: string | null
          product_ids?: string[]
          status?: string
          stripe_subscription_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_interval?: string
          created_at?: string
          discount_pct?: number
          id?: string
          notes?: string | null
          product_ids?: string[]
          status?: string
          stripe_subscription_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ov_products: {
        Row: {
          active: boolean
          benefit_bullets: Json
          bio_availability_text: string | null
          category: string
          color_tag: Json
          created_at: string
          daily_ritual_text: string | null
          description: string
          directions_text: string | null
          display_order: number
          dosage_text: string | null
          hero_ingredient: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          schedule_slot: string
          short_description: string | null
          slug: string
          sourcing_text: string | null
          tagline: string
        }
        Insert: {
          active?: boolean
          benefit_bullets?: Json
          bio_availability_text?: string | null
          category?: string
          color_tag?: Json
          created_at?: string
          daily_ritual_text?: string | null
          description?: string
          directions_text?: string | null
          display_order?: number
          dosage_text?: string | null
          hero_ingredient?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number
          schedule_slot?: string
          short_description?: string | null
          slug: string
          sourcing_text?: string | null
          tagline?: string
        }
        Update: {
          active?: boolean
          benefit_bullets?: Json
          bio_availability_text?: string | null
          category?: string
          color_tag?: Json
          created_at?: string
          daily_ritual_text?: string | null
          description?: string
          directions_text?: string | null
          display_order?: number
          dosage_text?: string | null
          hero_ingredient?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          schedule_slot?: string
          short_description?: string | null
          slug?: string
          sourcing_text?: string | null
          tagline?: string
        }
        Relationships: []
      }
      ov_profiles: {
        Row: {
          avatar_color: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarding_completed: boolean
          ritual_summary: string | null
          updated_at: string
        }
        Insert: {
          avatar_color?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          ritual_summary?: string | null
          updated_at?: string
        }
        Update: {
          avatar_color?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          ritual_summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ov_ritual_logs: {
        Row: {
          feeling_score: number
          id: string
          logged_at: string
          notes: string | null
          product_id: string
          user_id: string
        }
        Insert: {
          feeling_score?: number
          id?: string
          logged_at?: string
          notes?: string | null
          product_id: string
          user_id: string
        }
        Update: {
          feeling_score?: number
          id?: string
          logged_at?: string
          notes?: string | null
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      ov_user_rituals: {
        Row: {
          added_at: string
          display_order: number
          id: string
          is_paused: boolean
          product_id: string
          schedule_slot: string | null
          user_id: string
        }
        Insert: {
          added_at?: string
          display_order?: number
          id?: string
          is_paused?: boolean
          product_id: string
          schedule_slot?: string | null
          user_id: string
        }
        Update: {
          added_at?: string
          display_order?: number
          id?: string
          is_paused?: boolean
          product_id?: string
          schedule_slot?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      telegram_bot_state: {
        Row: {
          id: number
          update_offset: number
          updated_at: string
        }
        Insert: {
          id: number
          update_offset?: number
          updated_at?: string
        }
        Update: {
          id?: number
          update_offset?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_credentials: {
        Row: {
          created_at: string
          credential_type: string
          encrypted_value: string
          id: string
          label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_type?: string
          encrypted_value?: string
          id?: string
          label?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_type?: string
          encrypted_value?: string
          id?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
