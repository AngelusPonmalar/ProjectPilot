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
      api_endpoints: {
        Row: {
          created_at: string
          description: string
          id: string
          method: string
          module: string
          needs_review: boolean
          path: string
          position: number
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          method?: string
          module?: string
          needs_review?: boolean
          path?: string
          position?: number
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          method?: string
          module?: string
          needs_review?: boolean
          path?: string
          position?: number
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_endpoints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      architecture: {
        Row: {
          components: Json
          connections: Json
          created_at: string
          explanation: string
          id: string
          layers: Json
          needs_review: boolean
          project_id: string
          updated_at: string
        }
        Insert: {
          components?: Json
          connections?: Json
          created_at?: string
          explanation?: string
          id?: string
          layers?: Json
          needs_review?: boolean
          project_id: string
          updated_at?: string
        }
        Update: {
          components?: Json
          connections?: Json
          created_at?: string
          explanation?: string
          id?: string
          layers?: Json
          needs_review?: boolean
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "architecture_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      database_entities: {
        Row: {
          created_at: string
          fields: Json
          id: string
          name: string
          needs_review: boolean
          position: number
          project_id: string
          relationships: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          fields?: Json
          id?: string
          name?: string
          needs_review?: boolean
          position?: number
          project_id: string
          relationships?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          fields?: Json
          id?: string
          name?: string
          needs_review?: boolean
          position?: number
          project_id?: string
          relationships?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "database_entities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          needs_review: boolean
          position: number
          project_id: string
          related_requirements: Json
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          needs_review?: boolean
          position?: number
          project_id: string
          related_requirements?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          needs_review?: boolean
          position?: number
          project_id?: string
          related_requirements?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          id: string
          name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_invitations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invited_by: string
          invited_email: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invited_by: string
          invited_email: string
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invited_by?: string
          invited_email?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          joined_at: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_versions: {
        Row: {
          created_at: string
          id: string
          label: string
          note: string
          project_id: string
          snapshot: Json
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string
          note?: string
          project_id: string
          snapshot?: Json
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          note?: string
          project_id?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "project_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          current_phase: string
          description: string
          generation_error: string | null
          generation_status: string
          id: string
          name: string
          overview: string
          project_type: string
          tech_preference: string
          updated_at: string
          user_id: string
          user_types: Json
        }
        Insert: {
          created_at?: string
          current_phase?: string
          description?: string
          generation_error?: string | null
          generation_status?: string
          id?: string
          name: string
          overview?: string
          project_type?: string
          tech_preference?: string
          updated_at?: string
          user_id: string
          user_types?: Json
        }
        Update: {
          created_at?: string
          current_phase?: string
          description?: string
          generation_error?: string | null
          generation_status?: string
          id?: string
          name?: string
          overview?: string
          project_type?: string
          tech_preference?: string
          updated_at?: string
          user_id?: string
          user_types?: Json
        }
        Relationships: []
      }
      requirements: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          needs_review: boolean
          position: number
          priority: string
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          needs_review?: boolean
          position?: number
          priority?: string
          project_id: string
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          needs_review?: boolean
          position?: number
          priority?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sdlc_phases: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          project_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sdlc_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          completed: boolean
          created_at: string
          description: string
          due_date: string | null
          id: string
          module: string
          position: number
          priority: string
          project_id: string
          related_requirements: Json
          related_story: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          completed?: boolean
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          module?: string
          position?: number
          priority?: string
          project_id: string
          related_requirements?: Json
          related_story?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          completed?: boolean
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          module?: string
          position?: number
          priority?: string
          project_id?: string
          related_requirements?: Json
          related_story?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_recommendations: {
        Row: {
          created_at: string
          id: string
          module: string
          needs_review: boolean
          next_screens: Json
          position: number
          project_id: string
          purpose: string
          related_requirements: Json
          related_stories: Json
          screen: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          module?: string
          needs_review?: boolean
          next_screens?: Json
          position?: number
          project_id: string
          purpose?: string
          related_requirements?: Json
          related_stories?: Json
          screen?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          module?: string
          needs_review?: boolean
          next_screens?: Json
          position?: number
          project_id?: string
          purpose?: string
          related_requirements?: Json
          related_stories?: Json
          screen?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ui_recommendations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stories: {
        Row: {
          acceptance_criteria: Json
          code: string
          created_at: string
          epic: string
          goal: string
          id: string
          module: string
          needs_review: boolean
          persona: string
          position: number
          priority: string
          project_id: string
          related_requirements: Json
          status: string
          story: string
          updated_at: string
        }
        Insert: {
          acceptance_criteria?: Json
          code?: string
          created_at?: string
          epic?: string
          goal?: string
          id?: string
          module?: string
          needs_review?: boolean
          persona?: string
          position?: number
          priority?: string
          project_id: string
          related_requirements?: Json
          status?: string
          story?: string
          updated_at?: string
        }
        Update: {
          acceptance_criteria?: Json
          code?: string
          created_at?: string
          epic?: string
          goal?: string
          id?: string
          module?: string
          needs_review?: boolean
          persona?: string
          position?: number
          priority?: string
          project_id?: string
          related_requirements?: Json
          status?: string
          story?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_project: { Args: { _project_id: string }; Returns: boolean }
      current_user_email: { Args: never; Returns: string }
      is_project_member: { Args: { _project_id: string }; Returns: boolean }
      owns_project: { Args: { _project_id: string }; Returns: boolean }
      project_role_of: {
        Args: { _project_id: string }
        Returns: Database["public"]["Enums"]["project_role"]
      }
      shares_project_with: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      project_role:
        | "owner"
        | "project_manager"
        | "developer"
        | "designer"
        | "viewer"
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
      invitation_status: ["pending", "accepted", "declined", "expired"],
      project_role: [
        "owner",
        "project_manager",
        "developer",
        "designer",
        "viewer",
      ],
    },
  },
} as const
