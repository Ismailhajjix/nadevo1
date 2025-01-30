"use client"

import { useState, useEffect } from 'react'

interface VoteValidation {
  canVote: boolean
  lastVoteTime: number | null
  errorMessage: string | null
}

export function useVoteValidation() {
  const [validation, setValidation] = useState<VoteValidation>({
    canVote: true,
    lastVoteTime: null,
    errorMessage: null
  })

  // Check for existing vote in localStorage and cookies
  useEffect(() => {
    const checkVoteStatus = async () => {
      const lastVote = localStorage.getItem('lastVoteTime')
      const voteToken = localStorage.getItem('voteToken')
      
      if (lastVote && voteToken) {
        const timeSinceLastVote = Date.now() - parseInt(lastVote)
        const cooldownPeriod = 24 * 60 * 60 * 1000 // 24 hours
        
        if (timeSinceLastVote < cooldownPeriod) {
          const hoursRemaining = Math.ceil((cooldownPeriod - timeSinceLastVote) / (1000 * 60 * 60))
          setValidation({
            canVote: false,
            lastVoteTime: parseInt(lastVote),
            errorMessage: `لقد قمت بالتصويت مسبقاً. يرجى المحاولة بعد ${hoursRemaining} ساعة`
          })
        }
      }
    }

    checkVoteStatus()
  }, [])

  const validateVote = async (): Promise<boolean> => {
    try {
      // Make API call to validate vote
      const response = await fetch('/api/validate-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (!data.success) {
        setValidation({
          canVote: false,
          lastVoteTime: Date.now(),
          errorMessage: data.message
        })
        return false
      }

      // Store vote token and timestamp
      const voteToken = crypto.randomUUID()
      localStorage.setItem('voteToken', voteToken)
      localStorage.setItem('lastVoteTime', Date.now().toString())

      setValidation({
        canVote: false,
        lastVoteTime: Date.now(),
        errorMessage: null
      })

      return true
    } catch (error) {
      setValidation({
        canVote: false,
        lastVoteTime: null,
        errorMessage: 'حدث خطأ أثناء التحقق من التصويت. يرجى المحاولة مرة أخرى'
      })
      return false
    }
  }

  return { validation, validateVote }
} 