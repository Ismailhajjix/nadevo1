"use client"

import { VotingSystem } from '@/components/VotingSystem'
import { motion, AnimatePresence } from '@/utils/motion'
import Image from 'next/image'

export default function Home() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-radial relative overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob" 
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.2 }}
            className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" 
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" 
          />
          
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:50px_50px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex justify-center pt-8 pb-4"
          >
            <div className="relative w-48 h-24 md:w-64 md:h-32">
              <Image
                src="/images/nadevoGroup.png"
                alt="Nadevo Group"
                fill
                priority
                className="object-contain"
              />
            </div>
          </motion.div>

          <div className="container mx-auto px-4 py-6">
            <VotingSystem />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

