"use client"

import { motion } from "@/utils/motion"
import { useTotalVotes } from "@/hooks/useTotalVotes"
import { Users, Crown, TrendingUp } from "lucide-react"

export function VoteCounter() {
  const { totalVotes, loading, error } = useTotalVotes()

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        خطأ في تحميل عدد الأصوات
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl border border-white/10"
    >
      {/* Header */}
      <div className="relative px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-primary">عدد المصوّتين</h2>
          </div>
          <TrendingUp className="w-4 h-4 text-primary/50" />
        </div>
      </div>

      {/* Vote Count */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-4">
          <Users className="w-8 h-8 text-primary/70" />
          <div className="flex items-baseline gap-2">
            <motion.span
              key={totalVotes}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent"
            >
              {loading ? "..." : totalVotes}
            </motion.span>
            <span className="text-sm text-gray-400">صوت</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-800/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((totalVotes / 1000) * 100, 100)}%` }}
          className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50"
        />
      </div>
    </motion.div>
  )
} 