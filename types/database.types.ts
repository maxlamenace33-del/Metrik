export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Gender = "male" | "female" | "other";
export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active";
export type Intensity = "low" | "medium" | "high";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          gender: Gender;
          birth_date: string | null;
          height_cm: number | null;
          current_weight_kg: number | null;
          target_weight_kg: number | null;
          base_activity_level: ActivityLevel;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          gender?: Gender;
          birth_date?: string | null;
          height_cm?: number | null;
          current_weight_kg?: number | null;
          target_weight_kg?: number | null;
          base_activity_level?: ActivityLevel;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          gender?: Gender;
          birth_date?: string | null;
          height_cm?: number | null;
          current_weight_kg?: number | null;
          target_weight_kg?: number | null;
          base_activity_level?: ActivityLevel;
          updated_at?: string;
        };
        Relationships: [];
      };
      weight_logs: {
        Row: {
          id: string;
          user_id: string;
          weight_kg: number;
          logged_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight_kg: number;
          logged_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          weight_kg?: number;
          logged_at?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "weight_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      sports: {
        Row: {
          id: string;
          slug: string;
          name: string;
          default_met_low: number;
          default_met_medium: number;
          default_met_high: number;
          default_image_url: string | null;
          icon_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          default_met_low: number;
          default_met_medium: number;
          default_met_high: number;
          default_image_url?: string | null;
          icon_name?: string | null;
        };
        Update: {
          slug?: string;
          name?: string;
          default_met_low?: number;
          default_met_medium?: number;
          default_met_high?: number;
          default_image_url?: string | null;
          icon_name?: string | null;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          sport_id: string;
          duration_minutes: number;
          intensity: Intensity;
          weight_used_kg: number;
          estimated_calories_min: number;
          estimated_calories_max: number;
          image_url: string | null;
          notes: string | null;
          performed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sport_id: string;
          duration_minutes: number;
          intensity?: Intensity;
          weight_used_kg: number;
          estimated_calories_min: number;
          estimated_calories_max: number;
          image_url?: string | null;
          notes?: string | null;
          performed_at?: string;
          created_at?: string;
        };
        Update: {
          sport_id?: string;
          duration_minutes?: number;
          intensity?: Intensity;
          weight_used_kg?: number;
          estimated_calories_min?: number;
          estimated_calories_max?: number;
          image_url?: string | null;
          notes?: string | null;
          performed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_sport_id_fkey";
            columns: ["sport_id"];
            isOneToOne: false;
            referencedRelation: "sports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      meal_logs: {
        Row: {
          id: string;
          user_id: string;
          meal_type: MealType;
          description: string;
          estimated_calories: number;
          logged_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_type: MealType;
          description: string;
          estimated_calories: number;
          logged_at?: string;
          created_at?: string;
        };
        Update: {
          meal_type?: MealType;
          description?: string;
          estimated_calories?: number;
          logged_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      gender_enum: Gender;
      activity_level_enum: ActivityLevel;
      intensity_enum: Intensity;
      meal_type_enum: MealType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
