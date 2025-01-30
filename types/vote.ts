export interface VoteItem {
  id: string
  content: string
  upvotes: number
  downvotes: number
}

export type Person = {
  id: string
  name: string
  image: string
  votes: number
  category_id: string
}

export type VoteState = string | null

export type ThemeMode = "light" | "dark"

export type Category = {
  id: string
  name: string
  participants: Person[]
}

export const CATEGORIES: Category[] = [
  {
    id: "cat2",
    name: "Athletes",
    participants: []
  },
  {
    id: "cat1",
    name: "Creators",
    participants: []
  },
  {
    id: "cat3",
    name: "Organizers",
    participants: []
  }
]

export const PARTICIPANTS: Record<string, string[]> = {
  "cat2": [
    "منعم العبوضي",
    "فهيم دراز & عبد الوهاب الخميري",
    "محمد بنعمر",
    "حسين ترك",
    "محمد قرقاش"
  ],
  "cat1": [
    "سارة حيـون",
    "نـبـيـل الـحـمـوتـي",
    "فـوزيـة كـريـشـو"
  ],
  "cat3": [
    "مريم بوعسيلة",
    "شباب غيث",
    "أشرف بلحيان",
    "وليد الحدادي"
  ]
}

