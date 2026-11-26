import { addLocalDays } from './dates'
import type { Progress, ProgressStatus, Rating } from './types'

export const MIN_EASE = 1.3
export const MASTERED_INTERVAL = 21
export const LAPSE_DELAY_MS = 10 * 60 * 1000

export const RATING_LABELS: Record<Rating, string> = { 1: 'Quên', 3: 'Khó', 4: 'Nhớ', 5: 'Dễ' }
export const RATINGS: Rating[] = [1, 3, 4, 5]

export function newProgress(): Progress {
  return {
    status: 'new',
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    nextReviewAt: null,
    lastReviewedAt: null,
    lapses: 0,
  }
}

export function deriveStatus(p: Pick<Progress, 'intervalDays' | 'repetitions' | 'lastReviewedAt'>): ProgressStatus {
  if (p.lastReviewedAt == null) return 'new'
  if (p.intervalDays >= MASTERED_INTERVAL) return 'mastered'
  if (p.repetitions >= 2) return 'review'
  return 'learning'
}

export function nextEase(ease: number, q: number): number {
  const next = ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  return Math.max(MIN_EASE, Math.round(next * 100) / 100)
}

/** SM-2 variant. */
export function review(progress: Progress, q: Rating, now: number): Progress {
  const easeFactor = nextEase(progress.easeFactor, q)
  let { repetitions, intervalDays, lapses } = progress
  let nextReviewAt: number

  if (q < 3) {
    repetitions = 0
    intervalDays = 0
    lapses += 1
    nextReviewAt = now + LAPSE_DELAY_MS
  } else {
    if (repetitions === 0) intervalDays = 1
    else if (repetitions === 1) intervalDays = q === 3 ? 3 : 6
    else {
      const mult = q === 3 ? 0.8 : q === 5 ? 1.3 : 1
      intervalDays = Math.max(intervalDays + 1, Math.round(intervalDays * easeFactor * mult))
    }
    repetitions += 1
    nextReviewAt = addLocalDays(now, intervalDays)
  }

  const next: Progress = {
    easeFactor,
    repetitions,
    intervalDays,
    lapses,
    nextReviewAt,
    lastReviewedAt: now,
    status: 'learning',
  }
  next.status = deriveStatus(next)
  return next
}

export function autoGrade(correct: number, total: number): Rating {
  if (total === 0) return 4
  if (correct >= total) return 4
  if (correct === 0) return 1
  return 3
}

export function isDue(p: Progress, now: number): boolean {
  return p.nextReviewAt != null && p.nextReviewAt <= now
}
