'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2 } from 'lucide-react';
import { VoteService } from '@/lib/vote-service';

interface VoteFormProps {
  participantId: string;
}

export default function VoteForm({ participantId }: VoteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVote = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a temporary voter profile ID
      const tempVoterProfileId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const voteResponse = await VoteService.submitVote({
        participantId,
        voterProfileId: tempVoterProfileId
      });

      if (!voteResponse.success) {
        throw new Error(voteResponse.message);
      }

      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4">
      <motion.button
        onClick={handleVote}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isLoading}
        className="px-8 py-4 bg-primary/20 hover:bg-primary/30 rounded-lg
                 text-primary font-arabic flex items-center gap-3 disabled:opacity-50
                 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Heart className="w-6 h-6" />
        )}
        <span className="text-xl">صوت الآن</span>
      </motion.button>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-red-400 text-sm text-center font-arabic"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-green-400 text-sm text-center font-arabic"
          >
            تم تسجيل تصويتك بنجاح!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
} 