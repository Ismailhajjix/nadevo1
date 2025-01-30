"use client"

import { useTotalVotes } from "@/hooks/useTotalVotes"
import { motion } from "@/utils/motion"
import { Crown, Users } from "lucide-react"

export function TotalVotesCard() {
  const { totalVotes, loading } = useTotalVotes()

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-white/10"
    >
      {/* Crown Icon */}
      <div className="absolute top-4 right-4">
        <Crown className="w-6 h-6 text-primary opacity-50" />
      </div>

      {/* Title */}
      <div className="pt-6 px-8 pb-4">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-primary">عدد المصوّتين</h2>
        </div>
      </div>

      {/* Vote Count */}
      <div className="px-8 pb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-gray-400" />
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
              {loading ? "..." : totalVotes}
            </span>
            <span className="text-sm text-gray-400">صوت</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
    </motion.div>
  )
} 