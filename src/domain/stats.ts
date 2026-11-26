import { dayKey, addLocalDays } from './dates'
import { isDue } from './srsEngine'
import type { ActivityLog, HistoryEntry, Phrase, ProgressStatus } from './types'

export function computeStreak(activity: ActivityLog, now: number): { streak: number; studiedToday: boolean } {
  const studiedToday = !!activity.days[dayKey(now)]
  let cursor = studiedToday ? now : addLocalDays(now, -1)
  let streak = 0
  while (activity.days[dayKey(cursor)]) {
    streak++
    cursor = addLocalDays(cursor, -1)
  }
  return { streak, studiedToday }
}

export function countByStatus(phrases: Phrase[]): Record<ProgressStatus, number> {
  const out: Record<ProgressStatus, number> = { new: 0, learning: 0, review: 0, mastered: 0 }
  for (const p of phrases) out[p.progress.status]++
  return out
}

export function countDue(phrases: Phrase[], now: number): number {
  return phrases.filter((p) => isDue(p.progress, now)).length
}

export function lastNDays(activity: ActivityLog, now: number, n = 14): { key: string; date: number; count: number }[] {
  const out = []
  for (let i = n - 1; i >= 0; i--) {
    const date = addLocalDays(now, -i)
    const key = dayKey(date)
    out.push({ key, date, count: activity.days[key] ?? 0 })
  }
  return out
}

export function averageAccuracy(history: HistoryEntry[]): number | null {
  const valid = history.filter((h) => h.reviewedCount > 0)
  if (!valid.length) return null
  return valid.reduce((s, h) => s + h.accuracy, 0) / valid.length
}

export const STATUS_LABELS: Record<ProgressStatus, string> = {
  new: 'Mới',
  learning: 'Đang học',
  review: 'Ôn tập',
  mastered: 'Đã thuộc',
}
