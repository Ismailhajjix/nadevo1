'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Users, Crown, TrendingUp } from 'lucide-react';

export default function VotingStats() {
  const [totalVotes, setTotalVotes] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchVotes() {
      try {
        const { count, error } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        setTotalVotes(count || 0);
      } catch (err) {
        console.error('Error fetching votes:', err);
      } finally {
        setLoading(false);
      }
    }

    if (mounted) {
      fetchVotes();

      // Subscribe to realtime changes
      const subscription = supabase
        .channel('votes_counter')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'votes'
          },
          () => fetchVotes()
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="relative">
        {/* Glass card effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl backdrop-blur-xl border border-white/10" />
        
        {/* Content */}
        <div className="relative p-6 rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Crown className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-bold text-white font-arabic">عدد المصوّتين</h3>
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>

          {/* Vote count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 font-arabic">صوت</span>
            </div>
            <motion.div
              key={totalVotes}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-bold text-green-400 font-arabic"
            >
              {loading ? (
                <div className="h-8 w-24 bg-gray-700 rounded animate-pulse" />
              ) : (
                totalVotes?.toLocaleString('en-US') || '0'
              )}
            </motion.div>
          </div>

          {/* Progress indicator */}
          <div className="mt-4">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 