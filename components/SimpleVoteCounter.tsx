"use client"

import { useTotalVotes } from "@/hooks/useTotalVotes"
import { motion } from "@/utils/motion"
import { Users } from "lucide-react"

export function SimpleVoteCounter() {
  const { totalVotes, loading } = useTotalVotes()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3"
    >
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">عدد المصوّتين</span>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-bold text-primary">
            {loading ? "..." : totalVotes}
          </span>
          <span className="text-sm text-gray-400">صوت</span>
        </div>
      </div>
    </motion.div>
  )
} 