/**
 * Supabase database type definitions.
 * Generated from the schema in supabase/migrations/001_initial.sql.
 */

export interface Database {
  public: {
    Tables: {
      reviews: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          document_type: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          document_type?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          document_type?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          review_id: string;
          filename: string;
          file_path: string;
          file_size: number;
          file_type: string;
          extracted_text: string | null;
          char_count: number;
          document_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          filename: string;
          file_path: string;
          file_size?: number;
          file_type?: string;
          extracted_text?: string | null;
          char_count?: number;
          document_type?: string;
          created_at?: string;
        };
        Update: {
          extracted_text?: string | null;
          char_count?: number;
          document_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "reviews";
            referencedColumns: ["id"];
          },
        ];
      };
      agent_results: {
        Row: {
          id: string;
          review_id: string;
          agent_id: string;
          status: string;
          result_text: string | null;
          maturity_scores: Record<string, unknown>[];
          risks: Record<string, unknown>[];
          tokens_used: number;
          duration_ms: number;
          model: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          agent_id: string;
          status?: string;
          result_text?: string | null;
          maturity_scores?: Record<string, unknown>[];
          risks?: Record<string, unknown>[];
          tokens_used?: number;
          duration_ms?: number;
          model?: string;
          created_at?: string;
        };
        Update: {
          status?: string;
          result_text?: string | null;
          maturity_scores?: Record<string, unknown>[];
          risks?: Record<string, unknown>[];
          tokens_used?: number;
          duration_ms?: number;
        };
        Relationships: [
          {
            foreignKeyName: "agent_results_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "reviews";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          review_id: string;
          report_type: string;
          file_path: string | null;
          format: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          report_type: string;
          file_path?: string | null;
          format?: string;
          created_at?: string;
        };
        Update: {
          file_path?: string | null;
          format?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "reviews";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
