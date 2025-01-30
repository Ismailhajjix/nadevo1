import { useState } from "react"
import type { VoteItem as VoteItemType } from "../types/vote"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import type React from "react" // Added import for React

interface VoteItemProps {
  item: VoteItemType
  userVote: "up" | "down" | null
  onVote: (id: string, voteType: "up" | "down") => void
}

export const VoteItem: React.FC<VoteItemProps> = ({ item, userVote, onVote }) => {
  const [isVoting, setIsVoting] = useState(false)

  const handleVote = (voteType: "up" | "down") => {
    setIsVoting(true)
    onVote(item.id, voteType)
    setTimeout(() => setIsVoting(false), 300) // Duration of the animation
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <p className="text-lg font-medium">{item.content}</p>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => handleVote("up")}
          className={`p-2 rounded-full transition-all duration-300 ${
            userVote === "up" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
          } ${isVoting ? "scale-110" : "scale-100"} hover:bg-green-200`}
          disabled={isVoting}
        >
          <ThumbsUp size={20} />
          <span className="ml-1">{item.upvotes}</span>
        </button>
        <button
          onClick={() => handleVote("down")}
          className={`p-2 rounded-full transition-all duration-300 ${
            userVote === "down" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
          } ${isVoting ? "scale-110" : "scale-100"} hover:bg-red-200`}
          disabled={isVoting}
        >
          <ThumbsDown size={20} />
          <span className="ml-1">{item.downvotes}</span>
        </button>
      </div>
    </div>
  )
}

