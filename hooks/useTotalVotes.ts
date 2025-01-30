"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"

export function useTotalVotes() {
  const [totalVotes, setTotalVotes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTotalVotes = async () => {
      try {
        const { count, error } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })

        if (error) throw error
        setTotalVotes(count || 0)
      } catch (err) {
        console.error('Error fetching total votes:', err)
        setError('Failed to load vote count')
      } finally {
        setLoading(false)
      }
    }

    fetchTotalVotes()

    const subscription = supabase
      .channel('votes_counter')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        fetchTotalVotes
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { totalVotes, loading, error }
} 