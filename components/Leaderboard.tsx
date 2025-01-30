"use client"

import { motion } from "@/utils/motion"
import type { Person } from "@/types/vote"
import { Crown } from "lucide-react"

type LeaderboardProps = {
  people: Person[]
  totalVotes: number
}

export function Leaderboard({ people, totalVotes }: LeaderboardProps) {
  // Sort people by votes in descending order
  const sortedPeople = [...people].sort((a, b) => b.votes - a.votes)

  return (
    <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <Crown className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-primary">المتصدرون</h2>
      </div>

      <div className="space-y-4">
        {sortedPeople.map((person, index) => {
          const percentage = totalVotes > 0 
            ? ((person.votes / totalVotes) * 100).toFixed(1)
            : '0.0'

          return (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">#{index + 1}</span>
                <span className="font-medium text-gray-200">{person.name}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">{person.votes}</span>
                <span className="text-sm text-gray-400">({percentage}%)</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

