"use client"

import { motion } from "../utils/motion"
import type { Person } from '../types/vote'
import { PremiumCard } from './ui/PremiumCard'
import { PremiumButton } from './ui/PremiumButton'
import { TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { ClientOnly } from './ClientOnly'

type PersonCardProps = {
  person: Person
  isVoted: boolean
  onVote: (id: string) => void
  loading?: boolean
  totalVotes: number
}

export function PersonCard({ person, isVoted, onVote, loading, totalVotes }: PersonCardProps) {
  // Calculate percentage
  const percentage = totalVotes > 0 
    ? ((person.votes / totalVotes) * 100).toFixed(1)
    : '0.0'

  return (
    <PremiumCard>
      <div className="relative overflow-hidden group">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
        >
          <Image
            src={person.image}
            alt={person.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

        <div className="space-y-4">
          <motion.h3 
            className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent"
          >
            {person.name}
          </motion.h3>

          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-2xl font-bold text-primary-light">
                {person.votes}
              </span>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400">صوت</span>
                <span className="text-xs text-gray-500">
                  ({percentage}%)
                </span>
              </div>
            </motion.div>

            <ClientOnly>
              <PremiumButton
                onClick={() => onVote(person.id)}
                disabled={isVoted || loading}
                className={isVoted ? 'bg-accent hover:bg-accent-hover' : undefined}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? 'جاري التصويت' : isVoted ? 'تم التصويت' : 'صوت الآن'}
                  {!isVoted && !loading && (
                    <TrendingUp className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
                  )}
                </span>
              </PremiumButton>
            </ClientOnly>
          </div>
        </div>
      </div>
    </PremiumCard>
  )
}

