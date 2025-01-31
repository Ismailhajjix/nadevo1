'use client';

import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { supabase } from './supabase';
import type { Database } from '@/types/supabase';

type Tables = Database['public']['Tables']
type Vote = {
  participant_id: string;
  voter_profile_id: string;
  verification_id: string;
  status?: 'verified' | 'pending';
}

type VoterVerification = {
  id?: string;
  user_profile_id: string;
  ip_address: string;
  browser_fingerprint: string;
  is_incognito: boolean;
  user_agent: string;
}

type VoteRow = Tables['votes']['Row']
type ParticipantRow = Tables['participants']['Row']

interface VoteRequest {
  participantId: string;
  voterProfileId: string;
}

interface VoteResponse {
  success: boolean;
  message: string;
  error?: string;
}

export class VoteService {
  private static async getBrowserFingerprint(): Promise<string> {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  }

  private static async getIpAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting IP address:', error);
      return 'unknown';
    }
  }

  private static isIncognitoMode(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Method 1: Check localStorage and indexedDB
    const hasLocalStorage = (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })();

    const hasIndexedDB = (() => {
      try {
        return !!window.indexedDB;
      } catch (e) {
        return false;
      }
    })();

    // Consider it incognito if either method indicates incognito mode
    return !hasLocalStorage || !hasIndexedDB;
  }

  static async submitVote(request: VoteRequest): Promise<VoteResponse> {
    try {
      // 1. Check for incognito mode
      const isIncognito = this.isIncognitoMode();
      if (isIncognito) {
        return {
          success: false,
          message: 'لا يمكن التصويت في وضع التصفح المتخفي. يرجى استخدام وضع التصفح العادي',
          error: 'INCOGNITO_MODE'
        };
      }

      // 2. Get browser fingerprint and IP address
      const [fingerprint, ipAddress] = await Promise.all([
        this.getBrowserFingerprint(),
        this.getIpAddress()
      ]);

      // 3. Check for existing verification by fingerprint or IP
      const { data: existingVerification, error: verificationCheckError } = await supabase
        .from('voter_verifications')
        .select('id')
        .or(`browser_fingerprint.eq.${fingerprint},ip_address.eq.${ipAddress}`)
        .maybeSingle();

      if (verificationCheckError) {
        console.error('Error checking verification:', verificationCheckError);
        return {
          success: false,
          message: 'حدث خطأ أثناء التحقق من التصويت',
          error: 'VERIFICATION_ERROR'
        };
      }

      if (existingVerification) {
        return {
          success: false,
          message: 'لقد قمت بالتصويت مسبقاً',
          error: 'DUPLICATE_VOTE'
        };
      }

      // 4. Create verification record
      const verificationData: VoterVerification = {
        user_profile_id: request.voterProfileId,
        ip_address: ipAddress,
        browser_fingerprint: fingerprint,
        is_incognito: isIncognito,
        user_agent: navigator.userAgent
      };

      const { data: verification, error: verificationError } = await supabase
        .from('voter_verifications')
        .insert(verificationData)
        .select()
        .single();

      if (verificationError) {
        console.error('Error creating verification:', verificationError);
        return {
          success: false,
          message: 'حدث خطأ أثناء إنشاء التحقق',
          error: 'VERIFICATION_CREATE_ERROR'
        };
      }

      if (!verification) {
        return {
          success: false,
          message: 'فشل في إنشاء سجل التحقق',
          error: 'NO_VERIFICATION_CREATED'
        };
      }

      // 5. Submit the vote
      const voteData: Vote = {
        participant_id: request.participantId,
        voter_profile_id: request.voterProfileId,
        verification_id: verification.id,
        status: 'verified'
      };

      const { error: voteError } = await supabase
        .from('votes')
        .insert(voteData);

      if (voteError) {
        console.error('Error submitting vote:', voteError);
        return {
          success: false,
          message: 'حدث خطأ أثناء تسجيل التصويت',
          error: 'VOTE_SUBMISSION_ERROR'
        };
      }

      // 6. Update participant's vote count
      const { error: updateError } = await supabase.rpc('increment_vote_count', {
        participant_id: request.participantId
      });

      if (updateError) {
        console.error('Error updating vote count:', updateError);
      }

      return {
        success: true,
        message: 'تم تسجيل تصويتك بنجاح!'
      };

    } catch (error) {
      console.error('Vote submission error:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء التصويت',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getParticipantsByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('category_id', categoryId)
      .order('votes_count', { ascending: false });

    if (error) throw error;
    return data as ParticipantRow[];
  }

  static async getVotingStats() {
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('id, name, votes_count, category_id')
      .order('votes_count', { ascending: false });

    if (participantsError) throw participantsError;

    if (!participants) {
      return {
        totalVotes: 0,
        leaders: [],
        dailyGrowth: 0
      };
    }

    const typedParticipants = participants as ParticipantRow[];
    const totalVotes = typedParticipants.reduce((sum, p) => sum + (p.votes_count || 0), 0);
    const leaders = typedParticipants.slice(0, 3).map(p => ({
      name: p.name,
      votes: p.votes_count || 0,
      percent: totalVotes > 0 ? Math.round(((p.votes_count || 0) / totalVotes) * 100) : 0
    }));

    return {
      totalVotes,
      leaders,
      dailyGrowth: 0
    };
  }
} 