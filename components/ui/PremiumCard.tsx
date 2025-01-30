"use client"

import { motion } from "@/utils/motion"
import { cn } from "@/utils/cn"

interface PremiumCardProps {
  children: React.ReactNode
  className?: string
}

export function PremiumCard({ children, className }: PremiumCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-white dark:bg-gray-800',
        'rounded-xl shadow-xl',
        'border border-gray-100 dark:border-gray-700',
        'p-6',
        'transition-all duration-300',
        className
      )}
    >
      {children}
    </motion.div>
  )
} 