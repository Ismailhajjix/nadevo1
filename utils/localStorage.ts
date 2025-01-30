import type { Person, VoteState, ThemeMode } from "../types/vote"

const VOTE_KEY = 'voting-app-vote'
const PEOPLE_KEY = 'voting-app-people'
const THEME_KEY = 'voting-app-theme'

export const getStoredVote = (): VoteState => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(VOTE_KEY)
}

export const setStoredVote = (vote: VoteState) => {
  if (typeof window === 'undefined') return
  if (vote === null) {
    localStorage.removeItem(VOTE_KEY)
  } else {
    localStorage.setItem(VOTE_KEY, vote)
  }
}

export const getStoredPeople = (): Person[] => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(PEOPLE_KEY)
  return stored ? JSON.parse(stored) : []
}

export const setStoredPeople = (people: Person[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(PEOPLE_KEY, JSON.stringify(people))
}

export const getStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light'
  return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'light'
}

export const setStoredTheme = (theme: ThemeMode) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(THEME_KEY, theme)
}

