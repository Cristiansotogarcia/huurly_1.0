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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      payment_records: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          email: string
          id: string
          payment_method: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subscription_type: string | null
          updated_at: string | null
          user_id: string | null
          user_type: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          email: string
          id?: string
          payment_method?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          email?: string
          id?: string
          payment_method?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subscription_type?: string | null
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
          is_looking_for_place: boolean | null
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          is_looking_for_place?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_looking_for_place?: boolean | null
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tenant_profiles: {
        Row: {
          age: number | null
          availability_flexible: boolean | null
          available_from: string | null
          bio: string | null
          children_ages: Json | null
          computed_age: number | null
          contract_type: string | null
          created_at: string | null
          current_housing_situation: string | null
          date_of_birth: string | null
          desired_amenities: string[] | null
          documents_verified: boolean | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employer: string | null
          employment_status: string | null
          family_composition: string | null
          first_name: string | null
          furnished_preference: string | null
          guarantor_available: boolean | null
          guarantor_income: number | null
          guarantor_name: string | null
          guarantor_phone: string | null
          guarantor_relationship: string | null
          has_children: boolean | null
          has_partner: boolean | null
          has_pets: boolean | null
          household_composition: string | null
          household_size: number | null
          housing_allowance_eligible: boolean | null
          id: string
          income_proof_available: boolean | null
          landlord_interest: number | null
          last_name: string | null
          lease_duration_preference: string | null
          marital_status: string | null
          max_budget: number | null
          max_commute_time: number | null
          max_rent: number | null
          min_budget: number | null
          monthly_income: number | null
          motivation: string | null
          move_in_date_earliest: string | null
          move_in_date_preferred: string | null
          move_in_flexibility: string | null
          nationality: string | null
          number_of_children: number | null
          parking_required: boolean | null
          partner_employment_status: string | null
          partner_monthly_income: number | null
          partner_name: string | null
          partner_profession: string | null
          pet_details: string | null
          pet_policy_preference: string | null
          phone: string | null
          preferred_bedrooms: number | null
          preferred_city: string | null
          preferred_districts: string[] | null
          preferred_location: string | null
          preferred_property_type: string | null
          preferred_radius: number | null
          profession: string | null
          profile_completed: boolean | null
          profile_completion_percentage: number | null
          profile_picture_url: string | null
          profile_views: number | null
          reason_for_moving: string | null
          references_available: boolean | null
          rental_history: string | null
          rental_history_years: number | null
          sex: string | null
          smokes: boolean | null
          smoking_details: string | null
          smoking_policy_preference: string | null
          storage_needs: string | null
          total_guaranteed_income: number | null
          total_household_income: number | null
          transportation_preference: string | null
          updated_at: string | null
          user_id: string | null
          work_contract_type: string | null
          work_from_home: boolean | null
        }
        Insert: {
          age?: number | null
          availability_flexible?: boolean | null
          available_from?: string | null
          bio?: string | null
          children_ages?: Json | null
          computed_age?: number | null
          contract_type?: string | null
          created_at?: string | null
          current_housing_situation?: string | null
          date_of_birth?: string | null
          desired_amenities?: string[] | null
          documents_verified?: boolean | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer?: string | null
          employment_status?: string | null
          family_composition?: string | null
          first_name?: string | null
          furnished_preference?: string | null
          guarantor_available?: boolean | null
          guarantor_income?: number | null
          guarantor_name?: string | null
          guarantor_phone?: string | null
          guarantor_relationship?: string | null
          has_children?: boolean | null
          has_partner?: boolean | null
          has_pets?: boolean | null
          household_composition?: string | null
          household_size?: number | null
          housing_allowance_eligible?: boolean | null
          id?: string
          income_proof_available?: boolean | null
          landlord_interest?: number | null
          last_name?: string | null
          lease_duration_preference?: string | null
          marital_status?: string | null
          max_budget?: number | null
          max_commute_time?: number | null
          max_rent?: number | null
          min_budget?: number | null
          monthly_income?: number | null
          motivation?: string | null
          move_in_date_earliest?: string | null
          move_in_date_preferred?: string | null
          move_in_flexibility?: string | null
          nationality?: string | null
          number_of_children?: number | null
          parking_required?: boolean | null
          partner_employment_status?: string | null
          partner_monthly_income?: number | null
          partner_name?: string | null
          partner_profession?: string | null
          pet_details?: string | null
          pet_policy_preference?: string | null
          phone?: string | null
          preferred_bedrooms?: number | null
          preferred_city?: string | null
          preferred_districts?: string[] | null
          preferred_location?: string | null
          preferred_property_type?: string | null
          preferred_radius?: number | null
          profession?: string | null
          profile_completed?: boolean | null
          profile_completion_percentage?: number | null
          profile_picture_url?: string | null
          profile_views?: number | null
          reason_for_moving?: string | null
          references_available?: boolean | null
          rental_history?: string | null
          rental_history_years?: number | null
          sex?: string | null
          smokes?: boolean | null
          smoking_details?: string | null
          smoking_policy_preference?: string | null
          storage_needs?: string | null
          total_guaranteed_income?: number | null
          total_household_income?: number | null
          transportation_preference?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_contract_type?: string | null
          work_from_home?: boolean | null
        }
        Update: {
          age?: number | null
          availability_flexible?: boolean | null
          available_from?: string | null
          bio?: string | null
          children_ages?: Json | null
          computed_age?: number | null
          contract_type?: string | null
          created_at?: string | null
          current_housing_situation?: string | null
          date_of_birth?: string | null
          desired_amenities?: string[] | null
          documents_verified?: boolean | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer?: string | null
          employment_status?: string | null
          family_composition?: string | null
          first_name?: string | null
          furnished_preference?: string | null
          guarantor_available?: boolean | null
          guarantor_income?: number | null
          guarantor_name?: string | null
          guarantor_phone?: string | null
          guarantor_relationship?: string | null
          has_children?: boolean | null
          has_partner?: boolean | null
          has_pets?: boolean | null
          household_composition?: string | null
          household_size?: number | null
          housing_allowance_eligible?: boolean | null
          id?: string
          income_proof_available?: boolean | null
          landlord_interest?: number | null
          last_name?: string | null
          lease_duration_preference?: string | null
          marital_status?: string | null
          max_budget?: number | null
          max_commute_time?: number | null
          max_rent?: number | null
          min_budget?: number | null
          monthly_income?: number | null
          motivation?: string | null
          move_in_date_earliest?: string | null
          move_in_date_preferred?: string | null
          move_in_flexibility?: string | null
          nationality?: string | null
          number_of_children?: number | null
          parking_required?: boolean | null
          partner_employment_status?: string | null
          partner_monthly_income?: number | null
          partner_name?: string | null
          partner_profession?: string | null
          pet_details?: string | null
          pet_policy_preference?: string | null
          phone?: string | null
          preferred_bedrooms?: number | null
          preferred_city?: string | null
          preferred_districts?: string[] | null
          preferred_location?: string | null
          preferred_property_type?: string | null
          preferred_radius?: number | null
          profession?: string | null
          profile_completed?: boolean | null
          profile_completion_percentage?: number | null
          profile_picture_url?: string | null
          profile_views?: number | null
          reason_for_moving?: string | null
          references_available?: boolean | null
          rental_history?: string | null
          rental_history_years?: number | null
          sex?: string | null
          smokes?: boolean | null
          smoking_details?: string | null
          smoking_policy_preference?: string | null
          storage_needs?: string | null
          total_guaranteed_income?: number | null
          total_household_income?: number | null
          transportation_preference?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_contract_type?: string | null
          work_from_home?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_age_from_dob: {
        Args: { date_of_birth: string }
        Returns: number
      }
      get_profile_picture_url: {
        Args: { user_id: string; filename: string }
        Returns: string
      }
      user_has_active_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      document_status: "pending" | "approved" | "rejected"
      document_type:
        | "identity"
        | "payslip"
        | "employment_contract"
        | "reference"
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
      document_type: [
        "identity",
        "payslip",
        "employment_contract",
        "reference",
      ],
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
