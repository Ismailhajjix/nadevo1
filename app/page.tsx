'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import ParticipantGrid from '@/components/features/participants/ParticipantGrid';
import VotingStats from '@/components/features/voting/VotingStats';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] relative">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute top-0 -right-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob" 
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.2 }}
          className="absolute top-0 -left-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" 
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.4 }}
          className="absolute -bottom-8 right-20 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" 
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex justify-center mb-8"
          >
            <div className="relative w-48 h-24 md:w-64 md:h-32">
              <Image
                src="/images/nadevoGroup.png"
                alt="مجموعة نادِفو"
                width={256}
                height={128}
                priority
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-12 text-center font-arabic"
          >
            من يستحق جائزة التميز؟ صوت الآن
          </motion.h1>

          {/* Voting Stats */}
          <div className="mb-16">
            <VotingStats />
          </div>

          {/* Participants Grid */}
          <ParticipantGrid />
        </div>
      </div>
    </div>
  );
} 