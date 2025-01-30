"use client"

import { useVotingSystem } from "../hooks/useVotingSystem"
import { PersonCard } from "./PersonCard"
import { Leaderboard } from "./Leaderboard"
import { motion, AnimatePresence } from "../utils/motion"
import { toast } from 'react-hot-toast'
import { VoteCounter } from "./VoteCounter"
import { CATEGORIES } from "@/types/vote"

export function VotingSystem() {
  const { people, vote, castVote, loading, error } = useVotingSystem()

  // Calculate total votes
  const totalVotes = people.reduce((sum, person) => sum + person.votes, 0)

  // Group people by category with proper sorting and count
  const categoriesWithCounts = CATEGORIES.map(category => {
    const categoryParticipants = people.filter(person => 
      person.category_id === category.id  // Note: changed from categoryId to category_id
    )
    return {
      ...category,
      participants: categoryParticipants.sort((a, b) => b.votes - a.votes),
      count: categoryParticipants.length
    }
  })

  const handleVote = async (personId: string) => {
    try {
      const success = await castVote(personId)
      if (success) {
        toast.success('تم التصويت بنجاح')
      }
    } catch (error: any) {
      console.error('Error voting:', error)
      toast.error(error.message || 'حدث خطأ أثناء التصويت')
    }
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    )
  }

  if (loading && people.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  console.log('People:', people)
  console.log('Categories with counts:', categoriesWithCounts)

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Vote Counter */}
      <div className="max-w-md mx-auto mb-12">
        <VoteCounter />
      </div>

      <AnimatePresence>
        <div className="space-y-16">
          {categoriesWithCounts.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="space-y-8 bg-black/20 backdrop-blur-lg rounded-2xl p-8"
            >
              {/* Category Header */}
              <div className="text-center space-y-2">
                <motion.h2 
                  className="text-2xl font-bold text-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {category.name}
                </motion.h2>
                <motion.p 
                  className="text-sm text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {category.count === 0 ? 'لا يوجد مشاركين' : 
                   category.count === 1 ? 'مشارك واحد' :
                   category.count === 2 ? 'مشاركان' :
                   `${category.count} مشاركين`}
                </motion.p>
              </div>

              {/* Participants Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {category.participants.map((person) => (
                  <motion.div
                    key={person.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PersonCard 
                      person={person} 
                      isVoted={vote === person.id}
                      onVote={handleVote}
                      loading={loading}
                      totalVotes={totalVotes}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12"
      >
        <Leaderboard people={people} totalVotes={totalVotes} />
      </motion.div>
    </div>
  )
}

