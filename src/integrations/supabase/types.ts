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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      children_details: {
        Row: {
          child_age: number
          child_gender: string | null
          created_at: string | null
          id: string
          special_needs: boolean | null
          special_needs_details: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          child_age: number
          child_gender?: string | null
          created_at?: string | null
          id?: string
          special_needs?: boolean | null
          special_needs_details?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          child_age?: number
          child_gender?: string | null
          created_at?: string | null
          id?: string
          special_needs?: boolean | null
          special_needs_details?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      document_access_requests: {
        Row: {
          access_expires_at: string | null
          access_granted_at: string | null
          created_at: string | null
          id: string
          landlord_id: string | null
          message_id: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          created_at?: string | null
          id?: string
          landlord_id?: string | null
          message_id?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          access_expires_at?: string | null
          access_granted_at?: string | null
          created_at?: string | null
          id?: string
          landlord_id?: string | null
          message_id?: string | null
          status?: string | null
          tenant_id?: string | null
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
      dutch_cities_neighborhoods: {
        Row: {
          city_name: string
          created_at: string | null
          id: string
          is_major_city: boolean | null
          neighborhood_name: string
          population: number | null
          postal_code_prefix: string | null
          province: string
        }
        Insert: {
          city_name: string
          created_at?: string | null
          id?: string
          is_major_city?: boolean | null
          neighborhood_name: string
          population?: number | null
          postal_code_prefix?: string | null
          province: string
        }
        Update: {
          city_name?: string
          created_at?: string | null
          id?: string
          is_major_city?: boolean | null
          neighborhood_name?: string
          population?: number | null
          postal_code_prefix?: string | null
          province?: string
        }
        Relationships: []
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
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          has_pets?: boolean | null
          has_smokers?: boolean | null
          id?: string
          pet_details?: string | null
          smoking_details?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          has_pets?: boolean | null
          has_smokers?: boolean | null
          id?: string
          pet_details?: string | null
          smoking_details?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      household_members: {
        Row: {
          age: number
          created_at: string | null
          id: string
          relationship: string | null
          user_id: string | null
        }
        Insert: {
          age: number
          created_at?: string | null
          id?: string
          relationship?: string | null
          user_id?: string | null
        }
        Update: {
          age?: number
          created_at?: string | null
          id?: string
          relationship?: string | null
          user_id?: string | null
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
          recipient_id: string | null
          related_data: Json | null
          sender_id: string | null
          subject: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type: string
          read_at?: string | null
          recipient_id?: string | null
          related_data?: Json | null
          sender_id?: string | null
          subject: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string
          read_at?: string | null
          recipient_id?: string | null
          related_data?: Json | null
          sender_id?: string | null
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
      profile_analytics: {
        Row: {
          created_at: string | null
          id: string
          last_viewed_at: string | null
          monthly_views: number | null
          peak_viewing_day: string | null
          peak_viewing_hour: number | null
          profile_completion_score: number | null
          total_views: number | null
          unique_viewers: number | null
          updated_at: string | null
          user_id: string | null
          weekly_views: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_viewed_at?: string | null
          monthly_views?: number | null
          peak_viewing_day?: string | null
          peak_viewing_hour?: number | null
          profile_completion_score?: number | null
          total_views?: number | null
          unique_viewers?: number | null
          updated_at?: string | null
          user_id?: string | null
          weekly_views?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_viewed_at?: string | null
          monthly_views?: number | null
          peak_viewing_day?: string | null
          peak_viewing_hour?: number | null
          profile_completion_score?: number | null
          total_views?: number | null
          unique_viewers?: number | null
          updated_at?: string | null
          user_id?: string | null
          weekly_views?: number | null
        }
        Relationships: []
      }
      profile_view_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          notification_type: string | null
          read_at: string | null
          user_id: string | null
          viewer_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          notification_type?: string | null
          read_at?: string | null
          user_id?: string | null
          viewer_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          notification_type?: string | null
          read_at?: string | null
          user_id?: string | null
          viewer_id?: string | null
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
          ip_address: unknown | null
          session_id: string | null
          user_agent: string | null
          viewed_at: string | null
          viewed_profile_id: string | null
          viewer_id: string | null
          viewer_type: string
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          viewed_profile_id?: string | null
          viewer_id?: string | null
          viewer_type: string
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          viewed_profile_id?: string | null
          viewer_id?: string | null
          viewer_type?: string
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
          landlord_id: string | null
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
          landlord_id?: string | null
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
          landlord_id?: string | null
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
          property_id: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          status: string | null
          tenant_id: string | null
        }
        Insert: {
          application_message?: string | null
          applied_at?: string | null
          id?: string
          property_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          tenant_id?: string | null
        }
        Update: {
          application_message?: string | null
          applied_at?: string | null
          id?: string
          property_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string | null
          tenant_id?: string | null
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
          property_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_order?: number | null
          image_url: string
          is_primary?: boolean | null
          property_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_order?: number | null
          image_url?: string
          is_primary?: boolean | null
          property_id?: string | null
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
          landlord_id: string | null
          offered_at: string | null
          property_id: string | null
          responded_at: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          landlord_id?: string | null
          offered_at?: string | null
          property_id?: string | null
          responded_at?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          landlord_id?: string | null
          offered_at?: string | null
          property_id?: string | null
          responded_at?: string | null
          status?: string | null
          tenant_id?: string | null
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
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tenant_profiles: {
        Row: {
          age: number | null
          available_from: string | null
          bio: string | null
          children_ages: Json | null
          contract_type: string | null
          created_at: string | null
          current_housing_situation: string | null
          date_of_birth: string | null
          desired_amenities: string[] | null
          documents_verified: boolean | null
          employer: string | null
          employment_status: string | null
          family_composition: string | null
          first_name: string | null
          furnished_preference: string | null
          guarantor_available: boolean | null
          has_children: boolean | null
          has_partner: boolean | null
          has_pets: boolean | null
          household_composition: string | null
          household_size: number | null
          housing_allowance_eligible: boolean | null
          id: string
          landlord_interest: number | null
          last_name: string | null
          marital_status: string | null
          max_budget: number | null
          max_commute_time: number | null
          max_rent: number | null
          min_budget: number | null
          monthly_income: number | null
          motivation: string | null
          move_in_flexibility: string | null
          nationality: string | null
          number_of_children: number | null
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
          rental_history: string | null
          sex: string | null
          smokes: boolean | null
          smoking_details: string | null
          smoking_policy_preference: string | null
          total_household_income: number | null
          transportation_preference: string | null
          updated_at: string | null
          user_id: string | null
          work_contract_type: string | null
        }
        Insert: {
          age?: number | null
          available_from?: string | null
          bio?: string | null
          children_ages?: Json | null
          contract_type?: string | null
          created_at?: string | null
          current_housing_situation?: string | null
          date_of_birth?: string | null
          desired_amenities?: string[] | null
          documents_verified?: boolean | null
          employer?: string | null
          employment_status?: string | null
          family_composition?: string | null
          first_name?: string | null
          furnished_preference?: string | null
          guarantor_available?: boolean | null
          has_children?: boolean | null
          has_partner?: boolean | null
          has_pets?: boolean | null
          household_composition?: string | null
          household_size?: number | null
          housing_allowance_eligible?: boolean | null
          id?: string
          landlord_interest?: number | null
          last_name?: string | null
          marital_status?: string | null
          max_budget?: number | null
          max_commute_time?: number | null
          max_rent?: number | null
          min_budget?: number | null
          monthly_income?: number | null
          motivation?: string | null
          move_in_flexibility?: string | null
          nationality?: string | null
          number_of_children?: number | null
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
          rental_history?: string | null
          sex?: string | null
          smokes?: boolean | null
          smoking_details?: string | null
          smoking_policy_preference?: string | null
          total_household_income?: number | null
          transportation_preference?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_contract_type?: string | null
        }
        Update: {
          age?: number | null
          available_from?: string | null
          bio?: string | null
          children_ages?: Json | null
          contract_type?: string | null
          created_at?: string | null
          current_housing_situation?: string | null
          date_of_birth?: string | null
          desired_amenities?: string[] | null
          documents_verified?: boolean | null
          employer?: string | null
          employment_status?: string | null
          family_composition?: string | null
          first_name?: string | null
          furnished_preference?: string | null
          guarantor_available?: boolean | null
          has_children?: boolean | null
          has_partner?: boolean | null
          has_pets?: boolean | null
          household_composition?: string | null
          household_size?: number | null
          housing_allowance_eligible?: boolean | null
          id?: string
          landlord_interest?: number | null
          last_name?: string | null
          marital_status?: string | null
          max_budget?: number | null
          max_commute_time?: number | null
          max_rent?: number | null
          min_budget?: number | null
          monthly_income?: number | null
          motivation?: string | null
          move_in_flexibility?: string | null
          nationality?: string | null
          number_of_children?: number | null
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
          rental_history?: string | null
          sex?: string | null
          smokes?: boolean | null
          smoking_details?: string | null
          smoking_policy_preference?: string | null
          total_household_income?: number | null
          transportation_preference?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_contract_type?: string | null
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
      viewing_invitations: {
        Row: {
          created_at: string | null
          id: string
          landlord_id: string | null
          message_id: string | null
          property_address: string
          proposed_date: string
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          landlord_id?: string | null
          message_id?: string | null
          property_address: string
          proposed_date: string
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          landlord_id?: string | null
          message_id?: string | null
          property_address?: string
          proposed_date?: string
          status?: string | null
          tenant_id?: string | null
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
          property_id: string | null
          reserved_at: string | null
          slot_number: number
          status: string | null
          tenant_id: string | null
          updated_at: string | null
          viewing_date: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          reserved_at?: string | null
          slot_number: number
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          viewing_date?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          reserved_at?: string | null
          slot_number?: number
          status?: string | null
          tenant_id?: string | null
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
