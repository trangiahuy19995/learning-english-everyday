export type DeckColor = 'green' | 'blue' | 'orange' | 'purple' | 'pink' | 'teal'

export interface Deck {
  id: string
  name: string
  color: DeckColor
  description?: string
  createdAt: number
}

export interface Synonym {
  text: string
  note_vi?: string
}

export interface Example {
  en: string
  vi: string
  /** Exact substring of `en` that is the phrase as used (may be inflected). */
  highlight?: string
}

export type ProgressStatus = 'new' | 'learning' | 'review' | 'mastered'

export interface Progress {
  status: ProgressStatus
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReviewAt: number | null
  lastReviewedAt: number | null
  lapses: number
}

export interface Phrase {
  id: string
  phrase: string
  ipa: string
  meaning_vi: string
  nuance_vi?: string
  synonyms: Synonym[]
  examples: Example[]
  /** Deck id */
  topic: string
  starred: boolean
  progress: Progress
  createdAt: number
  updatedAt: number
}

export type Rating = 1 | 3 | 4 | 5

export type SessionSource = 'new' | 'due' | 'mixed'

export interface SessionConfig {
  size: number
  source: SessionSource
  /** Empty = all decks */
  deckIds: string[]
  starredOnly: boolean
}

export interface FillOptions {
  fillDue: boolean
  fillOtherNew: boolean
}

export type ExerciseKind = 'mcq-meaning' | 'mcq-synonym' | 'cloze'

export interface Exercise {
  id: string
  phraseId: string
  kind: ExerciseKind
  /** For MCQ */
  options?: string[]
  answer: string
  /** For cloze and synonym context */
  sentenceEn?: string
  sentenceVi?: string
  highlight?: string
}

export interface ExerciseResult {
  correctFirstTry: boolean
  answer: string
}

export type SessionPhase = 'study' | 'practice' | 'stageSummary' | 'complete'

export interface ActiveSession {
  id: string
  config: SessionConfig
  seed: number
  startedAt: number
  phraseIds: string[]
  stages: string[][]
  stageIndex: number
  phase: SessionPhase
  cardIndex: number
  exercises: Exercise[]
  exerciseIndex: number
  results: Record<string, ExerciseResult>
  ratings: Record<string, Rating>
  appliedStages: number[]
  /** Cumulative correct/total over applied stages */
  correctCount: number
  totalCount: number
}

export interface HistoryEntry {
  id: string
  startedAt: number
  finishedAt: number
  size: number
  stagesCompleted: number
  totalStages: number
  accuracy: number
  reviewedCount: number
  completed: boolean
}

export interface ActivityLog {
  /** YYYY-MM-DD -> number of phrases reviewed */
  days: Record<string, number>
}
