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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adaptive_tip_cache: {
        Row: {
          bouquet_id: string
          generated_date: string
          id: string
          tip: string
          user_id: string
        }
        Insert: {
          bouquet_id: string
          generated_date?: string
          id?: string
          tip: string
          user_id: string
        }
        Update: {
          bouquet_id?: string
          generated_date?: string
          id?: string
          tip?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adaptive_tip_cache_bouquet_id_fkey"
            columns: ["bouquet_id"]
            isOneToOne: false
            referencedRelation: "bouquets"
            referencedColumns: ["id"]
          },
        ]
      }
      bouquets: {
        Row: {
          added_at: string
          id: string
          name: string
          reminder_opt_in: boolean
          scan_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          name: string
          reminder_opt_in?: boolean
          scan_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          name?: string
          reminder_opt_in?: boolean
          scan_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bouquets_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      care_log: {
        Row: {
          action: string
          bouquet_id: string
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          action: string
          bouquet_id: string
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          action?: string
          bouquet_id?: string
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_log_bouquet_id_fkey"
            columns: ["bouquet_id"]
            isOneToOne: false
            referencedRelation: "bouquets"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_cache: {
        Row: {
          generated_at: string
          id: string
          recommendations: Json
          season: string
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          recommendations: Json
          season: string
          user_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          recommendations?: Json
          season?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          bouquet_id: string
          created_at: string
          id: string
          next_send_at: string
          user_id: string
        }
        Insert: {
          bouquet_id: string
          created_at?: string
          id?: string
          next_send_at: string
          user_id: string
        }
        Update: {
          bouquet_id?: string
          created_at?: string
          id?: string
          next_send_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_bouquet_id_fkey"
            columns: ["bouquet_id"]
            isOneToOne: false
            referencedRelation: "bouquets"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          created_at: string
          flowers: Json
          id: string
          image_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flowers: Json
          id?: string
          image_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          flowers?: Json
          id?: string
          image_url?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
