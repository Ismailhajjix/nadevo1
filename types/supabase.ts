export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type VoteStatus = 'pending' | 'verified' | 'rejected'
export type AuthMethod = 'phone' | 'email' | 'guest'

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          phone_number: string
          email?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          phone_number: string
          email?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          phone_number?: string
          email?: string
          updated_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          name: string
          image: string
          category_id: string
          votes_count: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          image: string
          category_id: string
          votes_count?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          image?: string
          category_id?: string
          votes_count?: number
          is_active?: boolean
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          participant_id: string
          user_id: string
          verification_id: string
          status: VoteStatus
          voted_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          user_id: string
          verification_id: string
          status?: VoteStatus
          voted_at?: string
        }
        Update: {
          id?: string
          participant_id?: string
          user_id?: string
          verification_id?: string
          status?: VoteStatus
          voted_at?: string
        }
      }
      voter_verifications: {
        Row: {
          id: string
          user_id: string
          phone_number: string
          ip_address: string
          browser_fingerprint: string
          user_agent: string
          is_incognito: boolean
          verification_token?: string
          captcha_token?: string
          auth_method: AuthMethod
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          phone_number: string
          ip_address: string
          browser_fingerprint: string
          user_agent: string
          is_incognito?: boolean
          verification_token?: string
          captcha_token?: string
          auth_method?: AuthMethod
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          phone_number?: string
          ip_address?: string
          browser_fingerprint?: string
          user_agent?: string
          is_incognito?: boolean
          verification_token?: string
          captcha_token?: string
          auth_method?: AuthMethod
          created_at?: string
        }
      }
      rate_limits: {
        Row: {
          id: string
          ip_address: string
          request_count: number
          last_request: string
        }
        Insert: {
          id?: string
          ip_address: string
          request_count?: number
          last_request?: string
        }
        Update: {
          id?: string
          ip_address?: string
          request_count?: number
          last_request?: string
        }
      }
      votes_history: {
        Row: {
          id: string
          date: string
          total_votes: number
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          total_votes: number
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          total_votes?: number
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description?: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
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
      vote_status: VoteStatus
      auth_method: AuthMethod
    }
  }
} 