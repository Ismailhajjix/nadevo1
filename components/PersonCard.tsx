"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { VoteService } from '@/lib/vote-service'
import { cn } from '@/lib/utils'

interface PersonCardProps {
  id: string;
  name: string;
  title: string;
  imageUrl: string;
  votes: number;
  className?: string;
}

export default function PersonCard({ id, name, title, imageUrl, votes, className }: PersonCardProps) {
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
        participantId: id,
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
    <div className={cn(
      "relative bg-gray-800/50 rounded-xl overflow-hidden backdrop-blur-sm border border-white/10",
      className
    )}>
      {/* Image and content */}
      <div className="p-4">
        <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-1 font-arabic">{name}</h3>
          <p className="text-gray-400 text-sm font-arabic">{title}</p>
        </div>

        {/* Vote button */}
        <div className="mt-4">
          <motion.button
            onClick={handleVote}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full py-2 bg-primary/20 hover:bg-primary/30 rounded-lg
                     text-primary font-arabic flex items-center justify-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Heart className="w-5 h-5" />
                <span>صوت الآن</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 text-red-400 text-sm text-center font-arabic"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 text-green-400 text-sm text-center font-arabic"
            >
              تم تسجيل تصويتك بنجاح!
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

