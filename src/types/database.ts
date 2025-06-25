
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      gebruikers: {
        Row: {
          id: string
          email: string
          naam: string
          telefoon: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          naam: string
          telefoon?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          naam?: string
          telefoon?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      gebruiker_rollen: {
        Row: {
          user_id: string
          role: string
          subscription_status: string | null
        }
        Insert: {
          user_id: string
          role: string
          subscription_status?: string | null
        }
        Update: {
          user_id?: string
          role?: string
          subscription_status?: string | null
        }
      }
      huurder_profielen: {
        Row: {
          id: string
          gebruiker_id: string
          voornaam: string
          achternaam: string
          geboortedatum: string
          telefoon: string
          beroep: string | null
          werkgever: string | null
          maandinkomen: number | null
          huidige_woonsituatie: string | null
          gewenste_locatie: string | null
          max_huur: number | null
          gewenste_startdatum: string | null
          motivatie: string | null
          profielfoto_url: string | null
          verificatie_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gebruiker_id: string
          voornaam: string
          achternaam: string
          geboortedatum: string
          telefoon: string
          beroep?: string | null
          werkgever?: string | null
          maandinkomen?: number | null
          huidige_woonsituatie?: string | null
          gewenste_locatie?: string | null
          max_huur?: number | null
          gewenste_startdatum?: string | null
          motivatie?: string | null
          profielfoto_url?: string | null
          verificatie_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          gebruiker_id?: string
          voornaam?: string
          achternaam?: string
          geboortedatum?: string
          telefoon?: string
          beroep?: string | null
          werkgever?: string | null
          maandinkomen?: number | null
          huidige_woonsituatie?: string | null
          gewenste_locatie?: string | null
          max_huur?: number | null
          gewenste_startdatum?: string | null
          motivatie?: string | null
          profielfoto_url?: string | null
          verificatie_status?: string
          updated_at?: string
        }
      }
      verhuurder_profielen: {
        Row: {
          id: string
          gebruiker_id: string
          bedrijfsnaam: string | null
          kvk_nummer: string | null
          telefoon: string
          aantal_eigendommen: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gebruiker_id: string
          bedrijfsnaam?: string | null
          kvk_nummer?: string | null
          telefoon: string
          aantal_eigendommen?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          gebruiker_id?: string
          bedrijfsnaam?: string | null
          kvk_nummer?: string | null
          telefoon?: string
          aantal_eigendommen?: number | null
          updated_at?: string
        }
      }
      documenten: {
        Row: {
          id: string
          huurder_id: string
          document_type: string
          file_url: string
          file_name: string
          upload_datum: string
          verificatie_status: string
          beoordelaar_id: string | null
          beoordelings_datum: string | null
          opmerkingen: string | null
        }
        Insert: {
          id?: string
          huurder_id: string
          document_type: string
          file_url: string
          file_name: string
          upload_datum?: string
          verificatie_status?: string
          beoordelaar_id?: string | null
          beoordelings_datum?: string | null
          opmerkingen?: string | null
        }
        Update: {
          huurder_id?: string
          document_type?: string
          file_url?: string
          file_name?: string
          verificatie_status?: string
          beoordelaar_id?: string | null
          beoordelings_datum?: string | null
          opmerkingen?: string | null
        }
      }
      notificaties: {
        Row: {
          id: string
          gebruiker_id: string
          titel: string
          bericht: string
          type: string
          gelezen: boolean
          created_at: string
        }
        Insert: {
          id?: string
          gebruiker_id: string
          titel: string
          bericht: string
          type: string
          gelezen?: boolean
          created_at?: string
        }
        Update: {
          gebruiker_id?: string
          titel?: string
          bericht?: string
          type?: string
          gelezen?: boolean
        }
      }
      abonnementen: {
        Row: {
          id: string
          huurder_id: string
          stripe_subscription_id: string | null
          status: string
          start_datum: string
          eind_datum: string | null
          bedrag: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          huurder_id: string
          stripe_subscription_id?: string | null
          status: string
          start_datum: string
          eind_datum?: string | null
          bedrag: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          huurder_id?: string
          stripe_subscription_id?: string | null
          status?: string
          start_datum?: string
          eind_datum?: string | null
          bedrag?: number
          updated_at?: string
        }
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
