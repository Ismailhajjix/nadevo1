'use client';

import { supabase } from './supabase';
import type { Database } from '@/types/supabase';

type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at?: string;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  error?: string;
  userId?: string;
}

export class AuthService {
  static async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      console.log('Starting signup process for:', data.email);
      
      // 1. Check if email is already registered
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id, email')
        .eq('email', data.email)
        .maybeSingle();

      if (existingProfile) {
        console.log('Email already exists:', data.email);
        return {
          success: false,
          message: 'البريد الإلكتروني مسجل مسبقاً',
          error: 'EMAIL_EXISTS'
        };
      }

      // 2. Create user profile directly
      const profileData: Omit<UserProfile, 'id'> = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        created_at: new Date().toISOString()
      };

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return {
          success: false,
          message: 'فشل في إنشاء الملف الشخصي',
          error: profileError.message
        };
      }

      return {
        success: true,
        message: 'تم التسجيل بنجاح',
        userId: profile.id
      };

    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء التسجيل',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .single();

      return profile;

    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }
} 