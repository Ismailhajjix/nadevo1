import { useState, useEffect } from "react"
import type { Person, VoteState } from "../types/vote"
import { getStoredVote, setStoredVote, getStoredPeople, setStoredPeople } from "../utils/localStorage"
import { initialPeople } from "../utils/initialData"

export const useVotes = () => {
  const [people, setPeople] = useState<Person[]>(() => {
    const storedPeople = getStoredPeople()
    return storedPeople.length > 0 ? storedPeople : initialPeople
  })
  const [vote, setVote] = useState<VoteState>(getStoredVote())

  useEffect(() => {
    setStoredPeople(people)
  }, [people])

  useEffect(() => {
    setStoredVote(vote)
  }, [vote])

  const castVote = (id: string) => {
    if (vote === id) {
      // Undo vote
      setPeople((prevPeople) =>
        prevPeople.map((person) => (person.id === id ? { ...person, votes: person.votes - 1 } : person)),
      )
      setVote(null)
    } else {
      // Change vote or new vote
      setPeople((prevPeople) =>
        prevPeople.map((person) => {
          if (person.id === id) {
            return { ...person, votes: person.votes + 1 }
          } else if (person.id === vote) {
            return { ...person, votes: person.votes - 1 }
          }
          return person
        }),
      )
      setVote(id)
    }
  }

  return { people, vote, castVote }
}

