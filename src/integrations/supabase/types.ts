import type { Database as GeneratedDatabase } from '@supabase/supabase-js';

/**
 * Type definitions for Supabase tables and relationships
 * This should match your actual database schema
 */
export interface Database extends GeneratedDatabase {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string;
          type: string;
          status: string;
          furnishing: string;
          landlord_id: string;
          location: Record<string, unknown>;
          features: Record<string, unknown>;
          amenities: string[];
          utilities: Record<string, unknown>;
          rules: Record<string, unknown>;
          pricing: Record<string, unknown>;
          availability: Record<string, unknown>;
          media: Record<string, unknown>;
          statistics?: Record<string, unknown>;
          featured: boolean;
          verified: boolean;
          last_updated: string;
          slug?: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          description: string;
          type: string;
          status: string;
          furnishing: string;
          landlord_id: string;
          location: Record<string, unknown>;
          features: Record<string, unknown>;
          amenities: string[];
          utilities: Record<string, unknown>;
          rules: Record<string, unknown>;
          pricing: Record<string, unknown>;
          availability: Record<string, unknown>;
          media: Record<string, unknown>;
          featured?: boolean;
          verified?: boolean;
          last_updated?: string;
          slug?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          description?: string;
          type?: string;
          status?: string;
          furnishing?: string;
          landlord_id?: string;
          location?: Record<string, unknown>;
          features?: Record<string, unknown>;
          amenities?: string[];
          utilities?: Record<string, unknown>;
          rules?: Record<string, unknown>;
          pricing?: Record<string, unknown>;
          availability?: Record<string, unknown>;
          media?: Record<string, unknown>;
          statistics?: Record<string, unknown>;
          featured?: boolean;
          verified?: boolean;
          last_updated?: string;
          slug?: string;
        };
      };
      // Add other table definitions as needed
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}