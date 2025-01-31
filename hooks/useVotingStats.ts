'use client';

import { useState, useEffect } from 'react';
import { Person } from '@/types/vote';
import { supabase } from '@/lib/supabase';

interface VotingStats {
  totalVotes: number;
  leaders: {
    name: string;
    votes: number;
    percent: number;
  }[];
  dailyGrowth: number;
}

export function useVotingStats() {
  const [stats, setStats] = useState<VotingStats>({
    totalVotes: 0,
    leaders: [],
    dailyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInitialStats() {
      try {
        // Get total votes by summing all participant votes
        const { data: participants, error: participantsError } = await supabase
          .from('participants')
          .select('id, name, votes')
          .order('votes', { ascending: false });

        if (participantsError) throw participantsError;

        // Calculate total votes and get top 3 leaders
        const totalVotes = participants.reduce((sum, p) => sum + p.votes, 0);
        const leaders = participants.slice(0, 3).map(p => ({
          name: p.name,
          votes: p.votes,
          percent: totalVotes > 0 ? Math.round((p.votes / totalVotes) * 100) : 0
        }));

        // Calculate daily growth
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const { data: yesterdayVotes, error: yesterdayError } = await supabase
          .from('votes_history')
          .select('total_votes')
          .eq('date', yesterday.toISOString().split('T')[0])
          .single();

        if (yesterdayError && yesterdayError.code !== 'PGRST116') throw yesterdayError;

        const dailyGrowth = yesterdayVotes && yesterdayVotes.total_votes > 0
          ? ((totalVotes - yesterdayVotes.total_votes) / yesterdayVotes.total_votes) * 100
          : 0;

        setStats({
          totalVotes,
          leaders,
          dailyGrowth
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    // Initial fetch
    fetchInitialStats();

    // Subscribe to real-time updates for participants
    const subscription = supabase
      .channel('participants-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'participants' 
        }, 
        () => {
          // Refetch stats when any participant's votes change
          fetchInitialStats();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { stats, loading, error };
} 