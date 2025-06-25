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
      abonnementen: {
        Row: {
          aangemaakt_op: string
          bedrag: number
          bijgewerkt_op: string
          currency: string | null
          eind_datum: string | null
          huurder_id: string | null
          id: string
          start_datum: string
          status: Database["public"]["Enums"]["abonnement_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          aangemaakt_op?: string
          bedrag?: number
          bijgewerkt_op?: string
          currency?: string | null
          eind_datum?: string | null
          huurder_id?: string | null
          id?: string
          start_datum: string
          status?: Database["public"]["Enums"]["abonnement_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          aangemaakt_op?: string
          bedrag?: number
          bijgewerkt_op?: string
          currency?: string | null
          eind_datum?: string | null
          huurder_id?: string | null
          id?: string
          start_datum?: string
          status?: Database["public"]["Enums"]["abonnement_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abonnementen_huurder_id_fkey"
            columns: ["huurder_id"]
            isOneToOne: false
            referencedRelation: "actieve_huurders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abonnementen_huurder_id_fkey"
            columns: ["huurder_id"]
            isOneToOne: false
            referencedRelation: "huurders"
            referencedColumns: ["id"]
          },
        ]
      }
      beoordelaars: {
        Row: {
          aangemaakt_op: string
          bijgewerkt_op: string
          documenten_beoordeeld: number | null
          goedkeuringspercentage: number | null
          id: string
        }
        Insert: {
          aangemaakt_op?: string
          bijgewerkt_op?: string
          documenten_beoordeeld?: number | null
          goedkeuringspercentage?: number | null
          id: string
        }
        Update: {
          aangemaakt_op?: string
          bijgewerkt_op?: string
          documenten_beoordeeld?: number | null
          goedkeuringspercentage?: number | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beoordelaars_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "gebruikers"
            referencedColumns: ["id"]
          },
        ]
      }
      betalingen: {
        Row: {
          aangemaakt_op: string | null
          bedrag: number
          bijgewerkt_op: string | null
          email: string
          gebruiker_id: string
          gebruiker_type: string
          id: string
          status: string
          stripe_betalingsintentie_id: string | null
          stripe_sessie_id: string | null
        }
        Insert: {
          aangemaakt_op?: string | null
          bedrag: number
          bijgewerkt_op?: string | null
          email: string
          gebruiker_id: string
          gebruiker_type: string
          id?: string
          status?: string
          stripe_betalingsintentie_id?: string | null
          stripe_sessie_id?: string | null
        }
        Update: {
          aangemaakt_op?: string | null
          bedrag?: number
          bijgewerkt_op?: string | null
          email?: string
          gebruiker_id?: string
          gebruiker_type?: string
          id?: string
          status?: string
          stripe_betalingsintentie_id?: string | null
          stripe_sessie_id?: string | null
        }
        Relationships: []
      }
      documenten: {
        Row: {
          aangemaakt_op: string
          beoordelaar_id: string | null
          beoordeling_notitie: string | null
          bestand_url: string
          bestandsnaam: string
          bijgewerkt_op: string
          huurder_id: string | null
          id: string
          status: Database["public"]["Enums"]["document_status"] | null
          type: Database["public"]["Enums"]["document_type"]
        }
        Insert: {
          aangemaakt_op?: string
          beoordelaar_id?: string | null
          beoordeling_notitie?: string | null
          bestand_url: string
          bestandsnaam: string
          bijgewerkt_op?: string
          huurder_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["document_status"] | null
          type: Database["public"]["Enums"]["document_type"]
        }
        Update: {
          aangemaakt_op?: string
          beoordelaar_id?: string | null
          beoordeling_notitie?: string | null
          bestand_url?: string
          bestandsnaam?: string
          bijgewerkt_op?: string
          huurder_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["document_status"] | null
          type?: Database["public"]["Enums"]["document_type"]
        }
        Relationships: [
          {
            foreignKeyName: "documenten_beoordelaar_id_fkey"
            columns: ["beoordelaar_id"]
            isOneToOne: false
            referencedRelation: "beoordelaars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenten_huurder_id_fkey"
            columns: ["huurder_id"]
            isOneToOne: false
            referencedRelation: "actieve_huurders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenten_huurder_id_fkey"
            columns: ["huurder_id"]
            isOneToOne: false
            referencedRelation: "huurders"
            referencedColumns: ["id"]
          },
        ]
      }
      favoriete_profielen: {
        Row: {
          aangemaakt_op: string
          huurder_id: string | null
          id: string
          verhuurder_id: string | null
        }
        Insert: {
          aangemaakt_op?: string
          huurder_id?: string | null
          id?: string
          verhuurder_id?: string | null
        }
        Update: {
          aangemaakt_op?: string
          huurder_id?: string | null
          id?: string
          verhuurder_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favoriete_profielen_huurder_id_fkey"
            columns: ["huurder_id"]
            isOneToOne: false
            referencedRelation: "actieve_huurders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoriete_profielen_huurder_id_fkey"
            columns: ["huurder_id"]
            isOneToOne: false
            referencedRelation: "huurders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoriete_profielen_verhuurder_id_fkey"
            columns: ["verhuurder_id"]
            isOneToOne: false
            referencedRelation: "verhuurders"
            referencedColumns: ["id"]
          },
        ]
      }
      gebruiker_rollen: {
        Row: {
          role: string
          subscription_status: string | null
          user_id: string
        }
        Insert: {
          role: string
          subscription_status?: string | null
          user_id: string
        }
        Update: {
          role?: string
          subscription_status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gebruikers: {
        Row: {
          aangemaakt_op: string
          bijgewerkt_op: string
          email: string
          id: string
          naam: string
          profiel_compleet: boolean | null
          rol: Database["public"]["Enums"]["gebruiker_rol"]
          telefoon: string | null
        }
        Insert: {
          aangemaakt_op?: string
          bijgewerkt_op?: string
          email: string
          id: string
          naam: string
          profiel_compleet?: boolean | null
          rol: Database["public"]["Enums"]["gebruiker_rol"]
          telefoon?: string | null
        }
        Update: {
          aangemaakt_op?: string
          bijgewerkt_op?: string
          email?: string
          id?: string
          naam?: string
          profiel_compleet?: boolean | null
          rol?: Database["public"]["Enums"]["gebruiker_rol"]
          telefoon?: string | null
        }
        Relationships: []
      }
      huurders: {
        Row: {
          aangemaakt_op: string
          abonnement_actief: boolean | null
          abonnement_start: string | null
          abonnement_verloopt: string | null
          beroep: string | null
          beschikbaarheid_flexibel: boolean | null
          beschrijving: string | null
          bijgewerkt_op: string
          borgsteller_beschikbaar: boolean | null
          borgsteller_inkomen: number | null
          borgsteller_naam: string | null
          borgsteller_relatie: string | null
          borgsteller_telefoon: string | null
          huisdieren: boolean | null
          id: string
          inkomen: number | null
          inkomensbewijs_beschikbaar: boolean | null
          kinderen: number | null
          leeftijd: number | null
          locatie_voorkeur: string[] | null
          max_huur: number | null
          max_kamers: number | null
          min_kamers: number | null
          partner: boolean | null
          profiel_foto_url: string | null
          profielfoto_url: string | null
          roken: boolean | null
          voorkeur_verhuisdatum: string | null
          vroegste_verhuisdatum: string | null
          woningvoorkeur: Json | null
        }
        Insert: {
          aangemaakt_op?: string
          abonnement_actief?: boolean | null
          abonnement_start?: string | null
          abonnement_verloopt?: string | null
          beroep?: string | null
          beschikbaarheid_flexibel?: boolean | null
          beschrijving?: string | null
          bijgewerkt_op?: string
          borgsteller_beschikbaar?: boolean | null
          borgsteller_inkomen?: number | null
          borgsteller_naam?: string | null
          borgsteller_relatie?: string | null
          borgsteller_telefoon?: string | null
          huisdieren?: boolean | null
          id: string
          inkomen?: number | null
          inkomensbewijs_beschikbaar?: boolean | null
          kinderen?: number | null
          leeftijd?: number | null
          locatie_voorkeur?: string[] | null
          max_huur?: number | null
          max_kamers?: number | null
          min_kamers?: number | null
          partner?: boolean | null
          profiel_foto_url?: string | null
          profielfoto_url?: string | null
          roken?: boolean | null
          voorkeur_verhuisdatum?: string | null
          vroegste_verhuisdatum?: string | null
          woningvoorkeur?: Json | null
        }
        Update: {
          aangemaakt_op?: string
          abonnement_actief?: boolean | null
          abonnement_start?: string | null
          abonnement_verloopt?: string | null
          beroep?: string | null
          beschikbaarheid_flexibel?: boolean | null
          beschrijving?: string | null
          bijgewerkt_op?: string
          borgsteller_beschikbaar?: boolean | null
          borgsteller_inkomen?: number | null
          borgsteller_naam?: string | null
          borgsteller_relatie?: string | null
          borgsteller_telefoon?: string | null
          huisdieren?: boolean | null
          id?: string
          inkomen?: number | null
          inkomensbewijs_beschikbaar?: boolean | null
          kinderen?: number | null
          leeftijd?: number | null
          locatie_voorkeur?: string[] | null
          max_huur?: number | null
          max_kamers?: number | null
          min_kamers?: number | null
          partner?: boolean | null
          profiel_foto_url?: string | null
          profielfoto_url?: string | null
          roken?: boolean | null
          voorkeur_verhuisdatum?: string | null
          vroegste_verhuisdatum?: string | null
          woningvoorkeur?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "huurders_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "gebruikers"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaties: {
        Row: {
          aangemaakt_op: string
          actie_url: string | null
          gebruiker_id: string | null
          gelezen: boolean | null
          id: string
          inhoud: string
          titel: string
          type: Database["public"]["Enums"]["notificatie_type"]
        }
        Insert: {
          aangemaakt_op?: string
          actie_url?: string | null
          gebruiker_id?: string | null
          gelezen?: boolean | null
          id?: string
          inhoud: string
          titel: string
          type: Database["public"]["Enums"]["notificatie_type"]
        }
        Update: {
          aangemaakt_op?: string
          actie_url?: string | null
          gebruiker_id?: string | null
          gelezen?: boolean | null
          id?: string
          inhoud?: string
          titel?: string
          type?: Database["public"]["Enums"]["notificatie_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notificaties_gebruiker_id_fkey"
            columns: ["gebruiker_id"]
            isOneToOne: false
            referencedRelation: "gebruikers"
            referencedColumns: ["id"]
          },
        ]
      }
      opgeslagen_zoekopdrachten: {
        Row: {
          aangemaakt_op: string
          id: string
          naam: string
          verhuurder_id: string | null
          zoekfilters: Json
        }
        Insert: {
          aangemaakt_op?: string
          id?: string
          naam: string
          verhuurder_id?: string | null
          zoekfilters: Json
        }
        Update: {
          aangemaakt_op?: string
          id?: string
          naam?: string
          verhuurder_id?: string | null
          zoekfilters?: Json
        }
        Relationships: [
          {
            foreignKeyName: "opgeslagen_zoekopdrachten_verhuurder_id_fkey"
            columns: ["verhuurder_id"]
            isOneToOne: false
            referencedRelation: "verhuurders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiel_weergaves: {
        Row: {
          aangemaakt_op: string
          huurder_id: string | null
          id: string
          verhuurder_id: string | null
        }
        Insert: {
          aangemaakt_op?: string
          huurder_id?: string | null
          id?: string
          verhuurder_id?: string | null
        }
        Update: {
          aangemaakt_op?: string
          huurder_id?: string | null
          id?: string
          verhuurder_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiel_weergaves_huurder_id_fkey"
            columns: ["huurder_id"]
            isOneToOne: false
            referencedRelation: "actieve_huurders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiel_weergaves_huurder_id_fkey"
            columns: ["huurder_id"]
            isOneToOne: false
            referencedRelation: "huurders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiel_weergaves_verhuurder_id_fkey"
            columns: ["verhuurder_id"]
            isOneToOne: false
            referencedRelation: "verhuurders"
            referencedColumns: ["id"]
          },
        ]
      }
      verhuurders: {
        Row: {
          aangemaakt_op: string
          aantal_woningen: number | null
          bedrijfsnaam: string | null
          beschrijving: string | null
          bijgewerkt_op: string
          id: string
          website: string | null
        }
        Insert: {
          aangemaakt_op?: string
          aantal_woningen?: number | null
          bedrijfsnaam?: string | null
          beschrijving?: string | null
          bijgewerkt_op?: string
          id: string
          website?: string | null
        }
        Update: {
          aangemaakt_op?: string
          aantal_woningen?: number | null
          bedrijfsnaam?: string | null
          beschrijving?: string | null
          bijgewerkt_op?: string
          id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verhuurders_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "gebruikers"
            referencedColumns: ["id"]
          },
        ]
      }
      verificaties: {
        Row: {
          aangemaakt_op: string
          beoordelaar_id: string | null
          bijgewerkt_op: string
          document_id: string | null
          huurder_id: string | null
          id: string
          notitie: string | null
          status: Database["public"]["Enums"]["document_status"] | null
        }
        Insert: {
          aangemaakt_op?: string
          beoordelaar_id?: string | null
          bijgewerkt_op?: string
          document_id?: string | null
          huurder_id?: string | null
          id?: string
          notitie?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
        }
        Update: {
          aangemaakt_op?: string
          beoordelaar_id?: string | null
          bijgewerkt_op?: string
          document_id?: string | null
          huurder_id?: string | null
          id?: string
          notitie?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "verificaties_beoordelaar_id_fkey"
            columns: ["beoordelaar_id"]
            isOneToOne: false
            referencedRelation: "beoordelaars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verificaties_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documenten"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verificaties_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documenten_wachtend"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verificaties_huurder_id_fkey"
            columns: ["huurder_id"]
            isOneToOne: false
            referencedRelation: "actieve_huurders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verificaties_huurder_id_fkey"
            columns: ["huurder_id"]
            isOneToOne: false
            referencedRelation: "huurders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      actieve_huurders: {
        Row: {
          abonnement_actief: boolean | null
          abonnement_start: string | null
          abonnement_verloopt: string | null
          beroep: string | null
          beschrijving: string | null
          email: string | null
          huisdieren: boolean | null
          id: string | null
          inkomen: number | null
          kinderen: number | null
          leeftijd: number | null
          locatie_voorkeur: string[] | null
          max_huur: number | null
          max_kamers: number | null
          min_kamers: number | null
          naam: string | null
          partner: boolean | null
          profielfoto_url: string | null
          roken: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "huurders_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "gebruikers"
            referencedColumns: ["id"]
          },
        ]
      }
      documenten_wachtend: {
        Row: {
          aangemaakt_op: string | null
          beoordelaar_id: string | null
          beoordeling_notitie: string | null
          bestand_url: string | null
          bestandsnaam: string | null
          bijgewerkt_op: string | null
          huurder_id: string | null
          id: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          type: Database["public"]["Enums"]["document_type"] | null
        }
        Insert: {
          aangemaakt_op?: string | null
          beoordelaar_id?: string | null
          beoordeling_notitie?: string | null
          bestand_url?: string | null
          bestandsnaam?: string | null
          bijgewerkt_op?: string | null
          huurder_id?: string | null
          id?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          type?: Database["public"]["Enums"]["document_type"] | null
        }
        Update: {
          aangemaakt_op?: string | null
          beoordelaar_id?: string | null
          beoordeling_notitie?: string | null
          bestand_url?: string | null
          bestandsnaam?: string | null
          bijgewerkt_op?: string | null
          huurder_id?: string | null
          id?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          type?: Database["public"]["Enums"]["document_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "documenten_beoordelaar_id_fkey"
            columns: ["beoordelaar_id"]
            isOneToOne: false
            referencedRelation: "beoordelaars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenten_huurder_id_fkey"
            columns: ["huurder_id"]
            isOneToOne: false
            referencedRelation: "actieve_huurders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documenten_huurder_id_fkey"
            columns: ["huurder_id"]
            isOneToOne: false
            referencedRelation: "huurders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_profiel_volledigheid: {
        Args: { huurder_uuid: string }
        Returns: boolean
      }
      create_huurder_profile: {
        Args: {
          user_id: string
          user_email: string
          user_naam: string
          user_telefoon?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      abonnement_status: "actief" | "gepauzeerd" | "geannuleerd" | "verlopen"
      document_status: "wachtend" | "goedgekeurd" | "afgekeurd"
      document_type:
        | "identiteit"
        | "inkomen"
        | "referentie"
        | "uittreksel_bkr"
        | "arbeidscontract"
      gebruiker_rol: "huurder" | "verhuurder" | "beoordelaar" | "admin"
      notificatie_type:
        | "document_goedgekeurd"
        | "document_afgekeurd"
        | "profiel_bekeken"
        | "nieuwe_match"
        | "systeem"
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
      abonnement_status: ["actief", "gepauzeerd", "geannuleerd", "verlopen"],
      document_status: ["wachtend", "goedgekeurd", "afgekeurd"],
      document_type: [
        "identiteit",
        "inkomen",
        "referentie",
        "uittreksel_bkr",
        "arbeidscontract",
      ],
      gebruiker_rol: ["huurder", "verhuurder", "beoordelaar", "admin"],
      notificatie_type: [
        "document_goedgekeurd",
        "document_afgekeurd",
        "profiel_bekeken",
        "nieuwe_match",
        "systeem",
      ],
    },
  },
} as const
