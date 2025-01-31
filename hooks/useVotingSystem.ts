"use client"

import { useState, useEffect } from "react"
import type { Person } from "../types/vote"
import { supabase } from "@/lib/supabase"

// Generate a unique user ID if not exists
const getUserId = () => {
  let userId = localStorage.getItem('user_id')
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem('user_id', userId)
  }
  return userId
}

export function useVotingSystem() {
  const [people, setPeople] = useState<Person[]>([])
  const [vote, setVote] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        console.log('Starting to fetch participants...')
        setLoading(true)
        setError(null)

        // First, check if we have any participants
        const { count, error: countError } = await supabase
          .from('people')
          .select('*', { count: 'exact', head: true })

        console.log('Current participant count:', count)

        if (count === 0) {
          // If no participants exist, let's insert them
          console.log('No participants found, inserting initial data...')
          const initialParticipants = [
            // Category 1
            { name: "سارة حيـون", image: "/participants/1.jpg", category_id: "cat1", votes: 0 },
            { name: "نـبـيـل الـحـمـوتـي", image: "/participants/2.jpg", category_id: "cat1", votes: 0 },
            { name: "فـوزيـة كـريـشـو", image: "/participants/3.jpg", category_id: "cat1", votes: 0 },
            
            // Category 2
            { name: "منعم العبوضي", image: "/participants/4.jpg", category_id: "cat2", votes: 0 },
            { name: "فهيم دراز & عبد الوهاب الخميري", image: "/participants/5.jpg", category_id: "cat2", votes: 0 },
            { name: "محمد بنعمر", image: "/participants/6.jpg", category_id: "cat2", votes: 0 },
            { name: "حسين ترك", image: "/participants/7.jpg", category_id: "cat2", votes: 0 },
            { name: "محمد قرقاش", image: "/participants/8.jpg", category_id: "cat2", votes: 0 },
            
            // Category 3
            { name: "مريم بوعسيلة", image: "/participants/9.jpg", category_id: "cat3", votes: 0 },
            { name: "شباب غيث", image: "/participants/10.jpg", category_id: "cat3", votes: 0 },
            { name: "أشرف بلحيان", image: "/participants/11.jpg", category_id: "cat3", votes: 0 },
            { name: "وليد الحدادي", image: "/participants/12.jpg", category_id: "cat3", votes: 0 }
          ]

          const { error: insertError } = await supabase
            .from('people')
            .insert(initialParticipants)

          if (insertError) {
            console.error('Error inserting participants:', insertError)
            throw insertError
          }
        }

        // Fetch all participants
        const { data, error: fetchError } = await supabase
          .from('people')
          .select('*')
          .order('votes', { ascending: false })

        if (fetchError) {
          console.error('Error fetching participants:', fetchError)
          throw fetchError
        }

        if (data) {
          console.log('Participants loaded successfully:', data)
          setPeople(data)
        } else {
          console.log('No participants found after insert')
        }

        // Check user's vote
        const userId = localStorage.getItem('user_id')
        if (userId) {
          const { data: userVote } = await supabase
            .from('votes')
            .select('candidate_id')
            .eq('user_id', userId)
            .single()

          if (userVote) {
            setVote(userVote.candidate_id)
          }
        }

      } catch (err: any) {
        console.error('Error in loadParticipants:', err)
        setError(err.message || 'Failed to load participants')
      } finally {
        setLoading(false)
      }
    }

    loadParticipants()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('people_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'people'
        },
        (payload: any) => {
          setPeople(currentPeople => 
            currentPeople.map(person => 
              person.id === payload.new.id
                ? { ...person, ...payload.new }
                : person
            )
          )
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const castVote = async (candidateId: string) => {
    try {
      setLoading(true)
      setError(null)

      let userId = localStorage.getItem('user_id')
      if (!userId) {
        userId = crypto.randomUUID()
        localStorage.setItem('user_id', userId)
      }

      const { error: voteError } = await supabase
        .from('votes')
        .insert([
          { user_id: userId, candidate_id: candidateId }
        ])

      if (voteError) {
        if (voteError.code === '23505') {
          throw new Error('لقد قمت بالتصويت مسبقاً')
        }
        throw voteError
      }

      setVote(candidateId)
      return true

    } catch (err: any) {
      console.error('Error casting vote:', err)
      setError(err.message || 'Failed to cast vote')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    people,
    vote,
    castVote,
    loading,
    error
  }
}

