import { createSamplePhrases, SAMPLE_DECKS, SEED_VERSION } from '@/data/sampleData'
import { uid } from '@/domain/random'
import { newProgress, review } from '@/domain/srsEngine'
import type { Deck, Phrase, Rating } from '@/domain/types'
import { createStore } from './createStore'
import { has, KEYS, load, save } from './storage'

export interface LibraryState {
  decks: Deck[]
  phrases: Phrase[]
}

function initial(): LibraryState {
  if (!has(KEYS.phrases)) {
    const seeded = { decks: SAMPLE_DECKS, phrases: createSamplePhrases() }
    save(KEYS.decks, seeded.decks)
    save(KEYS.phrases, seeded.phrases)
    save(KEYS.seedVersion, SEED_VERSION)
    return seeded
  }
  const state: LibraryState = {
    decks: load<Deck[]>(KEYS.decks, []),
    phrases: load<Phrase[]>(KEYS.phrases, []),
  }
  if (load<number>(KEYS.seedVersion, 1) < SEED_VERSION) {
    // One-time merge of newly bundled content; keeps user edits and progress untouched.
    const deckIds = new Set(state.decks.map((d) => d.id))
    const phraseIds = new Set(state.phrases.map((p) => p.id))
    state.decks = [...state.decks, ...SAMPLE_DECKS.filter((d) => !deckIds.has(d.id))]
    state.phrases = [...state.phrases, ...createSamplePhrases().filter((p) => !phraseIds.has(p.id))]
    save(KEYS.decks, state.decks)
    save(KEYS.phrases, state.phrases)
    save(KEYS.seedVersion, SEED_VERSION)
  }
  return state
}

export const libraryStore = createStore<LibraryState>(initial(), (s) => {
  save(KEYS.decks, s.decks)
  save(KEYS.phrases, s.phrases)
})

export type PhraseInput = Omit<Phrase, 'id' | 'progress' | 'createdAt' | 'updatedAt' | 'starred'> & {
  starred?: boolean
}

export const phraseStore = {
  addPhrase(input: PhraseInput): Phrase {
    const now = Date.now()
    const phrase: Phrase = {
      ...input,
      starred: input.starred ?? false,
      id: uid('ph'),
      progress: newProgress(),
      createdAt: now,
      updatedAt: now,
    }
    libraryStore.set((s) => ({ ...s, phrases: [...s.phrases, phrase] }))
    return phrase
  },
  updatePhrase(id: string, patch: Partial<Phrase>) {
    libraryStore.set((s) => ({
      ...s,
      phrases: s.phrases.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)),
    }))
  },
  deletePhrase(id: string) {
    libraryStore.set((s) => ({ ...s, phrases: s.phrases.filter((p) => p.id !== id) }))
  },
  toggleStar(id: string) {
    libraryStore.set((s) => ({
      ...s,
      phrases: s.phrases.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p)),
    }))
  },
  resetProgress(id: string) {
    phraseStore.updatePhrase(id, { progress: newProgress() })
  },
  applyRatings(ratings: Record<string, Rating>, now: number) {
    libraryStore.set((s) => ({
      ...s,
      phrases: s.phrases.map((p) => (ratings[p.id] ? { ...p, progress: review(p.progress, ratings[p.id], now) } : p)),
    }))
  },
  addDeck(input: Pick<Deck, 'name' | 'color' | 'description'>): Deck {
    const deck: Deck = { ...input, id: uid('deck'), createdAt: Date.now() }
    libraryStore.set((s) => ({ ...s, decks: [...s.decks, deck] }))
    return deck
  },
  updateDeck(id: string, patch: Partial<Deck>) {
    libraryStore.set((s) => ({ ...s, decks: s.decks.map((d) => (d.id === id ? { ...d, ...patch } : d)) }))
  },
  deleteDeck(id: string) {
    libraryStore.set((s) => ({
      decks: s.decks.filter((d) => d.id !== id),
      phrases: s.phrases.filter((p) => p.topic !== id),
    }))
  },
  replaceAll(state: LibraryState) {
    libraryStore.set(state)
  },
  restoreSamples() {
    libraryStore.set((s) => {
      const decks = [...s.decks]
      for (const d of SAMPLE_DECKS) if (!decks.some((x) => x.id === d.id)) decks.push(d)
      const phrases = [...s.phrases]
      for (const p of createSamplePhrases()) if (!phrases.some((x) => x.id === p.id)) phrases.push(p)
      return { decks, phrases }
    })
  },
}
