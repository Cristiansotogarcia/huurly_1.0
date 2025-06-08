export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      document_access_requests: {
        Row: {
          access_expires_at: string | null
          access_granted_at: string | null
          created_at: string | null
          id: string
          landlord_id: string
          message_id: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          created_at?: string | null
          id?: string
          landlord_id: string
          message_id?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          created_at?: string | null
          id?: string
          landlord_id?: string
          message_id?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_access_requests_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      household_info: {
        Row: {
          created_at: string | null
          has_pets: boolean | null
          has_smokers: boolean | null
          id: string
          pet_details: string | null
          smoking_details: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          has_pets?: boolean | null
          has_smokers?: boolean | null
          id?: string
          pet_details?: string | null
          smoking_details?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          has_pets?: boolean | null
          has_smokers?: boolean | null
          id?: string
          pet_details?: string | null
          smoking_details?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      household_members: {
        Row: {
          age: number
          created_at: string | null
          id: string
          relationship: string | null
          user_id: string
        }
        Insert: {
          age: number
          created_at?: string | null
          id?: string
          relationship?: string | null
          user_id: string
        }
        Update: {
          age?: number
          created_at?: string | null
          id?: string
          relationship?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string
          read_at: string | null
          recipient_id: string
          related_data: Json | null
          sender_id: string
          subject: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type: string
          read_at?: string | null
          recipient_id: string
          related_data?: Json | null
          sender_id: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string
          read_at?: string | null
          recipient_id?: string
          related_data?: Json | null
          sender_id?: string
          subject?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          related_id: string | null
          related_type: string | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          related_id?: string | null
          related_type?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_records: {
        Row: {
          amount: number | null
          created_at: string | null
          email: string
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_session_id: string | null
          updated_at: string | null
          user_id: string | null
          user_type: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          email: string
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          email?: string
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          application_count: number | null
          available_from: string | null
          available_until: string | null
          bathrooms: number | null
          bedrooms: number
          city: string
          created_at: string | null
          description: string | null
          furnished: boolean | null
          id: string
          landlord_id: string
          max_offers: number | null
          offers_sent: number | null
          pets_allowed: boolean | null
          postal_code: string | null
          property_type: string | null
          province: string | null
          rent_amount: number
          smoking_allowed: boolean | null
          square_meters: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          address: string
          application_count?: number | null
          available_from?: string | null
          available_until?: string | null
          bathrooms?: number | null
          bedrooms: number
          city: string
          created_at?: string | null
          description?: string | null
          furnished?: boolean | null
          id?: string
          landlord_id: string
          max_offers?: number | null
          offers_sent?: number | null
          pets_allowed?: boolean | null
          postal_code?: string | null
          property_type?: string | null
          province?: string | null
          rent_amount: number
          smoking_allowed?: boolean | null
          square_meters?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          application_count?: number | null
          available_from?: string | null
          available_until?: string | null
          bathrooms?: number | null
          bedrooms?: number
          city?: string
          created_at?: string | null
          description?: string | null
          furnished?: boolean | null
          id?: string
          landlord_id?: string
          max_offers?: number | null
          offers_sent?: number | null
          pets_allowed?: boolean | null
          postal_code?: string | null
          property_type?: string | null
          province?: string | null
          rent_amount?: number
          smoking_allowed?: boolean | null
          square_meters?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      property_applications: {
        Row: {
          application_message: string | null
          applied_at: string | null
          id: string
          property_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          application_message?: string | null
          applied_at?: string | null
          id?: string
          property_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          application_message?: string | null
          applied_at?: string | null
          id?: string
          property_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string | null
          id: string
          image_order: number | null
          image_url: string
          is_primary: boolean | null
          property_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_order?: number | null
          image_url: string
          is_primary?: boolean | null
          property_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_order?: number | null
          image_url?: string
          is_primary?: boolean | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_offers: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          landlord_id: string
          offered_at: string | null
          property_id: string
          responded_at: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          landlord_id: string
          offered_at?: string | null
          property_id: string
          responded_at?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          landlord_id?: string
          offered_at?: string | null
          property_id?: string
          responded_at?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_offers_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_profiles: {
        Row: {
          age: number | null
          available_from: string | null
          bio: string | null
          contract_type: string | null
          created_at: string | null
          current_housing_situation: string | null
          documents_verified: boolean | null
          employer: string | null
          employment_status: string | null
          first_name: string | null
          guarantor_available: boolean | null
          has_pets: boolean | null
          household_composition: string | null
          household_size: number | null
          housing_allowance_eligible: boolean | null
          id: string
          landlord_interest: number | null
          last_name: string | null
          max_rent: number | null
          monthly_income: number | null
          motivation: string | null
          move_in_flexibility: string | null
          pet_details: string | null
          pet_policy_preference: string | null
          preferred_bedrooms: number | null
          preferred_location: string | null
          preferred_radius: number | null
          profession: string | null
          profile_completion_percentage: number | null
          profile_picture_url: string | null
          profile_views: number | null
          rental_history: string | null
          smokes: boolean | null
          smoking_policy_preference: string | null
          updated_at: string | null
          user_id: string
          work_contract_type: string | null
        }
        Insert: {
          age?: number | null
          available_from?: string | null
          bio?: string | null
          contract_type?: string | null
          created_at?: string | null
          current_housing_situation?: string | null
          documents_verified?: boolean | null
          employer?: string | null
          employment_status?: string | null
          first_name?: string | null
          guarantor_available?: boolean | null
          has_pets?: boolean | null
          household_composition?: string | null
          household_size?: number | null
          housing_allowance_eligible?: boolean | null
          id?: string
          landlord_interest?: number | null
          last_name?: string | null
          max_rent?: number | null
          monthly_income?: number | null
          motivation?: string | null
          move_in_flexibility?: string | null
          pet_details?: string | null
          pet_policy_preference?: string | null
          preferred_bedrooms?: number | null
          preferred_location?: string | null
          preferred_radius?: number | null
          profession?: string | null
          profile_completion_percentage?: number | null
          profile_picture_url?: string | null
          profile_views?: number | null
          rental_history?: string | null
          smokes?: boolean | null
          smoking_policy_preference?: string | null
          updated_at?: string | null
          user_id: string
          work_contract_type?: string | null
        }
        Update: {
          age?: number | null
          available_from?: string | null
          bio?: string | null
          contract_type?: string | null
          created_at?: string | null
          current_housing_situation?: string | null
          documents_verified?: boolean | null
          employer?: string | null
          employment_status?: string | null
          first_name?: string | null
          guarantor_available?: boolean | null
          has_pets?: boolean | null
          household_composition?: string | null
          household_size?: number | null
          housing_allowance_eligible?: boolean | null
          id?: string
          landlord_interest?: number | null
          last_name?: string | null
          max_rent?: number | null
          monthly_income?: number | null
          motivation?: string | null
          move_in_flexibility?: string | null
          pet_details?: string | null
          pet_policy_preference?: string | null
          preferred_bedrooms?: number | null
          preferred_location?: string | null
          preferred_radius?: number | null
          profession?: string | null
          profile_completion_percentage?: number | null
          profile_picture_url?: string | null
          profile_views?: number | null
          rental_history?: string | null
          smokes?: boolean | null
          smoking_policy_preference?: string | null
          updated_at?: string | null
          user_id?: string
          work_contract_type?: string | null
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          subscription_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          subscription_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          subscription_status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      viewing_invitations: {
        Row: {
          created_at: string | null
          id: string
          landlord_id: string
          message_id: string | null
          property_address: string
          proposed_date: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          landlord_id: string
          message_id?: string | null
          property_address: string
          proposed_date: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          landlord_id?: string
          message_id?: string | null
          property_address?: string
          proposed_date?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viewing_invitations_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      viewing_slots: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          reserved_at: string | null
          slot_number: number
          status: string | null
          tenant_id: string
          updated_at: string | null
          viewing_date: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          reserved_at?: string | null
          slot_number: number
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          viewing_date?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          reserved_at?: string | null
          slot_number?: number
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          viewing_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viewing_slots_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      column_exists: {
        Args: { table_name: string; column_name: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      document_status: "pending" | "approved" | "rejected"
      document_type: "identity" | "payslip"
      user_role:
        | "Huurder"
        | "Verhuurder"
        | "Manager"
        | "Beheerder"
        | "Beoordelaar"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      document_status: ["pending", "approved", "rejected"],
      document_type: ["identity", "payslip"],
      user_role: [
        "Huurder",
        "Verhuurder",
        "Manager",
        "Beheerder",
        "Beoordelaar",
      ],
    },
  },
} as const
