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
      people: {
        Row: {
          id: string
          name: string
          image: string
          votes: number
        }
        Insert: {
          id: string
          name: string
          image: string
          votes?: number
        }
        Update: {
          votes?: number
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          candidate_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          candidate_id: string
        }
      }
      vote_counts: {
        Row: {
          candidate_id: string
          vote_count: number
        }
      }
    }
    Views: {
      total_votes: {
        Row: {
          total_votes: number
        }
      }
    }
  }
} 