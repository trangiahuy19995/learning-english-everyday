import { dayKey } from '@/domain/dates'
import { buildStageExercises } from '@/domain/exercises'
import { uid } from '@/domain/random'
import { buildStages } from '@/domain/sessionBuilder'
import { autoGrade } from '@/domain/srsEngine'
import type { ActiveSession, ActivityLog, HistoryEntry, Phrase, Rating, SessionConfig } from '@/domain/types'
import { createStore } from './createStore'
import { libraryStore, phraseStore } from './phraseStore'
import { KEYS, load, save } from './storage'

export const activeSessionStore = createStore<ActiveSession | null>(
  load<ActiveSession | null>(KEYS.activeSession, null),
  (s) => save(KEYS.activeSession, s),
)
export const historyStore = createStore<HistoryEntry[]>(load<HistoryEntry[]>(KEYS.history, []), (s) =>
  save(KEYS.history, s),
)
export const activityStore = createStore<ActivityLog>(load<ActivityLog>(KEYS.activity, { days: {} }), (s) =>
  save(KEYS.activity, s),
)

const MAX_HISTORY = 100

function phrasesById(): Map<string, Phrase> {
  return new Map(libraryStore.get().phrases.map((p) => [p.id, p]))
}

function exercisesForStage(session: Pick<ActiveSession, 'stages' | 'seed'>, stageIndex: number) {
  const map = phrasesById()
  const stage = (session.stages[stageIndex] ?? []).map((id) => map.get(id)).filter((p): p is Phrase => !!p)
  return buildStageExercises(stage, libraryStore.get().phrases, session.seed + stageIndex * 7919)
}

function update(fn: (s: ActiveSession) => ActiveSession) {
  activeSessionStore.set((s) => (s ? fn(s) : s))
}

function recordHistory(s: ActiveSession, completed: boolean) {
  if (!s.appliedStages.length) return
  const entry: HistoryEntry = {
    id: s.id,
    startedAt: s.startedAt,
    finishedAt: Date.now(),
    size: s.phraseIds.length,
    stagesCompleted: s.appliedStages.length,
    totalStages: s.stages.length,
    accuracy: s.totalCount ? s.correctCount / s.totalCount : 0,
    reviewedCount: s.appliedStages.reduce((n, i) => n + (s.stages[i]?.length ?? 0), 0),
    completed,
  }
  historyStore.set((h) => [entry, ...h.filter((x) => x.id !== entry.id)].slice(0, MAX_HISTORY))
}

/** Drop deleted phrases and empty stages. Returns null if nothing is left. */
export function reconcileSession(): ActiveSession | null {
  const s = activeSessionStore.get()
  if (!s) return null
  const map = phrasesById()
  const stages = s.stages.map((st) => st.filter((id) => map.has(id)))
  const changed = stages.some((st, i) => st.length !== s.stages[i].length)
  if (!changed) return s
  const keptIdx = stages.map((st, i) => (st.length ? i : -1)).filter((i) => i >= 0)
  if (!keptIdx.length) {
    activeSessionStore.set(null)
    return null
  }
  const newStages = keptIdx.map((i) => stages[i])
  const newStageIndex = Math.max(0, keptIdx.findIndex((i) => i >= s.stageIndex))
  const next: ActiveSession = {
    ...s,
    stages: newStages,
    phraseIds: newStages.flat(),
    stageIndex: newStageIndex,
    appliedStages: s.appliedStages.map((i) => keptIdx.indexOf(i)).filter((i) => i >= 0),
    phase: s.phase === 'complete' ? 'complete' : 'study',
    cardIndex: 0,
    exerciseIndex: 0,
    results: {},
    exercises: [],
  }
  next.exercises = exercisesForStage(next, next.stageIndex)
  activeSessionStore.set(next)
  return next
}

export const sessionActions = {
  start(config: SessionConfig, selected: Phrase[]) {
    const prev = activeSessionStore.get()
    if (prev) recordHistory(prev, false)
    const seed = Math.floor(Math.random() * 2 ** 31)
    const stages = buildStages(selected, seed)
    const base = {
      id: uid('ses'),
      config,
      seed,
      startedAt: Date.now(),
      phraseIds: stages.flat(),
      stages,
      stageIndex: 0,
      phase: 'study' as const,
      cardIndex: 0,
      exerciseIndex: 0,
      results: {},
      ratings: {},
      appliedStages: [],
      correctCount: 0,
      totalCount: 0,
    }
    activeSessionStore.set({ ...base, exercises: exercisesForStage(base, 0) })
  },
  setCard(index: number) {
    update((s) => ({ ...s, cardIndex: index }))
  },
  startPractice() {
    update((s) => ({ ...s, phase: 'practice', exerciseIndex: 0 }))
  },
  backToStudy() {
    update((s) => ({ ...s, phase: 'study' }))
  },
  recordResult(exerciseId: string, correctFirstTry: boolean, answer: string) {
    update((s) =>
      s.results[exerciseId] ? s : { ...s, results: { ...s.results, [exerciseId]: { correctFirstTry, answer } } },
    )
  },
  nextExercise() {
    update((s) => {
      if (s.exerciseIndex + 1 < s.exercises.length) return { ...s, exerciseIndex: s.exerciseIndex + 1 }
      // Prefill ratings from performance.
      const ratings = { ...s.ratings }
      for (const id of s.stages[s.stageIndex]) {
        const ex = s.exercises.filter((e) => e.phraseId === id)
        const correct = ex.filter((e) => s.results[e.id]?.correctFirstTry).length
        ratings[id] = autoGrade(correct, ex.length)
      }
      return { ...s, phase: 'stageSummary', ratings }
    })
  },
  setRating(phraseId: string, rating: Rating) {
    update((s) => ({ ...s, ratings: { ...s.ratings, [phraseId]: rating } }))
  },
  /** Applies SRS for the current stage and advances. */
  confirmStage() {
    const s = activeSessionStore.get()
    if (!s) return
    const now = Date.now()
    const stageIds = s.stages[s.stageIndex] ?? []
    if (!s.appliedStages.includes(s.stageIndex)) {
      const stageRatings: Record<string, Rating> = {}
      for (const id of stageIds) stageRatings[id] = s.ratings[id] ?? 4
      phraseStore.applyRatings(stageRatings, now)
      const key = dayKey(now)
      activityStore.set((a) => ({ days: { ...a.days, [key]: (a.days[key] ?? 0) + stageIds.length } }))
    }
    const correct = s.exercises.filter((e) => s.results[e.id]?.correctFirstTry).length
    const applied: ActiveSession = {
      ...s,
      appliedStages: s.appliedStages.includes(s.stageIndex) ? s.appliedStages : [...s.appliedStages, s.stageIndex],
      correctCount: s.appliedStages.includes(s.stageIndex) ? s.correctCount : s.correctCount + correct,
      totalCount: s.appliedStages.includes(s.stageIndex) ? s.totalCount : s.totalCount + s.exercises.length,
    }
    if (s.stageIndex + 1 < s.stages.length) {
      const nextIndex = s.stageIndex + 1
      activeSessionStore.set({
        ...applied,
        stageIndex: nextIndex,
        phase: 'study',
        cardIndex: 0,
        exerciseIndex: 0,
        results: {},
        exercises: exercisesForStage(applied, nextIndex),
      })
    } else {
      const done: ActiveSession = { ...applied, phase: 'complete' }
      recordHistory(done, true)
      activeSessionStore.set(done)
    }
  },
  abandon() {
    const s = activeSessionStore.get()
    if (s && s.phase !== 'complete') recordHistory(s, false)
    activeSessionStore.set(null)
  },
  finish() {
    activeSessionStore.set(null)
  },
}

export function sessionProgress(s: ActiveSession): { learned: number; total: number } {
  const learned = s.appliedStages.reduce((n, i) => n + (s.stages[i]?.length ?? 0), 0)
  const inStage =
    s.phase === 'complete' || s.appliedStages.includes(s.stageIndex)
      ? 0
      : s.phase === 'study'
        ? s.cardIndex
        : (s.stages[s.stageIndex]?.length ?? 0)
  return { learned: Math.min(s.phraseIds.length, learned + inStage), total: s.phraseIds.length }
}
