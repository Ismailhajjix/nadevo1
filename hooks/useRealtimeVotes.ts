import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeVotes(participantId: string) {
  const [votesCount, setVotesCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    async function setupRealtimeSubscription() {
      try {
        // Clean up existing subscription if any
        if (channel) {
          await channel.unsubscribe();
        }

        console.log('Setting up realtime subscription for participant:', participantId);

        // Create new subscription
        const newChannel = supabase
          .channel(`votes_${participantId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'votes',
              filter: `participant_id=eq.${participantId}`
            },
            async (payload) => {
              console.log('Received realtime update:', payload);
              
              // Fetch updated vote count
              const { data, error: countError } = await supabase
                .from('participants')
                .select('votes_count')
                .eq('id', participantId)
                .single();

              if (countError) {
                console.error('Error fetching updated vote count:', countError);
                return;
              }

              if (mounted && data) {
                setVotesCount(data.votes_count);
              }
            }
          )
          .subscribe(async (status) => {
            console.log('Subscription status:', status);
            
            if (status === 'SUBSCRIBED') {
              // Initial fetch of vote count
              const { data, error: initialError } = await supabase
                .from('participants')
                .select('votes_count')
                .eq('id', participantId)
                .single();

              if (initialError) {
                console.error('Error fetching initial vote count:', initialError);
                return;
              }

              if (mounted && data) {
                setVotesCount(data.votes_count);
              }
            }

            if (status === 'CLOSED' && mounted) {
              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying connection (${retryCount}/${maxRetries})...`);
                setTimeout(setupRealtimeSubscription, retryDelay * retryCount);
              } else {
                setError('Failed to maintain realtime connection');
              }
            }
          });

        setChannel(newChannel);
        setError(null);
      } catch (err) {
        console.error('Error setting up realtime subscription:', err);
        setError('Failed to setup realtime updates');
      }
    }

    setupRealtimeSubscription();

    return () => {
      mounted = false;
      if (channel) {
        console.log('Cleaning up realtime subscription');
        channel.unsubscribe();
      }
    };
  }, [participantId]);

  return { votesCount, error };
} 